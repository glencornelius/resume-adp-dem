# Luxury Resume Website (Next.js + Supabase)

一个可部署的高端个人简历网站，包含访客浏览模式和管理员在线编辑模式。

## 技术栈

- Next.js (App Router) + TypeScript
- Tailwind CSS
- shadcn/ui 风格组件（本地组件实现）
- Framer Motion
- Supabase (Auth + Postgres)
- Vercel（默认部署平台）

## 目录结构

```text
/app
  page.tsx
  /resume/page.tsx
  /admin/login/page.tsx
  /admin/editor/page.tsx
/components
  Hero.tsx
  ResumeSection.tsx
  ResumeCard.tsx
  SkillBadge.tsx
  AdminEditor.tsx
  EditableList.tsx
/lib
  supabase.ts
  resume.ts
  types.ts
/styles
  globals.css
/supabase
  schema.sql
```

## 本地运行

1. 安装依赖

```bash
npm install
```

2. 复制环境变量模板

```bash
cp .env.example .env.local
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

3. 填写 `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=你的 Supabase Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=你的 service role key
```

4. 启动开发环境

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## Supabase 配置步骤

1. 在 Supabase 新建项目。
2. 打开 SQL Editor，执行 [supabase/schema.sql](/C:/Users/a1933/Desktop/智能医学课程网站/supabase/schema.sql)。
3. 在 Authentication > Users 中创建管理员账号（邮箱+密码）。
4. 在 Project Settings > API 复制 URL 和 anon key，写入 `.env.local`。

## 后台登录与编辑

1. 打开 `/admin/login`
2. 使用 Supabase 管理员账号登录
3. 登录成功自动跳转 `/admin/editor`
4. 在编辑器中修改信息并保存
5. 刷新 `/resume` 可看到最新数据

## 本地快速登录模式（无需 Supabase）

可通过 `.env.local` 启用本地管理员模式：

```env
NEXT_PUBLIC_ENABLE_LOCAL_ADMIN=true
NEXT_PUBLIC_LOCAL_ADMIN_ID=你的账号
NEXT_PUBLIC_LOCAL_ADMIN_PASSWORD=你的密码
```

启用后可直接在 `/admin/login` 使用上述账号密码进入编辑器，保存内容会写入浏览器本地存储。

## 前台行为说明

- `/`：高端欢迎页，点击“查看完整履历”进入 `/resume`
- `/resume`：展示完整简历，支持打印/PDF、分享链接
- 无 Supabase 数据时，会自动回退默认示例简历（`lib/resume.ts`）

## 应届生简历板块说明与编辑方法

编辑入口：`/admin/editor`。每个板块都支持折叠、条目新增、删除、上下排序，并可开启实时预览。

1. `Profile（基本信息）`
   - 用途：展示姓名、院校、专业、联系方式、求职状态与方向。
   - 编辑：直接修改输入框；`GitHub/网站/头像`留空则前台自动隐藏。
2. `Education（教育背景）`
   - 用途：应届生核心模块，展示学校、课程、GPA、排名、荣誉。
   - 编辑：支持多条教育经历；课程/荣誉为可排序列表。
3. `Skills（专业技能）`
   - 用途：按类别展示技能，不使用百分比进度条。
   - 编辑：按 7 个分组维护标签：编程语言、数据处理、机器学习、医学 AI、Web 开发、文本处理、工具协作。
4. `ResearchAndCompetitions（科研/竞赛经历）`
   - 用途：展示科研参与、竞赛级别、成果与奖项。
   - 编辑：支持多条记录，奖项为空时前台自动隐藏。
5. `Projects（项目经历）`
   - 用途：应届生核心竞争力展示，突出职责、亮点和成果。
   - 编辑：支持多项目条目，技术栈/职责/亮点/成果均可维护为列表。
6. `Campus Experience（校园经历）`
   - 用途：展示组织协作、执行与沟通能力。
   - 编辑：支持多条记录，事项与成果为可排序列表。
7. `CertificatesAndAwards（证书/奖项）`
   - 用途：展示语言证书、奖学金、竞赛奖项等。
   - 编辑：支持多条记录，说明/机构为空时前台自动隐藏。
8. `Self Evaluation（自我评价）`
    - 用途：展示最多 3 条具体优势描述。
    - 编辑：维护优势列表，前台自动截取前 3 条。

前台空内容处理规则：任意板块无有效内容时不会显示空卡片。

## 部署到 Vercel

1. 将项目推送到 GitHub。
2. 在 Vercel 导入仓库。
3. 在 Vercel 项目环境变量中配置：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. 点击 Deploy。

## 验证命令

```bash
npm run type-check
npm run build
```

## 注意事项

- 不要把 Supabase key 写死到代码中。
- `SUPABASE_SERVICE_ROLE_KEY` 仅应在服务端环境中使用，不要暴露到浏览器。
