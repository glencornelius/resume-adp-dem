import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "min-h-[90px] w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-luxury-champagne placeholder:text-slate-400/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luxury-gold/70 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
