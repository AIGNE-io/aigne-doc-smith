# Doc-Smith Agent 功能意图

## 功能概述

Doc-Smith 主入口 Agent，采用延迟初始化策略：加载时仅检测工作空间模式用于生成 AFS 配置，运行时由框架自动执行初始化 agent 完成工作空间创建，然后进入文档生成对话模式。

## 功能意图

DocSmith 需要根据工作空间状态完成初始化，然后进入文档生成对话。加载阶段不执行副作用操作（如创建目录、git init），仅检测模式用于生成正确的 AFS modules 配置。初始化操作通过框架的 `cli.init` 机制在运行时自动执行。

## 工作流程

### 整体流程

```
doc-smith 启动
  ↓
加载 index.mjs（同步检测模式，生成 AFS modules）
  ↓
框架执行 cli.init 注册的 workspace-init agent
  ↓
  ├─ 检测是否已初始化
  ├─ 已初始化 → 跳过，返回成功
  └─ 未初始化 → 执行初始化流程
  ↓
执行主 docsmith agent
  ↓
进入文档生成对话模式
```

### 加载阶段（index.mjs 同步检测）

**目的**：确定工作空间模式，生成正确的 AFS modules 配置

**检测逻辑**：
1. 检查 `.aigne/doc-smith/config.yaml` 是否存在
   - 存在 → 读取 mode 字段，模式为 project
   - 不存在 → 继续检测
2. 检查 `./config.yaml` 是否存在
   - 存在 → 读取 mode 字段，模式为 standalone
   - 不存在 → 继续检测
3. 检查是否在 git 仓库中（检测 .git 目录）
   - 是 → 推断为 project 模式
   - 否 → 推断为 standalone 模式

**输出**：根据 mode 生成对应的 AFS modules 配置

### 运行阶段（workspace-init agent）

workspace-init agent 是一个 function agent，负责检测并执行初始化操作。

**执行逻辑**：
1. 重新检测工作空间状态（调用异步检测函数）
2. 如果已初始化（config.yaml 存在），跳过初始化，直接返回
3. 如果未初始化，根据检测到的模式执行对应的初始化流程

### 流程 A：项目内初始化

**触发条件**：未初始化，且当前目录在 git 仓库中

**步骤**：
1. 创建 `.aigne/doc-smith/` 目录
2. 在 `.aigne/doc-smith/` 中执行 `git init`
3. 创建目录结构（intent/、planning/、docs/）
4. 创建 `.gitignore` 文件（忽略 sources/ 目录）
5. 获取项目 git 信息（远程仓库 URL、当前分支、当前 commit）
6. 生成 config.yaml（mode: project，sources 配置为 local-path 类型，同时记录 git 信息）
7. 创建初始 git commit

### 流程 B：独立初始化

**触发条件**：未初始化，且当前目录不在 git 仓库中

**步骤**：
1. 执行 `git init` 初始化当前目录
2. 创建 `.gitignore`，添加 `sources/` 到忽略列表
3. 创建目录结构（intent/、planning/、docs/、sources/）
4. 生成 config.yaml（mode: standalone，sources 配置为空数组，后续对话中添加）

**注意**：独立启动时不询问仓库地址，源仓库的添加在后续对话流程中处理。

### 流程 C：已初始化

**触发条件**：config.yaml 已存在

**行为**：workspace-init agent 直接返回成功，不执行任何操作

## 核心能力

### 1. 目录状态检测

**同步检测（加载阶段，index.mjs）**：
- 使用 existsSync 检测配置文件是否存在
- 确定工作空间模式（project 或 standalone）
- 生成对应的 AFS modules 配置

**异步检测（运行阶段，workspace-init agent）**：
- 检测 workspace 是否已初始化
- 检测当前目录是否为 git 仓库
- 返回检测结果用于决定是否执行初始化

### 2. 工作空间初始化

- 根据检测结果决定是否需要初始化
- 根据模式执行对应的初始化流程
- 获取 git 仓库信息（远程 URL、当前分支、当前 commit）用于记录生成文档时的仓库状态
- 创建目录结构和配置文件

### 3. 用户交互

启动阶段不做任何用户询问。所有配置（如源仓库地址、语言等）在对话流程中处理。

### 4. 目录结构创建

**项目内模式创建的结构**：
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

**独立模式创建的结构**：
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

### 5. 配置文件内容

config.yaml 包含：
- `mode`：工作模式标识
  - `project`：项目内模式
  - `standalone`：独立模式
- `sources`：数据源配置数组
  - 项目内模式：`local-path` 类型，包含相对路径和 git 信息
  - 独立模式：`[]`（空数组，后续对话中添加）

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

### 6. 动态 AFS Modules 生成

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

### 7. Git 操作

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

- **加载阶段**：无输入，自动执行同步检测
- **运行阶段**：框架自动执行 init agent，然后执行主 agent

### 输出

**index.mjs 导出**：主 agent 配置对象（agent-skill-manager 类型）

**workspace-init agent 输出**：
- `{ success: true, initialized: boolean, mode: string }`

## 约束条件

### 必须遵循的规范

1. **延迟初始化**：加载阶段只做同步检测，不执行初始化操作
2. **cli.init 机制**：通过 aigne.yaml 的 `cli.init` 注册初始化 agent
3. **同步检测**：加载阶段的检测必须是同步的（使用 existsSync 等）
4. **目录结构**：严格遵循定义的目录结构
5. **配置格式**：config.yaml 遵循统一的 schema，必须包含 mode 字段
6. **无启动询问**：启动阶段不做任何用户询问
7. **AFS 一致性**：两种模式都提供 workspace 和 sources 两个 AFS 模块

### 职责边界

**index.mjs（加载阶段）**：
- 必须执行：同步检测工作空间模式，生成 AFS modules 配置
- 不应执行：创建目录、写文件、执行 git 命令等副作用操作

**workspace-init agent（运行阶段）**：
- 必须执行：异步检测是否已初始化，按需执行初始化流程
- 不应执行：询问用户、克隆仓库、生成文档内容

**主 agent（运行阶段）**：
- 必须执行：文档生成对话
- 不应执行：工作空间初始化

## 预期结果

### 成功标准

1. 加载阶段无副作用，仅检测模式并生成 AFS 配置
2. 已初始化的工作空间跳过初始化，直接进入对话
3. 未初始化的工作空间在运行时正确初始化
4. 目录结构和配置文件正确创建
5. Git 操作正确执行
6. 项目内模式正确获取并记录 git 仓库状态（url、branch、commit）
7. AFS modules 根据模式正确生成（workspace + sources）
8. 启动过程无用户交互

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
├── index.mjs              # 主 agent（含同步检测和 AFS 生成）
├── workspace-init.mjs     # 初始化 function agent
├── prompt.md              # 主 agent 指令文件
└── ai/
    └── intent.md          # 本文档

utils/
├── workspace.mjs          # 工作空间检测和初始化工具函数
└── afs-factory.mjs        # AFS modules 生成工具
```

### 组件说明

**index.mjs**：
- 同步检测工作空间模式
- 生成 AFS modules 配置
- 导出主 agent 配置（agent-skill-manager 类型）

**workspace-init.mjs**：
- Function agent，负责执行初始化
- 异步检测是否已初始化
- 调用 utils/workspace.mjs 中的初始化函数

**utils/workspace.mjs**：
- 提供同步检测函数（用于加载阶段）
- 提供异步检测和初始化函数（用于运行阶段）

### 注册到 aigne.yaml

```yaml
cli:
  init: workspace-init.mjs
  agents:
    - name: doc-smith
      url: skills-entry/doc-smith/index.mjs
```

---

**注意**：本文档描述功能意图，不包含具体实现代码。
