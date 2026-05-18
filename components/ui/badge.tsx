import * as React from "react";

import { cn } from "@/lib/utils";

function Badge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-luxury-gold/40 bg-luxury-gold/10 px-3 py-1 text-xs font-medium tracking-wide text-luxury-champagne",
        className
      )}
      {...props}
    />
  );
}

export { Badge };
