import type { Metadata } from "next";

import { AppToaster } from "@/components/ui/toaster";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com"),
  title: "高端个人简历网站",
  description: "一个支持在线编辑与展示的高端个人简历网站。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="font-body antialiased">
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
