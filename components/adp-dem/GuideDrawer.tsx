"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { BookOpen, CircleHelp, FileDown, FlaskConical, Layers3, Map, Sparkles, X } from "lucide-react";

import { cn } from "@/lib/utils";

interface GuideDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type GuideTab = "quick" | "map" | "modes" | "input" | "results" | "export" | "faq";

const guideTabs: Array<{ key: GuideTab; label: string; shortLabel: string; icon: typeof Sparkles }> = [
  { key: "quick", label: "快速开始", shortLabel: "开始", icon: Sparkles },
  { key: "map", label: "功能地图", shortLabel: "地图", icon: Map },
  { key: "modes", label: "预测模式", shortLabel: "模式", icon: Layers3 },
  { key: "input", label: "输入格式", shortLabel: "输入", icon: BookOpen },
  { key: "results", label: "结果解读", shortLabel: "结果", icon: FlaskConical },
  { key: "export", label: "导出报告", shortLabel: "导出", icon: FileDown },
  { key: "faq", label: "FAQ", shortLabel: "FAQ", icon: CircleHelp }
];

const featureMap = [
  ["概览", "了解平台定位、核心能力和项目指标。"],
  ["预测", "进行单条预测、批量预测、序列对比和突变扫描。"],
  ["候选库", "检索候选肽、查看 Top 排行、分子对接结果和收藏内容。"],
  ["研究", "查看模型流程、数据集、模型性能、消融实验和论文资料。"],
  ["报告", "查看历史记录、批量任务、报告草稿和本地数据管理。"]
];

const inputExamples = [
  { title: "单条序列", body: "RVIPAAVVGAAVAGGL" },
  { title: "FASTA", body: ">seq1\nRVIPAAVVGAAVAGGL\n>seq2\nMEALKRKIEEEGVVL" },
  { title: "CSV", body: "id,sequence\nseq1,RVIPAAVVGAAVAGGL\nseq2,MEALKRKIEEEGVVL" }
];

const faqItems = [
  ["Q1：为什么有时没有模型预测概率？", "A：当前可能处于离线演示模式，只进行基础性质分析和候选库匹配。"],
  ["Q2：这个结果能说明该肽一定有效吗？", "A：不能。结果只是计算预测和候选参考，仍需体外实验、细胞实验或临床验证。"],
  ["Q3：批量预测支持哪些文件？", "A：支持 FASTA、CSV、TXT。CSV 建议包含 id 和 sequence 两列。"],
  ["Q4：历史记录保存在哪里？", "A：默认保存在浏览器本地 localStorage，不会自动上传到云端。"],
  ["Q5：为什么我的序列提示非法？", "A：可能包含非标准氨基酸字母、数字、中文或特殊符号。"]
];

export function GuideDrawer({ open, onOpenChange }: GuideDrawerProps) {
  const [activeTab, setActiveTab] = useState<GuideTab>("quick");
  const ActiveIcon = useMemo(() => guideTabs.find((tab) => tab.key === activeTab)?.icon ?? Sparkles, [activeTab]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        aria-label="关闭使用指南"
        className="absolute inset-0 cursor-default bg-slate-950/62 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col border-l border-white/12 bg-[#071020]/96 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:w-[92vw]">
        <header className="border-b border-white/10 p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-luxury-gold/35 bg-luxury-gold/10 px-3 py-1 text-xs text-luxury-champagne">
                <ActiveIcon className="h-3.5 w-3.5" />
                使用指南
              </p>
              <h2 className="mt-3 font-display text-2xl text-white">ADP-DEM 使用指南</h2>
              <p className="mt-1 text-sm text-slate-300">快速理解预测流程、模式差异、输入格式和结果含义。</p>
            </div>
            <button
              type="button"
              aria-label="关闭使用指南"
              onClick={() => onOpenChange(false)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.05] text-slate-200 transition-colors hover:border-luxury-gold/45 hover:text-luxury-champagne"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="scrollbar-none mt-4 flex gap-2 overflow-x-auto">
            {guideTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors",
                    activeTab === tab.key
                      ? "border-luxury-gold/55 bg-luxury-gold/15 text-luxury-champagne"
                      : "border-white/12 bg-white/[0.03] text-slate-300 hover:border-luxury-gold/35 hover:text-luxury-champagne"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-5">
          {activeTab === "quick" ? <QuickStart /> : null}
          {activeTab === "map" ? <FeatureMap /> : null}
          {activeTab === "modes" ? <PredictionModes /> : null}
          {activeTab === "input" ? <InputFormats /> : null}
          {activeTab === "results" ? <ResultExplanation /> : null}
          {activeTab === "export" ? <ExportHelp /> : null}
          {activeTab === "faq" ? <FAQ /> : null}
        </div>

        <footer className="border-t border-amber-200/25 bg-amber-200/[0.06] p-4 text-xs leading-relaxed text-amber-100 md:p-5">
          本平台结果为计算模型预测、候选库匹配和分子对接分析，仅用于科研展示和后续实验候选参考，不代表已经完成药效验证、临床验证或医疗建议。
        </footer>
      </aside>
    </div>
  );
}

function GuideSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <h3 className="font-display text-lg text-white">{title}</h3>
      <div className="mt-3 text-sm leading-relaxed text-slate-300">{children}</div>
    </section>
  );
}

function QuickStart() {
  return (
    <GuideSection title="30 秒快速开始">
      <ol className="list-decimal space-y-2 pl-5">
        <li>点击“预测”进入预测工作台。</li>
        <li>输入一条多肽序列，例如 <span className="font-mono text-luxury-champagne">RVIPAAVVGAAVAGGL</span>。</li>
        <li>点击“开始分析”。</li>
        <li>查看预测模式、基础性质、候选库命中和可视化解释。</li>
        <li>可以将结果加入报告、收藏或导出 CSV / PDF。</li>
      </ol>
    </GuideSection>
  );
}

function FeatureMap() {
  return (
    <div className="grid gap-3">
      {featureMap.map(([title, body]) => (
        <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-luxury-champagne">{title}</p>
          <p className="mt-1 text-sm text-slate-300">{body}</p>
        </article>
      ))}
    </div>
  );
}

function PredictionModes() {
  return (
    <div className="grid gap-3">
      <GuideSection title="真实模型模式">
        当配置 <span className="font-mono text-luxury-champagne">NEXT_PUBLIC_ADP_API_URL</span> 并成功连接后端 Python 推理服务时，系统会调用模型接口返回预测结果。
      </GuideSection>
      <GuideSection title="离线演示模式">
        当未配置后端 API 或模型服务不可用时，系统只进行基础性质分析、候选库匹配和相似候选推荐，不代表完整模型推理结果。
      </GuideSection>
      <div className="rounded-2xl border border-amber-200/30 bg-amber-100/10 p-4 text-sm font-medium text-amber-100">
        不要将离线演示结果理解为真实药效预测。
      </div>
    </div>
  );
}

function InputFormats() {
  return (
    <div className="grid gap-3">
      <GuideSection title="支持输入">
        <ul className="list-disc space-y-1 pl-5">
          <li>单条多肽序列</li>
          <li>多行序列</li>
          <li>FASTA 文件</li>
          <li>CSV 文件</li>
          <li>TXT 文件</li>
        </ul>
      </GuideSection>
      <GuideSection title="序列规则">
        <ul className="list-disc space-y-1 pl-5">
          <li>仅支持标准氨基酸字母 <span className="font-mono text-luxury-champagne">ACDEFGHIKLMNPQRSTVWY</span>。</li>
          <li>系统会自动去除空格、换行并转为大写。</li>
          <li>含非法字符的序列会被标记为无效。</li>
        </ul>
      </GuideSection>
      <div className="grid gap-3">
        {inputExamples.map((item) => (
          <article key={item.title} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
            <p className="text-sm text-luxury-champagne">{item.title}</p>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-lg border border-white/10 bg-black/25 p-3 font-mono text-xs text-slate-100">{item.body}</pre>
          </article>
        ))}
      </div>
    </div>
  );
}

function ResultExplanation() {
  const items = [
    ["预测等级", "高潜力 / 中等潜力 / 低潜力 / 未连接模型。"],
    ["候选库命中", "表示该序列是否存在于当前已计算候选库中。"],
    ["基础性质", "包括长度、疏水性、极性比例、芳香族比例、净电荷等。"],
    ["相似候选", "系统会从候选库中寻找与输入序列相近的序列，作为参考。"],
    ["分子对接", "用于展示候选肽与 DPP-IV 靶点的计算模拟结合趋势，仅作为后续实验候选参考。"]
  ];
  return (
    <div className="grid gap-3">
      {items.map(([title, body]) => (
        <GuideSection key={title} title={title}>{body}</GuideSection>
      ))}
    </div>
  );
}

function ExportHelp() {
  return (
    <GuideSection title="导出和报告">
      <ul className="list-disc space-y-1 pl-5">
        <li>复制序列</li>
        <li>复制结果摘要</li>
        <li>导出单条预测 CSV</li>
        <li>导出批量预测 CSV</li>
        <li>收藏候选</li>
        <li>加入报告草稿</li>
        <li>生成打印版报告</li>
        <li>复制 Markdown 摘要</li>
      </ul>
    </GuideSection>
  );
}

function FAQ() {
  return (
    <div className="grid gap-3">
      {faqItems.map(([question, answer]) => (
        <article key={question} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-luxury-champagne">{question}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">{answer}</p>
        </article>
      ))}
    </div>
  );
}
