"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { Button } from "@/components/ui/button";
import {
  copyPredictionSummary,
  exportSinglePrediction
} from "@/lib/adp-dem/export";
import { parseSequenceInput } from "@/lib/adp-dem/parsers";
import {
  predictionLevelText,
  predictSequenceDemo,
  recommendationLevel,
  toConfidenceLabel,
  toPredictionLevel
} from "@/lib/adp-dem/predict";
import { sanitizeSequence } from "@/lib/adp-dem/properties";
import {
  addReportDraftItem,
  pushHistory,
  upsertFavorite
} from "@/lib/adp-dem/storage";
import { requestBackendPrediction } from "@/lib/adp-dem/api";
import { buildSinglePredictionReport, modelModeText, openPrintReport } from "@/lib/adp-dem/report";
import { CandidateItem, PredictionResult } from "@/lib/adp-dem/types";
import { validateUploadFile, validateSequenceRows } from "@/lib/adp-dem/upload";

interface PredictSingleTabProps {
  candidates: CandidateItem[];
  initialSequence?: string;
  backendConfigured: boolean;
}

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function metricRows(result: PredictionResult) {
  const rows = [
    { label: "当前模式", value: modelModeText(result.modelMode) },
    { label: "结果来源", value: result.source === "model" ? "Model" : result.source === "candidate-library" ? "Candidate Library" : "Demo" },
    { label: "可信度等级", value: `${result.credibilityLevel} · ${result.credibilityReason}` },
    { label: "预测等级", value: predictionLevelText(result.level) },
    ...(result.modelMode === "online"
      ? [
          { label: "模型预测概率", value: `${((result.modelProbability ?? 0) * 100).toFixed(2)}%` },
          { label: "Stage-1 分数", value: typeof result.stage1Score === "number" ? result.stage1Score.toFixed(4) : "--" },
          { label: "Stage-2 分数", value: typeof result.stage2Score === "number" ? result.stage2Score.toFixed(4) : "--" },
          { label: "候选排名", value: typeof result.candidateRank === "number" ? `#${result.candidateRank}` : "--" }
        ]
      : []),
    { label: "候选库命中", value: result.candidateHit ? "命中" : "未命中" },
    { label: "相似候选", value: `${result.similarCandidates.length} 条` },
    { label: "启发式评分", value: typeof result.heuristicScore === "number" ? `${result.heuristicScore.toFixed(1)} / 100` : "--" },
    { label: "推荐等级", value: recommendationLevel(result) }
  ];
  return rows;
}

export function PredictSingleTab({ candidates, initialSequence, backendConfigured }: PredictSingleTabProps) {
  const [input, setInput] = useState(initialSequence || "RVIPAAVVGAAVAGGL");
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(
    "当前模式：离线演示分析。仅展示基础性质分析、候选库命中、相似候选推荐和启发式评分。"
  );

  async function analyze() {
    setBusy(true);
    setError("");

    const demo = predictSequenceDemo({ sequence: input, candidates });
    if (!demo.ok || !demo.result) {
      setError(demo.errors[0] ?? "输入序列无效");
      setBusy(false);
      return;
    }

    let finalResult = demo.result;
    if (backendConfigured) {
      const backend = await requestBackendPrediction(demo.result.sequence, demo.result);
      if (backend.ok && backend.result) {
        const level = toPredictionLevel(backend.result.modelProbability);
        finalResult = {
          ...backend.result,
          level,
          confidenceLabel: toConfidenceLabel(level)
        };
      setNotice("当前模式：真实模型推理。结果展示后端返回的模型分数、阶段分数和版本信息。");
      } else {
        setNotice(backend.error ?? "当前模式：离线演示分析。仅展示基础性质分析、候选库命中、相似候选推荐和启发式评分。");
      }
    }

    setResult(finalResult);
    pushHistory({ ...finalResult, recordType: "single" });
    setBusy(false);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs text-slate-400">当前模式</p>
          <p className="mt-1 text-sm text-luxury-champagne">{result ? modelModeText(result.modelMode) : backendConfigured ? "待分析" : "离线演示分析"}</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-300">{notice}</p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-luxury-champagne">单条序列输入</p>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={7}
            className="mt-2 w-full rounded-lg border border-white/15 bg-slate-950/70 p-3 font-mono text-sm"
            placeholder="输入氨基酸序列"
          />
          {error ? <p className="mt-2 text-xs text-rose-200">{error}</p> : null}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button onClick={() => void analyze()} disabled={busy}>{busy ? "分析中..." : "开始分析"}</Button>
            <Button
              variant="secondary"
              onClick={() => {
                setInput("");
                setResult(null);
                setError("");
              }}
            >
              清空输入
            </Button>
            <Button variant="ghost" onClick={() => setInput("MEALKRKIEEEGVVL")}>示例 1</Button>
            <Button variant="ghost" onClick={() => setInput("GIAMAVGMAIAERHL")}>示例 2</Button>
          </div>
          <div className="mt-3 grid gap-2">
            <label className="text-xs text-slate-400">文件上传（FASTA/CSV/TXT）</label>
            <input
              type="file"
              accept=".fasta,.fa,.txt,.csv"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                const fileErrors = validateUploadFile(file);
                if (fileErrors.length > 0) {
                  setError(fileErrors.join(" "));
                  return;
                }
                const text = await file.text();
                const validation = validateSequenceRows(text, 1);
                if (validation.errors.length > 0 || validation.invalidRows.length > 0) {
                  setError(validation.errors[0] ?? validation.invalidRows[0]?.reason ?? "文件内序列无效");
                  return;
                }
                const first = validation.sequences[0] ?? parseSequenceInput(text)[0];
                if (first?.sequence) setInput(first.sequence);
              }}
              className="text-xs"
            />
            <button disabled className="rounded-md border border-dashed border-white/20 px-3 py-2 text-left text-xs text-slate-400">
              PDB 结构文件上传（Coming Soon）
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-luxury-champagne">操作</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => navigator.clipboard.writeText(sanitizeSequence(input))}>复制序列</Button>
            <Button variant="secondary" onClick={() => result && void copyPredictionSummary(result)} disabled={!result}>复制摘要</Button>
            <Button
              variant="secondary"
              disabled={!result}
              onClick={() => {
                if (!result) return;
                upsertFavorite({
                  id: createId(),
                  sequence: result.sequence,
                  rank: result.candidateRank,
                  stage1Score: result.stage1Score,
                  stage2Score: result.stage2Score,
                  createdAt: new Date().toISOString()
                });
              }}
            >
              加入收藏
            </Button>
            <Button variant="secondary" disabled={!result} onClick={() => result && pushHistory({ ...result, recordType: "single" })}>保存历史</Button>
            <Button variant="secondary" disabled={!result} onClick={() => result && exportSinglePrediction(result)}>导出 CSV</Button>
            <Button
              variant="secondary"
              disabled={!result}
              onClick={() => {
                if (!result) return;
                addReportDraftItem({
                  id: createId(),
                  source: "single",
                  title: `单条预测 - ${result.sequence.slice(0, 18)}`,
                  createdAt: new Date().toISOString(),
                  sequence: result.sequence,
                  modelMode: result.modelMode,
                  content: `当前模式：${modelModeText(result.modelMode)}\n等级：${predictionLevelText(result.level)}\n可信度：${result.credibilityLevel}（${result.credibilityReason}）\n推荐等级：${recommendationLevel(result)}\n结论：${result.explanation}`
                });
              }}
            >
              生成报告
            </Button>
            <Button
              variant="ghost"
              disabled={!result}
              onClick={() => {
                if (!result) return;
                openPrintReport(buildSinglePredictionReport(result));
              }}
            >
              打印报告
            </Button>
          </div>
        </section>
      </aside>

      <section className="space-y-4">
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg text-white">结果总览</h3>
            {result ? (
              <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-luxury-champagne">
                {modelModeText(result.modelMode)}
              </span>
            ) : null}
          </div>
          {result ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {metricRows(result).map((item) => (
                <article key={item.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="mt-1 text-sm text-slate-100">{item.value}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-300">输入序列后点击“开始分析”。</p>
          )}
          {result && result.modelMode === "offline-demo" ? (
            <p className="mt-3 rounded-xl border border-amber-200/30 bg-amber-100/10 p-3 text-xs text-amber-100">
              当前模式：离线演示分析。只展示基础性质分析、候选库命中、相似候选推荐和启发式评分，不提供模型预测概率或候选排名。
            </p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-luxury-champagne">Stage 流程状态</p>
          <div className="mt-3 grid gap-2 md:grid-cols-5">
            {["输入校验", "性质分析", "候选库匹配", result?.modelMode === "online" ? "模型推理" : "Demo 分析", "报告生成"].map((step) => (
              <div key={step} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-200">{step}</div>
            ))}
          </div>
        </section>

        {result?.modelMode === "online" ? (
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm text-luxury-champagne">预测分数仪表盘</p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "score", value: Math.max(0, Math.min(100, Math.round((result.modelProbability ?? 0) * 100))) },
                      { name: "rest", value: 100 - Math.max(0, Math.min(100, Math.round((result.modelProbability ?? 0) * 100))) }
                    ]}
                    dataKey="value"
                    startAngle={210}
                    endAngle={-30}
                    innerRadius={55}
                    outerRadius={78}
                    stroke="none"
                  >
                    <Cell fill="#d4b273" />
                    <Cell fill="rgba(255,255,255,0.12)" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="-mt-24 text-center font-display text-4xl text-white">{((result.modelProbability ?? 0) * 100).toFixed(2)}%</p>
          </section>
        ) : null}

        {result ? (
          <div className="grid gap-4 xl:grid-cols-2">
            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-luxury-champagne">氨基酸组成柱状图</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.entries(result.properties.aminoAcidCounts)
                      .filter(([, count]) => count > 0)
                      .map(([aa, count]) => ({ aa, count }))
                      .sort((a, b) => b.count - a.count)}
                  >
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis dataKey="aa" stroke="#cad4e8" fontSize={12} />
                    <YAxis stroke="#cad4e8" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#d4b273" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-luxury-champagne">序列性质雷达图</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    data={[
                      { metric: "长度", value: Math.min(100, Math.round((result.properties.length / 40) * 100)) },
                      { metric: "疏水", value: Math.round(result.properties.hydrophobicRatio * 100) },
                      { metric: "净电荷", value: Math.min(100, Math.max(0, 50 + result.properties.netCharge * 8)) },
                      { metric: "芳香", value: Math.round(result.properties.aromaticRatio * 100) },
                      { metric: "极性", value: Math.round(result.properties.polarRatio * 100) }
                    ]}
                  >
                    <PolarGrid stroke="rgba(255,255,255,0.15)" />
                    <PolarAngleAxis dataKey="metric" stroke="#d2dbef" fontSize={12} />
                    <Radar dataKey="value" stroke="#88a0ff" fill="#88a0ff" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        ) : null}

        {result ? (
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm text-luxury-champagne">序列氨基酸类型色带</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {[...result.sequence].map((aa, index) => (
                <span
                  key={`${aa}-${index}`}
                  className={`inline-flex h-7 w-7 items-center justify-center rounded text-[10px] font-semibold text-[#0b1122] ${
                    "KRH".includes(aa)
                      ? "bg-blue-400/70"
                      : "DE".includes(aa)
                        ? "bg-rose-400/70"
                        : "FWY".includes(aa)
                          ? "bg-violet-400/70"
                          : "AVILM".includes(aa)
                            ? "bg-amber-300/80"
                            : "bg-emerald-400/70"
                  }`}
                >
                  {aa}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {result ? (
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm text-luxury-champagne">相似候选对比</p>
            {result.similarCandidates.length > 0 ? (
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {result.similarCandidates.map((item) => (
                  <article key={`${item.sequence}-${item.rank}`} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="font-mono text-xs text-white">{item.sequence}</p>
                    <p className="mt-1 text-xs text-slate-300">
                      相似度 {(item.similarity * 100).toFixed(1)}% · 候选样本 #{item.rank}
                      {result.modelMode === "online" ? ` · Stage-1 ${item.stage1Score.toFixed(4)}` : ""}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-400">未找到高相似候选。</p>
            )}
          </section>
        ) : null}

        {result ? (
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-200">
            <p className="text-luxury-champagne">解释文本</p>
            <p className="mt-2 leading-relaxed">{result.explanation}</p>
          </section>
        ) : null}
      </section>
    </div>
  );
}
