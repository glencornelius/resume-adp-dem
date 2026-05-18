import { BatchTaskSummary, FavoriteCandidate, PredictionHistoryRecord, ReportDraftItem } from "@/lib/adp-dem/types";

export const STORAGE_KEYS = {
  history: "adp_dem_prediction_history_v2",
  favorites: "adp_dem_favorites_v1",
  batchTasks: "adp_dem_batch_tasks_v1",
  reportDraft: "adp_dem_report_draft_v1"
} as const;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function readHistory(): PredictionHistoryRecord[] {
  const records = readJson<PredictionHistoryRecord[]>(STORAGE_KEYS.history, []);
  return Array.isArray(records) ? records : [];
}

export function pushHistory(record: PredictionHistoryRecord) {
  const next = [record, ...readHistory()].slice(0, 500);
  writeJson(STORAGE_KEYS.history, next);
  return next;
}

export function deleteHistoryRecord(id: string) {
  const next = readHistory().filter((item) => item.id !== id);
  writeJson(STORAGE_KEYS.history, next);
  return next;
}

export function clearHistory() {
  writeJson(STORAGE_KEYS.history, []);
}

export function readFavorites(): FavoriteCandidate[] {
  const rows = readJson<FavoriteCandidate[]>(STORAGE_KEYS.favorites, []);
  return Array.isArray(rows) ? rows : [];
}

export function upsertFavorite(item: FavoriteCandidate) {
  const rows = readFavorites();
  const next = [item, ...rows.filter((row) => row.sequence !== item.sequence)].slice(0, 500);
  writeJson(STORAGE_KEYS.favorites, next);
  return next;
}

export function deleteFavorite(sequence: string) {
  const next = readFavorites().filter((row) => row.sequence !== sequence);
  writeJson(STORAGE_KEYS.favorites, next);
  return next;
}

export function clearFavorites() {
  writeJson(STORAGE_KEYS.favorites, []);
}

export function readBatchTasks(): BatchTaskSummary[] {
  const rows = readJson<BatchTaskSummary[]>(STORAGE_KEYS.batchTasks, []);
  return Array.isArray(rows) ? rows : [];
}

export function pushBatchTask(task: BatchTaskSummary) {
  const next = [task, ...readBatchTasks()].slice(0, 100);
  writeJson(STORAGE_KEYS.batchTasks, next);
  return next;
}

export function deleteBatchTask(id: string) {
  const next = readBatchTasks().filter((item) => item.id !== id);
  writeJson(STORAGE_KEYS.batchTasks, next);
  return next;
}

export function clearBatchTasks() {
  writeJson(STORAGE_KEYS.batchTasks, []);
}

export function readReportDraft(): ReportDraftItem[] {
  const rows = readJson<ReportDraftItem[]>(STORAGE_KEYS.reportDraft, []);
  return Array.isArray(rows) ? rows : [];
}

export function addReportDraftItem(item: ReportDraftItem) {
  const next = [item, ...readReportDraft()].slice(0, 200);
  writeJson(STORAGE_KEYS.reportDraft, next);
  return next;
}

export function removeReportDraftItem(id: string) {
  const next = readReportDraft().filter((row) => row.id !== id);
  writeJson(STORAGE_KEYS.reportDraft, next);
  return next;
}

export function clearReportDraft() {
  writeJson(STORAGE_KEYS.reportDraft, []);
}

export function clearAllAdpDemStorage() {
  clearHistory();
  clearFavorites();
  clearBatchTasks();
  clearReportDraft();
}

export function estimateStorageUsageKb() {
  if (!canUseStorage()) return 0;
  const keys = Object.values(STORAGE_KEYS);
  let bytes = 0;
  for (const key of keys) {
    const value = window.localStorage.getItem(key) ?? "";
    bytes += new Blob([value]).size;
  }
  return Number((bytes / 1024).toFixed(2));
}
