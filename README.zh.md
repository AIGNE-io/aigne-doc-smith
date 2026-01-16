# DocSmith

AI 驱动的文档生成工具，基于 Aigne Framework 构建。

## 功能特性

DocSmith 是一个完整的文档生成系统，提供：
- 📚 从代码仓库、文本文件和媒体资源生成全面的文档
- 🏗️ 构建有组织的文档结构和文档站点
- 📝 智能分析工作区内容并生成结构化的文档
- 🔄 将代码/项目内容转换为可读的文档
- 🌍 多语言支持和文档本地化
- 🖼️ 自动生成和更新文档图片
- 📤 一键发布文档到多个平台

支持生成：
- 技术文档
- 用户指南
- API 参考
- 教程和示例
- 产品文档

### 用户意图分析

DocSmith 会自动分析工作区内容，推断：
- **目标用户** - 文档的主要受众（开发者、运维人员、最终用户等）
- **使用场景** - 用户查阅文档的情境（首次接触、开发集成、问题排查等）
- **文档侧重点** - 文档类型（使用指南、API 参考、快速上手、架构说明等）

推断结果会展示给用户确认，支持多轮调整直到满意。

### 结构确认机制

在生成文档前，DocSmith 会展示规划的文档结构：
- 文档总数和层次关系
- 每个文档的标题、描述和来源文件
- 清晰的 emoji 标识便于快速浏览

用户可以：
- 删除/添加文档
- 调整层次结构（合并、拆分、调整父子关系）
- 修改内容范围

只有在用户确认结构后，才会开始生成实际内容。

## 项目结构

```
aigne-doc-smith/
├── aigne.yaml                # Aigne 框架配置
├── package.json              # 项目依赖和元信息
├── CLAUDE.md                 # Claude Code 项目说明
├── README.md                 # 本文件
│
├── agents/                   # 专用 Agents
│   ├── bash-executor/        # Bash 命令执行 agent
│   ├── clear/                # 清理配置 agent
│   ├── content-checker/      # 内容检查 agent
│   ├── generate-images/      # 图片生成 agent
│   ├── localize/             # 文档本地化 agent
│   ├── publish/              # 文档发布 agent
│   ├── save-document/        # 文档保存 agent
│   ├── structure-checker/    # 结构检查 agent
│   └── update-image/         # 图片更新 agent
│
├── skills/                   # Skill 定义
│   └── doc-smith/            # DocSmith Skill
│       ├── SKILL.md          # Skill 主文档
│       └── references/       # 参考文档
│
├── skills-entry/             # Aigne 框架入口配置
│   └── doc-smith/
│       ├── index.yaml        # 主入口配置
│       └── prompt.md         # 提示词模板
│
├── utils/                    # 工具函数库
│   ├── config.mjs            # 配置管理
│   ├── docs.mjs              # 文档处理
│   ├── git.mjs               # Git 操作
│   ├── image-utils.mjs       # 图片工具
│   ├── workspace.mjs         # Workspace 管理
│   └── ...                   # 更多工具
│
└── scripts/                  # 辅助脚本
    └── ...
```

## 快速开始

### 1. 安装 Aigne CLI

```bash
npm install -g @aigne/cli
```

### 2. 启动 DocSmith

在项目根目录直接执行：

```bash
cd my-project
aigne doc
```

首次执行时，Aigne CLI 会自动安装 DocSmith 并启动交互式文档生成流程。

**自动初始化：**

DocSmith 会自动完成：
- 检测当前项目
- 在 `.aigne/doc-smith/` 目录创建工作空间
- 生成 config.yaml 配置文件

**对话中完成：**

DocSmith 会在对话中引导你：
1. 询问输出语言（如用户未指定）
2. 分析项目内容
3. 推断用户意图
4. 规划文档结构
5. 生成结构化的 Markdown 文档

### 3. 生成的目录结构

```
my-project/
├── .aigne/
│   └── doc-smith/              # DocSmith 工作空间
│       ├── config.yaml         # 配置文件
│       ├── intent/             # 用户意图
│       ├── planning/           # 文档结构规划
│       ├── docs/               # 生成的文档
│       │   ├── overview.md
│       │   ├── getting-started.md
│       │   └── api/
│       │       └── authentication.md
│       └── cache/              # 临时数据
└── (项目其他文件...)
```

### 4. 独立 Workspace 模式（可选）

如需将文档项目与源代码分离，可使用独立 workspace：

```bash
# 创建独立 workspace
mkdir my-docs
cd my-docs
aigne doc
```

独立模式支持多数据源配置：

```yaml
# config.yaml
sources:
  - name: "main"
    type: local-path
    path: "../my-project"

  - name: "other-repo"
    type: git-clone
    url: "https://github.com/example/repo.git"
    branch: "main"
```

## 核心功能

### 文档生成
- 智能分析源代码和项目结构
- 自动推断用户意图和目标受众
- 生成结构化的 Markdown 文档
- 支持文档层次结构规划和确认

### 图片管理
- 自动生成文档所需的图片
- 支持图片占位符系统
- 批量更新和编辑图片
- 多种图片生成模型支持

### 多语言支持
- 文档本地化和翻译
- 多语言文档结构管理
- 自动同步不同语言版本

### 发布和部署
- 一键发布到多个平台
- 支持自定义发布配置
- 文档站点构建和部署

## 开发

### 安装依赖

```bash
pnpm install
```

### 代码质量

项目使用 Biome 进行代码检查和格式化：

```bash
# 检查代码
pnpm run lint

# 自动修复
pnpm run lint:fix
```

### 修改 Agents

添加或修改 agents：

1. 在 `agents/` 目录下创建或修改 agent
2. 在 `aigne.yaml` 中注册新的 agent
3. 编写 agent 的提示词和配置文件

### 修改工具函数

扩展或优化工具函数：

1. 在 `utils/` 目录下添加或修改工具函数
2. 确保使用 ES 模块语法（`.mjs` 文件）
3. 在需要的地方导入使用

## 技术栈

- **Aigne Framework** - AI agent 编排框架
- **Node.js** - 运行时环境（ES 模块）
- **pnpm** - 包管理器
- **Biome** - 代码检查和格式化
- **YAML** - 配置和数据格式

## 注意事项

- 确保已安装 Node.js (v18+) 和 pnpm
- 确保 Git 已安装（用于 submodule 和版本管理）
- 需要配置 Anthropic API key 或其他 LLM provider
- 图片生成功能需要配置相应的 API key

## 迁移说明

如果你之前使用过旧版本（`.aigne/doc-smith/` 目录结构），建议：
1. 创建新的 workspace 目录
2. 重新生成文档
3. 旧版本数据可以手动迁移到新的 workspace 目录结构中

## 版本信息

当前版本：`0.9.11`

## 支持

如有问题或建议，请在项目中提出 issue。

## 作者

**Arcblock** - [blocklet@arcblock.io](mailto:blocklet@arcblock.io)

GitHub: [@blocklet](https://github.com/blocklet)

## 许可

Elastic-2.0 License

## 相关链接

- [Aigne Framework](https://www.npmjs.com/package/@aigne/cli)
- [Arcblock](https://www.arcblock.io/)
