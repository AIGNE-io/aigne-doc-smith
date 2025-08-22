---
labels: ["Reference"]
---

# 配置指南

AIGNE DocSmith 的优势在于其能够根据您的特定需求进行定制。正确的配置可确保 AI 生成的文档具有适合您受众的风格、语调和深度。本指南详细介绍了所有可用设置。

您可以通过两种主要方式设置您的项目：

1.  **交互式设置**：运行 `aigne doc init` 命令。这将启动一个分步向导，向您提问并为您创建配置文件。这是推荐的入门方法。
2.  **手动编辑**：直接修改位于项目 `.aigne/doc-smith/` 目录中的 `config.yaml` 文件。这对于进行快速更改或高级调整非常有用。

本指南涵盖了您将在 `config.yaml` 文件中找到的核心设置。有关更具体的主题，请参阅我们的 [LLM 设置](./configuration-llm-setup.md) 和 [语言支持](./configuration-language-support.md) 指南。

## config.yaml 文件

所有设置都存储在单个 `config.yaml` 文件中。当您运行 `aigne doc init` 时，会生成此文件，并附有说明每个选项的有用注释。您可以随时编辑它。

一个典型的配置文件如下所示：

```yaml
# 用于文档发布的项目信息
projectName: My Awesome Project
projectDesc: A brief description of what this project does.
projectLogo: ""

# =============================================================================
# 文档配置
# =============================================================================

# 目的：您希望读者实现的主要成果是什么？
documentPurpose:
  - getStarted

# 目标受众：谁会最常阅读本文档？
targetAudienceTypes:
  - developers

# 读者知识水平：读者通常具备哪些知识？
readerKnowledgeLevel: completeBeginners

# 文档深度：文档应该有多全面？
documentationDepth: balancedCoverage

# 自定义规则：定义特定的文档生成规则和要求
rules: |


# 目标受众：描述您的特定目标受众及其特征
targetAudience: |


# 术语表：定义项目特定的术语和定义
# glossary: "@glossary.md"

locale: en
translateLanguages:
  - zh

docsDir: .aigne/doc-smith/docs  # 保存生成文档的目录
sourcesPath:  # 要分析的源代码路径
  - ./
```

## 核心配置设置

让我们来分解一下您可以自定义的关键设置。

### 文档目的

此设置告诉 AI 您的文档的主要目标是什么。这会影响结构和内容，以最好地服务于读者的意图。

| 选项 | 名称 | 描述 |
| :--- | :--- | :--- |
| `getStarted` | 快速入门 | 帮助新用户在 30 分钟内从零开始上手。 |
| `completeTasks` | 完成特定任务 | 引导用户完成常见的工作流程和用例。 |
| `findAnswers` | 快速查找答案 | 为所有功能和 API 提供可搜索的参考。 |
| `understandSystem` | 理解系统 | 解释其工作原理以及做出设计决策的原因。 |
| `solveProblems` | 解决问题 | 帮助用户排查和修复问题。 |
| `mixedPurpose` | 以上混合 | 涵盖多种需求的综合性文档。 |

### 目标受众

定义最常阅读文档的受众。这将调整写作风格、技术语言和所用示例的类型。

| 选项 | 名称 | 描述 |
| :--- | :--- | :--- |
| `endUsers` | 最终用户（非技术人员） | 使用产品但不编写代码的人员。 |
| `developers` | 集成开发者 | 将此产品添加到其项目中的工程师。 |
| `devops` | DevOps/基础设施 | 部署、监控和维护系统的团队。 |
| `decisionMakers` | 技术决策者 | 评估实施方案的架构师或负责人。 |
| `supportTeams` | 支持团队 | 帮助他人使用产品的人员。 |
| `mixedTechnical` | 混合技术受众 | 开发人员、DevOps 和其他技术用户。 |

### 读者知识水平

指定您受众的假定知识水平。这有助于 AI 决定是解释基本概念还是直接深入探讨高级主题。

| 选项 | 名称 | 描述 |
| :--- | :--- | :--- |
| `completeBeginners` | 完全初学者 | 完全不熟悉该领域或技术。 |
| `domainFamiliar` | 熟悉领域，不熟悉工具 | 了解问题领域，但对这个特定解决方案不熟悉。 |
| `experiencedUsers` | 有经验的用户 | 需要参考或高级主题的常规用户。 |
| `emergencyTroubleshooting` | 紧急情况/故障排除 | 出现问题，需要快速修复。 |
| `exploringEvaluating` | 探索/评估 | 试图了解该产品是否满足其需求。 |

### 文档深度

控制文档的全面程度。您可以选择只涵盖基本内容，也可以涵盖所有可能的细节。

| 选项 | 名称 | 描述 |
| :--- | :--- | :--- |
| `essentialOnly` | 仅核心内容 | 涵盖 80% 的用例，保持简洁。 |
| `balancedCoverage` | 均衡覆盖 | 具有良好深度和实际示例（推荐）。 |
| `comprehensive` | 全面 | 涵盖所有功能、边缘情况和高级场景。 |
| `aiDecide` | 由 AI 决定 | 分析代码复杂性并建议适当的深度。 |

### 文件和目录路径

- `docsDir`：生成的 Markdown 文档文件将保存到的目录。默认为 `.aigne/doc-smith/docs`。
- `sourcesPath`：DocSmith 应分析以生成文档的源代码文件和目录列表。如果为空，则默认为整个项目（`./`）。

---

## 详细配置主题

要深入了解特定配置领域，请参阅以下部分：

- **[LLM 设置](./configuration-llm-setup.md)**：了解如何将 DocSmith 连接到不同的大型语言模型，包括使用 AIGNE Hub 实现无密钥访问。
- **[语言支持](./configuration-language-support.md)**：查看支持的语言完整列表，并了解如何配置您的主语言及启用自动翻译。

配置项目后，下一步是探索核心功能。在[生成文档](./features-generate-documentation.md)指南中了解更多信息。