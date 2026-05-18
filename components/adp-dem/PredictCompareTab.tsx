"use client";

import { useMemo, useState } from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestBackendPrediction } from "@/lib/adp-dem/api";
import { downloadCsv, toCsv } from "@/lib/adp-dem/export";
import { predictionLevelText, predictSequenceDemo } from "@/lib/adp-dem/predict";
import { sanitizeSequence } from "@/lib/adp-dem/properties";
import { CandidateItem, PredictionResult } from "@/lib/adp-dem/types";

interface PredictCompareTabProps {
  candidates: CandidateItem[];
  backendConfigured: boolean;
}

function modeLabel(mode: PredictionResult["modelMode"]) {
  return mode === "online" ? "真实模型推理" : "离线演示分析";
}

export function PredictCompareTab({ candidates, backendConfigured }: PredictCompareTabProps) {
  const [inputs, setInputs] = useState<string[]>(["RVIPAAVVGAAVAGGL", "MEALKRKIEEEGVVL"]);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<PredictionResult[]>([]);

  async function runCompare() {
    const sequences = inputs.map((item) => sanitizeSequence(item)).filter(Boolean).slice(0, 5);
    if (sequences.length < 2) return;

    setBusy(true);
    const output: PredictionResult[] = [];

    for (const sequence of sequences) {
      const demo = predictSequenceDemo({ sequence, candidates });
      if (!demo.ok || !demo.result) continue;

      if (backendConfigured) {
        const backend = await requestBackendPrediction(demo.result.sequence, demo.result);
        output.push(backend.ok && backend.result ? backend.result : demo.result);
      } else {
        output.push(demo.result);
      }
    }

    setResults(output);
    setBusy(false);
  }

  const radarData = useMemo(() => {
    if (results.length === 0) return [];
    return [
      {
        metric: "长度",
        ...Object.fromEntries(results.map((item, index) => [`S${index + 1}`, Math.min(100, Math.round((item.properties.length / 40) * 100))]))
      },
      {
        metric: "疏水性",
        ...Object.fromEntries(results.map((item, index) => [`S${index + 1}`, Math.round(item.properties.hydrophobicRatio * 100)]))
      },
      {
        metric: "净电荷",
        ...Object.fromEntries(results.map((item, index) => [`S${index + 1}`, 50 + item.properties.netCharge * 8]))
      },
      {
        metric: "芳香族",
        ...Object.fromEntries(results.map((item, index) => [`S${index + 1}`, Math.round(item.properties.aromaticRatio * 100)]))
      },
      {
        metric: "极性",
        ...Object.fromEntries(results.map((item, index) => [`S${index + 1}`, Math.round(item.properties.polarRatio * 100)]))
      }
    ];
  }, [results]);

  const bestCandidate = useMemo(() => {
    if (results.length === 0) return null;
    const online = results.filter((item) => item.modelMode === "online" && typeof item.modelProbability === "number");
    if (online.length > 0) {
      return [...online].sort((a, b) => (b.modelProbability ?? 0) - (a.modelProbability ?? 0))[0];
    }
    return [...results].sort((a, b) => (b.heuristicScore ?? 0) - (a.heuristicScore ?? 0))[0];
  }, [results]);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <p className="text-sm text-luxury-champagne">序列对比输入（2-5 条）</p>
        <div className="mt-2 grid gap-2">
          {inputs.map((value, index) => (
            <div key={`compare-${index}`} className="flex gap-2">
              <Input
                value={value}
                onChange={(event) => {
                  const next = [...inputs];
                  next[index] = event.target.value;
                  setInputs(next);
                }}
                placeholder={`序列 ${index + 1}`}
                className="font-mono"
              />
              {inputs.length > 2 ? (
                <Button variant="ghost" onClick={() => setInputs(inputs.filter((_, rowIndex) => rowIndex !== index))}>删除</Button>
              ) : null}
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={() => void runCompare()} disabled={busy}>{busy ? "分析中..." : "开始对比"}</Button>
          <Button variant="secondary" onClick={() => inputs.length < 5 && setInputs([...inputs, ""])} disabled={inputs.length >= 5}>新增序列</Button>
          <Button
            variant="secondary"
            onClick={() => {
              if (results.length === 0) return;
              const rows = results.map((item) => ({
                sequence: item.sequence,
                modelMode: item.modelMode,
                level: predictionLevelText(item.level),
                modelProbability: item.modelMode === "online" ? item.modelProbability ?? "" : "",
                heuristicScore: item.modelMode === "offline-demo" ? item.heuristicScore ?? "" : "",
                stage1Score: item.stage1Score ?? "",
                hydrophobicRatio: item.properties.hydrophobicRatio,
                netCharge: item.properties.netCharge,
                aromaticRatio: item.properties.aromaticRatio,
                polarRatio: item.properties.polarRatio,
                candidateHit: item.candidateHit
              }));
              downloadCsv(
                toCsv(rows, ["sequence", "modelMode", "level", "modelProbability", "heuristicScore", "stage1Score", "hydrophobicRatio", "netCharge", "aromaticRatio", "polarRatio", "candidateHit"]),
                "adp-dem-compare.csv"
              );
            }}
          >
            导出对比报告
          </Button>
        </div>
        {bestCandidate ? (
          <p className="mt-3 rounded-xl border border-emerald-300/30 bg-emerald-200/10 p-3 text-sm text-emerald-100">
            优先候选建议：<span className="font-mono">{bestCandidate.sequence}</span>（{bestCandidate.modelMode === "online" ? "按模型概率" : "按启发式评分"}）
          </p>
        ) : null}
      </section>

      {results.length > 0 ? (
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-luxury-champagne">对比雷达图</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.15)" />
                <PolarAngleAxis dataKey="metric" stroke="#d2dbef" fontSize={12} />
                {results.map((_, index) => (
                  <Radar
                    key={`radar-${index}`}
                    dataKey={`S${index + 1}`}
                    stroke={["#d4b273", "#7ea2ff", "#56d0b1", "#ff9a7a", "#caa0ff"][index]}
                    fill={["#d4b273", "#7ea2ff", "#56d0b1", "#ff9a7a", "#caa0ff"][index]}
                    fillOpacity={0.12}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>
      ) : null}

      {results.length > 0 ? (
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-luxury-champagne">对比表格</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[920px] text-sm text-slate-200">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-luxury-gold">
                  <th className="pb-2">序列</th>
                  <th className="pb-2">长度</th>
                  <th className="pb-2">疏水性</th>
                  <th className="pb-2">净电荷</th>
                  <th className="pb-2">芳香族</th>
                  <th className="pb-2">极性</th>
                  <th className="pb-2">候选命中</th>
                  <th className="pb-2">当前模式</th>
                  <th className="pb-2">模型预测概率 / 启发式</th>
                </tr>
              </thead>
              <tbody>
                {results.map((item) => (
                  <tr key={item.id} className="border-t border-white/10">
                    <td className="py-2 font-mono text-xs">{item.sequence}</td>
                    <td className="py-2">{item.properties.length}</td>
                    <td className="py-2">{(item.properties.hydrophobicRatio * 100).toFixed(1)}%</td>
                    <td className="py-2">{item.properties.netCharge}</td>
                    <td className="py-2">{(item.properties.aromaticRatio * 100).toFixed(1)}%</td>
                    <td className="py-2">{(item.properties.polarRatio * 100).toFixed(1)}%</td>
                    <td className="py-2">{item.candidateHit ? "是" : "否"}</td>
                    <td className="py-2">{modeLabel(item.modelMode)}</td>
                    <td className="py-2">{item.modelMode === "online" ? `${((item.modelProbability ?? 0) * 100).toFixed(2)}%` : `${(item.heuristicScore ?? 0).toFixed(1)} / 100`}</td>
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
