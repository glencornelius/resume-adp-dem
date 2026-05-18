"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { HelpTooltip } from "@/components/adp-dem/HelpTooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  copyReportDraftMarkdown,
  exportHistory
} from "@/lib/adp-dem/export";
import { buildDraftReport, modelModeText, openPrintReport, ReportTemplateKind } from "@/lib/adp-dem/report";
import {
  clearAllAdpDemStorage,
  clearBatchTasks,
  clearFavorites,
  clearHistory,
  clearReportDraft,
  deleteBatchTask,
  deleteHistoryRecord,
  estimateStorageUsageKb,
  readBatchTasks,
  readFavorites,
  readHistory,
  readReportDraft,
  removeReportDraftItem
} from "@/lib/adp-dem/storage";
import { predictionLevelText } from "@/lib/adp-dem/predict";

type ReportsTab = "history" | "batch" | "export" | "local";

const tabs: Array<{ key: ReportsTab; label: string }> = [
  { key: "history", label: "历史预测" },
  { key: "batch", label: "批量任务" },
  { key: "export", label: "导出报告" },
  { key: "local", label: "本地数据管理" }
];

export function ReportsHub() {
  const [activeTab, setActiveTab] = useState<ReportsTab>("history");
  const [history, setHistory] = useState(readHistory());
  const [batchTasks, setBatchTasks] = useState(readBatchTasks());
  const [draftItems, setDraftItems] = useState(readReportDraft());
  const [favoriteCount, setFavoriteCount] = useState(readFavorites().length);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<"all" | "high" | "medium" | "low" | "unknown">("all");
  const [template, setTemplate] = useState<ReportTemplateKind>("research");

  const filteredHistory = useMemo(() => {
    return history
      .filter((item) => (level === "all" ? true : item.level === level))
      .filter((item) => (query.trim() ? item.sequence.includes(query.trim().toUpperCase()) : true))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [history, level, query]);

  const storageUsage = estimateStorageUsageKb();
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

      {activeTab === "history" ? (
        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="grid gap-2 md:grid-cols-4">
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索序列" />
            <select
              value={level}
              onChange={(event) => setLevel(event.target.value as typeof level)}
              className="h-10 rounded-md border border-white/20 bg-slate-950/70 px-3 text-sm"
            >
              <option value="all">全部等级</option>
              <option value="high">高潜力</option>
              <option value="medium">中等潜力</option>
              <option value="low">低潜力</option>
              <option value="unknown">未连接模型</option>
            </select>
            <Button variant="secondary" onClick={() => exportHistory(filteredHistory)}>导出 CSV</Button>
            <Button
              variant="ghost"
              onClick={() => {
                clearHistory();
                setHistory([]);
              }}
            >
              清空历史
            </Button>
          </div>

          <div className="grid gap-2">
            {filteredHistory.map((item) => (
              <article key={item.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">
                <p className="font-mono text-xs text-white">{item.sequence}</p>
                <p className="mt-1 text-xs text-slate-300">
                  {new Date(item.createdAt).toLocaleString()} · {predictionLevelText(item.level)} · 当前模式：{modelModeText(item.modelMode)}
                </p>
                <p className="mt-1 text-xs text-slate-400">{item.explanation}</p>
                <div className="mt-2 flex gap-2">
                  <Link
                    href={{
                      pathname: "/adp-dem/predict",
                      query: { sequence: item.sequence }
                    }}
                    className="text-xs text-luxury-champagne hover:underline"
                  >
                    再次预测
                  </Link>
                  <button
                    className="text-xs text-red-200 hover:underline"
                    onClick={() => setHistory(deleteHistoryRecord(item.id))}
                  >
                    删除
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "batch" ? (
        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-luxury-champagne">最近批量任务</p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                clearBatchTasks();
                setBatchTasks([]);
              }}
            >
              清空任务
            </Button>
          </div>

          {batchTasks.length === 0 ? <p className="text-sm text-slate-400">暂无批量任务记录。</p> : null}

          <div className="grid gap-2">
            {batchTasks.map((task) => (
              <article key={task.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">
                <p className="text-xs text-slate-400">{new Date(task.createdAt).toLocaleString()}</p>
                <p className="mt-1 text-slate-200">总数 {task.total} · 有效 {task.valid} · 无效 {task.invalid} · 高潜力 {task.highPotential}</p>
                <p className="text-xs text-luxury-gold">模式：{task.mode === "online" ? "真实模型" : "离线演示"}</p>
                <div className="mt-2 flex gap-2">
                  <Link href="/adp-dem/predict?tab=batch" className="text-xs text-luxury-champagne hover:underline">重新打开批量页面</Link>
                  <button className="text-xs text-red-200 hover:underline" onClick={() => setBatchTasks(deleteBatchTask(task.id))}>删除</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "export" ? (
        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-luxury-champagne">报告生成器</p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                clearReportDraft();
                setDraftItems([]);
              }}
            >
              清空草稿
            </Button>
          </div>

          <div className="grid gap-2 md:grid-cols-3">
            {[
              { key: "research", label: "科研报告版" },
              { key: "portfolio", label: "简历展示版" },
              { key: "batch", label: "批量筛选版" }
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setTemplate(item.key as ReportTemplateKind)}
                className={`rounded-xl border px-3 py-2 text-sm ${
                  template === item.key
                    ? "border-luxury-gold/55 bg-luxury-gold/15 text-luxury-champagne"
                    : "border-white/15 text-slate-300"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {draftItems.length === 0 ? <p className="text-sm text-slate-400">暂无报告草稿内容，可在 Predict/Library 页面加入。</p> : null}

          <div className="grid gap-2">
            {draftItems.map((item) => (
              <article key={item.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">
                <p className="text-xs text-luxury-gold">{item.source}</p>
                <p className="mt-1 text-white">{item.title}</p>
                {item.modelMode ? <p className="mt-1 text-xs text-slate-400">当前模式：{modelModeText(item.modelMode)}</p> : null}
                <p className="mt-1 whitespace-pre-line text-xs text-slate-300">{item.content}</p>
                <button className="mt-2 text-xs text-red-200 hover:underline" onClick={() => setDraftItems(removeReportDraftItem(item.id))}>删除</button>
              </article>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              disabled={draftItems.length === 0}
              onClick={() => {
                openPrintReport(buildDraftReport(draftItems, template));
              }}
            >
              PDF/打印报告
            </Button>
            <Button variant="secondary" disabled={draftItems.length === 0} onClick={() => void copyReportDraftMarkdown(draftItems)}>复制 Markdown 摘要</Button>
          </div>
        </section>
      ) : null}

      {activeTab === "local" ? (
        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center gap-2">
            <p className="text-sm text-luxury-champagne">本地数据管理</p>
            <HelpTooltip
              label="本地数据管理说明"
              content="历史记录、收藏、报告草稿和批量任务默认保存在当前浏览器 localStorage，不会自动上传云端。"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <Metric title="本地存储占用" value={`${storageUsage} KB`} />
            <Metric title="历史记录" value={`${history.length} 条`} />
            <Metric title="收藏候选" value={`${favoriteCount} 条`} />
            <Metric title="报告草稿" value={`${draftItems.length} 条`} />
            <Metric title="批量任务" value={`${batchTasks.length} 条`} />
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <Button variant="secondary" onClick={() => { clearHistory(); setHistory([]); }}>清空历史</Button>
            <Button variant="secondary" onClick={() => { clearFavorites(); setFavoriteCount(0); }}>清空收藏</Button>
            <Button variant="secondary" onClick={() => { clearReportDraft(); setDraftItems([]); }}>清空报告草稿</Button>
            <Button
              variant="ghost"
              onClick={() => {
                clearAllAdpDemStorage();
                setHistory([]);
                setBatchTasks([]);
                setDraftItems([]);
                setFavoriteCount(0);
              }}
            >
              一键清空全部本地数据
            </Button>
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
