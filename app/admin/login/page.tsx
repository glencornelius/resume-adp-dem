"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const localAdminEnabled = process.env.NEXT_PUBLIC_ENABLE_LOCAL_ADMIN === "true";
  const localAdminId = process.env.NEXT_PUBLIC_LOCAL_ADMIN_ID ?? "";
  const localAdminPassword = process.env.NEXT_PUBLIC_LOCAL_ADMIN_PASSWORD ?? "";

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (localAdminEnabled && email === localAdminId && password === localAdminPassword) {
      localStorage.setItem("local_admin_auth", "1");
      router.push("/admin/editor");
      router.refresh();
      return;
    }

    if (!supabase) {
      setErrorMessage("账号或密码不正确，或数据库服务未配置。");
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    router.push("/admin/editor");
    router.refresh();
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(79,116,255,0.2),transparent_28%),radial-gradient(circle_at_80%_15%,rgba(212,178,115,0.18),transparent_30%),radial-gradient(circle_at_50%_85%,rgba(141,107,255,0.15),transparent_40%)]" />
      <Card className="glass-panel relative z-10 w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-display text-2xl">管理员登录</CardTitle>
          <CardDescription>仅授权管理员可进入在线编辑后台。</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submitLogin}>
            <Input
              type="text"
              placeholder="管理员账号（手机号或邮箱）"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
            />
            <Input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            {errorMessage ? (
              <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {errorMessage}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              登录并进入编辑器
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
