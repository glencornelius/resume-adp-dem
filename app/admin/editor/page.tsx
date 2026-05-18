"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";

import { AdminEditor } from "@/components/AdminEditor";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { defaultResumeData, normalizeResumeData } from "@/lib/resume";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { ResumeData } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ResumeRow {
  id: string;
  user_id: string;
  data: ResumeData;
}

export default function AdminEditorPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"supabase" | "local" | null>(null);
  const [status, setStatus] = useState<"loading" | "unauthorized" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const localAdminEnabled = process.env.NEXT_PUBLIC_ENABLE_LOCAL_ADMIN === "true";

  useEffect(() => {
    const bootstrap = async () => {
      if (localAdminEnabled && localStorage.getItem("local_admin_auth") === "1") {
        const localData = localStorage.getItem("resume_local_data");
        if (localData) {
          try {
            const normalizedLocalData = normalizeResumeData(JSON.parse(localData));
            localStorage.setItem("resume_local_data", JSON.stringify(normalizedLocalData));
            setResumeData(normalizedLocalData);
          } catch {
            setResumeData(defaultResumeData);
          }
        } else {
          setResumeData(defaultResumeData);
        }
        setUserId("local-admin");
        setAuthMode("local");
        setStatus("ready");
        return;
      }

      if (!supabase) {
        setStatus("error");
        setErrorMessage("数据库服务未配置，请先设置环境变量并刷新页面。");
        return;
      }

      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setStatus("unauthorized");
        return;
      }

      setUserId(session.user.id);

      const { data, error } = await supabase
        .from("resumes")
        .select("id,user_id,data")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) {
        setStatus("error");
        setErrorMessage(error.message);
        return;
      }

      const row = data as ResumeRow | null;
      setResumeData(row?.data ? normalizeResumeData(row.data) : defaultResumeData);
      setAuthMode("supabase");
      setStatus("ready");
    };

    void bootstrap();
  }, [localAdminEnabled, supabase]);

  const handleSave = async (data: ResumeData) => {
    if (authMode === "local") {
      localStorage.setItem("resume_local_data", JSON.stringify(data));
      setResumeData(data);
      return;
    }

    if (!supabase || !userId) {
      throw new Error("登录状态已失效，请重新登录。");
    }

    const { error } = await supabase.from("resumes").upsert(
      {
        user_id: userId,
        data
      },
      {
        onConflict: "user_id"
      }
    );

    if (error) {
      throw new Error(error.message);
    }

    setResumeData(data);
  };

  const logout = async () => {
    localStorage.removeItem("local_admin_auth");
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/admin/login");
    router.refresh();
  };

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>正在验证权限</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-slate-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            正在加载后台数据...
          </CardContent>
        </Card>
      </main>
    );
  }

  if (status === "unauthorized") {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>未登录或权限不足</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-300">请先以管理员身份登录后再访问编辑器。</p>
            <Link href="/admin/login" className={cn(buttonVariants())}>
              前往登录页
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>后台加载失败</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {errorMessage ?? "未知错误"}
            </p>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              重试
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-10">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 pt-8 md:px-8">
        <p className="text-sm text-slate-300">已登录管理员后台</p>
        <Button variant="ghost" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          退出登录
        </Button>
      </div>
      {resumeData ? <AdminEditor initialData={resumeData} onSave={handleSave} /> : null}
    </main>
  );
}
