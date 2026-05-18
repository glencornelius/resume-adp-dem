"use client";

import { CircleHelp } from "lucide-react";

interface HelpTooltipProps {
  label: string;
  content: string;
}

export function HelpTooltip({ label, content }: HelpTooltipProps) {
  return (
    <span className="group relative inline-flex items-center">
      <button
        type="button"
        aria-label={label}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-slate-300 transition-colors hover:border-luxury-gold/45 hover:text-luxury-champagne focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luxury-gold/60"
      >
        <CircleHelp className="h-3.5 w-3.5" />
      </button>
      <span className="pointer-events-none absolute left-1/2 top-7 z-50 hidden w-64 -translate-x-1/2 rounded-lg border border-white/12 bg-[#081020]/95 px-3 py-2 text-left text-xs leading-relaxed text-slate-200 shadow-2xl shadow-black/40 backdrop-blur-xl group-hover:block group-focus-within:block">
        {content}
      </span>
    </span>
  );
}
