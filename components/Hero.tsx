"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const particles = [
  { left: "8%", top: "12%", size: 2.4, delay: 0.1, drift: -8 },
  { left: "16%", top: "72%", size: 2, delay: 0.4, drift: 7 },
  { left: "28%", top: "28%", size: 2.8, delay: 0.7, drift: -10 },
  { left: "41%", top: "65%", size: 1.8, delay: 0.2, drift: 6 },
  { left: "56%", top: "20%", size: 2.6, delay: 0.5, drift: -7 },
  { left: "66%", top: "50%", size: 2.1, delay: 0.3, drift: 8 },
  { left: "78%", top: "30%", size: 2.8, delay: 0.6, drift: -9 },
  { left: "87%", top: "68%", size: 2, delay: 0.8, drift: 7 }
];

export function Hero() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pb-20 pt-24 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(66,93,190,0.28),transparent_34%),radial-gradient(circle_at_78%_12%,rgba(206,170,109,0.13),transparent_32%),linear-gradient(135deg,#060910_0%,#0a1330_55%,#0d0f18_100%)]" />
      <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.08]" />
      <div className="pointer-events-none absolute inset-0">
        {particles.map((point, index) => (
          <motion.span
            key={index}
            className="absolute rounded-full bg-luxury-champagne/80 blur-[1px]"
            style={{
              left: point.left,
              top: point.top,
              width: `${point.size}px`,
              height: `${point.size}px`
            }}
            initial={{ opacity: 0.2 }}
            animate={{ y: [0, point.drift, 0], opacity: [0.18, 0.5, 0.18] }}
            transition={{
              duration: 7 + index * 0.8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: point.delay
            }}
          />
        ))}
      </div>
      <motion.div
        className="relative z-10 w-full max-w-4xl rounded-[2rem] bg-gradient-to-br from-[#cfac74]/55 via-white/10 to-[#4a3c29]/40 p-[1px] shadow-[0_28px_70px_rgba(5,8,20,0.6)]"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="relative overflow-hidden rounded-[calc(2rem-1px)] border border-white/10 bg-[linear-gradient(155deg,rgba(10,18,42,0.9),rgba(8,13,31,0.88)_62%,rgba(9,12,24,0.9))] px-5 py-11 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl sm:px-10 sm:py-14 md:px-14">
          <motion.div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_52%_28%,rgba(222,183,118,0.16),transparent_42%),radial-gradient(circle_at_52%_82%,rgba(103,135,232,0.09),transparent_48%)]"
            animate={{ opacity: [0.45, 0.6, 0.45] }}
            transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
          <p className="mx-auto mb-5 inline-flex rounded-full border border-luxury-gold/45 bg-luxury-gold/10 px-4 py-1 text-xs uppercase tracking-[0.24em] text-luxury-champagne">
            徐州医科大学
          </p>
          <h1 className="font-display text-[3.1rem] leading-none tracking-[0.03em] text-white sm:text-[4.2rem] md:text-[5.2rem]">
            葛超伟
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm tracking-[0.16em] text-luxury-gold sm:text-base">
            医学信息与工程学院 | 智能医学工程
          </p>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg">
            智能医学工程专业应届本科生，关注医学 AI、数据分析与 Web 应用开发，具备从数据处理、模型训练到系统展示的完整项目实践经历。
          </p>

          <div className="mt-10 sm:mt-12">
            <Link
              href="/resume"
              className={cn(
                buttonVariants({ size: "lg" }),
                "group h-14 rounded-full px-8 text-base transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(212,178,115,0.26)] sm:px-10"
              )}
            >
              查看完整履历
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
            </Link>
          </div>

          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {["医学 AI", "科研建模", "Web 实践"].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-luxury-gold/35 bg-luxury-gold/10 px-3 py-1 text-xs tracking-[0.08em] text-luxury-champagne"
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </div>
      </motion.div>

      <footer className="absolute bottom-5 right-5 z-20">
        <Link
          href="/admin/login"
          className="text-xs text-slate-400/80 transition-colors hover:text-luxury-champagne"
        >
          编辑入口
        </Link>
      </footer>
    </main>
  );
}
