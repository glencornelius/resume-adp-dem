"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestBackendPrediction } from "@/lib/adp-dem/api";
import { downloadCsv, toCsv } from "@/lib/adp-dem/export";
import { predictSequenceDemo } from "@/lib/adp-dem/predict";
import { VALID_AMINO_ACIDS, validateSequence } from "@/lib/adp-dem/properties";
import { CandidateItem, PredictionResult } from "@/lib/adp-dem/types";

interface PredictMutationTabProps {
  candidates: CandidateItem[];
  backendConfigured: boolean;
}

function modeLabel(mode: PredictionResult["modelMode"]) {
  return mode === "online" ? "真实模型推理" : "离线演示分析";
}

export function PredictMutationTab({ candidates, backendConfigured }: PredictMutationTabProps) {
  const [input, setInput] = useState("RVIPAAVVGAAVAGGL");
  const [position, setPosition] = useState(1);
  const [replacement, setReplacement] = useState("A");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [beforeResult, setBeforeResult] = useState<PredictionResult | null>(null);
  const [afterResult, setAfterResult] = useState<PredictionResult | null>(null);

  const mutationImpactRows = useMemo(() => {
    const checked = validateSequence(input);
    if (!checked.valid) return [];
    const seq = checked.sequence;
    if (position < 1 || position > seq.length) return [];

    return VALID_AMINO_ACIDS.split("").map((aa) => {
      const mutated = `${seq.slice(0, position - 1)}${aa}${seq.slice(position)}`;
      const result = predictSequenceDemo({ sequence: mutated, candidates });
      return {
        aa,
        heuristicScore: result.ok && result.result ? result.result.heuristicScore ?? 0 : 0,
        candidateHit: result.ok && result.result ? result.result.candidateHit : false
      };
    }).sort((a, b) => b.heuristicScore - a.heuristicScore);
  }, [input, position, candidates]);

  async function runMutation() {
    setBusy(true);
    setError("");

    const checked = validateSequence(input);
    if (!checked.valid) {
      setError(checked.errors[0] ?? "输入序列无效");
      setBusy(false);
      return;
    }

    const baseSeq = checked.sequence;
    if (position < 1 || position > baseSeq.length) {
      setError("突变位点超出序列长度范围");
      setBusy(false);
      return;
    }

    const before = predictSequenceDemo({ sequence: baseSeq, candidates });
    const mutatedSeq = `${baseSeq.slice(0, position - 1)}${replacement}${baseSeq.slice(position)}`;
    const after = predictSequenceDemo({ sequence: mutatedSeq, candidates });

    if (!before.ok || !before.result || !after.ok || !after.result) {
      setError("突变扫描失败，请检查输入");
      setBusy(false);
      return;
    }

    let finalBefore = before.result;
    let finalAfter = after.result;

    if (backendConfigured) {
      const [beforeBackend, afterBackend] = await Promise.all([
        requestBackendPrediction(before.result.sequence, before.result),
        requestBackendPrediction(after.result.sequence, after.result)
      ]);
      if (beforeBackend.ok && beforeBackend.result) finalBefore = beforeBackend.result;
      if (afterBackend.ok && afterBackend.result) finalAfter = afterBackend.result;
    }

    setBeforeResult(finalBefore);
    setAfterResult(finalAfter);
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <p className="text-sm text-luxury-champagne">突变扫描</p>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          <Input value={input} onChange={(event) => setInput(event.target.value)} className="font-mono md:col-span-2" placeholder="输入原始序列" />
          <div className="grid grid-cols-2 gap-2">
            <Input value={String(position)} onChange={(event) => setPosition(Number(event.target.value) || 1)} placeholder="位点" />
            <select
              value={replacement}
              onChange={(event) => setReplacement(event.target.value)}
              className="h-10 rounded-md border border-white/20 bg-slate-950/70 px-3 text-sm"
            >
              {VALID_AMINO_ACIDS.split("").map((aa) => (
                <option key={aa} value={aa}>{aa}</option>
              ))}
            </select>
          </div>
        </div>
        {error ? <p className="mt-2 text-xs text-rose-200">{error}</p> : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={() => void runMutation()} disabled={busy}>{busy ? "分析中..." : "生成突变并分析"}</Button>
          <Button
            variant="secondary"
            onClick={() => {
              const checked = validateSequence(input);
              if (!checked.valid) return;
              const seq = checked.sequence;
              const rows = mutationImpactRows.map((row) => ({
                position,
                aminoAcid: row.aa,
                mutatedSequence: `${seq.slice(0, position - 1)}${row.aa}${seq.slice(position)}`,
                heuristicScore: row.heuristicScore,
                candidateHit: row.candidateHit
              }));
              downloadCsv(toCsv(rows, ["position", "aminoAcid", "mutatedSequence", "heuristicScore", "candidateHit"]), "adp-dem-mutation-scan.csv");
            }}
          >
            导出突变扫描结果
          </Button>
        </div>
        {beforeResult?.modelMode === "offline-demo" || afterResult?.modelMode === "offline-demo" ? (
          <p className="mt-3 rounded-xl border border-amber-200/30 bg-amber-100/10 p-3 text-xs text-amber-100">
            当前模式：离线演示分析。只展示基础性质变化、候选库命中和启发式评分，不提供模型预测概率。
          </p>
        ) : null}
      </section>

      {beforeResult && afterResult ? (
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-luxury-champagne">突变前后对比</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {[beforeResult, afterResult].map((item, index) => (
              <article key={item.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs text-slate-400">{index === 0 ? "突变前" : "突变后"}</p>
                <p className="mt-1 font-mono text-xs text-white">{item.sequence}</p>
                <p className="mt-2 text-xs text-slate-300">模式：{modeLabel(item.modelMode)}</p>
                <p className="text-xs text-slate-300">疏水性：{(item.properties.hydrophobicRatio * 100).toFixed(1)}%</p>
                <p className="text-xs text-slate-300">净电荷：{item.properties.netCharge}</p>
                <p className="text-xs text-slate-300">候选命中：{item.candidateHit ? "是" : "否"}</p>
                <p className="text-xs text-slate-300">
                  {item.modelMode === "online"
                    ? `模型预测概率：${((item.modelProbability ?? 0) * 100).toFixed(2)}%`
                    : `启发式评分：${(item.heuristicScore ?? 0).toFixed(1)} / 100`}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {mutationImpactRows.length > 0 ? (
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-luxury-champagne">位点影响表（按启发式评分）</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm text-slate-200">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-luxury-gold">
                  <th className="pb-2">替换氨基酸</th>
                  <th className="pb-2">启发式评分</th>
                  <th className="pb-2">候选命中</th>
                </tr>
              </thead>
              <tbody>
                {mutationImpactRows.map((row) => (
                  <tr key={row.aa} className="border-t border-white/10">
                    <td className="py-2">{row.aa}</td>
                    <td className="py-2">{row.heuristicScore.toFixed(2)}</td>
                    <td className="py-2">{row.candidateHit ? "是" : "否"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
