"use client";

import { useMemo, useState } from "react";

import {
  DatasetSummary,
  FeatureAblationData,
  ModelMetrics,
  PaperHighlights
} from "@/lib/adp-dem/types";

interface ResearchHubProps {
  datasetSummary: DatasetSummary;
  modelMetrics: ModelMetrics;
  featureAblation: FeatureAblationData;
  paperHighlights: PaperHighlights;
  initialTab?: string;
}

type ResearchTab = "pipeline" | "dataset" | "performance" | "ablation" | "paper";

const tabs: Array<{ key: ResearchTab; label: string }> = [
  { key: "pipeline", label: "模型流程" },
  { key: "dataset", label: "数据集" },
  { key: "performance", label: "模型性能" },
  { key: "ablation", label: "消融实验" },
  { key: "paper", label: "论文资料" }
];

export function ResearchHub({ datasetSummary, modelMetrics, featureAblation, paperHighlights, initialTab }: ResearchHubProps) {
  const [activeTab, setActiveTab] = useState<ResearchTab>(
    initialTab === "paper" || initialTab === "pipeline" || initialTab === "dataset" || initialTab === "performance" || initialTab === "ablation"
      ? initialTab
      : "pipeline"
  );

  const aminoRows = useMemo(() => {
    return datasetSummary.aminoAcidFrequency.positive
      .map((item) => ({
        aa: item.aa,
        positive: item.freq,
        negative: datasetSummary.aminoAcidFrequency.negative.find((target) => target.aa === item.aa)?.freq ?? 0
      }))
      .sort((a, b) => b.positive - a.positive);
  }, [datasetSummary]);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                activeTab === tab.key
                  ? "border-luxury-gold/55 bg-luxury-gold/15 text-luxury-champagne"
                  : "border-white/15 text-slate-300 hover:border-white/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {activeTab === "pipeline" ? (
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-slate-200">
          <h3 className="text-lg text-white">ADP-DEM 两阶段流程</h3>
          <div className="mt-3 grid gap-2 md:grid-cols-5">
            {["输入序列", "Stage-1 主筛", "结构增强特征", "Stage-2 重排序", "候选输出与验证"].map((step, index) => (
              <div key={step} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs text-luxury-gold">Step {index + 1}</p>
                <p className="mt-1 text-sm">{step}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 leading-relaxed text-slate-300">
            Stage-1 用于高通量主筛，快速排除低潜力序列；Stage-2 引入结构感知信息提升对潜在活性肽的召回。
          </p>
        </section>
      ) : null}

      {activeTab === "dataset" ? (
        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="grid gap-3 md:grid-cols-4">
            <Metric title="总样本" value={String(datasetSummary.totalSamples)} />
            <Metric title="正样本" value={String(datasetSummary.positiveSamples)} />
            <Metric title="负样本" value={String(datasetSummary.negativeSamples)} />
            <Metric title="均值长度" value={datasetSummary.lengthStats.mean.toFixed(2)} />
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <table className="w-full min-w-[780px] text-sm text-slate-200">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-luxury-gold">
                  <th className="pb-2">AA</th>
                  <th className="pb-2">正样本频率</th>
                  <th className="pb-2">负样本频率</th>
                </tr>
              </thead>
              <tbody>
                {aminoRows.map((row) => (
                  <tr key={row.aa} className="border-t border-white/10">
                    <td className="py-2">{row.aa}</td>
                    <td className="py-2">{(row.positive * 100).toFixed(2)}%</td>
                    <td className="py-2">{(row.negative * 100).toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {activeTab === "performance" ? (
        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <Metric title="Stage-1 ACC" value={`${modelMetrics.independentTest.stage1.acc}%`} />
            <Metric title="Stage-1 AUC" value={`${modelMetrics.independentTest.stage1.auc}%`} />
            <Metric title="Stage-2 SN" value={`${modelMetrics.independentTest.stage2.sn}%`} />
            <Metric title="Stage-2 MCC" value={`${modelMetrics.independentTest.stage2.mcc}%`} />
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <table className="w-full min-w-[760px] text-sm text-slate-200">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-luxury-gold">
                  <th className="pb-2">方法</th>
                  <th className="pb-2">ACC</th>
                  <th className="pb-2">SN</th>
                  <th className="pb-2">SP</th>
                  <th className="pb-2">MCC</th>
                  <th className="pb-2">AUC</th>
                </tr>
              </thead>
              <tbody>
                {modelMetrics.methodComparisons.map((row) => (
                  <tr key={row.method} className="border-t border-white/10">
                    <td className="py-2">{row.method}</td>
                    <td className="py-2">{row.acc ?? "-"}</td>
                    <td className="py-2">{row.sn ?? "-"}</td>
                    <td className="py-2">{row.sp ?? "-"}</td>
                    <td className="py-2">{row.mcc ?? "-"}</td>
                    <td className="py-2">{row.auc ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {activeTab === "ablation" ? (
        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="grid gap-3 md:grid-cols-2">
            {featureAblation.featureContribution.map((item) => (
              <article key={item.feature} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-sm text-white">{item.feature}</p>
                <p className="mt-1 text-xs text-luxury-gold">贡献度 {(item.normalizedImpact * 100).toFixed(1)}%</p>
                <p className="mt-1 text-xs text-slate-300">{item.description}</p>
              </article>
            ))}
          </div>
          <div className="space-y-2">
            {featureAblation.moduleAblation.map((item) => (
              <article key={item.module} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">
                <p className="text-white">{item.module}</p>
                <p className="text-xs text-luxury-gold">{item.impact}</p>
                <p className="mt-1 text-xs text-slate-300">{item.summary}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "paper" ? (
        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h3 className="text-lg text-white">{paperHighlights.title}</h3>
          <p className="text-sm text-luxury-gold">{paperHighlights.englishTitle}</p>
          <p className="text-sm text-slate-300">团队：{paperHighlights.teamMembers.join("、")} · 指导老师：{paperHighlights.advisor}</p>
          <p className="text-sm leading-relaxed text-slate-300">{paperHighlights.abstractShort}</p>
          <div className="flex flex-wrap gap-2">
            {paperHighlights.keywords.map((keyword) => (
              <span key={keyword} className="rounded-full border border-luxury-gold/35 bg-luxury-gold/10 px-3 py-1 text-xs text-luxury-champagne">{keyword}</span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="/adp-dem/assets/adp-dem-paper.docx" target="_blank" rel="noreferrer" className="rounded-md border border-white/20 px-3 py-2 text-sm text-slate-100 hover:border-luxury-gold/45">下载 DOCX</a>
            <a href="/adp-dem/assets/adp-dem-paper.pdf" target="_blank" rel="noreferrer" className="rounded-md border border-white/20 px-3 py-2 text-sm text-slate-100 hover:border-luxury-gold/45">下载 PDF</a>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-xs text-slate-400">{title}</p>
      <p className="mt-1 text-lg text-white">{value}</p>
    </article>
  );
}
