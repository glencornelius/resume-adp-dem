import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ResumeCardProps {
  children: ReactNode;
  className?: string;
}

export function ResumeCard({ children, className }: ResumeCardProps) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-white/15 bg-white/[0.03] p-5 shadow-soft transition-all duration-300 hover:border-luxury-gold/35 hover:bg-white/[0.05]",
        className
      )}
    >
      {children}
    </article>
  );
}
