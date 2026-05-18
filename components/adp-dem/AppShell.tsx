"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CircleHelp, X } from "lucide-react";

import { AdpNav } from "@/components/adp-dem/AdpNav";
import { GuideDrawer } from "@/components/adp-dem/GuideDrawer";
import { OfflineModeDialog } from "@/components/adp-dem/OfflineModeDialog";

interface AppShellProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}

export function AppShell({ title, subtitle, children }: AppShellProps) {
  const pathname = usePathname();
  const [guideOpen, setGuideOpen] = useState(false);
  const [showFirstVisitHint, setShowFirstVisitHint] = useState(false);

  useEffect(() => {
    if (pathname !== "/adp-dem" && pathname !== "/adp-dem/predict") return;
    if (window.localStorage.getItem("adp_dem_guide_seen_v1") === "true") return;
    setShowFirstVisitHint(true);
  }, [pathname]);

  function markGuideSeen() {
    window.localStorage.setItem("adp_dem_guide_seen_v1", "true");
    setShowFirstVisitHint(false);
  }

  function openGuideFromHint() {
    markGuideSeen();
    setGuideOpen(true);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_10%_8%,rgba(212,178,115,0.08),transparent_30%),radial-gradient(circle_at_88%_12%,rgba(79,116,255,0.16),transparent_28%),linear-gradient(158deg,#050812_0%,#0b1229_55%,#11162f_100%)] text-slate-100">
      <AdpNav onOpenGuide={() => setGuideOpen(true)} />
      <div className="mx-auto w-full max-w-7xl px-4 pb-14 pt-6 md:px-8 md:pt-8">
        {title ? (
          <section className="mb-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <h1 className="font-display text-2xl text-white md:text-3xl">{title}</h1>
            {subtitle ? <p className="mt-2 text-sm text-slate-300">{subtitle}</p> : null}
          </section>
        ) : null}
        <div className="space-y-5">{children}</div>
      </div>
      {showFirstVisitHint ? (
        <div className="fixed bottom-4 right-4 z-50 max-w-[calc(100vw-2rem)] rounded-2xl border border-luxury-gold/30 bg-[#081020]/92 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openGuideFromHint}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3 py-2 text-xs text-luxury-champagne transition-colors hover:border-luxury-gold/45 hover:bg-luxury-gold/10"
            >
              <CircleHelp className="h-4 w-4" />
              第一次使用？查看 30 秒快速指南
            </button>
            <button
              type="button"
              aria-label="关闭首次使用提示"
              onClick={markGuideSeen}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-slate-300 transition-colors hover:border-white/25 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : null}
      <GuideDrawer open={guideOpen} onOpenChange={setGuideOpen} />
      <OfflineModeDialog />
    </main>
  );
}
