# AI Video Feedback Analyzer

## English

### What This Is

AI Video Feedback Analyzer is a working MVP for reviewing YouTube product videos. It helps marketing and growth teams decide whether a video is worth learning from, then turns transcript and comment evidence into reusable content insights and messaging assets.

The product is intentionally narrow: it focuses on YouTube product videos with text evidence from transcripts and comments. It is not a general viral-video analyzer or a full visual video-understanding tool.

### Why I Built It

Brands often collaborate with KOLs, reviewers, affiliates, or creators. After a video is published, teams can see views, likes, and comments, but they still struggle to answer:

- Why did this video work?
- Which parts of the structure are actually reusable?
- What did users say in their own words?
- Can comment language improve future scripts, landing pages, FAQs, or SEO copy?
- Is this video worth analyzing at all?

This MVP explores how AI can turn creator-video feedback into a structured decision workflow instead of a loose summary.

### Core Product Judgment

The most important product decision is that the tool should not analyze everything.

Before generating a full report, it screens the material based on performance signals and text evidence. If the video is weak or the transcript/comments are too thin, the report stops early instead of creating false confidence.

### Current Features

- Paste a YouTube URL.
- Auto-fetch public YouTube metrics when `YOUTUBE_API_KEY` is configured.
- Fetch up to 100 public top-level YouTube comments.
- Paste transcript or subtitle text.
- Add product context and performance metrics.
- Run analysis with OpenAI, Gemini, or local mock mode.
- Screen weak or low-evidence material before full analysis.
- Generate structured sections for video analysis and reusable language assets.
- Copy or download a reusable Markdown brief.
- Re-analyze existing reports.
- Switch between Chinese and English UI.

### Demo Flow

1. Open the home page.
2. Use the strong sample to generate or inspect a full report.
3. Start from the decision panel on the result page.
4. Review the video analysis and language asset sections.
5. Copy or download the reusable brief.
6. Use the weak sample to show how the system stops early when material is not worth full analysis.

### Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Prisma
- SQLite
- OpenAI API
- Gemini API
- YouTube Data API

### Local Setup

Install dependencies:

```bash
npm install
```

Create local environment variables:

```bash
cp .env.example .env
```

Push the Prisma schema to the local SQLite database:

```bash
npx prisma db push
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Environment Variables

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

The app can still run in mock mode without real model keys, but real analysis and YouTube fetching require the corresponding API keys.

### What Is Not Included Yet

- User accounts and permissions.
- Cloud deployment and billing.
- Full YouTube comment pagination and replies.
- Multi-platform data acquisition.
- Visual video analysis.
- Team collaboration workflows.

### Portfolio Notes

This project is also a portfolio case study. It demonstrates:

- Problem framing for a concrete marketing workflow.
- AI workflow design around evidence, screening, and structured output.
- Product judgment: refusing to over-analyze weak inputs.
- Full-stack execution from input flow to analysis, storage, result UI, and export.

More detailed bilingual notes are available in:

- `docs/portfolio-case-study.md`
- `docs/demo-script.md`
- `docs/evaluation/README.md`

## 中文

### 这是什么

AI Video Feedback Analyzer 是一个可以真实运行的 MVP，用于复盘 YouTube 产品视频。它帮助营销和增长团队判断一条视频是否值得学习，并把字幕和评论证据转化为可复用的内容洞察与营销语言资产。

这个产品刻意保持窄范围：它聚焦有字幕和评论文本证据的 YouTube 产品视频。它不是泛用爆款视频分析器，也不是完整的视频画面理解工具。

### 为什么做这个

品牌经常会和 KOL、测评博主、联盟创作者或达人合作。视频发布后，团队能看到播放、点赞和评论，但仍然很难回答：

- 这条视频为什么有效？
- 哪些内容结构是真的可以复用的？
- 用户在评论里到底是怎么表达的？
- 评论语言能否反向优化下一条脚本、落地页、FAQ 或 SEO 文案？
- 这条视频是否值得投入时间做深入分析？

这个 MVP 想探索的是：AI 如何把创作者视频反馈转化为结构化决策流程，而不是只生成一段泛泛总结。

### 核心产品判断

最重要的产品判断是：这个工具不应该分析所有素材。

在生成完整报告之前，系统会先根据表现数据和文本证据进行筛选。如果视频表现较弱，或字幕和评论证据不足，报告会提前停止，而不是制造看似完整但不可靠的结论。

### 当前功能

- 粘贴 YouTube 链接。
- 配置 `YOUTUBE_API_KEY` 后自动获取公开视频数据。
- 获取最多 100 条公开一级 YouTube 评论。
- 粘贴字幕或转写文本。
- 添加产品背景和表现数据。
- 使用 OpenAI、Gemini 或本地 mock 模式分析。
- 在完整分析前筛掉弱表现或低证据素材。
- 生成视频分析和可复用语言资产。
- 复制或下载 Markdown brief。
- 对已有报告重新分析。
- 支持中英文界面切换。

### 演示流程

1. 打开首页。
2. 使用强样本生成或查看完整报告。
3. 从结果页的决策面板讲起。
4. 查看视频分析和语言资产复用两个部分。
5. 复制或下载可复用 brief。
6. 使用弱样本展示系统如何在素材不值得完整分析时提前停止。

### 技术栈

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Prisma
- SQLite
- OpenAI API
- Gemini API
- YouTube Data API

### 本地运行

安装依赖：

```bash
npm install
```

创建本地环境变量：

```bash
cp .env.example .env
```

初始化本地 SQLite 数据库：

```bash
npx prisma db push
```

启动开发服务器：

```bash
npm run dev
```

打开：

```text
http://localhost:3000
```

### 环境变量

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

没有真实模型 key 时，应用仍然可以使用 mock 模式运行；真实 AI 分析和 YouTube 数据获取需要配置对应 API key。

### 当前不包含什么

- 用户账号和权限。
- 云端部署和计费。
- YouTube 评论全量分页和回复分析。
- 多平台数据采集。
- 视频画面分析。
- 团队协作流程。

### 作品集说明

这个项目也可以作为作品集案例，用来展示：

- 对具体营销工作流的问题定义能力。
- 围绕证据、筛选和结构化输出设计 AI 工作流的能力。
- 产品判断：拒绝对弱输入过度分析。
- 从输入流程、分析器、存储、结果页到导出的全栈执行能力。

更详细的中英文说明见：

- `docs/portfolio-case-study.md`
- `docs/demo-script.md`
- `docs/evaluation/README.md`

