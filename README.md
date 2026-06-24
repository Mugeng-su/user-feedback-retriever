# AI Video Feedback Analyzer

This is a small AI product prototype I built while thinking about a very practical marketing problem: after a brand works with a creator, how do we actually learn from the video?

Views, likes, and comments tell us whether something got attention. They do not automatically tell us what is worth reusing. I wanted a tool that could look at a product video, its transcript, and its comments, then help answer a more useful question:

> Is this video worth learning from, and if yes, what exactly can we reuse?

The current version focuses on YouTube product videos. It can fetch public video metrics and comments, accept a transcript, screen out weak material, and generate a structured report for content planning.

## What It Does

At a high level, the app does four things:

- Collects basic YouTube video data such as views, likes, and comment count.
- Uses transcript and comment text as evidence for analysis.
- Decides whether the video is strong enough to deserve a full teardown.
- Extracts reusable ideas: content structure, audience reactions, pain-point language, user quotes, and SEO-like phrases.

One design choice I care about is that the tool does not try to analyze everything. If a video has weak performance signals or too little text evidence, the report stops early. That felt important because AI tools can easily make weak inputs sound more certain than they really are.

## Why I Built It

The original idea came from reviewing KOL and creator videos for product marketing. A video may perform well, but the useful follow-up questions are harder:

- Why did this specific video work?
- Which parts were about the product, and which parts were just creator/context effects?
- How are users describing the product in their own words?
- Can those words improve future scripts, landing pages, FAQs, or SEO pages?
- Should the team spend time analyzing this video at all?

This project is my attempt to turn that workflow into a working MVP instead of leaving it as a spreadsheet or a manual note-taking process.

## Current Features

- Paste a YouTube URL.
- Fetch public YouTube metrics when `YOUTUBE_API_KEY` is configured.
- Fetch up to 100 public top-level YouTube comments.
- Paste transcript or subtitle text.
- Add product context and performance metrics.
- Run analysis with OpenAI, Gemini, or local mock mode.
- Stop early when the video is not worth a full analysis.
- Generate a structured report with video analysis and reusable language assets.
- Copy or download a Markdown brief.
- Re-analyze existing reports.
- Switch the UI between English and Chinese.

## Demo Flow

The easiest way to review the product is:

1. Open the home page.
2. Load the strong sample and run or inspect a full report.
3. Start from the decision panel on the result page.
4. Review the video analysis section.
5. Review the reusable language assets section.
6. Copy or download the brief.
7. Load the weak sample to see how the tool stops instead of over-analyzing.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Prisma
- SQLite
- OpenAI API
- Gemini API
- YouTube Data API

## Local Setup

Install dependencies:

```bash
npm install
```

Create your local environment file:

```bash
cp .env.example .env
```

Create the local SQLite database:

```bash
npx prisma db push
```

Start the app:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Environment Variables

```bash
DATABASE_URL="file:./dev.db"
ANALYZER_MODE="auto"
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-5.4"
OPENAI_REASONING_EFFORT="medium"
GEMINI_API_KEY=""
GEMINI_MODEL="gemini-3.5-flash"
YOUTUBE_API_KEY=""
```

The app can run in mock mode without real model keys. Real AI analysis and YouTube fetching require the corresponding API keys.

## What I Intentionally Did Not Build Yet

This is not meant to be a production SaaS yet. A few things are deliberately out of scope for now:

- User accounts and permissions.
- Cloud deployment and billing.
- Full YouTube comment pagination and replies.
- Multi-platform data acquisition.
- Visual video analysis.
- Team collaboration workflows.

I kept the scope narrow because I wanted the MVP to test the product logic first: can transcript and comment evidence become useful marketing decisions?

## Project Notes

More detailed notes are in:

- `docs/portfolio-case-study.md`
- `docs/demo-script.md`
- `docs/evaluation/README.md`

---

# AI 视频反馈分析工具

这是我在思考一个很具体的营销问题时做出来的 AI 产品原型：品牌和创作者合作之后，我们到底应该怎么从一条视频里学到东西？

播放、点赞和评论能告诉我们这条视频有没有获得关注，但它们不会自动告诉我们哪些东西值得复用。我想做的是一个能看产品视频、字幕和评论，然后回答一个更有用问题的工具：

> 这条视频是否值得学习？如果值得，具体有哪些东西可以复用？

当前版本主要聚焦 YouTube 产品视频。它可以获取公开视频数据和评论，接收字幕文本，筛掉不值得完整分析的素材，并生成一份用于内容规划的结构化报告。

## 它能做什么

简单来说，这个工具做四件事：

- 收集 YouTube 视频的基础数据，比如播放、点赞和评论数。
- 把字幕和评论文本作为分析证据。
- 判断这条视频是否值得做完整拆解。
- 提取可复用内容：内容结构、用户反应、痛点表达、用户原话和接近 SEO 搜索意图的表达。

我比较在意的一个设计选择是：它不会强行分析所有素材。如果视频表现弱，或者文本证据太少，报告会提前停止。这个判断很重要，因为 AI 很容易把弱输入包装成看起来很完整、很确定的结论。

## 为什么做这个

最开始的想法来自产品营销里的 KOL / 创作者视频复盘。一条视频可能表现不错，但真正有用的问题通常更难：

- 这条视频为什么有效？
- 哪些部分来自产品本身，哪些只是创作者或场景因素？
- 用户在评论里是怎么自然描述这个产品的？
- 这些表达能不能反向优化下一条脚本、落地页、FAQ 或 SEO 页面？
- 这条视频到底值不值得团队花时间分析？

这个项目就是我尝试把这个流程做成一个可运行 MVP，而不是停留在表格或手动笔记里。

## 当前功能

- 粘贴 YouTube 链接。
- 配置 `YOUTUBE_API_KEY` 后获取公开视频数据。
- 获取最多 100 条公开一级 YouTube 评论。
- 粘贴字幕或转写文本。
- 添加产品背景和表现数据。
- 使用 OpenAI、Gemini 或本地 mock 模式分析。
- 在视频不值得完整分析时提前停止。
- 生成包含视频分析和可复用语言资产的结构化报告。
- 复制或下载 Markdown brief。
- 对已有报告重新分析。
- 支持中英文界面切换。

## 演示方式

最简单的查看方式是：

1. 打开首页。
2. 加载强样本，运行或查看完整报告。
3. 从结果页的决策面板开始看。
4. 查看视频分析部分。
5. 查看可复用语言资产部分。
6. 复制或下载 brief。
7. 再加载弱样本，看看系统如何提前停止，而不是强行分析。

## 技术栈

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Prisma
- SQLite
- OpenAI API
- Gemini API
- YouTube Data API

## 本地运行

安装依赖：

```bash
npm install
```

创建本地环境变量：

```bash
cp .env.example .env
```

创建本地 SQLite 数据库：

```bash
npx prisma db push
```

启动应用：

```bash
npm run dev
```

然后打开：

```text
http://localhost:3000
```

## 环境变量

```bash
DATABASE_URL="file:./dev.db"
ANALYZER_MODE="auto"
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-5.4"
OPENAI_REASONING_EFFORT="medium"
GEMINI_API_KEY=""
GEMINI_MODEL="gemini-3.5-flash"
YOUTUBE_API_KEY=""
```

没有真实模型 key 时，应用仍然可以使用 mock 模式运行。真实 AI 分析和 YouTube 数据获取需要配置对应 API key。

## 暂时没有做的事

这个项目目前不是生产级 SaaS，所以我有意没有做这些部分：

- 用户账号和权限。
- 云端部署和计费。
- YouTube 评论全量分页和回复分析。
- 多平台数据采集。
- 视频画面分析。
- 团队协作流程。

我把范围控制得比较窄，是因为当前最想验证的是产品逻辑：字幕和评论证据，是否能转化成有用的营销判断？

## 项目记录

更详细的过程记录在：

- `docs/portfolio-case-study.md`
- `docs/demo-script.md`
- `docs/evaluation/README.md`

