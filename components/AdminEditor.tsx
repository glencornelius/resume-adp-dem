"use client";

import { ReactNode, useMemo, useState } from "react";
import { ChevronDown, Eye, EyeOff, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ResumeView } from "@/components/ResumeView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ResumeCampusExperience,
  ResumeCertificateAward,
  ResumeData,
  ResumeEducation,
  ResumeProject,
  ResumeResearchCompetition
} from "@/lib/types";

interface AdminEditorProps {
  initialData: ResumeData;
  onSave: (data: ResumeData) => Promise<void>;
  onPersistDefault?: (data: ResumeData) => Promise<void>;
}

const fixedAvatarUrl = "/avatar-gechaowei.jpg";

function sanitizeResumeForSave(data: ResumeData): ResumeData {
  return {
    ...data,
    profile: {
      ...data.profile,
      github: "",
      avatarUrl: fixedAvatarUrl
    }
  };
}

function moveArrayItem<T>(items: T[], from: number, to: number) {
  const copy = [...items];
  const [target] = copy.splice(from, 1);
  copy.splice(to, 0, target);
  return copy;
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = false
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group rounded-2xl border border-white/10 bg-white/[0.02]">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-luxury-champagne">
        <span className="font-medium">{title}</span>
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-5 pb-5">{children}</div>
    </details>
  );
}

function StringListEditor({
  title,
  values,
  onChange,
  placeholder = "请输入内容"
}: {
  title: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  const addItem = () => {
    const value = draft.trim();
    if (!value) return;
    onChange([...values, value]);
    setDraft("");
  };

  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <p className="text-xs text-slate-300">{title}</p>
      <div className="flex gap-2">
        <Input value={draft} placeholder={placeholder} onChange={(e) => setDraft(e.target.value)} />
        <Button type="button" size="sm" variant="secondary" onClick={addItem}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
      {values.length === 0 ? (
        <p className="text-xs text-slate-400">暂无内容</p>
      ) : (
        <div className="space-y-2">
          {values.map((item, index) => (
            <div key={`${title}-${index}`} className="flex items-center gap-2">
              <Input
                value={item}
                onChange={(e) => {
                  const copy = [...values];
                  copy[index] = e.target.value;
                  onChange(copy);
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={index === 0}
                onClick={() => onChange(moveArrayItem(values, index, index - 1))}
              >
                上
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={index === values.length - 1}
                onClick={() => onChange(moveArrayItem(values, index, index + 1))}
              >
                下
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => onChange(values.filter((_, i) => i !== index))}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const newEducation = (): ResumeEducation => ({
  school: "",
  college: "",
  major: "",
  degree: "",
  startDate: "",
  endDate: "",
  courses: [],
  gpa: "",
  ranking: "",
  honors: []
});

const newResearch = (): ResumeResearchCompetition => ({
  name: "",
  type: "",
  level: "",
  period: "",
  role: "",
  techStack: [],
  advisor: "",
  direction: "",
  responsibilities: [],
  result: "",
  award: ""
});

const newProject = (): ResumeProject => ({
  name: "",
  type: "",
  period: "",
  role: "",
  description: "",
  techStack: [],
  responsibilities: [],
  highlights: [],
  outcomes: [],
  link: "",
  github: ""
});

const newCampus = (): ResumeCampusExperience => ({
  organization: "",
  role: "",
  period: "",
  responsibilities: [],
  achievements: []
});

const newCertificate = (): ResumeCertificateAward => ({
  name: "",
  type: "",
  issuer: "",
  date: "",
  description: ""
});

export function AdminEditor({ initialData, onSave, onPersistDefault }: AdminEditorProps) {
  const [data, setData] = useState<ResumeData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [isPersistingDefault, setIsPersistingDefault] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const canSave = useMemo(() => {
    return data.profile.name.trim().length > 0 && data.profile.email.trim().length > 0;
  }, [data.profile.email, data.profile.name]);

  const updateProfile = (field: keyof ResumeData["profile"], value: string) => {
    setData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value
      }
    }));
  };

  const saveData = async () => {
    if (!canSave) {
      toast.error("请至少填写姓名和邮箱");
      return;
    }

    setIsSaving(true);
    try {
      const sanitizedData = sanitizeResumeForSave(data);
      await onSave(sanitizedData);
      setData(sanitizedData);
      toast.success("简历保存成功");
    } catch (error) {
      const message = error instanceof Error ? error.message : "保存失败，请稍后重试";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const persistDefault = async () => {
    if (!onPersistDefault) return;
    if (!canSave) {
      toast.error("请至少填写姓名和邮箱");
      return;
    }

    setIsPersistingDefault(true);
    try {
      const sanitizedData = sanitizeResumeForSave(data);
      await onSave(sanitizedData);
      await onPersistDefault(sanitizedData);
      setData(sanitizedData);
      toast.success("已保存为项目默认简历");
    } catch (error) {
      const message = error instanceof Error ? error.message : "保存到源码失败";
      toast.error(message);
    } finally {
      setIsPersistingDefault(false);
    }
  };

  const updateEducationItem = (index: number, patch: Partial<ResumeEducation>) => {
    setData((prev) => {
      const copy = [...prev.education];
      copy[index] = { ...copy[index], ...patch };
      return { ...prev, education: copy };
    });
  };

  const updateResearchItem = (index: number, patch: Partial<ResumeResearchCompetition>) => {
    setData((prev) => {
      const copy = [...prev.researchAndCompetitions];
      copy[index] = { ...copy[index], ...patch };
      return { ...prev, researchAndCompetitions: copy };
    });
  };

  const updateProjectItem = (index: number, patch: Partial<ResumeProject>) => {
    setData((prev) => {
      const copy = [...prev.projects];
      copy[index] = { ...copy[index], ...patch };
      return { ...prev, projects: copy };
    });
  };

  const updateCampusItem = (index: number, patch: Partial<ResumeCampusExperience>) => {
    setData((prev) => {
      const copy = [...prev.campusExperience];
      copy[index] = { ...copy[index], ...patch };
      return { ...prev, campusExperience: copy };
    });
  };

  const updateCertificateItem = (index: number, patch: Partial<ResumeCertificateAward>) => {
    setData((prev) => {
      const copy = [...prev.certificatesAndAwards];
      copy[index] = { ...copy[index], ...patch };
      return { ...prev, certificatesAndAwards: copy };
    });
  };

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-8">
      <header className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5">
        <div>
          <h1 className="font-display text-2xl text-white">应届生简历管理中心</h1>
          <p className="text-sm text-slate-300">保留 8 个核心板块，支持编辑、排序、预览与保存。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setPreviewMode((prev) => !prev)}>
            {previewMode ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {previewMode ? "关闭预览" : "开启预览"}
          </Button>
          {onPersistDefault ? (
            <Button variant="secondary" onClick={persistDefault} disabled={isPersistingDefault || isSaving || !canSave}>
              {isPersistingDefault ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              保存为默认简历
            </Button>
          ) : null}
          <Button onClick={saveData} disabled={isSaving || !canSave}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            保存修改
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <CollapsibleSection title="1) 基本信息 Profile" defaultOpen>
            <Card>
              <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
                <Input placeholder="姓名" value={data.profile.name} onChange={(e) => updateProfile("name", e.target.value)} />
                <Input placeholder="学校" value={data.profile.university} onChange={(e) => updateProfile("university", e.target.value)} />
                <Input placeholder="学院" value={data.profile.college} onChange={(e) => updateProfile("college", e.target.value)} />
                <Input placeholder="专业" value={data.profile.major} onChange={(e) => updateProfile("major", e.target.value)} />
                <Input placeholder="学历" value={data.profile.degree} onChange={(e) => updateProfile("degree", e.target.value)} />
                <Input placeholder="毕业年份" value={data.profile.graduationYear} onChange={(e) => updateProfile("graduationYear", e.target.value)} />
                <Input placeholder="所在城市" value={data.profile.location} onChange={(e) => updateProfile("location", e.target.value)} />
                <Input placeholder="邮箱" value={data.profile.email} onChange={(e) => updateProfile("email", e.target.value)} />
                <Input placeholder="电话" value={data.profile.phone} onChange={(e) => updateProfile("phone", e.target.value)} />
                <Input placeholder="微信（可选）" value={data.profile.wechat || ""} onChange={(e) => updateProfile("wechat", e.target.value)} />
                <Input placeholder="个人网站（可选）" value={data.profile.website || ""} onChange={(e) => updateProfile("website", e.target.value)} />
                <Input placeholder="头像链接" className="sm:col-span-2" value={fixedAvatarUrl} disabled />
                <Input placeholder="求职状态" className="sm:col-span-2" value={data.profile.jobStatus} onChange={(e) => updateProfile("jobStatus", e.target.value)} />
                <Input placeholder="求职方向" className="sm:col-span-2" value={data.profile.jobDirection} onChange={(e) => updateProfile("jobDirection", e.target.value)} />
              </CardContent>
            </Card>
          </CollapsibleSection>

          <CollapsibleSection title="2) 教育背景 Education" defaultOpen>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">教育经历条目</CardTitle>
                <Button type="button" size="sm" variant="secondary" onClick={() => setData((prev) => ({ ...prev, education: [...prev.education, newEducation()] }))}>
                  <Plus className="mr-1 h-4 w-4" />
                  新增
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.education.map((item, index) => (
                  <Card key={`edu-${index}`} className="border-white/10 bg-white/[0.02]">
                    <CardContent className="space-y-3 p-4">
                      <div className="flex gap-2">
                        <Button type="button" size="sm" variant="secondary" disabled={index === 0} onClick={() => setData((prev) => ({ ...prev, education: moveArrayItem(prev.education, index, index - 1) }))}>上移</Button>
                        <Button type="button" size="sm" variant="secondary" disabled={index === data.education.length - 1} onClick={() => setData((prev) => ({ ...prev, education: moveArrayItem(prev.education, index, index + 1) }))}>下移</Button>
                        <Button type="button" size="sm" variant="destructive" onClick={() => setData((prev) => ({ ...prev, education: prev.education.filter((_, i) => i !== index) }))}>
                          <Trash2 className="mr-1 h-3.5 w-3.5" />
                          删除
                        </Button>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Input placeholder="学校" value={item.school} onChange={(e) => updateEducationItem(index, { school: e.target.value })} />
                        <Input placeholder="学院" value={item.college} onChange={(e) => updateEducationItem(index, { college: e.target.value })} />
                        <Input placeholder="专业" value={item.major} onChange={(e) => updateEducationItem(index, { major: e.target.value })} />
                        <Input placeholder="学历" value={item.degree} onChange={(e) => updateEducationItem(index, { degree: e.target.value })} />
                        <Input placeholder="开始时间" value={item.startDate} onChange={(e) => updateEducationItem(index, { startDate: e.target.value })} />
                        <Input placeholder="结束时间" value={item.endDate} onChange={(e) => updateEducationItem(index, { endDate: e.target.value })} />
                        <Input placeholder="GPA（可选）" value={item.gpa || ""} onChange={(e) => updateEducationItem(index, { gpa: e.target.value })} />
                        <Input placeholder="排名（可选）" value={item.ranking || ""} onChange={(e) => updateEducationItem(index, { ranking: e.target.value })} />
                      </div>
                      <StringListEditor title="主修课程" values={item.courses} onChange={(values) => updateEducationItem(index, { courses: values })} />
                      <StringListEditor title="在校荣誉" values={item.honors || []} onChange={(values) => updateEducationItem(index, { honors: values })} />
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </CollapsibleSection>

          <CollapsibleSection title="3) 专业技能 Skills" defaultOpen>
            <Card>
              <CardContent className="space-y-3 p-4">
                <StringListEditor title="编程语言" values={data.skills.programming} onChange={(values) => setData((prev) => ({ ...prev, skills: { ...prev.skills, programming: values } }))} />
                <StringListEditor title="数据处理" values={data.skills.dataProcessing} onChange={(values) => setData((prev) => ({ ...prev, skills: { ...prev.skills, dataProcessing: values } }))} />
                <StringListEditor title="机器学习" values={data.skills.machineLearning} onChange={(values) => setData((prev) => ({ ...prev, skills: { ...prev.skills, machineLearning: values } }))} />
                <StringListEditor title="医学 AI" values={data.skills.medicalAI} onChange={(values) => setData((prev) => ({ ...prev, skills: { ...prev.skills, medicalAI: values } }))} />
                <StringListEditor title="Web 开发" values={data.skills.webDevelopment} onChange={(values) => setData((prev) => ({ ...prev, skills: { ...prev.skills, webDevelopment: values } }))} />
                <StringListEditor title="文本处理" values={data.skills.textProcessing} onChange={(values) => setData((prev) => ({ ...prev, skills: { ...prev.skills, textProcessing: values } }))} />
                <StringListEditor title="工具协作" values={data.skills.tooling} onChange={(values) => setData((prev) => ({ ...prev, skills: { ...prev.skills, tooling: values } }))} />
              </CardContent>
            </Card>
          </CollapsibleSection>

          <CollapsibleSection title="4) 科研 / 竞赛经历 Research & Competitions" defaultOpen>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">科研/竞赛条目</CardTitle>
                <Button type="button" size="sm" variant="secondary" onClick={() => setData((prev) => ({ ...prev, researchAndCompetitions: [...prev.researchAndCompetitions, newResearch()] }))}>
                  <Plus className="mr-1 h-4 w-4" />
                  新增
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.researchAndCompetitions.map((item, index) => (
                  <Card key={`research-${index}`} className="border-white/10 bg-white/[0.02]">
                    <CardContent className="space-y-3 p-4">
                      <div className="flex gap-2">
                        <Button type="button" size="sm" variant="secondary" disabled={index === 0} onClick={() => setData((prev) => ({ ...prev, researchAndCompetitions: moveArrayItem(prev.researchAndCompetitions, index, index - 1) }))}>上移</Button>
                        <Button type="button" size="sm" variant="secondary" disabled={index === data.researchAndCompetitions.length - 1} onClick={() => setData((prev) => ({ ...prev, researchAndCompetitions: moveArrayItem(prev.researchAndCompetitions, index, index + 1) }))}>下移</Button>
                        <Button type="button" size="sm" variant="destructive" onClick={() => setData((prev) => ({ ...prev, researchAndCompetitions: prev.researchAndCompetitions.filter((_, i) => i !== index) }))}>
                          <Trash2 className="mr-1 h-3.5 w-3.5" />
                          删除
                        </Button>
                      </div>
                      <Input placeholder="名称" value={item.name} onChange={(e) => updateResearchItem(index, { name: e.target.value })} />
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Input placeholder="类型" value={item.type} onChange={(e) => updateResearchItem(index, { type: e.target.value })} />
                        <Input placeholder="级别" value={item.level} onChange={(e) => updateResearchItem(index, { level: e.target.value })} />
                        <Input placeholder="时间" value={item.period} onChange={(e) => updateResearchItem(index, { period: e.target.value })} />
                        <Input placeholder="角色" value={item.role} onChange={(e) => updateResearchItem(index, { role: e.target.value })} />
                        <Input placeholder="研究方向（可选）" value={item.direction || ""} onChange={(e) => updateResearchItem(index, { direction: e.target.value })} />
                        <Input placeholder="奖项（可选）" value={item.award || ""} onChange={(e) => updateResearchItem(index, { award: e.target.value })} />
                      </div>
                      <StringListEditor title="技术标签（建议最多 8 个）" values={item.techStack || []} onChange={(values) => updateResearchItem(index, { techStack: values })} />
                      <StringListEditor title="我负责" values={item.responsibilities} onChange={(values) => updateResearchItem(index, { responsibilities: values })} />
                      <Textarea placeholder="项目成果" value={item.result} onChange={(e) => updateResearchItem(index, { result: e.target.value })} />
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </CollapsibleSection>

          <CollapsibleSection title="5) 项目经历 Projects" defaultOpen>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">项目条目</CardTitle>
                <Button type="button" size="sm" variant="secondary" onClick={() => setData((prev) => ({ ...prev, projects: [...prev.projects, newProject()] }))}>
                  <Plus className="mr-1 h-4 w-4" />
                  新增
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.projects.map((item, index) => (
                  <Card key={`project-${index}`} className="border-white/10 bg-white/[0.02]">
                    <CardContent className="space-y-3 p-4">
                      <div className="flex gap-2">
                        <Button type="button" size="sm" variant="secondary" disabled={index === 0} onClick={() => setData((prev) => ({ ...prev, projects: moveArrayItem(prev.projects, index, index - 1) }))}>上移</Button>
                        <Button type="button" size="sm" variant="secondary" disabled={index === data.projects.length - 1} onClick={() => setData((prev) => ({ ...prev, projects: moveArrayItem(prev.projects, index, index + 1) }))}>下移</Button>
                        <Button type="button" size="sm" variant="destructive" onClick={() => setData((prev) => ({ ...prev, projects: prev.projects.filter((_, i) => i !== index) }))}>
                          <Trash2 className="mr-1 h-3.5 w-3.5" />
                          删除
                        </Button>
                      </div>
                      <Input placeholder="项目名称" value={item.name} onChange={(e) => updateProjectItem(index, { name: e.target.value })} />
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Input placeholder="项目类型" value={item.type} onChange={(e) => updateProjectItem(index, { type: e.target.value })} />
                        <Input placeholder="项目时间" value={item.period} onChange={(e) => updateProjectItem(index, { period: e.target.value })} />
                      </div>
                      <Input placeholder="担任角色" value={item.role} onChange={(e) => updateProjectItem(index, { role: e.target.value })} />
                      <Textarea placeholder="项目简介" value={item.description} onChange={(e) => updateProjectItem(index, { description: e.target.value })} />
                      <StringListEditor title="技术标签（建议最多 8 个）" values={item.techStack} onChange={(values) => updateProjectItem(index, { techStack: values })} />
                      <StringListEditor title="我负责" values={item.responsibilities} onChange={(values) => updateProjectItem(index, { responsibilities: values })} />
                      <StringListEditor title="项目亮点" values={item.highlights} onChange={(values) => updateProjectItem(index, { highlights: values })} />
                      <StringListEditor title="项目成果" values={item.outcomes} onChange={(values) => updateProjectItem(index, { outcomes: values })} />
                      <Input placeholder="项目链接（可选）" value={item.link || ""} onChange={(e) => updateProjectItem(index, { link: e.target.value })} />
                      <Input placeholder="GitHub（可选）" value={item.github || ""} onChange={(e) => updateProjectItem(index, { github: e.target.value })} />
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </CollapsibleSection>

          <CollapsibleSection title="6) 校园经历 Campus Experience" defaultOpen>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">校园经历条目</CardTitle>
                <Button type="button" size="sm" variant="secondary" onClick={() => setData((prev) => ({ ...prev, campusExperience: [...prev.campusExperience, newCampus()] }))}>
                  <Plus className="mr-1 h-4 w-4" />
                  新增
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.campusExperience.map((item, index) => (
                  <Card key={`campus-${index}`} className="border-white/10 bg-white/[0.02]">
                    <CardContent className="space-y-3 p-4">
                      <div className="flex gap-2">
                        <Button type="button" size="sm" variant="secondary" disabled={index === 0} onClick={() => setData((prev) => ({ ...prev, campusExperience: moveArrayItem(prev.campusExperience, index, index - 1) }))}>上移</Button>
                        <Button type="button" size="sm" variant="secondary" disabled={index === data.campusExperience.length - 1} onClick={() => setData((prev) => ({ ...prev, campusExperience: moveArrayItem(prev.campusExperience, index, index + 1) }))}>下移</Button>
                        <Button type="button" size="sm" variant="destructive" onClick={() => setData((prev) => ({ ...prev, campusExperience: prev.campusExperience.filter((_, i) => i !== index) }))}>
                          <Trash2 className="mr-1 h-3.5 w-3.5" />
                          删除
                        </Button>
                      </div>
                      <Input placeholder="组织名称" value={item.organization} onChange={(e) => updateCampusItem(index, { organization: e.target.value })} />
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Input placeholder="职位" value={item.role} onChange={(e) => updateCampusItem(index, { role: e.target.value })} />
                        <Input placeholder="时间" value={item.period} onChange={(e) => updateCampusItem(index, { period: e.target.value })} />
                      </div>
                      <StringListEditor title="负责事项" values={item.responsibilities} onChange={(values) => updateCampusItem(index, { responsibilities: values })} />
                      <StringListEditor title="成果（可选）" values={item.achievements || []} onChange={(values) => updateCampusItem(index, { achievements: values })} />
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </CollapsibleSection>

          <CollapsibleSection title="7) 证书 / 奖项 Certificates & Awards" defaultOpen>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">证书与奖项条目</CardTitle>
                <Button type="button" size="sm" variant="secondary" onClick={() => setData((prev) => ({ ...prev, certificatesAndAwards: [...prev.certificatesAndAwards, newCertificate()] }))}>
                  <Plus className="mr-1 h-4 w-4" />
                  新增
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.certificatesAndAwards.map((item, index) => (
                  <Card key={`cert-${index}`} className="border-white/10 bg-white/[0.02]">
                    <CardContent className="space-y-3 p-4">
                      <div className="flex gap-2">
                        <Button type="button" size="sm" variant="secondary" disabled={index === 0} onClick={() => setData((prev) => ({ ...prev, certificatesAndAwards: moveArrayItem(prev.certificatesAndAwards, index, index - 1) }))}>上移</Button>
                        <Button type="button" size="sm" variant="secondary" disabled={index === data.certificatesAndAwards.length - 1} onClick={() => setData((prev) => ({ ...prev, certificatesAndAwards: moveArrayItem(prev.certificatesAndAwards, index, index + 1) }))}>下移</Button>
                        <Button type="button" size="sm" variant="destructive" onClick={() => setData((prev) => ({ ...prev, certificatesAndAwards: prev.certificatesAndAwards.filter((_, i) => i !== index) }))}>
                          <Trash2 className="mr-1 h-3.5 w-3.5" />
                          删除
                        </Button>
                      </div>
                      <Input placeholder="名称" value={item.name} onChange={(e) => updateCertificateItem(index, { name: e.target.value })} />
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Input placeholder="类型" value={item.type} onChange={(e) => updateCertificateItem(index, { type: e.target.value })} />
                        <Input placeholder="时间" value={item.date} onChange={(e) => updateCertificateItem(index, { date: e.target.value })} />
                      </div>
                      <Input placeholder="颁发机构（可选）" value={item.issuer || ""} onChange={(e) => updateCertificateItem(index, { issuer: e.target.value })} />
                      <Textarea placeholder="说明（可选）" value={item.description || ""} onChange={(e) => updateCertificateItem(index, { description: e.target.value })} />
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </CollapsibleSection>

          <CollapsibleSection title="8) 自我评价 Self Evaluation" defaultOpen>
            <Card>
              <CardContent className="p-4">
                <StringListEditor
                  title="优势列表（最多展示 3 条）"
                  values={data.selfEvaluation.strengths}
                  onChange={(values) => setData((prev) => ({ ...prev, selfEvaluation: { strengths: values } }))}
                />
              </CardContent>
            </Card>
          </CollapsibleSection>
        </div>

        <div className="space-y-4">
          {previewMode ? (
            <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border border-white/15 bg-luxury-ink/70">
              <ResumeView data={data} />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">预览模式</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300">点击右上角“开启预览”可实时查看当前编辑效果。</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
