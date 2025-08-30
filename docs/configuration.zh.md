---
labels: ["Reference"]
---

# 配置指南

AIGNE DocSmith 的行为由一个位于项目 `.aigne/doc-smith/` 目录下的中央配置文件 `config.yaml` 控制。该文件允许你精确定义文档的风格、受众、范围和语言，确保生成的内容完全符合你的需求。

你可以使用交互式命令 `aigne doc init` 创建和修改此文件，也可以手动编辑。

## `config.yaml` 文件结构

以下是一个完整的 `config.yaml` 文件示例。其中包含解释每个可用选项的注释，你可以取消注释并修改这些选项以适应你的项目。

```yaml
# 用于文档发布的项目信息
projectName: My Awesome Project
projectDesc: 对该项目功能的简要描述。
projectLogo: "path/to/your/logo.png"

# =============================================================================
# 文档配置
# =============================================================================

# 目的：你希望读者实现的主要成果是什么？
documentPurpose:
  - getStarted
  - completeTasks

# 目标受众：谁会最常阅读本文档？
targetAudienceTypes:
  - developers

# 读者知识水平：读者在阅读时通常具备哪些知识？
readerKnowledgeLevel: domainFamiliar

# 文档深度：文档应有多全面？
documentationDepth: balancedCoverage

# 自定义规则：定义具体的文档生成规则和要求
rules: |
  - 始终在“操作指南”中包含“故障排除”部分。
  - 代码示例必须与 Node.js v18 及更高版本兼容。

# 目标受众：描述你的特定目标受众及其特征
targetAudience: |
  熟悉 JavaScript 和 REST API 但对我们的特定平台不熟悉的中级软件工程师。

# 术语表：定义项目特定的术语和定义
# glossary: "@glossary.md"  # 包含术语表定义的 Markdown 文件路径

# 文档的主要语言
locale: en

# 要将文档翻译成的语言列表
translateLanguages:
  - zh
  - ja

# 保存生成的文档的目录
docsDir: .aigne/doc-smith/docs

# 要分析的源代码路径
sourcesPath:
  - ./src
  - ./lib
```

## 文档策略

这些核心设置定义了 AI 生成内容的方法，影响其语调、结构和深度。

### 文档目的 (`documentPurpose`)

此设置指定文档的主要目标。你可以选择一个或多个选项。

| 选项 | 名称 | 描述 |
|---|---|---|
| `getStarted` | 快速入门 | 帮助新用户在 30 分钟内从零开始上手。针对速度和基本步骤进行优化。 |
| `completeTasks` | 完成特定任务 | 通过分步说明指导用户完成常见工作流程和用例。 |
| `findAnswers` | 快速查找答案 | 为所有功能和 API 提供可搜索的全面参考。 |
| `understandSystem` | 理解系统 | 解释系统的工作原理、其架构以及设计决策背后的基本原理。 |
| `solveProblems` | 解决常见问题 | 帮助用户诊断和修复常见问题，重点关注错误场景。 |
| `mixedPurpose` | 服务于多种目的 | 创建涵盖多种需求的综合性文档，平衡不同目标。 |

### 目标受众 (`targetAudienceTypes`)

定义文档的阅读对象。这有助于适当地调整语言、示例和技术深度。

| 选项 | 名称 | 描述 |
|---|---|---|
| `endUsers` | 最终用户（非技术人员） | 使用产品但不编写代码的人员。内容将使用通俗易懂的语言并侧重于用户界面。 |
| `developers` | 开发者 | 集成你的产品/API 的工程师。内容将以代码为先，并保证技术准确性。 |
| `devops` | DevOps / SRE | 部署和维护系统的团队。内容将侧重于运维和故障排除。 |
| `decisionMakers` | 技术决策者 | 评估产品的架构师和负责人。内容将是高层次的，并附有架构图。 |
| `supportTeams` | 支持团队 | 帮助他人使用产品的人员。内容将侧重于诊断和常见问题。 |
| `mixedTechnical` | 混合技术受众 | 开发者、DevOps 和其他技术用户的组合。内容将分层呈现。 |

### 读者知识水平 (`readerKnowledgeLevel`)

指定你的受众所具备的初始知识水平。

| 选项 | 名称 | 描述 |
|---|---|---|
| `completeBeginners` | 完全是初学者 | 完全不熟悉该领域。内容将定义所有术语，并假定读者不具备任何先验知识。 |
| `domainFamiliar` | 使用过类似工具 | 了解问题领域，但对你的解决方案不熟悉。内容侧重于差异和独特功能。 |
| `experiencedUsers` | 是专家 | 需要参考或高级主题的常规用户。内容紧凑且技术上精确。 |
| `emergencyTroubleshooting` | 紧急/故障排除 | 需要快速解决问题的人员。内容结构为：症状 -> 诊断 -> 解决方案。 |
| `exploringEvaluating` | 正在评估此工具 | 试图了解该工具是否满足其需求。内容侧重于用例和快速入门。 |

### 文档深度 (`documentationDepth`)

控制生成的文档的全面程度。

| 选项 | 名称 | 描述 |
|---|---|---|
| `essentialOnly` | 仅包含基本内容 | 涵盖核心功能和最常见的用例，以保持简洁。 |
| `balancedCoverage` | 均衡覆盖 | 为大多数功能提供具有良好深度和实用示例。 [推荐] |
| `comprehensive` | 全面 | 涵盖所有功能、边缘情况和高级场景，并提供大量示例。 |
| `aiDecide` | 由 AI 决定 | AI 会分析你的代码复杂度和 API 表面，以建议合适的深度。 |

## 自定义和内容控制

除了核心策略，你还可以提供更具体的指导。

*   **`rules`**：一个自由文本字段，你可以在其中提供具体、持久的指令，供 AI 在生成期间遵循（例如，“始终包含‘先决条件’部分”）。
*   **`targetAudience`**：一个自由文本字段，用于比预设更详细地描述你的受众。
*   **`glossary`**：指向包含项目特定术语的 Markdown 文件的路径。这可确保在所有生成和翻译的内容中使用一致的术语。

---

本指南概述了主要配置选项。有关更具体的设置，请参阅以下部分：

*   **对于 AI 模型：** 在 [LLM 设置](./configuration-llm-setup.md) 指南中了解如何连接到不同的 LLM。
*   **对于翻译：** 在 [语言支持](./configuration-language-support.md) 中查看支持的语言完整列表以及如何配置它们。