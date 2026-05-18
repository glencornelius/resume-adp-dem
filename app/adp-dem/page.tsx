import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/adp-dem/AppShell";
import { Button } from "@/components/ui/button";
import { loadAdpDemData } from "@/lib/adp-dem/data";

export const metadata: Metadata = {
  title: "ADP-DEM 抗糖尿病肽智能预测平台",
  description: "以预测为核心的多模态抗糖尿病肽分析平台，覆盖输入、分析、解释、候选推荐、收藏与报告导出。"
};

export default async function AdpDemHomePage() {
  const data = await loadAdpDemData();

  return (
    <AppShell>
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(145deg,rgba(8,12,29,0.96),rgba(13,23,49,0.92)_55%,rgba(24,17,34,0.94))] p-6 md:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(212,178,115,0.15),transparent_36%),radial-gradient(circle_at_82%_70%,rgba(95,123,255,0.2),transparent_35%)]" />
        <div className="relative z-10">
          <p className="inline-flex rounded-full border border-luxury-gold/40 bg-luxury-gold/10 px-3 py-1 text-xs tracking-[0.14em] text-luxury-champagne">ADP-DEM PLATFORM</p>
          <h1 className="mt-4 max-w-full break-words font-display text-3xl text-white md:text-5xl">ADP-DEM 抗糖尿病肽智能预测平台</h1>
          <p className="mt-4 max-w-4xl text-sm leading-relaxed text-slate-200">
            输入序列 → 预测分析 → 可视化解释 → 候选推荐 → 收藏与历史 → 导出报告。
            平台默认围绕预测工作流设计，研究资料已归类到 Research，不干扰主流程。
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/adp-dem/predict"><Button className="h-11 px-6">开始预测</Button></Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Metric title="研究计算规模" value={`Top-${data.topCandidates.totalCandidates} 候选集`} />
        <Metric title="当前前端展示" value={`${data.topCandidates.candidates.length} 条精选候选`} />
        <Metric title="模型验证指标" value={`Stage-1 AUC ${data.modelMetrics.independentTest.stage1.auc}%`} />
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm">
        <p className="text-luxury-champagne">核心任务流</p>
        <p className="mt-2 text-slate-300">输入序列 → 预测分析 → 可视化解释 → 候选推荐 → 收藏 / 历史 → 导出报告</p>
      </section>

      <section className="rounded-2xl border border-amber-200/30 bg-amber-200/5 p-4 text-sm text-amber-100">
        未连接后端模型时，平台会自动切换到离线演示模式，仅展示基础性质分析和候选库匹配，不伪造模型预测结果。
      </section>
    </AppShell>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs text-slate-400">{title}</p>
      <p className="mt-1 bg-gradient-to-r from-luxury-champagne to-[#91a8ff] bg-clip-text text-2xl font-semibold text-transparent">{value}</p>
    </article>
  );
}
