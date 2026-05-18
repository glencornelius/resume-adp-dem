"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { HelpTooltip } from "@/components/adp-dem/HelpTooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { downloadCsv, exportFavorites, toCsv } from "@/lib/adp-dem/export";
import { computeSequenceProperties } from "@/lib/adp-dem/properties";
import {
  addReportDraftItem,
  deleteFavorite,
  readFavorites,
  upsertFavorite
} from "@/lib/adp-dem/storage";
import { CandidateItem, DockingResults } from "@/lib/adp-dem/types";

interface LibraryHubProps {
  candidates: CandidateItem[];
  ranking: CandidateItem[];
  dockingResults: DockingResults;
  totalCandidates: number;
}

type LibraryTab = "all" | "top" | "docking" | "favorites";

const tabs: Array<{ key: LibraryTab; label: string }> = [
  { key: "all", label: "全部候选" },
  { key: "top", label: "Top 候选" },
  { key: "docking", label: "分子对接" },
  { key: "favorites", label: "收藏候选" }
];

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const figureAssets = [
  { src: "/adp-dem/assets/table5-performance.png", title: "表5：Stage-1 与 Stage-2 指标" },
  { src: "/adp-dem/assets/table6a-ablation.png", title: "表6A：特征消融（部分）" },
  { src: "/adp-dem/assets/table6b-ablation.png", title: "表6B：模块消融（部分）" },
  { src: "/adp-dem/assets/table7-comparison.png", title: "表7：方法对比" }
];

const pageSize = 50;

export function LibraryHub({ candidates, ranking, dockingResults, totalCandidates }: LibraryHubProps) {
  const [activeTab, setActiveTab] = useState<LibraryTab>("all");
  const [query, setQuery] = useState("");
  const [lengthType, setLengthType] = useState<"all" | "short" | "mid" | "long">("all");
  const [sortBy, setSortBy] = useState<"stage1" | "stage2" | "rank">("stage1");
  const [topCount, setTopCount] = useState<10 | 20>(10);
  const [page, setPage] = useState(1);
  const [favoriteNote, setFavoriteNote] = useState<Record<string, string>>({});
  const [favorites, setFavorites] = useState(readFavorites());

  const filteredCandidates = useMemo(() => {
    const q = query.trim().toUpperCase();
    const next = candidates
      .filter((item) => (q ? item.sequence.includes(q) : true))
      .filter((item) => (lengthType === "all" ? true : item.lengthBin === lengthType));

    next.sort((a, b) => {
      if (sortBy === "rank") return a.rank - b.rank;
      if (sortBy === "stage2") return (b.stage2Score ?? -1) - (a.stage2Score ?? -1);
      return b.stage1Score - a.stage1Score;
    });

    return next;
  }, [candidates, query, lengthType, sortBy]);

  const dockingMap = useMemo(() => new Map(dockingResults.topComplexes.map((item) => [item.sequence, item])), [dockingResults]);
  const pageCount = Math.max(1, Math.ceil(filteredCandidates.length / pageSize));
  const pagedCandidates = filteredCandidates.slice((page - 1) * pageSize, page * pageSize);

  function candidatePriority(item: CandidateItem) {
    const docking = dockingMap.get(item.sequence);
    if (item.rank <= 50 && docking) return "优先验证";
    if (item.rank <= 200 || item.stage1Score >= 0.8) return "可关注";
    return "暂不优先";
  }

  function addFavorite(item: CandidateItem) {
    const next = upsertFavorite({
      id: createId(),
      sequence: item.sequence,
      rank: item.rank,
      stage1Score: item.stage1Score,
      stage2Score: item.stage2Score,
      note: favoriteNote[item.sequence] ?? "",
      createdAt: new Date().toISOString()
    });
    setFavorites(next);
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs text-slate-400">原始筛选规模</p>
            <p className="mt-1 text-lg text-white">Top-{totalCandidates} 候选集</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs text-slate-400">当前前端展示</p>
            <p className="mt-1 text-lg text-white">{candidates.length} 条精选候选样本</p>
          </article>
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

      {activeTab === "all" ? (
        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="grid gap-2 md:grid-cols-4">
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索序列" />
            <select value={lengthType} onChange={(event) => setLengthType(event.target.value as typeof lengthType)} className="h-10 rounded-md border border-white/20 bg-slate-950/70 px-3 text-sm">
              <option value="all">全部长度</option>
              <option value="short">short</option>
              <option value="mid">mid</option>
              <option value="long">long</option>
            </select>
            <select value={sortBy} onChange={(event) => { setSortBy(event.target.value as typeof sortBy); setPage(1); }} className="h-10 rounded-md border border-white/20 bg-slate-950/70 px-3 text-sm">
              <option value="stage1">按 Stage-1 分数</option>
              <option value="stage2">按 Stage-2 分数</option>
              <option value="rank">按排名</option>
            </select>
            <Button
              variant="secondary"
              onClick={() => {
                const rows = filteredCandidates.map((item) => ({
                  rank: item.rank,
                  sequence: item.sequence,
                  length: item.length,
                  lengthType: item.lengthBin,
                  stage1Score: item.stage1Score,
                  stage2Score: item.stage2Score,
                  sourceProtein: item.sourceProtein,
                  enzyme: item.enzyme
                }));
                downloadCsv(toCsv(rows, ["rank", "sequence", "length", "lengthType", "stage1Score", "stage2Score", "sourceProtein", "enzyme"]), "adp-dem-library-filtered.csv");
              }}
            >
              导出 CSV
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>筛选结果 {filteredCandidates.length} 条，每页 {pageSize} 条</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>上一页</Button>
              <span>第 {page} / {pageCount} 页</span>
              <Button size="sm" variant="secondary" disabled={page >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>下一页</Button>
            </div>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[1050px] text-sm text-slate-200">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-luxury-gold">
                  <th className="pb-2">排名</th>
                  <th className="pb-2">序列</th>
                  <th className="pb-2">长度</th>
                  <th className="pb-2">类型</th>
                  <th className="pb-2">Stage-1</th>
                  <th className="pb-2">Stage-2</th>
                  <th className="pb-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {pagedCandidates.map((item) => {
                  const props = computeSequenceProperties(item.sequence);
                  const docking = dockingMap.get(item.sequence);
                  return (
                  <tr key={`${item.rank}-${item.sequence}`} className="border-t border-white/10">
                    <td className="py-2">#{item.rank}</td>
                    <td className="py-2 font-mono text-xs">{item.sequence}</td>
                    <td className="py-2">{item.length}</td>
                    <td className="py-2">{item.lengthBin} · 疏水 {(props.hydrophobicRatio * 100).toFixed(1)}% · 净电荷 {props.netCharge}</td>
                    <td className="py-2">{item.stage1Score.toFixed(4)}</td>
                    <td className="py-2">{item.stage2Score.toFixed(4)}</td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(item.sequence)}>复制序列</Button>
                        <Link
                          href={{
                            pathname: "/adp-dem/predict",
                            query: { sequence: item.sequence }
                          }}
                          className="inline-flex h-8 items-center rounded-md border border-white/20 px-3 text-xs text-slate-200 hover:border-luxury-gold/40"
                        >
                          用于预测
                        </Link>
                        <Button size="sm" variant="ghost" onClick={() => addFavorite(item)}>加入收藏</Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            addReportDraftItem({
                              id: createId(),
                              source: "library",
                              title: `候选库 - #${item.rank}`,
                              createdAt: new Date().toISOString(),
                              sequence: item.sequence,
                              content: `序列长度：${item.length}\n疏水性：${(props.hydrophobicRatio * 100).toFixed(1)}%\n净电荷：${props.netCharge}\n候选库排名：#${item.rank}\n是否有对接结果：${docking ? "是" : "否"}\n对接能量：${docking?.dockingEnergy ?? "--"}\n推荐等级：${candidatePriority(item)}\nStage-1：${item.stage1Score.toFixed(4)}\nStage-2：${item.stage2Score.toFixed(4)}\n来源蛋白：${item.sourceProtein}`
                            })
                          }
                        >
                          加入报告
                        </Button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid gap-2 md:hidden">
            {pagedCandidates.map((item) => {
              const props = computeSequenceProperties(item.sequence);
              const docking = dockingMap.get(item.sequence);
              return (
              <article key={`${item.rank}-${item.sequence}`} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs">
                <p className="text-slate-400">#{item.rank} · {item.lengthBin}</p>
                <p className="mt-1 font-mono text-white">{item.sequence}</p>
                <p className="mt-1 text-slate-300">长度 {item.length} · 疏水 {(props.hydrophobicRatio * 100).toFixed(1)}% · 净电荷 {props.netCharge}</p>
                <p className="text-slate-300">对接 {docking ? docking.dockingEnergy : "--"} · {candidatePriority(item)}</p>
              </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {activeTab === "top" ? (
        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-luxury-champagne">Top 候选排行榜</p>
            <div className="flex gap-2">
              <Button size="sm" variant={topCount === 10 ? "default" : "secondary"} onClick={() => setTopCount(10)}>Top 10</Button>
              <Button size="sm" variant={topCount === 20 ? "default" : "secondary"} onClick={() => setTopCount(20)}>Top 20</Button>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {ranking.slice(0, topCount).map((item, index) => (
              <article key={`${item.rank}-${item.sequence}`} className={`rounded-2xl border bg-white/[0.04] p-4 ${index === 0 ? "border-luxury-gold/55" : "border-white/10"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-luxury-gold">Rank #{item.rank}</p>
                    <p className="mt-1 font-mono text-base text-white">{item.sequence}</p>
                  </div>
                  <span className="rounded-full border border-luxury-gold/40 px-2 py-1 text-xs text-luxury-champagne">{item.lengthBin}</span>
                </div>
                <p className="mt-2 text-sm text-slate-300">Stage-1 {item.stage1Score.toFixed(4)} · Stage-2 {item.stage2Score.toFixed(4)} · 长度 {item.length}</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => addFavorite(item)}>加入收藏</Button>
                  <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(item.sequence)}>复制序列</Button>
                  <Link
                    href={{
                      pathname: "/adp-dem/predict",
                      query: { sequence: item.sequence }
                    }}
                    className="inline-flex h-8 items-center rounded-md border border-white/20 px-3 text-xs text-slate-200 hover:border-luxury-gold/40"
                  >
                    用于预测
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "docking" ? (
        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center gap-2">
            <p className="text-sm text-luxury-champagne">分子对接结果</p>
            <HelpTooltip
              label="分子对接说明"
              content="对接结果展示计算模拟结合趋势，只适合作为候选筛选参考，不能替代实验验证。"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs text-luxury-gold">Top-100 中低于 -200</p>
              <p className="mt-1 font-display text-3xl text-white">{dockingResults.summary.top100Below200}</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs text-luxury-gold">Top-100 中低于 -220</p>
              <p className="mt-1 font-display text-3xl text-white">{dockingResults.summary.top100Below220}</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs text-luxury-gold">最低结合能</p>
              <p className="mt-1 font-display text-3xl text-white">{dockingResults.summary.minimumEnergy}</p>
            </article>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <table className="w-full min-w-[520px] text-sm text-slate-200">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-luxury-gold">
                  <th className="pb-2">序列</th>
                  <th className="pb-2">预测概率</th>
                  <th className="pb-2">对接能</th>
                </tr>
              </thead>
              <tbody>
                {dockingResults.topComplexes.slice(0, 12).map((item) => (
                  <tr key={item.sequence} className="border-t border-white/10">
                    <td className="py-2 font-mono text-xs">{item.sequence}</td>
                    <td className="py-2">{item.predictedProbability.toFixed(2)}%</td>
                    <td className="py-2">{item.dockingEnergy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {figureAssets.map((item) => (
              <figure key={item.src} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
                  <Image src={item.src} alt={item.title} fill className="object-cover" />
                </div>
                <figcaption className="mt-2 text-xs text-slate-300">{item.title}</figcaption>
              </figure>
            ))}
          </div>

          <p className="rounded-xl border border-amber-200/30 bg-amber-100/10 p-3 text-xs text-amber-100">
            分子对接结果属于计算模拟，不代表药效验证或临床结论，需结合后续实验确认。
          </p>
        </section>
      ) : null}

      {activeTab === "favorites" ? (
        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-luxury-champagne">收藏候选</p>
            <Button size="sm" variant="secondary" onClick={() => exportFavorites(favorites)} disabled={favorites.length === 0}>导出收藏候选</Button>
          </div>

          {favorites.length === 0 ? <p className="text-sm text-slate-400">暂无收藏候选。</p> : null}

          <div className="grid gap-2">
            {favorites.map((item) => (
              <article key={`${item.sequence}-${item.id}`} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">
                <p className="font-mono text-xs text-white">{item.sequence}</p>
                <p className="mt-1 text-xs text-slate-300">#{item.rank ?? "--"} · Stage-1 {item.stage1Score?.toFixed(4) ?? "--"}</p>
                <textarea
                  value={favoriteNote[item.sequence] ?? item.note ?? ""}
                  onChange={(event) => setFavoriteNote({ ...favoriteNote, [item.sequence]: event.target.value })}
                  rows={2}
                  className="mt-2 w-full rounded-lg border border-white/15 bg-slate-950/70 p-2 text-xs"
                  placeholder="备注"
                />
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      const next = upsertFavorite({
                        ...item,
                        note: favoriteNote[item.sequence] ?? item.note ?? ""
                      });
                      setFavorites(next);
                    }}
                  >
                    保存备注
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setFavorites(deleteFavorite(item.sequence))}>删除</Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      addReportDraftItem({
                        id: createId(),
                        source: "favorite",
                        title: `收藏候选 - ${item.sequence.slice(0, 16)}`,
                        createdAt: new Date().toISOString(),
                        content: `序列：${item.sequence}\n备注：${favoriteNote[item.sequence] ?? item.note ?? "无"}`
                      })
                    }
                  >
                    加入报告
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
