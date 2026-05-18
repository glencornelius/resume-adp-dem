export interface ResumeProfile {
  name: string;
  university: string;
  college: string;
  major: string;
  degree: string;
  graduationYear: string;
  location: string;
  email: string;
  phone: string;
  wechat?: string;
  github?: string;
  website?: string;
  avatarUrl?: string;
  jobStatus: string;
  jobDirection: string;
}

export interface ResumeEducation {
  school: string;
  college: string;
  major: string;
  degree: string;
  startDate: string;
  endDate: string;
  courses: string[];
  gpa?: string;
  ranking?: string;
  honors?: string[];
}

export interface ResumeSkills {
  programming: string[];
  dataProcessing: string[];
  machineLearning: string[];
  medicalAI: string[];
  webDevelopment: string[];
  textProcessing: string[];
  tooling: string[];
}

export interface ResumeProject {
  name: string;
  type: string;
  period: string;
  role: string;
  description: string;
  techStack: string[];
  responsibilities: string[];
  highlights: string[];
  outcomes: string[];
  link?: string;
  github?: string;
}

export interface ResumeResearchCompetition {
  name: string;
  type: string;
  level: string;
  period: string;
  role: string;
  techStack?: string[];
  advisor?: string;
  direction?: string;
  responsibilities: string[];
  result: string;
  award?: string;
}

export interface ResumeCampusExperience {
  organization: string;
  role: string;
  period: string;
  responsibilities: string[];
  achievements?: string[];
}

export interface ResumeCertificateAward {
  name: string;
  type: string;
  issuer?: string;
  date: string;
  description?: string;
}

export interface ResumeSelfEvaluation {
  strengths: string[];
}

export interface ResumeData {
  profile: ResumeProfile;
  education: ResumeEducation[];
  skills: ResumeSkills;
  researchAndCompetitions: ResumeResearchCompetition[];
  projects: ResumeProject[];
  campusExperience: ResumeCampusExperience[];
  certificatesAndAwards: ResumeCertificateAward[];
  selfEvaluation: ResumeSelfEvaluation;
}

export const emptyResume: ResumeData = {
  profile: {
    name: "",
    university: "",
    college: "",
    major: "",
    degree: "",
    graduationYear: "",
    location: "",
    email: "",
    phone: "",
    wechat: "",
    github: "",
    website: "",
    avatarUrl: "",
    jobStatus: "",
    jobDirection: ""
  },
  education: [],
  skills: {
    programming: [],
    dataProcessing: [],
    machineLearning: [],
    medicalAI: [],
    webDevelopment: [],
    textProcessing: [],
    tooling: []
  },
  researchAndCompetitions: [],
  projects: [],
  campusExperience: [],
  certificatesAndAwards: [],
  selfEvaluation: {
    strengths: []
  }
};
