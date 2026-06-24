# Portfolio Case Study: AI Video Feedback Analyzer

## English Version

### One-line Positioning

An AI prototype that helps marketing and growth teams decide whether a YouTube product video is worth learning from, then turns transcript and comment evidence into reusable content and messaging assets.

### Why This Exists

Brands often collaborate with creators and receive videos that appear to perform well. The team can see views, likes, and comments, but the harder questions are usually unanswered:

- Why did this video work?
- Which parts of the video structure are actually reusable?
- What did users say in their own words?
- Can those comments improve future scripts, landing pages, FAQs, or SEO copy?
- Should the team spend time analyzing this video at all?

This prototype was built to prove that AI can turn creator video feedback into a structured decision workflow, rather than a loose pile of impressions.

### Target User

The initial target user is a marketing, growth, or content team member reviewing product videos made by KOLs, affiliates, reviewers, or creators.

They do not need a general viral-video analyzer. They need a fast way to identify which product videos deserve replication, what can be copied safely, and which user expressions can be reused in future marketing material.

### Core Product Bet

The product bet is not "AI can summarize videos." The stronger bet is:

> A useful AI content tool should first judge whether the evidence is strong enough, then only generate detailed analysis when the input supports it.

That product judgment led to three important constraints:

- The tool screens weak material before writing a full report.
- The tool separates video-mechanism analysis from reusable language assets.
- The tool treats transcript and comments as evidence, not as decoration.

### MVP Scope

The MVP supports a focused internal workflow:

- Paste a YouTube URL.
- Auto-fetch public YouTube metrics when an API key is configured.
- Fetch up to 100 public top-level YouTube comments.
- Paste transcript/subtitle text.
- Run an OpenAI, Gemini, or mock analyzer.
- Receive a structured report with screening, content mechanics, comment material, language assets, and reusable brief export.

The MVP intentionally does not attempt full video understanding, visual scene analysis, multi-platform scraping, account systems, or team collaboration.

### Key Product Decisions

#### 1. Add A Screening Gate

Early outputs over-explained weak videos. That made the report look confident even when the source video did not deserve deep analysis.

The prototype now checks performance and evidence quality first. If the material is weak, the report stops at a screening decision instead of forcing a full teardown.

#### 2. Separate Analysis From Reuse

The page is organized into two major jobs:

- Video analysis: understand whether and why the content worked.
- Language asset reuse: collect user language that can improve scripts, landing pages, SEO, and briefs.

This makes the report easier to read and easier to use in a real workflow.

#### 3. Preserve User Language

The most valuable comment output is not a generic summary. It is the way users naturally describe benefits, pain points, objections, and search intent.

The tool keeps user quotes, pain-point expressions, and SEO-like phrases close to the original comment language so the team can reuse authentic wording.

#### 4. Avoid Overclaiming When Text Evidence Is Thin

Some videos have very little spoken content or low-quality comments. Instead of pretending every video can be analyzed equally, the system records whether transcript and comment evidence are strong enough for full analysis.

### Demo Flow

Use this path when presenting the prototype:

1. Start on the home page and explain the business problem.
2. Point out the four-step input workflow: URL, context, text evidence, analysis.
3. Click the strong demo sample card or create one high-performing sample.
4. Show the result page decision panel first.
5. Explain how the report splits into video analysis and reusable language assets.
6. Open the reusable brief and explain how a marketer could use it in the next content cycle.
7. Click the screened-out demo sample card or show a weak sample, then explain why the tool refuses to over-analyze it.

### What This Proves

This prototype demonstrates:

- Problem framing: identifying a concrete content and growth workflow.
- Product judgment: adding gates and constraints instead of generating endless AI output.
- AI workflow design: turning unstructured transcript and comments into structured decisions.
- Prompt and schema iteration: refining output based on real sample reviews.
- Full-stack execution: building the input flow, analyzer layer, settings, storage, result UI, and export behavior.

### What Is Deliberately Not Finished

The prototype is not meant to be a production SaaS yet. The following are intentionally outside the current completion bar:

- User accounts and permissions.
- Cloud deployment and billing.
- Full YouTube comment pagination and reply analysis.
- Multi-platform acquisition.
- Visual video analysis.
- Team review workflows.

These would matter if the goal changed from portfolio prototype to production product.

### Completion Bar

This project can be considered portfolio-complete when:

- A recruiter or hiring manager can understand the problem in under two minutes.
- A demo can run through one strong sample and one screened-out sample.
- The result page clearly shows the product judgment behind the AI output.
- The case study explains why the product makes these decisions.
- The remaining limitations are explicit rather than hidden.

## 中文版本

### 一句话定位

这是一个 AI 原型，用来帮助营销和增长团队判断一条 YouTube 产品视频是否值得学习，并把字幕和评论证据转化成可复用的内容洞察与营销语言资产。

### 为什么做这个

品牌经常会和 KOL、测评博主、达人或联盟创作者合作，拿到一些看起来表现不错的视频。团队能看到播放、点赞和评论，但更难回答的问题通常是：

- 这条视频为什么有效？
- 哪些视频结构是真的可以复用的？
- 用户在评论里到底是怎么表达的？
- 这些评论能不能反向优化下一条脚本、落地页、FAQ 或 SEO 文案？
- 这条视频是否值得投入时间做深入分析？

这个原型想证明的是：AI 不只是总结内容，它可以把创作者视频反馈转化成一个结构化的决策流程。

### 目标用户

初始目标用户是正在复盘产品视频的营销、增长或内容团队成员。视频来源可以是 KOL、联盟创作者、测评博主或品牌合作达人。

他们真正需要的不是泛用的爆款视频分析器，而是一个快速判断工具：哪些产品视频值得复刻，哪些内容结构可以安全借鉴，哪些用户表达可以复用到后续营销材料里。

### 核心产品假设

这个产品的核心假设不是“AI 可以总结视频”。更强的假设是：

> 一个有用的 AI 内容工具，应该先判断证据是否足够，再在输入真正支撑结论时生成详细分析。

这个判断带来了三个重要约束：

- 工具会先筛选弱素材，而不是直接写完整报告。
- 工具会把视频机制分析和语言资产复用分开。
- 工具会把字幕和评论当作证据，而不是装饰性的引用。

### MVP 范围

当前 MVP 支持一个聚焦的内部工作流：

- 粘贴 YouTube 链接。
- 在配置 API key 后自动获取公开视频数据。
- 获取最多 100 条公开一级 YouTube 评论。
- 粘贴字幕或转写文本。
- 使用 OpenAI、Gemini 或 mock 分析器。
- 生成包含素材筛选、内容机制、评论素材、语言资产和可导出 brief 的结构化报告。

当前 MVP 有意不做完整视频理解、画面分析、多平台爬取、账号系统、团队协作或商业化部署。

### 关键产品决策

#### 1. 加入素材筛选门槛

早期输出会对弱视频也进行大量分析，这会让报告看起来很有信心，但源素材本身并不值得深入复盘。

现在原型会先检查表现数据和文本证据质量。如果素材较弱，报告会停在筛选结论，而不是强行生成完整拆解。

#### 2. 把“分析”和“复用”分开

页面被组织成两个主要任务：

- 视频分析：理解内容是否有效，以及为什么有效。
- 语言资产复用：收集可以用于脚本、落地页、SEO 和 brief 的用户语言。

这样报告更容易读，也更接近真实团队的使用方式。

#### 3. 保留用户原始语言

评论里最有价值的内容不是泛泛总结，而是用户自然描述收益、痛点、异议和搜索意图的方式。

工具会尽量保留用户原话、痛点表达和接近搜索意图的表达，让团队可以复用更真实的用户语言。

#### 4. 文本证据不足时避免过度推断

有些视频口播文本很少，或者评论质量很低。这个系统不会假装所有视频都能同等分析，而是会记录字幕和评论证据是否足以支撑完整分析。

### 演示流程

展示这个原型时，可以按这个路径讲：

1. 从首页开始，先解释业务问题。
2. 指出四步输入流程：链接、基础信息、文本证据、分析。
3. 点击强样本 demo 卡片，或创建一条高表现样本。
4. 先展示结果页的决策面板。
5. 解释报告如何拆成视频分析和语言资产复用。
6. 打开可复用 brief，说明营销团队如何把它带入下一轮内容生产。
7. 可选：点击弱素材 demo 卡片，或展示一条弱样本，说明为什么工具会拒绝过度分析。

### 这个项目证明了什么

这个原型可以证明：

- 问题定义能力：识别了一个具体的内容和增长工作流。
- 产品判断能力：通过门槛和约束避免无边界的 AI 输出。
- AI 工作流设计能力：把非结构化字幕和评论转成结构化决策。
- Prompt 与结构化输出迭代能力：基于真实样本评审持续调整。
- 全栈执行能力：完成了输入流程、分析器层、设置、存储、结果页和导出行为。

### 有意不做完的部分

这个原型目前不是生产级 SaaS。以下内容不属于当前完成标准：

- 用户账号和权限。
- 云端部署和计费。
- YouTube 评论全量分页和回复分析。
- 多平台数据采集。
- 视觉视频分析。
- 团队协作和审批流程。

如果目标从作品集原型转为正式产品，这些才会成为下一阶段重点。

### 完成标准

当满足以下条件时，这个项目可以视为作品集阶段完成：

- 招聘方或面试官能在两分钟内理解问题。
- demo 能跑通一条强样本和一条被筛掉的弱样本。
- 结果页能清楚展示 AI 输出背后的产品判断。
- case study 能解释为什么产品这样设计。
- 剩余限制被明确说明，而不是被隐藏起来。
