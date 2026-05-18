"use client";

import { useEffect, useState } from "react";

const OFFLINE_NOTICE_KEY = "adp_dem_offline_notice_ack_v1";
const hasBackend = Boolean(process.env.NEXT_PUBLIC_ADP_API_URL?.trim());

export function OfflineModeDialog() {
  const [open, setOpen] = useState(!hasBackend);

  useEffect(() => {
    if (hasBackend) {
      setOpen(false);
      return;
    }
    try {
      const acknowledged = window.sessionStorage.getItem(OFFLINE_NOTICE_KEY);
      setOpen(!acknowledged);
    } catch {
      setOpen(true);
    }
  }, []);

  function acknowledge() {
    try {
      window.sessionStorage.setItem(OFFLINE_NOTICE_KEY, "true");
    } catch {
      // Some restricted browser contexts can block sessionStorage. The dialog still closes for the current page.
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/68 px-4 py-6 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="offline-mode-title"
        className="glass-panel relative w-full max-w-lg overflow-hidden rounded-2xl p-5 shadow-2xl shadow-black/50 md:p-6"
      >
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_18%_10%,rgba(212,178,115,0.12),transparent_34%),radial-gradient(circle_at_86%_24%,rgba(95,123,255,0.16),transparent_32%)]" />
        <div className="relative">
          <p className="inline-flex rounded-full border border-amber-200/30 bg-amber-200/10 px-3 py-1 text-xs text-luxury-champagne">
            Offline Demo
          </p>
          <h2 id="offline-mode-title" className="mt-3 font-display text-2xl text-white">
            当前为离线演示模式
          </h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-200">
            <p>
              未检测到后端模型推理服务。当前网站仅支持基础性质分析、候选库匹配、相似候选推荐、可视化展示、历史记录和报告导出，不代表完整模型预测结果。
            </p>
            <p>如需真实模型推理，需要连接后端 Python 推理服务。</p>
          </div>
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={acknowledge}
              className="inline-flex h-10 items-center justify-center rounded-md bg-gradient-to-r from-luxury-gold/95 to-[#8ea2ff] px-5 text-sm font-medium text-luxury-ink shadow-glow transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luxury-gold/70"
            >
              知道了
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
