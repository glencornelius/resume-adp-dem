"use client";

import { useEffect, useState } from "react";

import { ResumeView } from "@/components/ResumeView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { defaultResumeData, normalizeResumeData } from "@/lib/resume";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { ResumeData } from "@/lib/types";

interface ResumeRecord {
  data: ResumeData;
}

function hasMeaningfulResumeData(data: ResumeData) {
  return Boolean(
    data.profile.name.trim() ||
      data.profile.university.trim() ||
      data.education.length > 0 ||
      data.projects.length > 0 ||
      data.researchAndCompetitions.length > 0
  );
}

export default function ResumePage() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const localAdminEnabled = process.env.NEXT_PUBLIC_ENABLE_LOCAL_ADMIN === "true";

  useEffect(() => {
    const fetchResume = async () => {
      setStatus("loading");
      if (localAdminEnabled) {
        const localData = localStorage.getItem("resume_local_data");
        if (localData) {
          try {
            const normalizedLocalData = normalizeResumeData(JSON.parse(localData));
            if (hasMeaningfulResumeData(normalizedLocalData)) {
              localStorage.setItem("resume_local_data", JSON.stringify(normalizedLocalData));
              setResumeData(normalizedLocalData);
              setStatus("ready");
              return;
            }
            localStorage.removeItem("resume_local_data");
          } catch {
            localStorage.removeItem("resume_local_data");
          }
        }
      }

      const supabase = createSupabaseBrowserClient();

      if (!supabase) {
        setResumeData(defaultResumeData);
        setStatus("ready");
        return;
      }

      const { data, error } = await supabase
        .from("resumes")
        .select("data")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(error);
        setResumeData(defaultResumeData);
        setStatus("error");
        return;
      }

      const row = data as ResumeRecord | null;

      if (!row?.data) {
        setResumeData(defaultResumeData);
        setStatus("ready");
        return;
      }

      setResumeData(normalizeResumeData(row.data));
      setStatus("ready");
    };

    void fetchResume();
  }, [localAdminEnabled]);

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>正在加载简历</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/2 animate-shimmer bg-gradient-to-r from-transparent via-luxury-gold/70 to-transparent" />
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!resumeData) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>暂无简历数据</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-300">请先在后台编辑并保存简历，或使用默认示例数据预览。</p>
            <Button onClick={() => setResumeData(defaultResumeData)}>加载示例简历</Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <>
      {status === "error" ? (
        <div className="mx-auto mt-4 w-full max-w-6xl rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          数据库读取失败，当前展示默认示例简历。请检查环境变量或数据库配置。
        </div>
      ) : null}
      <ResumeView data={resumeData} />
    </>
  );
}
