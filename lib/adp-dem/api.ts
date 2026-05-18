import { PredictionResult } from "@/lib/adp-dem/types";
import { deriveCredibility, toConfidenceLabel, toPredictionLevel } from "@/lib/adp-dem/predict";

function cleanBase(base: string) {
  return base.trim().replace(/\/+$/, "");
}

function buildEndpoint(base: string, path: string) {
  const normalizedBase = cleanBase(base);
  if (!normalizedBase) return "";
  if (normalizedBase.endsWith(path)) return normalizedBase;
  return `${normalizedBase}${path}`;
}

function resolvePredictEndpoints(base: string) {
  const normalizedBase = cleanBase(base);
  if (!normalizedBase) return [];
  if (/\/predict$/i.test(normalizedBase)) return [normalizedBase];
  return [buildEndpoint(normalizedBase, "/predict"), normalizedBase];
}

function resolveBatchEndpoints(base: string) {
  const normalizedBase = cleanBase(base);
  if (!normalizedBase) return [];
  return [buildEndpoint(normalizedBase, "/batch-predict"), buildEndpoint(normalizedBase, "/batch_predict")];
}

function getNumber(payload: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return undefined;
}

function getString(payload: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return undefined;
}

function isProbability(value: number | undefined) {
  return typeof value === "number" && value >= 0 && value <= 1;
}

function validateBackendPredictPayload(payload: Record<string, unknown>) {
  const probability = getNumber(payload, ["modelProbability", "probability", "score", "prediction", "predictedProbability"]);
  const sequence = getString(payload, ["sequence"]);

  if (!isProbability(probability)) {
    return { ok: false as const, error: "模型服务返回异常，已切换为离线演示分析。" };
  }

  if (sequence && !/^[ACDEFGHIKLMNPQRSTVWY]+$/i.test(sequence)) {
    return { ok: false as const, error: "模型服务返回异常，已切换为离线演示分析。" };
  }

  return { ok: true as const };
}

function toModelResult(fallback: PredictionResult, payload: Record<string, unknown>): PredictionResult {
  const probability = getNumber(payload, ["modelProbability", "probability", "score", "prediction", "predictedProbability"]);
  const stage1Score = getNumber(payload, ["stage1Score", "stage1", "stage_1", "stage1_score"]);
  const stage2Score = getNumber(payload, ["stage2Score", "stage2", "stage_2", "stage2_score"]);
  const candidateRank = getNumber(payload, ["candidateRank", "rank", "candidate_rank"]);
  const level = toPredictionLevel(probability);

  return {
    ...fallback,
    id: typeof payload.id === "string" ? payload.id : fallback.id,
    sequence: typeof payload.sequence === "string" ? payload.sequence : fallback.sequence,
    createdAt: typeof payload.createdAt === "string" ? payload.createdAt : fallback.createdAt,
    source: "model",
    modelMode: "online",
    modelProbability: probability,
    stage1Score: stage1Score ?? fallback.stage1Score,
    stage2Score: stage2Score ?? fallback.stage2Score,
    candidateRank,
    modelVersion: getString(payload, ["modelVersion", "model_version"]),
    dataVersion: getString(payload, ["dataVersion", "data_version"]),
    level,
    confidenceLabel: toConfidenceLabel(level),
    ...deriveCredibility({ modelMode: "online", candidateHit: fallback.candidateHit }),
    explanation:
      getString(payload, ["explanation", "summary"]) ??
      `模型推理完成：概率${typeof probability === "number" ? ` ${(probability * 100).toFixed(2)}%` : "未返回"}，Stage-1 ${typeof stage1Score === "number" ? stage1Score.toFixed(4) : "--"}，Stage-2 ${typeof stage2Score === "number" ? stage2Score.toFixed(4) : "--"}。`
  };
}

function unwrapPayload(json: unknown): Record<string, unknown> | null {
  if (!json || typeof json !== "object") return null;
  const root = json as Record<string, unknown>;
  if (root.result && typeof root.result === "object") {
    return root.result as Record<string, unknown>;
  }
  return root;
}

export function getBackendApiBase() {
  return cleanBase(process.env.NEXT_PUBLIC_ADP_API_URL ?? "");
}

export function isBackendApiConfigured() {
  return Boolean(getBackendApiBase());
}

export interface BackendPredictResponse {
  ok: boolean;
  result?: PredictionResult;
  error?: string;
}

export async function requestBackendPrediction(sequence: string, fallback: PredictionResult): Promise<BackendPredictResponse> {
  const base = getBackendApiBase();
  if (!base) {
    return { ok: false, error: "Backend API not configured" };
  }

  const endpoints = resolvePredictEndpoints(base);
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ sequence })
      });

      if (!response.ok) {
        continue;
      }

      const payload = unwrapPayload(await response.json());
      if (!payload) continue;
      const schema = validateBackendPredictPayload(payload);
      if (!schema.ok) return { ok: false, error: schema.error };

      return {
        ok: true,
        result: toModelResult(fallback, payload)
      };
    } catch {
      // Try next endpoint.
    }
  }

  return { ok: false, error: "Backend prediction request failed" };
}

export interface BackendBatchRow {
  sequence: string;
  modelProbability?: number;
  stage1Score?: number;
  stage2Score?: number;
  candidateRank?: number;
  modelVersion?: string;
  dataVersion?: string;
  explanation?: string;
}

export interface BackendBatchResponse {
  ok: boolean;
  rows: BackendBatchRow[];
  error?: string;
}

export async function requestBackendBatchPredictions(sequences: string[]): Promise<BackendBatchResponse> {
  const base = getBackendApiBase();
  if (!base || sequences.length === 0) return { ok: false, rows: [], error: "Backend API not configured" };

  for (const endpoint of resolveBatchEndpoints(base)) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ sequences })
      });
      if (!response.ok) continue;

      const json = await response.json();
      if (!json || typeof json !== "object") continue;

      const rows = ((json as Record<string, unknown>).results ?? (json as Record<string, unknown>).data) as unknown;
      if (!Array.isArray(rows)) continue;

      const parsedRows = rows
        .filter((row) => row && typeof row === "object")
        .map((row) => {
          const payload = row as Record<string, unknown>;
          return {
            sequence: getString(payload, ["sequence"]) ?? "",
            modelProbability: getNumber(payload, ["modelProbability", "probability", "score", "prediction"]),
            stage1Score: getNumber(payload, ["stage1Score", "stage1", "stage_1"]),
            stage2Score: getNumber(payload, ["stage2Score", "stage2", "stage_2"]),
            candidateRank: getNumber(payload, ["candidateRank", "rank"]),
            modelVersion: getString(payload, ["modelVersion", "model_version"]),
            dataVersion: getString(payload, ["dataVersion", "data_version"]),
            explanation: getString(payload, ["explanation", "summary"])
          };
        })
        .filter((item) => item.sequence);

      const invalidRow = parsedRows.find((item) => !isProbability(item.modelProbability));
      if (invalidRow || parsedRows.length === 0) {
        return { ok: false, rows: [], error: "模型服务返回异常，已切换为离线演示分析。" };
      }

      return { ok: true, rows: parsedRows };
    } catch {
      // Try next endpoint.
    }
  }

  return { ok: false, rows: [], error: "Backend batch prediction request failed" };
}
