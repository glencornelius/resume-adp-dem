"use client";

import { useMemo, useState } from "react";

import { HelpTooltip } from "@/components/adp-dem/HelpTooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestBackendBatchPredictions, requestBackendPrediction } from "@/lib/adp-dem/api";
import { downloadCsv, exportPredictionList, toCsv } from "@/lib/adp-dem/export";
import { parseSequenceInput } from "@/lib/adp-dem/parsers";
import {
  predictionLevelText,
  predictSequenceDemo,
  toConfidenceLabel,
  toPredictionLevel
} from "@/lib/adp-dem/predict";
import { pushBatchTask, pushHistory } from "@/lib/adp-dem/storage";
import { buildBatchPredictionReport, openPrintReport, shortModeText } from "@/lib/adp-dem/report";
import { CandidateItem, PredictionResult } from "@/lib/adp-dem/types";
import { InvalidSequenceRow, MAX_BATCH_SEQUENCES, validateSequenceRows, validateUploadFile } from "@/lib/adp-dem/upload";

interface PredictBatchTabProps {
  candidates: CandidateItem[];
  backendConfigured: boolean;
}

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function modeLabel(mode: PredictionResult["modelMode"]) {
  return shortModeText(mode);
}

export function PredictBatchTab({ candidates, backendConfigured }: PredictBatchTabProps) {
  const [text, setText] = useState("RVIPAAVVGAAVAGGL\nMEALKRKIEEEGVVL\nINVALID###\nGIAMAVGMAIAERHL");
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<PredictionResult[]>([]);
  const [invalid, setInvalid] = useState<InvalidSequenceRow[]>([]);
  const [query, setQuery] = useState("");
  const [highOnly, setHighOnly] = useState(false);
  const [notice, setNotice] = useState("当前模式会根据后端 API 可用性自动判定；离线演示分析不显示模型预测概率和候选排名。");

  const parsedCount = useMemo(() => parseSequenceInput(text).length, [text]);

  const filteredResults = useMemo(() => {
    return results
      .filter((item) => (highOnly ? item.level === "high" : true))
      .filter((item) => (query.trim() ? item.sequence.includes(query.trim().toUpperCase()) : true));
  }, [results, highOnly, query]);

  async function runBatch() {
    const validation = validateSequenceRows(text, MAX_BATCH_SEQUENCES);
    if (validation.errors.length > 0) {
      setInvalid(validation.invalidRows);
      setNotice(validation.errors.join(" "));
      setResults([]);
      return;
    }

    const rows = validation.sequences;
    if (rows.length === 0) {
      setInvalid(validation.invalidRows);
      setNotice(validation.invalidRows.length > 0 ? "全部序列均无效，请导出错误列表查看原因。" : "未识别到有效序列。");
      setResults([]);
      return;
    }

    setBusy(true);
    setProgress(0);
    setNotice("正在进行批量分析。");

    const validRows: Array<{ id: string; result: PredictionResult }> = [];
    const invalidRows: InvalidSequenceRow[] = [...validation.invalidRows];

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      const demo = predictSequenceDemo({ sequence: row.sequence, candidates });
      if (!demo.ok || !demo.result) {
        invalidRows.push({ id: row.id, sequence: row.sequence, reason: demo.errors[0] ?? "非法序列" });
      } else {
        validRows.push({ id: row.id, result: demo.result });
      }
      setProgress(Math.round(((i + 1) / rows.length) * 35));
    }

    const finalRows: PredictionResult[] = [];

    if (backendConfigured && validRows.length > 0) {
      const payload = await requestBackendBatchPredictions(validRows.map((item) => item.result.sequence));

      if (payload.ok && payload.rows.length > 0) {
        const payloadMap = new Map(payload.rows.map((item) => [item.sequence, item]));
        for (let i = 0; i < validRows.length; i += 1) {
          const row = validRows[i];
          const backend = payloadMap.get(row.result.sequence);

          if (backend && typeof backend.modelProbability === "number") {
            const level = toPredictionLevel(backend.modelProbability);
            finalRows.push({
              ...row.result,
              id: row.id,
              source: "model",
              modelMode: "online",
              modelProbability: backend.modelProbability,
              stage1Score: backend.stage1Score ?? row.result.stage1Score,
              stage2Score: backend.stage2Score ?? row.result.stage2Score,
              candidateRank: backend.candidateRank,
              modelVersion: backend.modelVersion,
              dataVersion: backend.dataVersion,
              level,
              confidenceLabel: toConfidenceLabel(level),
              credibilityLevel: row.result.candidateHit ? "高" : "中",
              credibilityReason: row.result.candidateHit ? "真实模型推理 + 候选库命中" : "真实模型推理，但候选库未命中",
              explanation: backend.explanation || row.result.explanation
            });
          } else {
            finalRows.push({ ...row.result, id: row.id });
          }

          setProgress(35 + Math.round(((i + 1) / validRows.length) * 55));
        }
        setNotice("当前模式：真实模型推理。批量结果包含后端模型服务返回字段。");
      } else {
        setNotice(payload.error ?? "模型服务不可用，已切换为离线演示分析。");
        for (let i = 0; i < validRows.length; i += 1) {
          const row = validRows[i];
          const backend = await requestBackendPrediction(row.result.sequence, row.result);
          finalRows.push(backend.ok && backend.result ? { ...backend.result, id: row.id } : { ...row.result, id: row.id });
          setProgress(35 + Math.round(((i + 1) / validRows.length) * 55));
        }
      }
    } else {
      for (let i = 0; i < validRows.length; i += 1) {
        finalRows.push({ ...validRows[i].result, id: validRows[i].id });
        setProgress(35 + Math.round(((i + 1) / validRows.length) * 55));
      }
    }

    finalRows.forEach((row) => {
      pushHistory({ ...row, recordType: "batch" });
    });

    setResults(finalRows);
    setInvalid(invalidRows);
    setProgress(100);
    setBusy(false);

    pushBatchTask({
      id: createId(),
      createdAt: new Date().toISOString(),
      total: rows.length,
      valid: finalRows.length,
      invalid: invalidRows.length,
      mode: finalRows.some((item) => item.modelMode === "online") ? "online" : "offline-demo",
      highPotential: finalRows.filter((item) => item.level === "high").length
    });
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center gap-2">
          <p className="text-sm text-luxury-champagne">批量预测输入</p>
          <HelpTooltip
            label="批量预测上传格式说明"
            content="支持 FASTA、CSV、TXT。CSV 建议包含 id 和 sequence 两列，序列仅使用标准氨基酸字母。"
          />
        </div>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={8}
          className="mt-2 w-full rounded-lg border border-white/15 bg-slate-950/70 p-3 font-mono text-sm"
          placeholder="支持多行文本、FASTA、CSV、TXT"
        />
        <div className="mt-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
          <input
            type="file"
            accept=".fasta,.fa,.txt,.csv"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const fileErrors = validateUploadFile(file);
              if (fileErrors.length > 0) {
                setNotice(fileErrors.join(" "));
                return;
              }
              const nextText = await file.text();
              const validation = validateSequenceRows(nextText, MAX_BATCH_SEQUENCES);
              setText(nextText);
              setInvalid(validation.invalidRows);
              setNotice(validation.errors[0] ?? `已读取文件：${validation.sequences.length} 条有效序列，${validation.invalidRows.length} 条无效。`);
            }}
            className="text-xs"
          />
          <span className="text-xs text-slate-400">限制：FASTA/CSV/TXT，≤2MB，≤{MAX_BATCH_SEQUENCES} 条序列</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={() => void runBatch()} disabled={busy}>{busy ? "批量分析中..." : "开始批量分析"}</Button>
          <Button variant="secondary" onClick={() => exportPredictionList(results, "adp-dem-batch-all.csv")} disabled={results.length === 0}>导出全部结果 CSV</Button>
          <Button variant="secondary" onClick={() => exportPredictionList(filteredResults, "adp-dem-batch-filtered.csv")} disabled={filteredResults.length === 0}>导出当前筛选 CSV</Button>
          <Button
            variant="secondary"
            onClick={() => exportPredictionList(results.filter((item) => item.level === "high"), "adp-dem-batch-high.csv")}
            disabled={results.length === 0}
          >
            导出高潜力 CSV
          </Button>
          <Button
            variant="secondary"
            disabled={invalid.length === 0}
            onClick={() =>
              downloadCsv(
                toCsv(invalid.map((item) => ({ id: item.id, sequence: item.sequence, reason: item.reason })), ["id", "sequence", "reason"]),
                "adp-dem-invalid-sequences.csv"
              )
            }
          >
            导出错误列表 CSV
          </Button>
          <Button
            variant="ghost"
            disabled={results.length === 0}
            onClick={() => {
              openPrintReport(buildBatchPredictionReport(results, invalid.length, parsedCount));
            }}
          >
            批量报告
          </Button>
        </div>
        <div className="mt-3 text-xs text-slate-300">总数 {parsedCount} | 有效 {results.length} | 无效 {invalid.length}</div>
        <p className="mt-2 text-xs text-slate-300">{notice}</p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-gradient-to-r from-luxury-gold to-luxury-blue transition-all" style={{ width: `${progress}%` }} />
        </div>
        {results.some((item) => item.modelMode === "offline-demo") ? (
          <p className="mt-3 rounded-xl border border-amber-200/30 bg-amber-100/10 p-3 text-xs text-amber-100">
            部分结果处于离线演示模式，不显示模型预测概率或候选排名，仅展示基础性质分析、候选库命中、相似候选推荐和启发式评分。
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <p className="text-sm text-luxury-champagne">筛选</p>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索序列" />
          <label className="inline-flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={highOnly} onChange={(event) => setHighOnly(event.target.checked)} /> 仅看高潜力
          </label>
        </div>
      </section>

      {invalid.length > 0 ? (
        <section className="rounded-2xl border border-rose-300/30 bg-rose-300/5 p-4 text-sm text-rose-100">
          <p>无效序列（前 20 条）</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
            {invalid.slice(0, 20).map((item) => (
              <li key={`${item.id}-${item.sequence}`}>{item.id}: {item.sequence} - {item.reason}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <p className="text-sm text-luxury-champagne">批量结果</p>
        <div className="mt-3 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[980px] text-sm text-slate-200">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-luxury-gold">
                <th className="pb-2">ID</th>
                <th className="pb-2">序列</th>
                <th className="pb-2">模式</th>
                <th className="pb-2">模型预测概率 / 启发式</th>
                <th className="pb-2">Stage-1</th>
                <th className="pb-2">等级</th>
                <th className="pb-2">命中</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((item) => (
                <tr key={item.id} className="border-t border-white/10">
                  <td className="py-2">{item.id.slice(0, 8)}</td>
                  <td className="py-2 font-mono text-xs">{item.sequence}</td>
                  <td className="py-2">{modeLabel(item.modelMode)}</td>
                  <td className="py-2">{item.modelMode === "online" ? `${((item.modelProbability ?? 0) * 100).toFixed(2)}%` : `${(item.heuristicScore ?? 0).toFixed(1)} / 100`}</td>
                  <td className="py-2">{typeof item.stage1Score === "number" ? item.stage1Score.toFixed(4) : "--"}</td>
                  <td className="py-2">{predictionLevelText(item.level)}</td>
                  <td className="py-2">{item.candidateHit ? "是" : "否"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 grid gap-2 md:hidden">
          {filteredResults.map((item) => (
            <article key={item.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs">
              <p className="font-mono text-white">{item.sequence}</p>
              <p className="mt-1 text-slate-300">{modeLabel(item.modelMode)} · {predictionLevelText(item.level)}</p>
              <p className="text-slate-400">{item.modelMode === "online" ? `模型预测概率：${((item.modelProbability ?? 0) * 100).toFixed(2)}%` : `启发式评分：${(item.heuristicScore ?? 0).toFixed(1)} / 100`}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
