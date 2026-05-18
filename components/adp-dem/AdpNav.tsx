"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/adp-dem", label: "概览", match: (path: string) => path === "/adp-dem" },
  { href: "/adp-dem/predict", label: "预测", match: (path: string) => path.startsWith("/adp-dem/predict") },
  { href: "/adp-dem/library", label: "候选库", match: (path: string) => path.startsWith("/adp-dem/library") },
  { href: "/adp-dem/research", label: "研究", match: (path: string) => path.startsWith("/adp-dem/research") },
  { href: "/adp-dem/reports", label: "报告", match: (path: string) => path.startsWith("/adp-dem/reports") }
] as const;

interface AdpNavProps {
  onOpenGuide: () => void;
}

export function AdpNav({ onOpenGuide }: AdpNavProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070c19]/88 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-4 py-3 md:gap-3 md:px-8">
        <div className="min-w-0">
          <p className="font-display text-base tracking-wide text-white md:text-lg">ADP-DEM</p>
          <p className="truncate text-xs text-slate-400">抗糖尿病肽智能预测平台</p>
        </div>
        <nav className="hidden flex-wrap items-center gap-2 lg:flex">
          {navItems.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs transition-colors",
                  active
                    ? "border border-luxury-gold/50 bg-luxury-gold/12 text-luxury-champagne"
                    : "border border-white/10 text-slate-300 hover:border-luxury-gold/35 hover:text-luxury-champagne"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
          <button
            type="button"
            onClick={onOpenGuide}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1.5 text-xs text-slate-200 shadow-[0_0_0_rgba(212,178,115,0)] backdrop-blur-md transition-all hover:border-luxury-gold/40 hover:text-luxury-champagne hover:shadow-[0_0_18px_rgba(212,178,115,0.16)] md:px-3"
          >
            <CircleHelp className="h-3.5 w-3.5" />
            <span className="hidden md:inline">使用指南</span>
            <span className="md:hidden">指南</span>
          </button>
          <Link
            href="/resume"
            className="rounded-full border border-white/15 px-2.5 py-1.5 text-xs text-slate-200 transition-colors hover:border-luxury-gold/40 hover:text-luxury-champagne md:px-3"
          >
            <span className="hidden md:inline">返回简历</span>
            <span className="md:hidden">简历</span>
          </Link>
        </div>
      </div>
      <div className="scrollbar-none flex gap-2 overflow-x-auto px-4 pb-3 lg:hidden">
        {navItems.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap rounded-full border px-3 py-1 text-xs",
                active
                  ? "border-luxury-gold/50 bg-luxury-gold/12 text-luxury-champagne"
                  : "border-white/10 text-slate-300"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
