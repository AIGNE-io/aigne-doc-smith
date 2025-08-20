---
labels: ["Reference"]
---

# 配置指南

AIGNE DocSmith 提供一系列设置，可根据您的特定需求定制生成的文档。所有这些设置都在一个名为 `config.yaml` 的文件中进行管理，该文件位于您项目的 `.aigne/doc-smith/` 目录中。本指南详细介绍了所有可用选项。

创建和管理此文件的最简单方法是运行交互式设置向导：

```bash
aigne doc init
```

此命令将引导您完成一系列问题，以创建初始配置。您可以随时直接编辑 `config.yaml` 文件来优化您的设置。

有关设置不同 AI 模型或管理语言的具体细节，请参阅我们的专门指南：

*   **[LLM 设置](./configuration-llm-setup.md):** 了解如何使用不同的 AI 模型，包括 AIGNE Hub。
*   **[语言支持](./configuration-language-support.md):** 查看支持的语言完整列表以及如何启用翻译。

---

## `config.yaml` 文件

您的配置文件集中了给 AI 的所有指令，从目标受众到输出目录。以下是关键部分及其控制内容的总览。

### 文档策略

这些设置定义了文档的高级目标，影响其基调、风格和内容。

#### `documentPurpose`

此设置回答了以下问题：“您希望读者实现的主要成果是什么？”它帮助 AI 专注于最重要的信息。

| Option | Name | Description |
| --- | --- | --- |
| `getStarted` | 快速上手 | 帮助新用户在 30 分钟内从零开始上手 |
| `completeTasks` | 完成特定任务 | 指导用户完成常见工作流程和用例 |
| `findAnswers` | 快速查找答案 | 为所有功能和 API 提供可搜索的参考 |
| `understandSystem` | 理解系统 | 解释其工作原理以及做出设计决策的原因 |
| `solveProblems` | 解决问题 | 帮助用户排查和修复问题 |
| `mixedPurpose` | 以上混合 | 涵盖多种需求的综合性文档 |

#### `targetAudienceTypes`

此项指定最常阅读文档的人员。这个选择对所使用的语言和示例有重大影响。

| Option | Name | Description |
| --- | --- | --- |
| `endUsers` | 最终用户（非技术人员） | 使用产品但不编码的人员 |
| `developers` | 集成开发者 | 将此添加到其项目中的工程师 |
| `devops` | DevOps/基础设施 | 部署、监控、维护系统的团队 |
| `decisionMakers` | 技术决策者 | 评估或规划实施的架构师、负责人 |
| `supportTeams` | 支持团队 | 帮助他人使用产品的人员 |
| `mixedTechnical` | 混合技术受众 | 开发者、DevOps 和技术用户 |

#### `readerKnowledgeLevel`

此设置阐明了读者在阅读文档时所假定的知识水平。

| Option | Name | Description |
| --- | --- | --- |
| `completeBeginners` | 完全初学者 | 完全不熟悉此领域/技术 |
| `domainFamiliar` | 熟悉领域，不熟悉工具 | 了解问题领域，但对此特定解决方案不熟悉 |
| `experiencedUsers` | 经验丰富的用户 | 需要参考/高级主题的常规用户 |
| `emergencyTroubleshooting` | 紧急/故障排查 | 出现问题，需要快速修复 |
| `exploringEvaluating` | 探索/评估 | 试图了解这是否满足他们的需求 |

#### `documentationDepth`

此项决定文档应达到的全面程度。

| Option | Name | Description |
| --- | --- | --- |
| `essentialOnly` | 仅核心内容 | 覆盖 80% 的用例，保持简洁 |
| `balancedCoverage` | 平衡覆盖 | 具有良好深度和实用示例 [推荐] |
| `comprehensive` | 全面 | 覆盖所有功能、边缘情况和高级场景 |
| `aiDecide` | 由 AI 决定 | 分析代码复杂性并建议适当的深度 |

### 自定义规则和描述

为实现更精细的控制，您可以提供自由文本指令。

*   `rules`: 使用此字段定义生成的具体规则或要求。例如，“所有代码示例必须包含解释每行代码的注释。”
*   `targetAudience`: 提供一个详细段落，描述超出预定义类型的目标受众及其特征。

### 文件和语言设置

这些设置控制文件位置和语言的实际方面。

*   `projectName`: 您的项目名称，用于发布。
*   `projectDesc`: 您项目的简短描述。
*   `projectLogo`: 指向您项目徽标图像的 URL。
*   `locale`: 文档的主要语言（例如，`en`）。
*   `translateLanguages`: 要将文档翻译成的其他语言列表。请参阅 [语言支持](./configuration-language-support.md) 指南以了解所有选项。
*   `docsDir`: 用于保存生成的文档文件的目录。
*   `sourcesPath`: DocSmith 应分析以生成文档的源代码路径列表。

---

## `config.yaml` 示例

以下是一个完整配置文件的示例：

```yaml
# 用于文档发布的项目信息
projectName: AIGNE DocSmith
projectDesc: 一款 AI 驱动的文档生成工具。
projectLogo: https://docsmith.aigne.io/logo.png

# =============================================================================
# 文档配置
# =============================================================================

# 目的：您希望读者实现的主要成果是什么？
documentPurpose:
  - getStarted
  - completeTasks

# 目标受众：谁会最常阅读此文档？
targetAudienceTypes:
  - developers

# 读者知识水平：读者在阅读时通常具备哪些知识？
readerKnowledgeLevel: domainFamiliar

# 文档深度：文档应达到多高的全面程度？
documentationDepth: balancedCoverage

# 自定义规则：定义具体的文档生成规则和要求
rules: |
  确保所有 API 示例都是完整的，并且可以直接运行。
  尽可能避免使用技术术语。

# 目标受众：描述您的特定目标受众及其特征
targetAudience: |
  主要受众是熟悉 JavaScript 和 Node.js 但对 AIGNE 生态系统不熟悉的开发者。他们希望将 DocSmith 集成到现有的 CI/CD 管道中。

locale: en
translateLanguages:
  - zh
  - ja

docsDir: .aigne/doc-smith/docs  # 保存生成文档的目录
sourcesPath:  # 要分析的源代码路径
  - ./src
  - ./agents
```

## 后续步骤

配置文件设置完成后，您就可以创建文档了。请继续阅读 [生成文档](./features-generate-documentation.md) 指南，了解如何运行生成过程。