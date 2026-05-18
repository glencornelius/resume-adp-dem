export type LengthBin = "short" | "mid" | "long";
export type PredictionLevel = "high" | "medium" | "low" | "unknown";

export interface AminoAcidFrequencyItem {
  aa: string;
  freq: number;
  count: number;
}

export interface LengthDistributionItem {
  length: number;
  count: number;
}

export interface LengthBinDistributionItem {
  bin: LengthBin;
  count: number;
}

export interface DatasetSummary {
  generatedAt: string;
  datasetName: string;
  sourceFile: string;
  totalSamples: number;
  positiveSamples: number;
  negativeSamples: number;
  classBalance: {
    positiveRatio: number;
    negativeRatio: number;
  };
  split: {
    strategy: string;
    ratio: string;
    trainEstimated: number;
    testEstimated: number;
    note: string;
  };
  lengthStats: {
    min: number;
    max: number;
    mean: number;
    median: number;
    positiveMean: number;
    negativeMean: number;
  };
  lengthDistribution: LengthDistributionItem[];
  lengthBinDistribution: LengthBinDistributionItem[];
  sampleExamples: {
    positive: string[];
    negative: string[];
  };
  aminoAcidFrequency: {
    positive: AminoAcidFrequencyItem[];
    negative: AminoAcidFrequencyItem[];
  };
}

export interface StageMetrics {
  name: string;
  acc: number;
  sn: number;
  sp: number;
  mcc: number;
  auc: number;
  focus: string;
}

export interface ModelComparisonRow {
  method: string;
  acc: number | null;
  sn: number | null;
  sp: number | null;
  mcc: number | null;
  auc: number | null;
}

export interface ModelMetrics {
  generatedAt: string;
  independentTest: {
    stage1: StageMetrics;
    stage2: StageMetrics;
  };
  explanation: string[];
  methodComparisons: ModelComparisonRow[];
}

export interface CandidateItem {
  rank: number;
  sequence: string;
  length: number;
  lengthBin: LengthBin;
  stage1Score: number;
  stage2Score: number;
  structureStatus: string;
  sourceProtein: string;
  enzyme: string;
  peptideId: string;
  threeDiToken: string;
  threeDiSeq: string;
  pdbPath: string;
  occurrences: number;
  sourceProteinCount: number;
  start: number;
  end: number;
}

export interface TopCandidates {
  generatedAt: string;
  sourceFiles: string[];
  totalCandidates: number;
  queryNote: string;
  candidates: CandidateItem[];
  ranking: CandidateItem[];
}

export interface Top2000Summary {
  generatedAt: string;
  totalCandidates: number;
  scoreStats: {
    min: number;
    max: number;
    mean: number;
    p25: number;
    p50: number;
    p75: number;
  };
  lengthStats: {
    min: number;
    max: number;
    mean: number;
    median: number;
  };
  lengthBins: Array<{ bin: string; count: number }>;
  structureCoverage: {
    with3Di: number;
    pending: number;
  };
  topEnzymes: Array<{ name: string; count: number }>;
}

export interface LengthDistributionSummary {
  generatedAt: string;
  dataset: LengthDistributionItem[];
  datasetBins: LengthBinDistributionItem[];
  topCandidates: LengthDistributionItem[];
  topCandidateBins: LengthBinDistributionItem[];
}

export interface FeatureAblationItem {
  feature: string;
  normalizedImpact: number;
  description: string;
}

export interface ModuleAblationItem {
  module: string;
  impact: string;
  summary: string;
}

export interface FeatureAblationData {
  generatedAt: string;
  note: string;
  featureContribution: FeatureAblationItem[];
  moduleAblation: ModuleAblationItem[];
}

export interface DockingComplex {
  sequence: string;
  predictedProbability: number;
  dockingEnergy: number;
}

export interface DockingResults {
  generatedAt: string;
  target: string;
  engine: string;
  summary: {
    top100Below200: number;
    top100Below220: number;
    minimumEnergy: number;
    top20Range: string;
    interpretation: string;
  };
  topComplexes: DockingComplex[];
  notes: string[];
}

export interface PaperHighlights {
  generatedAt: string;
  title: string;
  englishTitle: string;
  school: string;
  teamMembers: string[];
  advisor: string;
  keywords: string[];
  abstractShort: string;
  highlights: string[];
  limitations: string[];
  sourceTextLength: number;
}

export interface AdpDemDataBundle {
  datasetSummary: DatasetSummary;
  modelMetrics: ModelMetrics;
  topCandidates: TopCandidates;
  top2000Summary: Top2000Summary;
  lengthDistribution: LengthDistributionSummary;
  featureAblation: FeatureAblationData;
  dockingResults: DockingResults;
  paperHighlights: PaperHighlights;
}

export interface SequenceProperties {
  length: number;
  lengthType: "short" | "mid" | "long" | "out";
  aminoAcidCounts: Record<string, number>;
  hydrophobicRatio: number;
  polarRatio: number;
  aromaticRatio: number;
  positiveChargeCount: number;
  negativeChargeCount: number;
  netCharge: number;
}

export interface SimilarCandidate {
  sequence: string;
  rank: number;
  stage1Score: number;
  stage2Score?: number;
  similarity: number;
}

export type ResultSource = "model" | "candidate-library" | "demo";
export type ModelMode = "online" | "offline-demo";
export type CredibilityLevel = "高" | "中" | "低";

export interface PredictionResult {
  id: string;
  sequence: string;
  createdAt: string;
  source: ResultSource;
  candidateHit: boolean;
  modelMode: ModelMode;
  modelProbability?: number;
  stage1Score?: number;
  stage2Score?: number;
  candidateRank?: number;
  modelVersion?: string;
  dataVersion?: string;
  heuristicScore?: number;
  level: PredictionLevel;
  confidenceLabel: string;
  credibilityLevel: CredibilityLevel;
  credibilityReason: string;
  properties: SequenceProperties;
  similarCandidates: SimilarCandidate[];
  explanation: string;
}

export interface PredictionHistoryRecord extends PredictionResult {
  recordType?: "single" | "batch";
}

export interface FavoriteCandidate {
  id: string;
  sequence: string;
  rank?: number;
  stage1Score?: number;
  stage2Score?: number;
  note?: string;
  createdAt: string;
}

export interface BatchTaskSummary {
  id: string;
  createdAt: string;
  total: number;
  valid: number;
  invalid: number;
  mode: "online" | "offline-demo";
  highPotential: number;
}

export interface ReportDraftItem {
  id: string;
  source: "single" | "batch" | "library" | "favorite";
  title: string;
  content: string;
  createdAt: string;
  sequence?: string;
  modelMode?: ModelMode;
}
