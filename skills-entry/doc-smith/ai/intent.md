# Doc-Smith Agent 功能意图

## 功能概述

Doc-Smith 主入口 Agent，在启动时自动检测并初始化工作空间，然后进入文档生成对话模式。整个流程通过单一 index.mjs 文件实现，导出一个 JS 配置对象。启动阶段不做任何用户询问，所有交互在对话流程中处理。

## 功能意图

DocSmith 需要在启动时自动检测工作空间状态，根据不同场景完成初始化，然后进入文档生成对话。由于 AIGNE 框架的实现限制，初始化逻辑和主 agent 配置需要合并在同一个 index.mjs 文件中。

## 工作流程

### 整体流程

```
doc-smith 启动
  ↓
加载 index.mjs（使用 top-level await）
  ↓
检测当前目录状态
  ↓
├─ config.yaml 已存在 → 读取配置，生成 AFS modules
├─ 是 git 仓库（无 config.yaml）→ 执行项目内初始化，生成 AFS modules
├─ 是空目录或非 git 目录 → 执行独立初始化，生成 AFS modules
└─ 其他情况 → 报错退出
  ↓
导出配置对象（含动态生成的 AFS modules）
  ↓
进入文档生成对话模式
```

### 流程 A：项目内启动

**触发条件**：当前目录是 git 仓库，且 `.aigne/doc-smith/config.yaml` 不存在

**步骤**：
1. 创建 `.aigne/doc-smith/` 目录
2. 在 `.aigne/doc-smith/` 中执行 `git init`
3. 创建目录结构（intent/、planning/、docs/）
4. 创建 `.gitignore` 文件（忽略 sources/ 目录）
5. 获取项目 git 信息（远程仓库 URL、当前分支、当前 commit）
6. 生成 config.yaml（mode: project，sources 配置为 local-path 类型，同时记录 git 信息）
7. 生成 AFS modules 配置

### 流程 B：独立启动

**触发条件**：当前目录是空目录或非 git 目录

**步骤**：
1. 执行 `git init` 初始化当前目录
2. 创建 `.gitignore`，添加 `sources/` 到忽略列表
3. 创建目录结构（intent/、planning/、docs/、sources/）
4. 生成 config.yaml（mode: standalone，sources 配置为空数组，后续对话中添加）
5. 生成 AFS modules 配置

**注意**：独立启动时不询问仓库地址，源仓库的添加在后续对话流程中处理。

### 流程 C：已初始化

**触发条件**：`config.yaml` 已存在（通过检测 `.aigne/doc-smith/config.yaml` 或 `./config.yaml`）

**步骤**：
1. 读取现有配置
2. 根据 config.yaml 中的 mode 字段生成 AFS modules 配置

## 核心能力

### 1. 目录状态检测

- 检测 workspace 是否已初始化（`.aigne/doc-smith/config.yaml` 或 `./config.yaml` 存在）
- 检测当前目录是否为 git 仓库（`.git/` 目录存在）
- 检测当前目录是否为空目录
- 获取 git 仓库信息（远程 URL、当前分支、当前 commit）用于记录生成文档时的仓库状态

### 2. 用户交互

启动阶段不做任何用户询问。所有配置（如源仓库地址、语言等）在对话流程中处理。

### 3. 目录结构创建

**项目内启动创建的结构**：
```
.aigne/
└── doc-smith/
    ├── .git/                # 独立 git 仓库
    ├── .gitignore           # 忽略 sources/ 目录
    ├── config.yaml          # 工作空间配置
    ├── intent/              # 意图文件目录
    ├── planning/            # 规划文件目录
    └── docs/                # 生成的文档目录
```

**独立启动创建的结构**：
```
./                           # 当前目录
├── .git/
├── .gitignore               # 包含 sources/
├── config.yaml              # 工作空间配置
├── sources/                 # 源仓库目录（后续添加）
├── intent/
├── planning/
└── docs/
```

### 4. 配置文件内容

config.yaml 包含：
- `mode`：工作模式标识
  - `project`：项目内启动
  - `standalone`：独立启动
- `sources`：数据源配置数组
  - 项目内启动：`local-path` 类型，包含相对路径和 git 信息
  - 独立启动：`[]`（空数组，后续对话中添加）

**config.yaml 示例（项目内模式）**：
```yaml
mode: project
sources:
  - type: local-path
    path: "../../"                           # 相对路径（用于 AFS 挂载）
    url: "git@github.com:user/project.git"   # 远程仓库 URL（origin）
    branch: "main"                           # 当前分支
    commit: "a1b2c3d"                        # 当前 commit hash（短格式）
```

**config.yaml 示例（独立模式）**：
```yaml
mode: standalone
sources: []
```

**字段说明**（与 git-clone 格式一致）：
- `type`：数据源类型（`local-path`、`git-clone` 等）
- `path`：本地相对路径，用于 AFS 挂载（local-path 专用）
- `url`：远程仓库 URL（优先获取 origin，无远程时为空）
- `branch`：当前分支名
- `commit`：当前 commit hash（短格式，7 位）

### 5. 动态 AFS Modules 生成

根据工作空间模式动态生成 AFS modules，两种模式保持一致的 AFS 结构：

**项目内模式**：
- workspace：`${CWD}/.aigne/doc-smith`（工作空间目录）
- sources：`${CWD}`（源代码目录，即产品仓库根目录）

**独立模式**：
- workspace：`${CWD}`（工作空间目录）
- sources：`${CWD}/sources`（源代码目录）

**始终包含**：
- history：历史记录存储
- doc-smith skill：技能文件目录

这样两种模式对内部执行是一致的，都有 workspace 和 sources 两个 AFS 模块。

### 6. Git 操作

- `git init`：初始化仓库
- `git remote get-url origin`：获取远程仓库 URL
- `git branch --show-current`：获取当前分支名
- `git rev-parse --short HEAD`：获取当前 commit hash（短格式）

**获取 git 信息的策略**：
- 优先获取 origin 远程仓库 URL
- 如果 origin 不存在，尝试获取第一个可用的远程仓库
- 如果没有远程仓库，url 字段为空字符串
- 分支名、commit hash 获取失败时，默认使用空字符串

## 输入输出

### 输入

- 模块加载时自动执行初始化检测
- 启动阶段不接受用户输入

### 输出

导出一个 JS 配置对象，包含：
- `type`：agent 类型
- `name`：agent 名称
- `instructions`：指令文件路径
- `skills`：可用技能列表
- `afs.modules`：动态生成的 AFS 模块配置

## 约束条件

### 必须遵循的规范

1. **单文件实现**：所有逻辑在 index.mjs 中实现
2. **导出 JS 对象**：默认导出必须是配置对象，不能是函数
3. **top-level await**：使用 top-level await 在模块加载时执行异步初始化
4. **目录结构**：严格遵循定义的目录结构
5. **配置格式**：config.yaml 遵循统一的 schema，必须包含 mode 字段
6. **无启动询问**：启动阶段不做任何用户询问
7. **AFS 一致性**：两种模式都提供 workspace 和 sources 两个 AFS 模块

### 职责边界

- **必须执行**：
  - 检测当前目录状态
  - 获取 git 仓库信息（项目内模式）
  - 创建目录结构和配置文件（首次启动）
  - 执行必要的 git 操作
  - 动态生成 AFS modules 配置

- **不应执行**：
  - 不在启动阶段询问用户
  - 不在启动阶段克隆仓库
  - 不生成文档内容（由对话模式处理）
  - 不创建远程仓库
  - 不推送到远程

## 预期结果

### 成功标准

1. 正确检测目录状态并选择对应流程
2. 目录结构和配置文件正确创建
3. Git 操作正确执行
4. 项目内模式正确获取并记录 git 仓库状态（url、branch、commit）
5. AFS modules 根据模式正确生成（workspace + sources）
6. 成功导出配置对象进入对话模式
7. 启动过程无用户交互

## 错误处理

### 常见错误

1. **权限问题**：无法创建目录或文件
2. **git 命令不可用**：系统未安装 git
3. **无远程仓库**：项目未配置 origin 远程仓库

### 处理策略

1. **权限问题**：输出错误信息，提示检查目录权限
2. **git 不可用**：输出错误信息，提示安装 git
3. **无远程仓库**：正常继续，url 字段设为空字符串（不阻断流程）

## 实现方式

### 文件结构

```
skills-entry/doc-smith/
├── index.mjs            # 主入口（含初始化逻辑和配置导出）
├── utils.mjs            # 共享工具函数
├── prompt.md            # agent 指令文件
└── ai/
    └── intent/
        └── doc-smith.md # 本文档
```

### 注册到 aigne.yaml

在 `aigne.yaml` 的 cli.agents 配置中，将 index.mjs 设置为 doc-smith 的入口。

---

**注意**：本文档描述功能意图，不包含具体实现代码。
