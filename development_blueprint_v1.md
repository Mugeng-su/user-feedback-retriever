# 开发蓝图 V1

## 1. 文档目的

这份文档用于把前面的产品定义转化成可以直接进入开发的蓝图。

目标是明确 4 件事：

1. 信息架构怎么设计
2. 页面字段要收哪些数据
3. AI 输出的 JSON Schema 长什么样
4. 开发任务如何拆分

## 2. V1 总体方案

V1 建议做成一个轻量 Web 应用，支持用户手动录入一条视频相关信息，提交后由 AI 生成结构化复盘报告。

最小闭环如下：

`创建分析任务 -> 输入视频与评论 -> 提交分析 -> AI 生成结构化结果 -> 页面展示报告`

## 3. 信息架构

### 3.1 顶层模块

V1 建议只有 4 个顶层模块：

1. `New Analysis`
创建新分析任务

2. `Analysis Detail`
展示单次分析结果

3. `History`
查看历史分析记录

4. `Settings`
配置模型、提示词和系统参数

### 3.2 为什么这样设计

- 页面少，便于快速开发
- 功能链路清晰
- 为后续扩展历史记录和可配置提示词留出位置

## 4. 页面结构与字段清单

## 4.1 页面一：New Analysis

### 页面目标
让用户以尽可能低的成本提交一条分析任务。

### 页面区块

1. `Basic Info`
2. `Performance Metrics`
3. `Transcript`
4. `Comments`
5. `Submit`

### 字段清单

#### Basic Info
- `title`
字段类型：string
是否必填：是
说明：视频标题

- `platform`
字段类型：enum
是否必填：是
建议枚举：TikTok / Instagram / YouTube / Xiaohongshu / Other

- `videoUrl`
字段类型：string
是否必填：否
说明：原始视频链接

- `productName`
字段类型：string
是否必填：否
说明：视频关联产品名

- `creatorName`
字段类型：string
是否必填：否
说明：KOL 或账号名称

#### Performance Metrics
- `views`
字段类型：number
是否必填：否

- `likes`
字段类型：number
是否必填：否

- `commentsCount`
字段类型：number
是否必填：否

- `shares`
字段类型：number
是否必填：否

- `saves`
字段类型：number
是否必填：否

#### Transcript
- `transcript`
字段类型：text
是否必填：是
说明：视频字幕、文稿或人工整理后的内容文本

#### Comments
- `commentsRaw`
字段类型：text
是否必填：是
说明：原始评论文本，一行一条

- `language`
字段类型：string
是否必填：否
默认值：auto

### 前端基础校验
- `title` 非空
- `platform` 已选择
- `transcript` 非空且长度达到最小阈值
- `commentsRaw` 至少包含 3 条评论

## 4.2 页面二：Analysis Detail

### 页面目标
清晰展示单次分析的结构化结果，并支持复制使用。

### 页面区块

1. `Header Summary`
2. `Why It Worked`
3. `Video Breakdown`
4. `Comment Insights`
5. `User Language Library`
6. `Next Content Suggestions`

### 各区块字段

#### Header Summary
- 视频标题
- 平台
- 创作者
- 关键指标
- 3 到 5 条核心结论

#### Why It Worked
- 关键爆点列表
- 表现好的主要原因
- 哪些因素可能可复用
- 哪些因素可能不可复用

#### Video Breakdown
- 开头钩子
- 问题设定
- 解决方案展示
- 证据或效果证明
- 节奏与结构判断
- CTA 或结束方式

#### Comment Insights
- 主题分类列表
- 每类主题的情绪倾向
- 每类主题的代表评论
- 高频质疑点
- 高频认可点

#### User Language Library
- 用户原话摘录
- 可复用卖点表达
- 用户常用描述词
- SEO 高意图表达

#### Next Content Suggestions
- 下条视频建议角度
- 建议保留的结构
- 建议测试的新开头
- 建议避免的表达
- 可直接用于脚本或文案的句式

### 操作功能
- 复制整个报告
- 单独复制某个模块
- 重新生成分析

## 4.3 页面三：History

### 页面目标
让用户能回看已经分析过的内容。

### 列表字段
- `title`
- `platform`
- `productName`
- `creatorName`
- `createdAt`
- `status`

### 筛选建议
- 平台筛选
- 状态筛选
- 关键词搜索

### V1 可简化策略
如果开发节奏紧，History 可以先做成简单列表，不做高级搜索。

## 4.4 页面四：Settings

### 页面目标
让内部团队可以调整系统行为。

### 建议字段
- `model`
- `temperature`
- `systemPrompt`
- `maxCommentsToAnalyze`
- `maxTranscriptLength`

### V1 可简化策略
如果时间紧，Settings 可以先只做环境变量配置，不做页面。

## 5. 数据流设计

## 5.1 提交链路

1. 用户提交表单
2. 后端创建 `analysis` 记录，状态为 `pending`
3. 后端清洗输入文本
4. 后端调用 AI 分析
5. 解析模型返回的 JSON
6. 保存 `result_json`
7. 更新状态为 `completed` 或 `failed`

## 5.2 评论预处理建议

后端在调用模型前先做轻量清洗：

- 去掉空行
- 去掉纯表情或纯无意义字符
- 去重
- 裁剪超长评论
- 限制评论总条数

## 5.3 文稿预处理建议

- 去除多余换行
- 合并碎片句子
- 限制总 token 长度
- 保留原始语义，不做激进压缩

## 6. JSON Schema 设计

## 6.1 设计原则

- 前端友好
- 后端易校验
- 后续可扩展
- 尽量避免自由散文式返回

## 6.2 推荐结果结构

```json
{
  "summary": {
    "one_liner": "string",
    "key_takeaways": ["string"]
  },
  "why_it_worked": {
    "viral_factors": ["string"],
    "reusable_factors": ["string"],
    "non_reusable_factors": ["string"]
  },
  "video_breakdown": {
    "hook": "string",
    "problem_setup": "string",
    "solution_demo": "string",
    "proof_points": ["string"],
    "pacing_and_structure": "string",
    "ending_and_cta": "string"
  },
  "comment_insights": {
    "top_topics": [
      {
        "topic": "string",
        "sentiment": "positive | mixed | negative | neutral",
        "description": "string",
        "example_comments": ["string"]
      }
    ],
    "top_praises": ["string"],
    "top_objections": ["string"],
    "feature_requests": ["string"]
  },
  "user_language_library": {
    "raw_quotes": ["string"],
    "benefit_phrases": ["string"],
    "pain_point_phrases": ["string"],
    "seo_phrases": ["string"]
  },
  "next_content_suggestions": {
    "next_angles": ["string"],
    "opening_hooks": ["string"],
    "copywriting_phrases": ["string"],
    "do_more": ["string"],
    "avoid": ["string"]
  }
}
```

## 6.3 对应 TypeScript 类型建议

```ts
type Sentiment = "positive" | "mixed" | "negative" | "neutral";

type TopicInsight = {
  topic: string;
  sentiment: Sentiment;
  description: string;
  example_comments: string[];
};

type AnalysisResult = {
  summary: {
    one_liner: string;
    key_takeaways: string[];
  };
  why_it_worked: {
    viral_factors: string[];
    reusable_factors: string[];
    non_reusable_factors: string[];
  };
  video_breakdown: {
    hook: string;
    problem_setup: string;
    solution_demo: string;
    proof_points: string[];
    pacing_and_structure: string;
    ending_and_cta: string;
  };
  comment_insights: {
    top_topics: TopicInsight[];
    top_praises: string[];
    top_objections: string[];
    feature_requests: string[];
  };
  user_language_library: {
    raw_quotes: string[];
    benefit_phrases: string[];
    pain_point_phrases: string[];
    seo_phrases: string[];
  };
  next_content_suggestions: {
    next_angles: string[];
    opening_hooks: string[];
    copywriting_phrases: string[];
    do_more: string[];
    avoid: string[];
  };
};
```

## 6.4 后端校验建议

建议对模型输出做 schema 校验，避免前端因为字段缺失崩溃。

推荐做法：
- 使用 `zod` 或 `json schema` 校验
- 校验失败时记录错误并返回可读提示
- 支持 fallback 重试一次

## 7. 技术栈建议

## 7.1 推荐前端
- `Next.js`
- `TypeScript`
- `Tailwind CSS`

原因：
- 适合快速搭建表单和结果页
- 前后端一体，利于快速迭代
- 生态成熟，适合后续接数据库和鉴权

## 7.2 推荐后端
- 直接使用 `Next.js Route Handlers` 或 `Server Actions`

原因：
- V1 逻辑简单
- 不需要单独拆后端服务
- 部署成本低

## 7.3 推荐数据库
- V1 本地开发：`SQLite`
- 上线可选：`PostgreSQL`

原因：
- 结构简单
- 分析记录以文本和 JSON 为主

## 7.4 推荐 ORM
- `Prisma`

原因：
- 数据建模快
- 对 JSON 字段支持较好
- 与 Next.js 搭配顺畅

## 7.5 推荐 AI 接入
- OpenAI API

接入建议：
- 用一个稳定的大模型生成结构化结果
- 使用明确的 system prompt
- 要求 JSON 输出

## 7.6 推荐校验和工具库
- `zod`
- `react-hook-form`
- `shadcn/ui` 或自定义轻量组件

## 8. 数据表建议

## 8.1 Analysis 表

建议字段：

- `id`
- `title`
- `platform`
- `videoUrl`
- `productName`
- `creatorName`
- `views`
- `likes`
- `commentsCount`
- `shares`
- `saves`
- `transcript`
- `commentsRaw`
- `language`
- `status`
- `errorMessage`
- `resultJson`
- `createdAt`
- `updatedAt`

### 状态枚举
- `pending`
- `processing`
- `completed`
- `failed`

## 8.2 为什么 V1 不强制拆 Comment 表

因为第一版重点是跑通分析闭环，而不是做评论检索系统。

如果后面要支持：
- 单条评论打标签
- 评论筛选
- 评论搜索
- 多轮分析

再单独拆表更合适。

## 9. API 设计建议

## 9.1 `POST /api/analyses`

### 用途
创建分析任务

### 请求体

```json
{
  "title": "Demo video",
  "platform": "TikTok",
  "videoUrl": "https://...",
  "productName": "Product A",
  "creatorName": "Creator X",
  "views": 100000,
  "likes": 5000,
  "commentsCount": 200,
  "shares": 300,
  "saves": 100,
  "transcript": "....",
  "commentsRaw": "comment 1\ncomment 2\ncomment 3",
  "language": "en"
}
```

### 返回

```json
{
  "id": "analysis_id",
  "status": "processing"
}
```

## 9.2 `GET /api/analyses/:id`

### 用途
获取单次分析结果

### 返回

```json
{
  "id": "analysis_id",
  "status": "completed",
  "resultJson": {}
}
```

## 9.3 `GET /api/analyses`

### 用途
获取历史分析列表

## 9.4 `POST /api/analyses/:id/regenerate`

### 用途
重新生成整份分析

### V1 可选
如果时间有限，可以先不做。

## 10. Prompt 设计建议

## 10.1 System Prompt 目标

明确告诉模型：
- 它是一个内容复盘分析助手
- 它不是泛泛总结员
- 它要给出可执行建议
- 它必须严格输出 JSON

## 10.2 Prompt 中应该明确的要求

- 先分析视频为什么有效
- 再分析评论中的主题、赞许、质疑和需求
- 提取用户原话时优先保留自然表达
- 下一条内容建议要具体，不要空泛
- 避免重复和套话

## 10.3 Prompt 版本化建议

建议把 prompt 存成独立常量或文件，便于后续迭代。

## 11. 开发任务拆分

## 11.1 阶段一：项目初始化
- 初始化 Next.js + TypeScript 项目
- 集成 Tailwind CSS
- 配置 Prisma 和 SQLite
- 配置环境变量

## 11.2 阶段二：数据层
- 建立 Analysis 数据模型
- 跑迁移
- 完成数据库读写封装

## 11.3 阶段三：输入页
- 搭建 New Analysis 页面
- 完成表单组件
- 完成前端校验
- 提交到创建任务接口

## 11.4 阶段四：AI 分析链路
- 实现文本清洗逻辑
- 编写系统 prompt
- 调用 LLM
- 校验 JSON 输出
- 写回数据库

## 11.5 阶段五：结果页
- 实现 Detail 页面
- 渲染各分析模块
- 增加复制操作

## 11.6 阶段六：历史页
- 列出历史分析记录
- 支持跳转详情页

## 11.7 阶段七：打磨
- 加载态和错误态
- 空状态
- 失败重试
- 基础样式优化

## 12. 开发优先级

## 12.1 P0
- 创建分析任务
- 保存数据
- 调用 AI 输出结构化 JSON
- 渲染结果页

## 12.2 P1
- 历史记录
- 复制模块内容
- 错误处理与重试

## 12.3 P2
- 导出 Markdown
- Prompt 配置
- 局部重新生成

## 13. 风险点与防护

## 13.1 风险：模型输出不稳定
防护：
- 使用 schema 校验
- 加强 prompt 约束
- 失败自动重试

## 13.2 风险：输入文本过长
防护：
- 截断评论
- 限制文稿长度
- 必要时先做摘要再分析

## 13.3 风险：分析结果空泛
防护：
- 在 prompt 中强调“必须给出具体可执行建议”
- 对输出模块做更细粒度约束

## 13.4 风险：用户觉得填写麻烦
防护：
- 保持字段精简
- 非必要字段全部设为可选
- 优先保证提交体验流畅

## 14. 建议的首个开发版本范围

如果要快速做出第一个可跑版本，我建议只做这些：

- 一个提交页面
- 一个结果页面
- 一个 Analysis 表
- 一个 AI 分析接口

暂时先不做：
- History
- Settings
- 导出功能
- 重新生成

也就是说，最小可运行版本其实可以压缩成：

`输入 -> 提交 -> 分析 -> 展示`

## 15. 我建议的下一步

到这里，产品需求已经足够支撑代码启动了。

最自然的下一步是：

1. 定技术栈
2. 初始化项目
3. 搭建数据库模型
4. 先把 `New Analysis` 和 `Analysis Detail` 两页做出来

如果你愿意，下一步我就可以直接开始进入代码阶段，帮你把这个 V1 项目脚手架搭起来。 
