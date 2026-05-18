"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      richColors
      position="top-right"
      theme="dark"
      toastOptions={{
        style: {
          background: "rgba(15, 20, 40, 0.95)",
          border: "1px solid rgba(212, 178, 115, 0.35)",
          color: "#f8eed2"
        }
      }}
    />
  );
}
