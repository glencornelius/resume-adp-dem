import { promises as fs } from "node:fs";
import path from "node:path";

import {
  AdpDemDataBundle,
  CandidateItem,
  DatasetSummary,
  DockingResults,
  FeatureAblationData,
  LengthDistributionSummary,
  ModelMetrics,
  PaperHighlights,
  Top2000Summary,
  TopCandidates
} from "@/lib/adp-dem/types";

const DATA_DIR = path.join(process.cwd(), "public", "adp-dem", "data");

async function readJson<T>(fileName: string): Promise<T> {
  const filePath = path.join(DATA_DIR, fileName);
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export async function loadAdpDemData(): Promise<AdpDemDataBundle> {
  const [
    datasetSummary,
    modelMetrics,
    topCandidates,
    top2000Summary,
    lengthDistribution,
    featureAblation,
    dockingResults,
    paperHighlights
  ] = await Promise.all([
    readJson<DatasetSummary>("dataset-summary.json"),
    readJson<ModelMetrics>("model-metrics.json"),
    readJson<TopCandidates>("top-candidates.json"),
    readJson<Top2000Summary>("top2000-summary.json"),
    readJson<LengthDistributionSummary>("length-distribution.json"),
    readJson<FeatureAblationData>("feature-ablation.json"),
    readJson<DockingResults>("docking-results.json"),
    readJson<PaperHighlights>("paper-highlights.json")
  ]);

  return {
    datasetSummary,
    modelMetrics,
    topCandidates,
    top2000Summary,
    lengthDistribution,
    featureAblation,
    dockingResults,
    paperHighlights
  };
}

export async function loadCandidates(): Promise<CandidateItem[]> {
  const data = await readJson<TopCandidates>("top-candidates.json");
  return data.candidates;
}

export async function loadMethodData() {
  const [datasetSummary, modelMetrics, featureAblation, lengthDistribution] = await Promise.all([
    readJson<DatasetSummary>("dataset-summary.json"),
    readJson<ModelMetrics>("model-metrics.json"),
    readJson<FeatureAblationData>("feature-ablation.json"),
    readJson<LengthDistributionSummary>("length-distribution.json")
  ]);

  return { datasetSummary, modelMetrics, featureAblation, lengthDistribution };
}

export async function loadResultsData() {
  const [topCandidates, dockingResults, top2000Summary] = await Promise.all([
    readJson<TopCandidates>("top-candidates.json"),
    readJson<DockingResults>("docking-results.json"),
    readJson<Top2000Summary>("top2000-summary.json")
  ]);

  return { topCandidates, dockingResults, top2000Summary };
}

export async function loadPaperData() {
  return readJson<PaperHighlights>("paper-highlights.json");
}
