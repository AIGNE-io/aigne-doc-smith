# Source 类型重构功能意图

## 功能概述

重构 DocSmith workspace 的数据源接入方式，支持两种启动路径和统一的多数据源配置，以满足不同的文档管理场景。

## 功能意图

当前 DocSmith 将源代码仓库作为 git submodule 添加到 workspace，这种方式导致一个架构限制：**无法让产品仓库管理自己的文档**。

具体问题：
- 如果 docs workspace 放在产品仓库内，又把产品仓库作为自己的 submodule，会形成循环嵌套
- 这与"项目自己管理自己的文档"的长期目标冲突
- DocSmith 应该是项目自动构建的一部分，而非独立存在

解决思路：
- **两种启动路径**：根据用户启动位置自动选择合适的初始化流程
- **统一的 schema**：无论哪种方式启动，config.yaml 格式一致
- **多数据源支持**：可以添加多个 local-path 或 git-clone 类型的数据源

## 两种启动路径

### 路径 A：项目内启动（推荐）

**触发条件**：在已有的 git 仓库中执行 `docsmith init`

**初始化行为**：
1. 创建 `.docsmith/` 子目录
2. 在 `.docsmith/` 中执行 `git init`（独立仓库）
3. 将 `.docsmith/` 添加为外层仓库的 submodule
4. 自动配置主数据源为 `local-path: "../"`

**目录结构**：
```
product-repo/                    # 产品仓库（外层）
├── .gitmodules                 # .docsmith 作为 submodule
├── src/                        # 产品源代码
└── .docsmith/                  # DocSmith workspace（独立 git 仓库）
    ├── .git/                   # 独立的 git 历史
    ├── config.yaml             # sources 包含 local-path: "../"
    ├── intent/
    ├── planning/
    └── docs/
```

**Git 关系**：
```
product-repo  ──submodule──>  .docsmith

文件引用（非 git 关系）：
.docsmith  ──local-path "../"──>  product-repo 的文件
```

**适用场景**：
- 项目团队自己维护文档
- DocSmith 作为项目构建的一部分
- 希望文档版本与代码版本同步

### 路径 B：独立启动

**触发条件**：在空目录或非 git 目录中执行 `docsmith init`

**初始化行为**：
1. 在当前目录初始化 workspace
2. 执行 `git init`
3. 询问用户添加数据源（git-clone URL）
4. 克隆数据源到 `.cache/` 目录

**目录结构**：
```
docs-workspace/                  # DocSmith workspace
├── .git/
├── config.yaml                 # sources 包含 git-clone 配置
├── .cache/
│   └── main-project/           # 克隆的数据源（gitignore）
├── intent/
├── planning/
└── docs/
```

**适用场景**：
- 快速试用 DocSmith
- 纯文档项目
- CI/CD 临时构建环境

## 统一的 Config Schema

**两种启动路径生成相同格式的 config.yaml**：

```yaml
# config.yaml

# 数据源列表（支持多个）
sources:
  # 主数据源
  - name: "main-project"
    type: local-path              # 或 git-clone
    path: "../"                   # local-path 专用

  # 参考数据源（可选）
  - name: "aigne-framework"
    type: git-clone
    url: "https://github.com/ArcBlock/aigne-framework.git"
    ref: "main"                   # branch/tag/commit，默认 "main"
    cachePath: ".cache/aigne-framework"

  - name: "blocklet-sdk"
    type: git-clone
    url: "https://github.com/ArcBlock/blocklet-sdk.git"
    ref: "v1.2.0"
```

## 核心能力

### 1. 两种数据源类型

| 类型 | 用途 | 配置字段 |
|------|------|---------|
| `local-path` | 引用本地目录 | `path`（相对路径） |
| `git-clone` | 克隆远程仓库 | `url`, `ref`, `cachePath` |

### 2. 启动路径自动检测

```
docsmith init
  ↓
检测当前目录
  ↓
├─ 是 git 仓库 → 项目内启动
│   ├─ 创建 .docsmith/ 子目录
│   ├─ git init（独立仓库）
│   ├─ 添加为 submodule
│   └─ 配置 local-path: "../"
│
└─ 非 git 仓库 → 独立启动
    ├─ 在当前目录初始化
    ├─ git init
    ├─ 询问数据源 URL
    └─ 配置 git-clone
```

### 3. 多数据源支持

无论哪种启动路径，都可以后续添加更多数据源：
```bash
docsmith add-source https://github.com/ArcBlock/aigne-framework.git
docsmith add-source ../another-local-project --type local-path
```

### 4. Workspace 目录名称

项目内启动时，固定使用 `.docsmith/`：
- 隐藏目录，对项目侵入最小
- 固定名称，无需配置
- 检测简单：`.docsmith/config.yaml` 存在即为已初始化

### 5. 历史独立

项目内启动时，`.docsmith/` 是独立的 git 仓库：
- 文档提交不污染产品仓库历史
- 通过 submodule 关联，产品仓库只记录指向的 commit
- DocSmith 封装 submodule 操作，降低用户门槛

## 输入输出

### 输入

- 自动检测：
  - 当前目录是否为 git 仓库（决定启动路径）

- 项目内启动：
  - 无需额外输入（自动配置）

- 独立启动：
  - 数据源 URL（必需）
  - 分支/tag/commit（可选，默认 main）

- 添加数据源：
  - URL 或本地路径
  - 数据源名称（可选，自动从 URL 推断）

### 输出

- config.yaml 中的 sources 配置
- 根据启动路径执行相应的 git 操作
- 初始化完成后的 workspace 结构

## 约束条件

### 必须遵循的规范

1. **config.yaml schema**：
   ```yaml
   sources:
     - name: string              # 数据源名称
       type: "local-path" | "git-clone"

       # local-path 专用
       path: string              # 相对路径

       # git-clone 专用
       url: string               # 仓库 URL
       ref: string               # branch/tag/commit，默认 "main"
       cachePath: string         # 克隆位置，默认 ".cache/{name}"
   ```

2. **项目内启动要求**：
   - workspace 目录固定为 `.docsmith/`
   - 必须初始化为独立 git 仓库
   - 必须添加为外层仓库的 submodule

3. **git-clone 要求**：
   - cachePath 目录必须加入 .gitignore
   - 支持通过 ref 字段锁定版本

### 职责边界

- **必须执行**：
  - 自动检测启动路径
  - 项目内启动时自动添加 submodule
  - git-clone 时自动克隆到 cache 目录
  - 验证路径/URL 有效性

- **不应执行**：
  - 不创建远程仓库（用户自行创建）
  - 不推送到远程（用户自行推送）
  - 不修改外层仓库的其他文件（除 .gitmodules）

- **协作方式**：
  - 与现有 workspace 初始化流程集成
  - 封装 submodule 操作，降低用户门槛

## 预期结果

### 成功标准

1. **路径自动选择**：根据启动位置自动决定初始化流程
2. **schema 统一**：两种路径生成相同格式的 config.yaml
3. **多数据源**：支持添加多个 local-path 或 git-clone 数据源
4. **历史独立**：项目内启动时文档有独立的 git 历史
5. **操作简单**：用户无需直接操作 submodule

## 错误处理

### 常见错误

1. **submodule 添加失败**：外层仓库不是 git 仓库或权限问题
2. **目录已存在**：`.docsmith/` 目录已存在
3. **网络问题**：git-clone 无法访问远程仓库
4. **URL 无效**：git-clone 的 URL 格式错误或仓库不存在
5. **路径无效**：local-path 指向的路径不存在

### 处理策略

1. **submodule 失败**：提供手动添加的命令指引
2. **目录存在**：检测是否为有效 workspace，是则提示已初始化，否则报错
3. **网络问题**：提示检查 URL 和网络连接，支持重试
4. **路径无效**：提示检查路径，建议正确的相对路径格式

## 实现方式

### 1. 修改 workspace-initialization.md

- 新增启动路径检测逻辑
- 分支处理两种启动路径的初始化流程
- 统一 config.yaml 生成逻辑

### 2. config.yaml schema 更新

- `source` 改为 `sources`（数组）
- 每个数据源包含 `name`, `type` 及类型专属字段
- 支持 local-path 和 git-clone 两种类型

### 3. 封装 submodule 操作

提供高级命令，用户无需直接操作 submodule：
- `docsmith init`：自动处理 submodule 创建和添加
- `docsmith commit`：在 workspace 中提交
- `docsmith push`：推送 workspace
- `docsmith add-source`：添加新数据源

### 4. 迁移策略

对于现有 workspace：
- 旧的 `source` 单数据源配置自动转换为 `sources` 数组
- 保持向后兼容

---

**注意**：本文档描述功能意图，不包含具体实现细节。
