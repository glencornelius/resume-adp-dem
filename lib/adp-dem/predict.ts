import { CandidateItem, PredictionLevel, PredictionResult, SequenceProperties, SimilarCandidate } from "@/lib/adp-dem/types";
import { computeSequenceProperties, sanitizeSequence, validateSequence } from "@/lib/adp-dem/properties";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function createId() {
  if (typeof globalThis !== "undefined" && "crypto" in globalThis && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sequenceSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const maxLen = Math.max(a.length, b.length);
  const minLen = Math.min(a.length, b.length);
  let same = 0;
  for (let i = 0; i < minLen; i += 1) {
    if (a[i] === b[i]) same += 1;
  }
  const lengthPenalty = 1 - Math.abs(a.length - b.length) / maxLen;
  return Number(clamp((same / maxLen) * 0.75 + lengthPenalty * 0.25, 0, 1).toFixed(4));
}

function computeHeuristicScore(properties: SequenceProperties): number {
  const lenScore = properties.lengthType === "mid" ? 1 : properties.lengthType === "long" ? 0.72 : properties.lengthType === "short" ? 0.6 : 0.35;
  const hydroScore = 1 - Math.abs(properties.hydrophobicRatio - 0.32) / 0.32;
  const chargeScore = 1 - Math.abs(properties.netCharge) / 8;
  const polarScore = 1 - Math.abs(properties.polarRatio - 0.28) / 0.28;
  const aromaScore = properties.aromaticRatio / 0.2;
  const blended = 0.28 * lenScore + 0.26 * hydroScore + 0.2 * chargeScore + 0.16 * polarScore + 0.1 * aromaScore;
  return Number((clamp(blended, 0, 1) * 100).toFixed(2));
}

function findSimilarCandidates(sequence: string, candidates: CandidateItem[], top = 5): SimilarCandidate[] {
  return candidates
    .map((item) => ({
      sequence: item.sequence,
      rank: item.rank,
      stage1Score: item.stage1Score,
      stage2Score: item.stage2Score,
      similarity: sequenceSimilarity(sequence, item.sequence)
    }))
    .filter((item) => item.similarity >= 0.35)
    .sort((a, b) => b.similarity - a.similarity || a.rank - b.rank)
    .slice(0, top);
}

function demoExplanation(result: {
  properties: SequenceProperties;
  candidateHit: boolean;
  similarCount: number;
  heuristicScore: number;
}): string {
  const { properties, candidateHit, similarCount, heuristicScore } = result;
  const lenDesc = `长度 ${properties.length} aa（${properties.lengthType}）`;
  const hydroDesc = `疏水比例 ${(properties.hydrophobicRatio * 100).toFixed(1)}%`;
  const chargeDesc = `净电荷 ${properties.netCharge}`;
  const candidateDesc = candidateHit ? "候选库中已命中相同序列" : "候选库中未命中完全相同序列";
  return `${lenDesc}，${hydroDesc}，${chargeDesc}。${candidateDesc}，检索到 ${similarCount} 条相似候选。当前为离线展示模式，启发式评分 ${heuristicScore.toFixed(1)} 分，仅用于候选优先级参考。`;
}

export function deriveCredibility(result: Pick<PredictionResult, "modelMode" | "candidateHit">) {
  if (result.modelMode === "online" && result.candidateHit) {
    return {
      credibilityLevel: "高" as const,
      credibilityReason: "真实模型推理 + 候选库命中"
    };
  }

  if (result.modelMode === "online") {
    return {
      credibilityLevel: "中" as const,
      credibilityReason: "真实模型推理，但候选库未命中"
    };
  }

  return {
    credibilityLevel: "低" as const,
    credibilityReason: "仅离线性质分析与候选库相似性检索"
  };
}

export function recommendationLevel(result: Pick<PredictionResult, "modelMode" | "level" | "candidateHit" | "heuristicScore">) {
  if (result.modelMode === "online" && (result.level === "high" || result.candidateHit)) return "优先验证";
  if (result.modelMode === "online" && result.level === "medium") return "可关注";
  if (result.modelMode === "offline-demo" && ((result.heuristicScore ?? 0) >= 68 || result.candidateHit)) return "可关注";
  return "暂不优先";
}

export interface PredictOptions {
  sequence: string;
  candidates: CandidateItem[];
}

export interface PredictOutput {
  ok: boolean;
  errors: string[];
  result?: PredictionResult;
}

export function predictSequenceDemo({ sequence, candidates }: PredictOptions): PredictOutput {
  const checked = validateSequence(sequence);
  if (!checked.valid) {
    return { ok: false, errors: checked.errors };
  }

  const normalized = sanitizeSequence(checked.sequence);
  const properties = computeSequenceProperties(normalized);
  const exactHit = candidates.find((item) => item.sequence === normalized);
  const similarCandidates = findSimilarCandidates(normalized, candidates, 5);
  const heuristicScore = computeHeuristicScore(properties);

  const result: PredictionResult = {
    id: createId(),
    sequence: normalized,
    createdAt: new Date().toISOString(),
    source: exactHit ? "candidate-library" : "demo",
    candidateHit: Boolean(exactHit),
    modelMode: "offline-demo",
    stage1Score: exactHit?.stage1Score,
    stage2Score: exactHit?.stage2Score,
    candidateRank: exactHit?.rank,
    heuristicScore,
    level: "unknown",
    confidenceLabel: "未连接模型",
    ...deriveCredibility({ modelMode: "offline-demo", candidateHit: Boolean(exactHit) }),
    properties,
    similarCandidates,
    explanation: demoExplanation({
      properties,
      candidateHit: Boolean(exactHit),
      similarCount: similarCandidates.length,
      heuristicScore
    })
  };

  return {
    ok: true,
    errors: [],
    result
  };
}

export function toPredictionLevel(probability?: number): PredictionLevel {
  if (typeof probability !== "number") return "unknown";
  if (probability >= 0.8) return "high";
  if (probability >= 0.6) return "medium";
  return "low";
}

export function toConfidenceLabel(level: PredictionLevel): string {
  if (level === "high") return "高潜力";
  if (level === "medium") return "中等潜力";
  if (level === "low") return "低潜力";
  return "未连接模型";
}

export function predictionLevelText(level: PredictionLevel): string {
  if (level === "high") return "高潜力";
  if (level === "medium") return "中等潜力";
  if (level === "low") return "低潜力";
  return "未连接模型";
}
