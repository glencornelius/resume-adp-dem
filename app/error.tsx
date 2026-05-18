"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="glass-panel max-w-lg rounded-2xl p-6">
        <h2 className="font-display text-2xl text-white">页面发生错误</h2>
        <p className="mt-2 text-sm text-slate-300">{error.message || "请稍后重试。"}</p>
        <Button className="mt-4" onClick={reset}>
          重试
        </Button>
      </div>
    </main>
  );
}
