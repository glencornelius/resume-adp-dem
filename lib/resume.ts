import { ResumeData } from "@/lib/types";

export const defaultResumeData: ResumeData = {
  profile: {
    name: "葛超伟",
    university: "徐州医科大学",
    college: "医学信息与工程学院",
    major: "智能医学工程",
    degree: "本科",
    graduationYear: "2026",
    location: "江苏徐州",
    email: "a1933014774@163.com",
    phone: "15215866836",
    wechat: "gcw15215866836",
    github: "",
    website: "",
    avatarUrl: "/avatar-gechaowei.jpg",
    jobStatus: "应届本科生 / 正在求职",
    jobDirection: "医学 AI / 数据分析 / Web 应用开发"
  },
  education: [
    {
      school: "徐州医科大学",
      college: "医学信息与工程学院",
      major: "智能医学工程",
      degree: "本科",
      startDate: "2022.09",
      endDate: "2026.06",
      courses: ["医学信息学", "机器学习", "Python 程序设计", "数据库原理", "医学影像处理", "神经网络与深度学习", "自然语言处理", "系统解剖学", "电子学基础", "病理生理学", "临川医学概论"],
      gpa: "3.9/5",
      ranking: "前10%",
      honors: ["校单项奖学金", "校二等奖学金", "校三好学生"]
    }
  ],
  skills: {
    programming: ["Python", "JavaScript", "TypeScript", "SQL"],
    dataProcessing: ["Pandas", "NumPy", "Matplotlib", "数据清洗", "数据可视化", "结果分析"],
    machineLearning: ["SVM", "随机森林", "XGBoost", "LightGBM", "模型训练", "模型评估"],
    medicalAI: ["多肽序列分析", "蛋白质语言模型", "候选肽筛选", "医学数据建模"],
    webDevelopment: ["Flask", "Next.js", "React", "Tailwind CSS", "前后端接口", "网页展示"],
    textProcessing: ["jieba", "TF-IDF", "Word2Vec", "BERT 句向量", "文本相似度分析"],
    tooling: ["Git", "GitHub", "VS Code", "Postman", "Excel"]
  },
  researchAndCompetitions: [
    {
      name: "基于 AI 的抗糖尿病肽候选筛选研究",
      type: "科研 / 竞赛项目",
      level: "校级 / 省赛项目",
      period: "2025.06 - 2026.03",
      role: "算法建模与数据分析",
      techStack: ["Python", "PyTorch", "scikit-learn", "XGBoost", "LightGBM", "Pandas", "NumPy", "Matplotlib"],
      advisor: "",
      direction: "抗糖尿病肽候选筛选",
      responsibilities: [
        "整理抗糖尿病肽相关数据，完成序列清洗、标签整理和样本筛选",
        "提取多肽序列的基础特征，如氨基酸组成、疏水性、电荷等",
        "使用机器学习方法训练预测模型，判断候选肽是否可能具有抗糖尿病活性",
        "根据蛋白酶切规则生成候选肽库，并对候选序列进行批量预测",
        "整理模型结果，输出候选肽列表、评估指标和可视化图表"
      ],
      result:
        "整理 472 条训练样本（正负样本各 236 条）；生成约 64 万条候选肽序列并完成批量预测；基础模型 AUC 达到 0.9203；完成从数据整理到候选筛选的完整流程。",
      award: ""
    },
    {
      name: "抗 HIV 多肽活性预测与展示系统",
      type: "科研项目",
      level: "校级 / 项目级",
      period: "2025.09 - 2026.02",
      role: "算法建模与系统实现",
      techStack: ["Python", "PyTorch", "scikit-learn", "Flask", "JavaScript", "3Dmol.js"],
      advisor: "",
      direction: "抗 HIV 多肽活性预测",
      responsibilities: [
        "整理抗 HIV 多肽数据，完成数据清洗、样本划分和特征提取",
        "提取多肽序列的基础信息，如组成、电荷、疏水性和分子量等",
        "使用机器学习模型进行预测实验，并对不同模型效果进行比较",
        "开发 Flask 后端接口，实现序列输入、预测结果返回和分析展示",
        "在网页端展示预测结果、突变影响分析和三维结构结果"
      ],
      result:
        "完成 380 条抗 HIV 多肽样本建模实验；基础模型在测试集中 AUC 达到 0.9817；实现可交互网页平台，支持在线输入序列并查看预测结果；完成从模型训练到网页展示的完整应用流程。",
      award: ""
    }
  ],
  projects: [
    {
      name: "ADP-DEM 抗糖尿病肽智能筛选系统",
      type: "医学 AI 项目官网",
      period: "2025.06 - 2026.03",
      role: "算法建模与可视化平台开发",
      description:
        "围绕抗糖尿病肽计算发现构建两阶段预测与可视化展示页面，覆盖数据集概览、模型性能、候选肽筛选、分子对接结果与在线 Demo。",
      techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Recharts", "Python"],
      responsibilities: [
        "基于 ADP-DEM 研究流程梳理项目展示架构，完成医学 AI 产品化网页设计",
        "将训练数据、候选结果与论文指标压缩为轻量 JSON，支持前端可视化",
        "实现候选肽 Explorer，支持序列搜索、长度筛选、排序、详情查看与导出",
        "实现在线序列分析 Demo，明确区分候选库查询与完整模型推理",
        "补充分子对接结果展示与科研免责声明，提升对外展示规范性"
      ],
      highlights: [
        "将科研项目升级为高端产品化展示网站",
        "实现从模型指标到候选库交互分析的全链路展示",
        "兼顾非专业 HR 可读性与技术面试官关注的数据细节"
      ],
      outcomes: [
        "形成可部署到 Vercel 的独立项目详情页",
        "支持从简历页一键跳转到项目网站"
      ],
      link: "/adp-dem",
      github: ""
    },
    {
      name: "抗 HIV 多肽智能预测平台",
      type: "医学 AI Web 应用",
      period: "2025.09 - 2026.02",
      role: "算法建模与系统实现",
      description:
        "这是一个面向多肽序列分析的网页系统。用户输入一段多肽序列后，系统会给出该序列是否可能具有抗 HIV 活性的预测结果，并展示相关分析信息。",
      techStack: ["Python", "Flask", "scikit-learn", "JavaScript", "3Dmol.js"],
      responsibilities: [
        "搭建网页系统的后端接口，支持序列提交和结果返回",
        "将训练好的预测模型接入系统，实现在线预测",
        "设计结果展示页面，让用户更直观地查看预测概率和分析结果",
        "增加突变分析功能，用于观察序列变化对预测结果的影响",
        "接入三维结构展示功能，让结果呈现更直观"
      ],
      highlights: [
        "将 AI 模型做成了可以直接使用的网页工具",
        "支持用户在线输入序列并获得预测结果",
        "同时展示预测结果、突变分析和结构信息",
        "体现了从算法实验到实际系统开发的完整能力"
      ],
      outcomes: [
        "完成抗 HIV 多肽预测流程的线上化",
        "把模型结果转化为可交互、可展示的系统页面"
      ],
      link: "",
      github: ""
    },
    {
      name: "CheckMate Pro 智能语义查重系统",
      type: "NLP Web 应用",
      period: "2025.04 - 2025.08",
      role: "系统设计与核心开发",
      description:
        "这是一个面向作业和文档场景的智能查重系统。系统支持上传 Word、PDF、TXT 等格式文档，并从文字相似度和语义相似度两个角度进行分析，帮助用户发现内容重复或相似部分。",
      techStack: ["Python", "Flask", "jieba", "scikit-learn", "Word2Vec", "BERT", "JavaScript"],
      responsibilities: [
        "搭建 Flask 后端，完成文档上传、文本解析和查重接口",
        "支持 Word、PDF、TXT 等多种文件格式的内容读取",
        "接入多种文本相似度算法，对文档间相似程度进行计算",
        "实现单篇查重、批量查重和相似度矩阵展示",
        "设计查重结果页面，让检测结果更直观易读"
      ],
      highlights: [
        "支持多种文档格式上传和解析",
        "支持单文档查重和批量文档查重",
        "可以生成文档相似度结果，方便对比分析",
        "完成了从文件上传、文本处理到结果展示的完整流程"
      ],
      outcomes: [
        "完成可用于课程和文档场景的查重系统原型",
        "形成从后端接口到前端展示的完整功能链路"
      ],
      link: "",
      github: ""
    }
  ],
  campusExperience: [
    {
      organization: "医学信息与工程学院学生会",
      role: "技术部干事",
      period: "2023.09 - 2024.06",
      responsibilities: [
        "参与学院活动报名系统和信息发布内容维护",
        "协助组织学术讲座、志愿活动等学院活动",
        "负责部分活动数据整理和文档归档",
        "在团队协作中提升了沟通、执行和资料整理能力"
      ],
      achievements: []
    }
  ],
  certificatesAndAwards: [
    {
      name: "全国大学生医学技术创新竞赛省级三等奖",
      type: "竞赛奖项",
      issuer: "",
      date: "2024.11",
      description: "负责项目展示页面开发与答辩材料整理"
    },
    {
      name: "校单项奖学金",
      type: "奖学金",
      issuer: "",
      date: "2024.12",
      description: "综合成绩与实践表现优秀"
    },
    {
      name: "校二等奖学金",
      type: "奖学金",
      issuer: "",
      date: "2024.12",
      description: "综合成绩与实践表现优秀"
    },
    {
      name: "校三好学生",
      type: "奖学金",
      issuer: "",
      date: "2024.12",
      description: "综合成绩与实践表现优秀"
    },
    {
      name: "大学英语四级 CET-4",
      type: "证书",
      issuer: "",
      date: "2023.12",
      description: "555"
    },
    {
      name: "大学英语六级 CET-6",
      type: "证书",
      issuer: "",
      date: "2024.06",
      description: "443"
    },
    {
      name: "计算机二级证书",
      type: "证书",
      issuer: "",
      date: "",
      description: "优秀(＞90)"
    }
  ],
  selfEvaluation: {
    strengths: [
      "具备医学与工程交叉学习背景，能够理解医学场景中的数据分析和智能应用需求。",
      "有较完整的项目实践经历，参与过从数据整理、模型训练到网页系统展示的全过程。",
      "熟悉 Python 数据处理和基础 Web 开发，能够将算法结果转化为可展示、可交互的应用页面。"
    ]
  }
};

function toStringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function toRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object") {
    return value as Record<string, unknown>;
  }
  return {};
}

function hasOwn(record: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(record, key);
}

function stringField(record: Record<string, unknown>, key: string, fallback: string | undefined = "") {
  if (!hasOwn(record, key)) return fallback ?? "";
  const value = toStringValue(record[key]);
  return value.trim() ? value : fallback ?? "";
}

function stringArrayField(record: Record<string, unknown>, key: string, fallback: string[] = []) {
  if (!hasOwn(record, key)) return fallback;
  const values = toStringArray(record[key]);
  return values.length > 0 ? values : fallback;
}

function mergeUnique(primary: string[], secondary: string[]) {
  return [...primary, ...secondary.filter((item) => !primary.includes(item))];
}

export function normalizeResumeData(value: unknown): ResumeData {
  const root = toRecord(value);
  const profile = toRecord(root.profile);
  const skills = toRecord(root.skills);
  const defaultProfile = defaultResumeData.profile;
  const defaultSkills = defaultResumeData.skills;

  const legacyDataAnalysis = toStringArray(skills.dataAnalysis);
  const legacyNlp = toStringArray(skills.nlp);
  const legacyTools = toStringArray(skills.tools);
  const legacyFrontend = toStringArray(skills.frontend);
  const legacyBackend = toStringArray(skills.backend);
  const legacyProductDesign = toStringArray(skills.productDesign);

  const skillField = (key: keyof ResumeData["skills"], fallback: string[], legacy: string[] = []) => {
    if (hasOwn(skills, key) || legacy.length > 0) {
      const values = mergeUnique(toStringArray(skills[key]), legacy);
      return values.length > 0 ? values : fallback;
    }
    return fallback;
  };

  return {
    profile: {
      ...defaultResumeData.profile,
      name: stringField(profile, "name", defaultProfile.name),
      university: stringField(profile, "university", defaultProfile.university),
      college: stringField(profile, "college", defaultProfile.college),
      major: stringField(profile, "major", defaultProfile.major),
      degree: stringField(profile, "degree", defaultProfile.degree),
      graduationYear: stringField(profile, "graduationYear", defaultProfile.graduationYear),
      location: stringField(profile, "location", defaultProfile.location),
      email: stringField(profile, "email", defaultProfile.email),
      phone: stringField(profile, "phone", defaultProfile.phone),
      wechat: stringField(profile, "wechat", defaultProfile.wechat),
      github: "",
      website: stringField(profile, "website", defaultProfile.website),
      avatarUrl: defaultProfile.avatarUrl,
      jobStatus: stringField(profile, "jobStatus", defaultProfile.jobStatus),
      jobDirection: stringField(profile, "jobDirection", defaultProfile.jobDirection)
    },
    education: hasOwn(root, "education") && Array.isArray(root.education) && root.education.length > 0
      ? root.education.map((item) => {
          const row = toRecord(item);
          return {
            school: stringField(row, "school"),
            college: stringField(row, "college"),
            major: stringField(row, "major"),
            degree: stringField(row, "degree"),
            startDate: stringField(row, "startDate"),
            endDate: stringField(row, "endDate"),
            courses: stringArrayField(row, "courses"),
            gpa: stringField(row, "gpa"),
            ranking: stringField(row, "ranking"),
            honors: stringArrayField(row, "honors")
          };
        })
      : defaultResumeData.education,
    skills: {
      programming: skillField("programming", defaultSkills.programming),
      dataProcessing: skillField("dataProcessing", defaultSkills.dataProcessing, legacyDataAnalysis),
      machineLearning: skillField("machineLearning", defaultSkills.machineLearning, legacyBackend),
      medicalAI: skillField("medicalAI", defaultSkills.medicalAI),
      webDevelopment: skillField("webDevelopment", defaultSkills.webDevelopment, legacyFrontend),
      textProcessing: skillField("textProcessing", defaultSkills.textProcessing, legacyNlp),
      tooling: skillField("tooling", defaultSkills.tooling, mergeUnique(legacyTools, legacyProductDesign))
    },
    researchAndCompetitions: hasOwn(root, "researchAndCompetitions") && Array.isArray(root.researchAndCompetitions) && root.researchAndCompetitions.length > 0
      ? root.researchAndCompetitions.map((item) => {
          const row = toRecord(item);
          return {
            name: stringField(row, "name"),
            type: stringField(row, "type"),
            level: stringField(row, "level"),
            period: stringField(row, "period"),
            role: stringField(row, "role"),
            techStack: stringArrayField(row, "techStack"),
            advisor: stringField(row, "advisor"),
            direction: stringField(row, "direction"),
            responsibilities: stringArrayField(row, "responsibilities"),
            result: stringField(row, "result"),
            award: stringField(row, "award")
          };
        })
      : defaultResumeData.researchAndCompetitions,
    projects: hasOwn(root, "projects") && Array.isArray(root.projects) && root.projects.length > 0
      ? root.projects.map((item) => {
          const row = toRecord(item);
          return {
            name: stringField(row, "name"),
            type: stringField(row, "type"),
            period: stringField(row, "period"),
            role: stringField(row, "role"),
            description: stringField(row, "description"),
            techStack: stringArrayField(row, "techStack"),
            responsibilities: stringArrayField(row, "responsibilities"),
            highlights: stringArrayField(row, "highlights"),
            outcomes: stringArrayField(row, "outcomes"),
            link: stringField(row, "link"),
            github: stringField(row, "github")
          };
        })
      : defaultResumeData.projects,
    campusExperience: hasOwn(root, "campusExperience") && Array.isArray(root.campusExperience) && root.campusExperience.length > 0
      ? root.campusExperience.map((item) => {
          const row = toRecord(item);
          return {
            organization: stringField(row, "organization"),
            role: stringField(row, "role"),
            period: stringField(row, "period"),
            responsibilities: stringArrayField(row, "responsibilities"),
            achievements: stringArrayField(row, "achievements")
          };
        })
      : defaultResumeData.campusExperience,
    certificatesAndAwards: hasOwn(root, "certificatesAndAwards") && Array.isArray(root.certificatesAndAwards) && root.certificatesAndAwards.length > 0
      ? root.certificatesAndAwards.map((item) => {
          const row = toRecord(item);
          return {
            name: stringField(row, "name"),
            type: stringField(row, "type"),
            issuer: stringField(row, "issuer"),
            date: stringField(row, "date"),
            description: stringField(row, "description")
          };
        })
      : defaultResumeData.certificatesAndAwards,
    selfEvaluation: {
      strengths: hasOwn(root, "selfEvaluation")
        ? stringArrayField(toRecord(root.selfEvaluation), "strengths", defaultResumeData.selfEvaluation.strengths)
        : defaultResumeData.selfEvaluation.strengths
    }
  };
}
