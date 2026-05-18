"use client";

import { useEffect } from "react";

interface ClientRedirectProps {
  href: string;
}

export function ClientRedirect({ href }: ClientRedirectProps) {
  useEffect(() => {
    window.location.replace(href);
  }, [href]);

  return (
    <main className="min-h-screen bg-luxury-ink px-6 py-16 text-slate-200">
      <a className="text-luxury-champagne underline underline-offset-4" href={href}>
        正在跳转...
      </a>
    </main>
  );
}
