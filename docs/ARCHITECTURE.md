# Doc-Smith 架构设计文档

## 目录

1. [系统概述](#1-系统概述)
2. [系统整体架构](#2-系统整体架构)
3. [Agent 架构与依赖关系](#3-agent-架构与依赖关系)
4. [文档生命周期](#4-文档生命周期)
5. [当前发布流程 (Discuss Kit)](#5-当前发布流程-discuss-kit)
6. [Vibe Hub 发布方案设计](#6-vibe-hub-发布方案设计)
7. [数据模型与文件格式](#7-数据模型与文件格式)
8. [工具层详解](#8-工具层详解)
9. [关键文件位置](#9-关键文件位置)

---

## 1. 系统概述

**Doc-Smith** 是一个基于 Aigne Framework 构建的 AI 驱动文档生成系统，核心能力包括：

- 从代码仓库、文本文件、媒体等来源生成综合文档
- 构建有组织的文档结构和站点
- 支持多语言本地化
- 管理图片生成和更新
- 发布文档到多个平台

### 核心架构原则

- **模块化设计**：Agent 处理特定职责（生成、校验、发布、本地化、图片）
- **AFS 集成**：使用 Aigne File System 模块访问 workspace 和 sources
- **持久化 Workspace**：维护 `.aigne/doc-smith/`（项目模式）或独立 workspace
- **任务追踪**：使用持久化任务规划文件跟踪进度

---

## 2. 系统整体架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLI 入口层                                      │
│  aigne doc    aigne publish    aigne clear    aigne localize               │
└───────┬────────────┬──────────────┬──────────────────┬─────────────────────┘
        │            │              │                  │
        ▼            ▼              ▼                  ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                          Agent 编排层 (Aigne Framework)                        │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐   │
│  │ doc-smith (Main)    │  │ publish         │  │ localize                │   │
│  │ agent-skill-manager │  │ team-agent      │  │ team-agent              │   │
│  │                     │  │                 │  │                         │   │
│  │ 技能:               │  │ 流程:           │  │ 流程:                   │   │
│  │ · doc-smith-detail  │  │ 1. check        │  │ 1. prepare-translation  │   │
│  │ · publish           │  │ 2. translate-   │  │ 2. load-glossary        │   │
│  │ · localize          │  │    meta         │  │ 3. translate (并行×3)   │   │
│  │ · generate-images   │  │ 3. publish-docs │  │ 4. generate-summary     │   │
│  │ · structure-checker │  │                 │  │                         │   │
│  │ · content-checker   │  └─────────────────┘  └─────────────────────────┘   │
│  │ · update-image      │                                                     │
│  └─────────────────────┘  ┌─────────────────┐  ┌─────────────────────────┐   │
│                           │ generate-images │  │ clear                   │   │
│                           │ team-agent      │  │ function-agent          │   │
│                           │                 │  │                         │   │
│                           │ 流程:           │  │ 清理缓存/配置           │   │
│                           │ 1. scan-slots   │  └─────────────────────────┘   │
│                           │ 2. prepare      │                                │
│                           │ 3. generate(×5) │                                │
│                           │ 4. summary      │                                │
│                           └─────────────────┘                                │
└───────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                              工具层 (utils/)                                   │
├───────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ workspace    │  │ config       │  │ docs         │  │ docs-converter   │  │
│  │              │  │              │  │              │  │                  │  │
│  │ ·检测模式    │  │ ·读写YAML    │  │ ·加载结构    │  │ ·扫描文档        │  │
│  │ ·初始化     │  │ ·保留注释    │  │ ·构建树      │  │ ·替换图片槽      │  │
│  │ ·Git信息    │  │              │  │ ·生成sidebar │  │ ·处理sources路径 │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │ ·调整链接        │  │
│                                                        └──────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ auth         │  │ upload       │  │ deploy       │  │ afs-factory      │  │
│  │              │  │              │  │              │  │                  │  │
│  │ ·Token管理   │  │ ·TUS上传     │  │ ·付费部署    │  │ ·生成AFS模块     │  │
│  │ ·OAuth流程   │  │ ·重试逻辑    │  │ ·Payment API │  │ ·workspace/sources│ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                              数据层 (Workspace)                                │
├───────────────────────────────────────────────────────────────────────────────┤
│  .aigne/doc-smith/ (PROJECT模式) 或 ./ (STANDALONE模式)                       │
│                                                                               │
│  ├── config.yaml              # 项目配置                                      │
│  ├── intent/                  # 用户意图                                      │
│  │   ├── user-intent.md                                                      │
│  │   └── GLOSSARY.md                                                         │
│  ├── planning/                # 文档规划                                      │
│  │   └── document-structure.yaml                                             │
│  ├── docs/                    # 文档内容                                      │
│  │   ├── overview/                                                           │
│  │   │   ├── .meta.yaml       # 元数据                                       │
│  │   │   ├── en.md            # 英文                                         │
│  │   │   └── zh.md            # 中文翻译                                     │
│  │   └── api/                                                                │
│  │       └── ...                                                             │
│  ├── cache/                   # 缓存                                         │
│  │   ├── images/              # 生成的图片                                    │
│  │   ├── upload-cache.yaml    # 上传记录                                      │
│  │   └── translation-cache.yaml                                              │
│  └── .tmp/                    # 临时文件（发布时使用）                          │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Agent 架构与依赖关系

### 3.1 Workspace 模式

| 模式 | Workspace 位置 | Sources 位置 | 适用场景 |
|------|---------------|-------------|---------|
| PROJECT | `.aigne/doc-smith/` | 项目根目录 | 为现有项目生成文档 |
| STANDALONE | `./` | `./sources/` | 独立文档项目 |

### 3.2 Agent 列表

| Agent | 类型 | 职责 |
|-------|------|------|
| `doc-smith` | agent-skill-manager | 主入口，文档生成编排 |
| `publish` | team-agent | 发布到 Discuss Kit |
| `localize` | team-agent | 批量文档翻译 |
| `generate-images` | team-agent | 批量图片生成 |
| `structure-checker` | function-agent | 校验文档结构 |
| `content-checker` | function-agent | 校验文档内容 |
| `doc-smith-docs-detail` | agent-skill-manager | 单文档详情生成 |
| `update-image` | team-agent | 更新单张图片 |
| `clear` | function-agent | 清理缓存/配置 |

### 3.3 依赖关系图

```
┌─────────────────────────────────────────────────────────────────┐
│ skills-entry/doc-smith/index.mjs (Main Entry)                  │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ 编排所有工作流步骤:                                        │   │
│ │ 1. 初始化 workspace                                       │   │
│ │ 2. 分析用户意图                                           │   │
│ │ 3. 规划文档结构                                           │   │
│ │ 4. 生成文档内容                                           │   │
│ │ 5. 生成图片 (可选)                                        │   │
│ │ 6. 翻译文档 (可选)                                        │   │
│ │ 7. 发布文档                                               │   │
│ └───────────────────────────────────────────────────────────┘   │
└───────────┬─────────────────────────────────────────────────────┘
            │
    ┌───────┴────────┬──────────────┬────────────┬──────────┐
    │                │              │            │          │
    ▼                ▼              ▼            ▼          ▼
┌─────────┐  ┌──────────┐  ┌──────────────┐  ┌───────┐  ┌────────┐
│ Publish │  │ Localize │  │Generate      │  │Update │  │ Doc    │
│ Agent   │  │ Agent    │  │Images Agent  │  │Image  │  │Detail  │
└────┬────┘  └──────────┘  └──────────────┘  └───────┘  └────────┘
     │
     ├─→ check.mjs
     ├─→ translate-meta.mjs
     └─→ publish-docs.mjs
          ├─→ copyDocumentsToTemp()
          ├─→ generateSidebar()
          └─→ publishDocsFn() (@aigne/publish-docs)
```

---

## 4. 文档生命周期

```
  ┌───────────┐      ┌───────────┐      ┌───────────┐      ┌───────────────┐
  │ 1. 意图   │ ───→ │ 2. 规划   │ ───→ │ 3. 生成   │ ───→ │ 4. 增强       │
  │   分析    │      │   结构    │      │   内容    │      │  (图片/翻译)  │
  └───────────┘      └───────────┘      └───────────┘      └───────────────┘
       │                  │                  │                    │
       ▼                  ▼                  ▼                    ▼
  ┌───────────┐      ┌───────────┐      ┌───────────┐      ┌───────────────┐
  │user-intent│      │document-  │      │ docs/     │      │ docs/*.md     │
  │   .md     │      │structure  │      │ *.md      │      │ + 图片/翻译   │
  └───────────┘      │  .yaml    │      │ .meta.yaml│      └───────────────┘
                     └───────────┘      └───────────┘              │
                                                                   ▼
                                                          ┌───────────────┐
                                                          │ 5. 发布       │
                                                          │              │
                                                          │ · 转换格式   │
                                                          │ · 生成sidebar│
                                                          │ · 上传平台   │
                                                          └───────────────┘
```

---

## 5. 当前发布流程 (Discuss Kit)

### 5.1 概述

- **目标平台**: Discuss Kit（ArcBlock 生态的文档托管组件）
- **入口**: `agents/publish/`
- **存储**: 远程 Discuss Kit 数据库中的 Board

### 5.2 发布流程详解

```
aigne publish
     │
     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 1: check.mjs                                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ · 加载 config.yaml                                                          │
│ · 验证 projectName / projectDesc / projectLogo                              │
│ · 缺失字段从 package.json 自动填充                                           │
│ · 调用 structure-checker 验证结构                                            │
│ · 调用 content-checker 验证内容                                              │
│ · 输出: { valid: true, config: {...} }                                      │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 2: translate-meta.mjs                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ · 读取 config.locale + translateLanguages                                   │
│ · 如多语言: 调用 LLM 翻译 projectName/Desc                                   │
│ · 缓存到 translation-cache.yaml                                             │
│ · 输出: { translatedMetadata: { title: {...}, desc: {...} } }               │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 3: publish-docs.mjs                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  3a. copyDocumentsToTemp() (docs-converter.mjs)                             │
│  ─────────────────────────────────────────────                              │
│  · 扫描 docs/ 下所有 .meta.yaml                                              │
│  · 路径转换:                                                                 │
│    - 深度1: overview/en.md → overview.md                                    │
│    - 深度2+: api/auth/en.md → api/auth.md                                   │
│  · 替换图片槽: <!-- afs:image --> → ![alt](path)                            │
│  · 处理 /sources/ 绝对路径 → 相对路径                                        │
│  · 内部链接添加 .md 后缀                                                     │
│  · 输出到 .tmp/                                                             │
│                                                                             │
│  3b. generateSidebar() (docs.mjs)                                           │
│  ─────────────────────────────────                                          │
│  · 读取 document-structure.yaml                                              │
│  · 构建树形结构                                                              │
│  · 生成 _sidebar.md                                                         │
│                                                                             │
│  3c. 平台选择 & 认证                                                         │
│  ─────────────────────                                                       │
│  · DocSmith Cloud (免费) → docsmith.aigne.io                                │
│  · 自有网站 (需已安装 Discuss Kit)                                           │
│  · 新建网站 (付费) → Payment Broker                                         │
│  · 认证: DID Connect → 获取 accessToken                                     │
│                                                                             │
│  3d. publishDocsFn() (@aigne/publish-docs)                                  │
│  ─────────────────────────────────────────                                   │
│  · 上传 _sidebar.md 和所有文档                                               │
│  · 增量上传 (通过 upload-cache.yaml)                                         │
│  · 更新 Board 元数据                                                         │
│                                                                             │
│  3e. 持久化配置                                                              │
│  ─────────────────                                                           │
│  · 保存 appUrl、boardId 到 config.yaml                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 与 Discuss Kit 的依赖关系

```
Doc-Smith（文档生产者）          Discuss Kit（文档托管平台）
┌────────────────────┐          ┌────────────────────────┐
│ · AI 生成文档       │          │ · 存储和展示文档        │
│ · 格式转换          │  ──→     │ · 管理 Board（文档集）  │
│ · 多语言翻译        │  发布到   │ · 用户访问控制          │
│ · 增量上传          │          │ · 文件托管（Media Kit） │
└────────────────────┘          └────────────────────────┘
```

**核心概念**:
- **Board**: Discuss Kit 中的文档集合，对应一个 Doc-Smith 项目
- **DID**: 去中心化标识符，用于组件识别
- **TUS**: 可恢复上传协议，用于文件上传

---

## 6. Vibe Hub 发布方案设计

### 6.1 背景

Discuss Kit 作为完整的文档托管组件较重，希望通过 Vibe Hub 提供更轻量的替代方案。

### 6.2 Vibe Hub 概述

Vibe Hub 是静态网站托管平台：
- 接收 ZIP 项目 → AI 分析转换 → 部署为 Blocklet → 子域名访问
- 每个 Vibe 独立部署，通过 `https://{did}.domain/` 访问

### 6.3 方案对比

| 维度 | Discuss Kit | Vibe Hub |
|------|-------------|----------|
| **定位** | 文档管理平台（Board/文章模型） | 静态站点托管（ZIP → 部署） |
| **内容格式** | Markdown，平台侧渲染 | 预构建的 HTML/CSS/JS |
| **导航/侧边栏** | 内置 `_sidebar.md` 支持 | 无，需项目自带 |
| **文档内搜索** | 内置 | 无，需项目自带 |
| **部署单位** | Board（文档集合） | Vibe（独立子域名站点） |
| **更新方式** | 增量上传（按文件 hash 缓存） | 重新上传整个 ZIP |
| **重量级** | 重（完整 Blocklet 组件） | 轻（纯静态文件托管） |

### 6.4 实现方案

#### 方案 A: Docsify（零构建，推荐起步）

```
docs/ → docs-converter → .tmp/ → + index.html (Docsify) → ZIP → Vibe Hub
```

**优点**:
- Docsify 天然支持 `_sidebar.md`，与现有结构最兼容
- 无需构建步骤，改动最小
- 可快速验证整条链路

**缺点**:
- SEO 差（纯 SPA，客户端渲染）

#### 方案 B: VitePress（需构建，SEO 友好）

```
docs/ → docs-converter → VitePress 配置 → vitepress build → dist/ → ZIP → Vibe Hub
```

**优点**:
- SEO 好、性能好、功能完整
- 预渲染 HTML

**缺点**:
- 需要较大改造，引入构建步骤

### 6.5 新发布流程设计

```
aigne publish --target vibe  或  aigne publish-vibe
     │
     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 1: check.mjs (复用现有)                                                 │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 2: build-static-site.mjs (新增)                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Docsify 方案:                                                               │
│  · 生成 index.html (含 Docsify 配置)                                         │
│  · 复制 _sidebar.md                                                         │
│  · 扁平化 Markdown 文件                                                      │
│  · 复制 assets                                                              │
│  · 替换图片槽                                                                │
│  · 输出: 可直接托管的静态目录                                                 │
│                                                                             │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 3: package-and-upload.mjs (新增)                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ · 将静态目录打包为 ZIP                                                       │
│ · 调用 Vibe Hub API: POST /api/uploaded-blocklets                          │
│ · 等待转换完成 (WebSocket 或轮询)                                            │
│ · 获取部署 URL: https://{did}.vibe-hub.com                                  │
│ · 保存 vibeId 到 config.yaml                                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.6 复用与新增

```
✅ 可直接复用                          ❌ 需新增/修改
─────────────                          ─────────────
· check.mjs (校验逻辑)                 · build-static-site.mjs
· docs-converter.mjs                     (生成 index.html + Docsify 配置)
  (图片槽替换、路径处理)
· docs.mjs                             · package-and-upload.mjs
  (sidebar 生成逻辑)                     (ZIP 打包 + Vibe Hub API 调用)
· structure-checker
· content-checker                      · config.yaml 扩展
· image-slots.mjs                        (新增 vibeId、vibeUrl 字段)
· sources-path-resolver.mjs
                                       · CLI 入口
                                         (aigne publish-vibe 或 --target)
```

### 6.7 数据流对比

```
当前 (Discuss Kit):
  docs/ → docs-converter → .tmp/ → @aigne/publish-docs → Discuss Kit API → Board

新方案 (Vibe Hub):
  docs/ → docs-converter → .tmp/ → build-static → ZIP → Vibe Hub API → 子域名站点
                             │
                             ├─ 方案A: + index.html (Docsify) → 客户端渲染
                             │
                             └─ 方案B: + vitepress build ────→ 预渲染 HTML
```

---

## 7. 数据模型与文件格式

### 7.1 文档结构: `document-structure.yaml`

```yaml
project:
  title: "Project Name"
  description: "Brief description"

documents:
  - title: "Overview"
    description: "Project introduction"
    path: "/overview"
    sourcePaths:
      - "README.md"
    icon: "lucide:home"           # 仅顶层文档
    children:
      - title: "Getting Started"
        path: "/overview/getting-started"
        sourcePaths: ["docs/install.md"]
```

### 7.2 文档元数据: `.meta.yaml`

```yaml
kind: "doc"
sourceLocale: "en"
title: "Document Title"
description: "Brief description"
```

### 7.3 图片槽格式

```markdown
<!-- afs:image id="unique-id" key="optional-key" desc="Image description" -->
```

### 7.4 配置文件: `config.yaml`

```yaml
# 项目信息
projectName: "My Project"
projectDesc: "Project description"
projectLogo: "https://example.com/logo.png"

# 文档设置
locale: "en"
translateLanguages: ["zh", "ja"]
documentPurpose: ["guide", "api"]

# 发布配置 (Discuss Kit)
appUrl: "https://custom.site.com"
boardId: "board_123"

# 发布配置 (Vibe Hub, 新增)
vibeId: "vibe_456"
vibeUrl: "https://abc.vibe-hub.com"

# 数据源配置
sources:
  - name: "main"
    type: "local-path"
    path: "../"
  - name: "other-repo"
    type: "git-clone"
    url: "https://github.com/..."
```

---

## 8. 工具层详解

### 8.1 核心工具

| 工具 | 文件 | 职责 |
|------|------|------|
| workspace | `utils/workspace.mjs` | Workspace 检测、模式管理、Git 集成 |
| config | `utils/config.mjs` | 配置文件读写，保留 YAML 注释 |
| docs | `utils/docs.mjs` | 文档结构加载、树构建、sidebar 生成 |
| docs-converter | `utils/docs-converter.mjs` | 文档扫描、格式转换、图片处理 |
| afs-factory | `utils/afs-factory.mjs` | 生成 AFS 模块配置 |

### 8.2 认证与部署

| 工具 | 文件 | 职责 |
|------|------|------|
| auth | `utils/auth.mjs` | Token 管理、凭证缓存、AIGNE Hub 集成 |
| deploy | `utils/deploy.mjs` | Discuss Kit 网站部署、支付流程 |
| upload | `utils/upload.mjs` | TUS 协议文件上传 |
| http | `utils/http.mjs` | 组件发现、blocklet 信息获取 |

### 8.3 图片与资源

| 工具 | 文件 | 职责 |
|------|------|------|
| image-slots | `utils/image-slots.mjs` | 解析/处理 AFS 图片槽语法 |
| image-utils | `utils/image-utils.mjs` | 图片查找（含 fallback 逻辑） |
| sources-path-resolver | `utils/sources-path-resolver.mjs` | 解析 /sources/ 虚拟路径 |

### 8.4 路径常量

```javascript
// utils/agent-constants.mjs
export const PATHS = {
  WORKSPACE_BASE,           // Workspace 根目录
  TMP_DIR,                 // .tmp 目录
  CACHE,                   // cache 目录
  DOCUMENT_STRUCTURE,      // planning/document-structure.yaml
  DOCS_DIR,               // docs 目录
  CONFIG,                 // config.yaml
  GLOSSARY,               // intent/GLOSSARY.md
  PLANNING_DIR,           // planning 目录
}
```

---

## 9. 关键文件位置

### 9.1 入口点

```
skills-entry/
├── doc-smith/
│   ├── index.mjs          # 主 CLI 入口，workspace 初始化
│   └── prompt.md          # 主 agent 系统提示
└── doc-smith-docs-detail/
    └── index.mjs          # 文档详情生成入口
```

### 9.2 Agents

```
agents/
├── publish/
│   ├── index.yaml
│   ├── check.mjs
│   ├── translate-meta.mjs
│   └── publish-docs.mjs
├── localize/
├── generate-images/
├── structure-checker/
├── content-checker/
├── update-image/
└── clear/
```

### 9.3 工具

```
utils/
├── workspace.mjs
├── agent-constants.mjs
├── config.mjs
├── docs.mjs
├── docs-converter.mjs
├── sources-path-resolver.mjs
├── afs-factory.mjs
├── auth.mjs
├── deploy.mjs
├── upload.mjs
└── ...
```

---

## 附录: 术语表

| 术语 | 说明 |
|------|------|
| AFS | Aigne File System，Aigne 框架的文件系统抽象 |
| Board | Discuss Kit 中的文档集合 |
| DID | Decentralized Identifier，去中心化标识符 |
| Vibe | Vibe Hub 中的部署单位 |
| TUS | 可恢复上传协议 |
| Workspace | Doc-Smith 的工作目录 |
