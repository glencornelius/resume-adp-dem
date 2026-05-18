"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ExternalLink, GraduationCap, MapPin, Printer, Share2, UserRound } from "lucide-react";
import { toast } from "sonner";

import { ResumeCard } from "@/components/ResumeCard";
import { ResumeSection } from "@/components/ResumeSection";
import { SkillBadge } from "@/components/SkillBadge";
import { Button } from "@/components/ui/button";
import { ResumeData } from "@/lib/types";

interface ResumeViewProps {
  data: ResumeData;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 }
};

const skillGroups: Array<{ key: keyof ResumeData["skills"]; title: string }> = [
  { key: "programming", title: "编程语言" },
  { key: "dataProcessing", title: "数据处理" },
  { key: "machineLearning", title: "机器学习" },
  { key: "medicalAI", title: "医学 AI" },
  { key: "webDevelopment", title: "Web 开发" },
  { key: "textProcessing", title: "文本处理" },
  { key: "tooling", title: "工具协作" }
];

function hasText(value?: string | null) {
  return Boolean(value && value.trim());
}

function isInternalPath(value: string) {
  return value.startsWith("/");
}

function isAdpProject(name: string) {
  return /抗糖尿病肽|抗糖尿病/.test(name);
}

export function ResumeView({ data }: ResumeViewProps) {
  const profile = data.profile;

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: `${profile.name} 个人简历`,
        text: `${profile.name} - ${profile.jobDirection}`,
        url
      });
      toast.success("分享面板已打开");
      return;
    }
    await navigator.clipboard.writeText(url);
    toast.success("链接已复制到剪贴板");
  };

  const showEducation = data.education.length > 0;
  const showSkills = skillGroups.some((group) => data.skills[group.key].length > 0);
  const showResearch = data.researchAndCompetitions.length > 0;
  const showProjects = data.projects.length > 0;
  const showCampus = data.campusExperience.length > 0;
  const showCertificates = data.certificatesAndAwards.length > 0;
  const showSelfEvaluation = data.selfEvaluation.strengths.length > 0;

  const groupedCertificates = data.certificatesAndAwards.reduce<Record<string, typeof data.certificatesAndAwards>>(
    (acc, item) => {
      const key = item.type || "其他";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {}
  );

  return (
    <main className="relative min-h-screen px-4 py-8 md:px-10 md:py-12 print:bg-white print:px-0 print:py-0">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(212,178,115,0.12),transparent_32%),radial-gradient(circle_at_82%_8%,rgba(79,116,255,0.16),transparent_30%)] print:hidden" />
      <div className="relative z-10 mx-auto max-w-6xl space-y-5">
        <section className="no-print grid gap-3 sm:grid-cols-2">
          <Link
            href="/resume"
            className="rounded-2xl border border-luxury-gold/45 bg-gradient-to-r from-luxury-gold/18 to-luxury-gold/8 px-5 py-4 text-white shadow-glow transition hover:-translate-y-0.5"
          >
            <p className="text-xs tracking-[0.12em] text-luxury-champagne">RESUME</p>
            <p className="mt-1 text-lg font-semibold">简历</p>
            <p className="mt-1 text-xs text-slate-200">查看个人履历、教育背景与项目经历</p>
          </Link>
          <Link
            href="/adp-dem"
            className="rounded-2xl border border-[#8ba3ff]/55 bg-gradient-to-r from-[#6b88ff]/20 to-[#4f74ff]/10 px-5 py-4 text-white shadow-[0_12px_30px_rgba(79,116,255,0.22)] transition hover:-translate-y-0.5"
          >
            <p className="text-xs tracking-[0.12em] text-[#c7d5ff]">PROJECT</p>
            <p className="mt-1 text-lg font-semibold">项目</p>
            <p className="mt-1 text-xs text-slate-200">进入 ADP-DEM 抗糖尿病肽智能预测平台</p>
          </Link>
        </section>
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="glass-panel rounded-3xl p-5 md:p-8 print:border-none print:bg-white print:shadow-none"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4 md:gap-5">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-luxury-gold/35 bg-slate-900/40">
                {hasText(profile.avatarUrl) ? (
                  <Image src={profile.avatarUrl || ""} alt={profile.name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-300">
                    <UserRound className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="font-display text-3xl tracking-[0.02em] text-white print:text-black md:text-4xl">
                  {profile.name}
                </h1>
                <p className="mt-1 text-sm text-luxury-gold md:text-base">{profile.jobStatus}</p>
                <p className="mt-1 text-xs text-slate-300 md:text-sm">方向：{profile.jobDirection}</p>
                <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-300 md:text-sm">
                  智能医学工程专业应届本科生，关注医学 AI、数据分析与 Web 应用开发，具备从数据处理、模型训练到系统展示的完整项目实践经历。
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-300 print:text-slate-700">
                  <span className="inline-flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {profile.university} · {profile.college}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {profile.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="no-print flex flex-wrap gap-2 lg:justify-end">
              <Button variant="secondary" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                打印 / 导出 PDF
              </Button>
              <Button variant="secondary" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                分享
              </Button>
            </div>
          </div>

          <div className="mt-5 grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-200 md:grid-cols-2">
            <p>专业：{profile.major}</p>
            <p>学历：{profile.degree}</p>
            <p>毕业年份：{profile.graduationYear}</p>
            <p>电话：{profile.phone}</p>
            <p>
              邮箱：
              <a href={`mailto:${profile.email}`} className="text-luxury-champagne hover:underline">
                {profile.email}
              </a>
            </p>
            {hasText(profile.wechat) ? <p>微信：{profile.wechat}</p> : null}
            {hasText(profile.website) ? (
              <p>
                个人网站：
                <a
                  href={profile.website}
                  target="_blank"
                  className="text-luxury-champagne hover:underline"
                  rel="noreferrer"
                >
                  {profile.website}
                </a>
              </p>
            ) : null}
          </div>
        </motion.header>

        {showEducation ? (
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.03 }}
          >
            <ResumeSection title="教育背景 Education" subtitle="应届生重点展示模块">
              <div className="space-y-4">
                {data.education.map((item, index) => (
                  <ResumeCard key={`${item.school}-${index}`}>
                    <div className="flex flex-col justify-between gap-2 md:flex-row md:items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-white print:text-black">{item.school}</h3>
                        <p className="text-sm text-luxury-gold">
                          {item.college} · {item.major} · {item.degree}
                        </p>
                      </div>
                      <p className="text-xs text-slate-300 print:text-slate-600">
                        {item.startDate} - {item.endDate}
                      </p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-200">
                      {item.gpa ? <span className="rounded-full border border-luxury-gold/40 px-2 py-1">GPA: {item.gpa}</span> : null}
                      {item.ranking ? (
                        <span className="rounded-full border border-luxury-gold/40 px-2 py-1">排名: {item.ranking}</span>
                      ) : null}
                    </div>
                    {item.courses.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.courses.map((course) => (
                          <SkillBadge key={course} skill={course} />
                        ))}
                      </div>
                    ) : null}
                    {item.honors && item.honors.length > 0 ? (
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-200 print:text-slate-700">
                        {item.honors.map((honor) => (
                          <li key={honor}>{honor}</li>
                        ))}
                      </ul>
                    ) : null}
                  </ResumeCard>
                ))}
              </div>
            </ResumeSection>
          </motion.section>
        ) : null}

        {showSkills ? (
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.05 }}
          >
            <ResumeSection title="专业技能 Skills">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {skillGroups
                  .filter((group) => data.skills[group.key].length > 0)
                  .map((group) => (
                    <ResumeCard key={group.key} className="border-white/10">
                      <h3 className="mb-3 text-sm font-semibold tracking-wide text-luxury-gold">{group.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        {data.skills[group.key].map((skill) => (
                          <SkillBadge key={skill} skill={skill} />
                        ))}
                      </div>
                    </ResumeCard>
                  ))}
              </div>
            </ResumeSection>
          </motion.section>
        ) : null}

        {showResearch ? (
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.07 }}
          >
            <ResumeSection title="科研 / 竞赛经历 Research & Competitions">
              <div className="space-y-4">
                {data.researchAndCompetitions.map((item, index) => (
                  <ResumeCard key={`${item.name}-${index}`} className="border-luxury-gold/20">
                    <div className="flex flex-col justify-between gap-2 md:flex-row md:items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-white print:text-black">{item.name}</h3>
                        <p className="text-sm text-luxury-gold">{item.type} · {item.role}</p>
                      </div>
                      <p className="text-xs text-slate-300 print:text-slate-600">{item.period}</p>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full border border-luxury-gold/45 px-2 py-1 text-luxury-champagne">{item.level}</span>
                      {hasText(item.award) ? (
                        <span className="rounded-full border border-luxury-gold/45 px-2 py-1 text-luxury-champagne">{item.award}</span>
                      ) : null}
                    </div>
                    {item.techStack && item.techStack.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.techStack.slice(0, 8).map((tech) => (
                          <SkillBadge key={tech} skill={tech} />
                        ))}
                      </div>
                    ) : null}
                    {hasText(item.direction) ? <p className="mt-2 text-sm text-slate-300">研究方向：{item.direction}</p> : null}
                    {item.responsibilities.length > 0 ? (
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-200 print:text-slate-700">
                        {item.responsibilities.map((res) => (
                          <li key={res}>{res}</li>
                        ))}
                      </ul>
                    ) : null}
                    <p className="mt-3 text-sm text-slate-200 print:text-slate-700">项目成果：{item.result}</p>
                    {isAdpProject(item.name) ? (
                      <div className="mt-4">
                        <Link
                          href="/adp-dem"
                          className="inline-flex items-center rounded-full border border-luxury-gold/45 bg-luxury-gold/15 px-4 py-2 text-sm font-semibold text-luxury-champagne transition hover:bg-luxury-gold/25"
                        >
                          查看项目网站 →
                        </Link>
                      </div>
                    ) : null}
                  </ResumeCard>
                ))}
              </div>
            </ResumeSection>
          </motion.section>
        ) : null}

        {showProjects ? (
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.09 }}
          >
            <ResumeSection title="项目经历 Projects" subtitle="项目描述已简化为更易读表达">
              <div className="space-y-4">
                {data.projects.map((project, index) => (
                  <ResumeCard key={`${project.name}-${index}`} className="border-luxury-gold/25 hover:shadow-glow">
                    <div className="flex flex-col justify-between gap-2 md:flex-row md:items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-white print:text-black">{project.name}</h3>
                        <p className="text-sm text-luxury-gold">
                          {project.type} · {project.role}
                        </p>
                      </div>
                      <p className="text-xs text-slate-300 print:text-slate-600">{project.period}</p>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-200 print:text-slate-700">{project.description}</p>
                    {project.techStack.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {project.techStack.slice(0, 8).map((tech) => (
                          <SkillBadge key={tech} skill={tech} />
                        ))}
                      </div>
                    ) : null}
                    {project.responsibilities.length > 0 ? (
                      <div className="mt-4">
                        <p className="text-sm font-semibold text-luxury-champagne">我负责</p>
                        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-200 print:text-slate-700">
                          {project.responsibilities.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {project.highlights.length > 0 ? (
                      <div className="mt-4">
                        <p className="text-sm font-semibold text-luxury-champagne">项目亮点</p>
                        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-200 print:text-slate-700">
                          {project.highlights.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {project.outcomes.length > 0 ? (
                      <div className="mt-4">
                        <p className="text-sm font-semibold text-luxury-champagne">项目成果</p>
                        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-200 print:text-slate-700">
                          {project.outcomes.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {hasText(project.link) || hasText(project.github) ? (
                      <div className="mt-4 flex flex-wrap gap-4 text-sm">
                        {hasText(project.link) ? (
                          isInternalPath(project.link || "") ? (
                            <a
                              href={project.link || ""}
                              className="inline-flex items-center rounded-full border border-luxury-gold/45 bg-luxury-gold/15 px-4 py-2 text-sm font-semibold text-luxury-champagne transition hover:bg-luxury-gold/25"
                            >
                              查看项目网站 →
                            </a>
                          ) : (
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-luxury-champagne hover:underline"
                            >
                              项目链接
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )
                        ) : null}
                        {hasText(project.github) ? (
                          <a
                            href={project.github}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-luxury-champagne hover:underline"
                          >
                            GitHub
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : null}
                      </div>
                    ) : null}
                  </ResumeCard>
                ))}
              </div>
            </ResumeSection>
          </motion.section>
        ) : null}

        {showCampus ? (
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.11 }}
          >
            <ResumeSection title="校园经历 Campus Experience">
              <div className="space-y-3">
                {data.campusExperience.map((item, index) => (
                  <ResumeCard key={`${item.organization}-${index}`}>
                    <div className="flex flex-col justify-between gap-2 md:flex-row md:items-start">
                      <div>
                        <h3 className="text-base font-semibold text-white print:text-black">{item.organization}</h3>
                        <p className="text-sm text-luxury-gold">{item.role}</p>
                      </div>
                      <p className="text-xs text-slate-300 print:text-slate-600">{item.period}</p>
                    </div>
                    {item.responsibilities.length > 0 ? (
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-200 print:text-slate-700">
                        {item.responsibilities.map((res) => (
                          <li key={res}>{res}</li>
                        ))}
                      </ul>
                    ) : null}
                    {item.achievements && item.achievements.length > 0 ? (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-200 print:text-slate-700">
                        {item.achievements.map((ach) => (
                          <li key={ach}>{ach}</li>
                        ))}
                      </ul>
                    ) : null}
                  </ResumeCard>
                ))}
              </div>
            </ResumeSection>
          </motion.section>
        ) : null}

        {showCertificates ? (
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.13 }}
          >
            <ResumeSection title="证书 / 奖项 Certificates & Awards">
              <div className="space-y-4">
                {Object.entries(groupedCertificates).map(([type, list]) => (
                  <div key={type} className="space-y-2">
                    <p className="text-sm font-semibold tracking-wide text-luxury-gold">{type}</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      {list.map((item, index) => (
                        <ResumeCard key={`${item.name}-${index}`}>
                          <h3 className="text-base font-semibold text-white print:text-black">{item.name}</h3>
                          <p className="mt-1 text-xs text-slate-300 print:text-slate-600">{item.date}</p>
                          {hasText(item.issuer) ? <p className="mt-2 text-sm text-slate-200">颁发机构：{item.issuer}</p> : null}
                          {hasText(item.description) ? (
                            <p className="mt-2 text-sm text-slate-200 print:text-slate-700">{item.description}</p>
                          ) : null}
                        </ResumeCard>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ResumeSection>
          </motion.section>
        ) : null}

        {showSelfEvaluation ? (
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.15 }}
          >
            <ResumeSection title="自我评价 Self Evaluation">
              <ul className="list-disc space-y-2 pl-5 text-sm text-slate-100 print:text-slate-700">
                {data.selfEvaluation.strengths.slice(0, 3).map((strength) => (
                  <li key={strength}>{strength}</li>
                ))}
              </ul>
            </ResumeSection>
          </motion.section>
        ) : null}
      </div>
    </main>
  );
}
