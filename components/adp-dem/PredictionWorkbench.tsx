"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { HelpTooltip } from "@/components/adp-dem/HelpTooltip";
import { modelModeText } from "@/lib/adp-dem/report";
import { CandidateItem } from "@/lib/adp-dem/types";

const PredictSingleTab = dynamic(() => import("@/components/adp-dem/PredictSingleTab").then((mod) => mod.PredictSingleTab), {
  ssr: false,
  loading: () => <TabLoading />
});
const PredictBatchTab = dynamic(() => import("@/components/adp-dem/PredictBatchTab").then((mod) => mod.PredictBatchTab), {
  ssr: false,
  loading: () => <TabLoading />
});
const PredictCompareTab = dynamic(() => import("@/components/adp-dem/PredictCompareTab").then((mod) => mod.PredictCompareTab), {
  ssr: false,
  loading: () => <TabLoading />
});
const PredictMutationTab = dynamic(() => import("@/components/adp-dem/PredictMutationTab").then((mod) => mod.PredictMutationTab), {
  ssr: false,
  loading: () => <TabLoading />
});

interface PredictionWorkbenchProps {
  candidates: CandidateItem[];
  initialSequence?: string;
  initialTab?: string;
  backendConfigured: boolean;
}

type PredictTab = "single" | "batch" | "compare" | "mutation";

const tabs: Array<{ key: PredictTab; label: string }> = [
  { key: "single", label: "单条预测" },
  { key: "batch", label: "批量预测" },
  { key: "compare", label: "序列对比" },
  { key: "mutation", label: "突变扫描" }
];

function normalizePredictTab(value?: string | null): PredictTab {
  return value === "batch" || value === "compare" || value === "mutation" || value === "single" ? value : "single";
}

export function PredictionWorkbench({
  candidates,
  initialSequence,
  initialTab,
  backendConfigured
}: PredictionWorkbenchProps) {
  const [activeTab, setActiveTab] = useState<PredictTab>(normalizePredictTab(initialTab));
  const [sequenceFromQuery, setSequenceFromQuery] = useState(initialSequence ?? "");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setActiveTab(normalizePredictTab(params.get("tab") ?? initialTab));
    setSequenceFromQuery(params.get("sequence") ?? initialSequence ?? "");
  }, [initialSequence, initialTab]);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="mb-4 grid gap-2 text-xs text-slate-300 md:grid-cols-2">
          <StatusPill label="模型服务" value={backendConfigured ? "在线待请求" : "离线"} tone={backendConfigured ? "good" : "warn"} />
          <StatusPill
            label="当前模式"
            value={backendConfigured ? modelModeText("online") : modelModeText("offline-demo")}
            tone={backendConfigured ? "good" : "warn"}
            help="真实模型模式会调用已配置的后端推理服务；离线演示模式只做基础性质分析、候选库匹配和相似推荐。"
          />
        </div>
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

      {activeTab === "single" ? <PredictSingleTab candidates={candidates} initialSequence={sequenceFromQuery} backendConfigured={backendConfigured} /> : null}
      {activeTab === "batch" ? <PredictBatchTab candidates={candidates} backendConfigured={backendConfigured} /> : null}
      {activeTab === "compare" ? <PredictCompareTab candidates={candidates} backendConfigured={backendConfigured} /> : null}
      {activeTab === "mutation" ? <PredictMutationTab candidates={candidates} backendConfigured={backendConfigured} /> : null}
    </div>
  );
}

function StatusPill({ label, value, tone, help }: { label: string; value: string; tone?: "good" | "warn"; help?: string }) {
  const toneClass = tone === "good" ? "text-emerald-100" : tone === "warn" ? "text-amber-100" : "text-slate-100";
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
        {label}
        {help ? <HelpTooltip label={`${label}说明`} content={help} /> : null}
      </p>
      <p className={`mt-0.5 truncate ${toneClass}`}>{value}</p>
    </div>
  );
}

function TabLoading() {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-sm text-slate-300">正在加载分析模块...</div>;
}
