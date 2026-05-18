import { FavoriteCandidate, PredictionHistoryRecord, PredictionResult, ReportDraftItem } from "@/lib/adp-dem/types";
import { predictionLevelText } from "@/lib/adp-dem/predict";

function escapeCsv(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export function toCsv<T extends Record<string, unknown>>(rows: T[], headers: string[]): string {
  const head = headers.join(",");
  const body = rows.map((row) => headers.map((key) => escapeCsv(row[key])).join(",")).join("\n");
  return `${head}\n${body}`;
}

export function downloadCsv(content: string, fileName: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportSinglePrediction(result: PredictionResult) {
  const rows = [
    {
      id: result.id,
      sequence: result.sequence,
      createdAt: result.createdAt,
      source: result.source,
      modelMode: result.modelMode,
      candidateHit: result.candidateHit,
      modelProbability: result.modelMode === "online" ? result.modelProbability ?? "" : "",
      stage1Score: result.stage1Score ?? "",
      stage2Score: result.stage2Score ?? "",
      candidateRank: result.modelMode === "online" ? result.candidateRank ?? "" : "",
      heuristicScore: result.heuristicScore ?? "",
      level: predictionLevelText(result.level),
      confidenceLabel: result.confidenceLabel,
      length: result.properties.length,
      lengthType: result.properties.lengthType,
      hydrophobicRatio: result.properties.hydrophobicRatio,
      polarRatio: result.properties.polarRatio,
      aromaticRatio: result.properties.aromaticRatio,
      netCharge: result.properties.netCharge,
      explanation: result.explanation
    }
  ];

  downloadCsv(
    toCsv(rows, [
      "id",
      "sequence",
      "createdAt",
      "source",
      "modelMode",
      "candidateHit",
      "modelProbability",
      "stage1Score",
      "stage2Score",
      "candidateRank",
      "heuristicScore",
      "level",
      "confidenceLabel",
      "length",
      "lengthType",
      "hydrophobicRatio",
      "polarRatio",
      "aromaticRatio",
      "netCharge",
      "explanation"
    ]),
    `adp-dem-prediction-${result.id.slice(0, 8)}.csv`
  );
}

export function exportPredictionList(results: PredictionResult[], fileName = "adp-dem-predictions.csv") {
  const rows = results.map((result) => ({
    id: result.id,
    sequence: result.sequence,
    createdAt: result.createdAt,
    source: result.source,
    modelMode: result.modelMode,
    candidateHit: result.candidateHit,
    modelProbability: result.modelMode === "online" ? result.modelProbability ?? "" : "",
    stage1Score: result.stage1Score ?? "",
    stage2Score: result.stage2Score ?? "",
    candidateRank: result.modelMode === "online" ? result.candidateRank ?? "" : "",
    heuristicScore: result.heuristicScore ?? "",
    level: predictionLevelText(result.level),
    length: result.properties.length,
    lengthType: result.properties.lengthType,
    hydrophobicRatio: result.properties.hydrophobicRatio,
    netCharge: result.properties.netCharge
  }));

  downloadCsv(
    toCsv(rows, [
      "id",
      "sequence",
      "createdAt",
      "source",
      "modelMode",
      "candidateHit",
      "modelProbability",
      "stage1Score",
      "stage2Score",
      "candidateRank",
      "heuristicScore",
      "level",
      "length",
      "lengthType",
      "hydrophobicRatio",
      "netCharge"
    ]),
    fileName
  );
}

export function exportHistory(records: PredictionHistoryRecord[]) {
  const rows = records.map((result) => ({
    id: result.id,
    createdAt: result.createdAt,
    sequence: result.sequence,
    level: predictionLevelText(result.level),
    source: result.source,
    modelMode: result.modelMode,
    candidateHit: result.candidateHit,
    modelProbability: result.modelMode === "online" ? result.modelProbability ?? "" : "",
    candidateRank: result.modelMode === "online" ? result.candidateRank ?? "" : "",
    length: result.properties.length,
    lengthType: result.properties.lengthType,
    summary: result.explanation
  }));

  downloadCsv(
    toCsv(rows, [
      "id",
      "createdAt",
      "sequence",
      "level",
      "source",
      "modelMode",
      "candidateHit",
      "modelProbability",
      "candidateRank",
      "length",
      "lengthType",
      "summary"
    ]),
    "adp-dem-history.csv"
  );
}

export function exportFavorites(items: FavoriteCandidate[]) {
  const rows = items.map((item) => ({
    id: item.id,
    createdAt: item.createdAt,
    sequence: item.sequence,
    rank: item.rank ?? "",
    stage1Score: item.stage1Score ?? "",
    stage2Score: item.stage2Score ?? "",
    note: item.note ?? ""
  }));

  downloadCsv(toCsv(rows, ["id", "createdAt", "sequence", "rank", "stage1Score", "stage2Score", "note"]), "adp-dem-favorites.csv");
}

export async function copyPredictionSummary(result: PredictionResult) {
  const scoreLine =
    result.modelMode === "online"
      ? `模型预测概率: ${typeof result.modelProbability === "number" ? `${(result.modelProbability * 100).toFixed(2)}%` : "--"}`
      : `启发式评分: ${typeof result.heuristicScore === "number" ? `${result.heuristicScore.toFixed(1)} / 100` : "--"}`;

  const summary = [
    "ADP-DEM 预测摘要",
    `序列: ${result.sequence}`,
    `时间: ${new Date(result.createdAt).toLocaleString()}`,
    `当前模式: ${result.modelMode === "online" ? "真实模型推理" : "离线演示分析"}`,
    `等级: ${predictionLevelText(result.level)}`,
    scoreLine,
    `Stage-1: ${typeof result.stage1Score === "number" ? result.stage1Score.toFixed(4) : "--"}`,
    `Stage-2: ${typeof result.stage2Score === "number" ? result.stage2Score.toFixed(4) : "--"}`,
    `候选命中: ${result.candidateHit ? "是" : "否"}`,
    `相似候选: ${result.similarCandidates.length}`,
    `解释: ${result.explanation}`
  ].join("\n");

  await navigator.clipboard.writeText(summary);
}

export function copyReportDraftMarkdown(items: ReportDraftItem[]) {
  const markdown = [
    "# ADP-DEM 报告摘要",
    `生成时间: ${new Date().toLocaleString()}`,
    ""
  ];

  for (const item of items) {
    markdown.push(`## ${item.title}`);
    markdown.push(item.content);
    markdown.push("");
  }

  return navigator.clipboard.writeText(markdown.join("\n"));
}
