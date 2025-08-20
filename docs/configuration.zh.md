---
labels: ["Reference"]
---

# 配置指南

AIGNE DocSmith 的强大之处在于其高度的可配置性。通过调整配置，您可以精确控制文档的生成方式，以满足特定的项目需求、匹配目标读者的背景，并定义文档的风格和深度。

所有配置都集中在一个名为 `config.yaml` 的文件中，通常位于 `.aigne/doc-smith/` 目录下。您可以通过运行 `aigne doc init` 命令，以交互式问答的方式轻松生成和修改此文件。

![回答问题完成项目设置](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

下面我们将深入探讨 `config.yaml` 文件中的核心配置选项，帮助您更好地自定义文档生成过程。

## 核心配置选项

### 1. 文档目的 (documentPurpose)

此选项定义了您希望读者通过文档达成的首要目标。不同的目的会影响文档的内容侧重点和结构。

| 选项 | 名称 | 描述 |
|---|---|---|
| `getStarted` | 快速上手 | 帮助新用户在30分钟内从零开始到成功运行。 |
| `completeTasks` | 完成特定任务 | 指导用户完成常见的工作流程和用例。 |
| `findAnswers` | 快速查找答案 | 为所有功能和 API 提供可搜索的参考。 |
| `understandSystem` | 理解系统 | 解释系统的工作原理和设计决策。 |
| `solveProblems` | 解决问题 | 帮助用户排查和修复遇到的问题。 |
| `mixedPurpose` | 混合目的 | 覆盖多种需求的综合性文档。 |

### 2. 目标受众 (targetAudienceTypes)

明确文档的主要读者群体，可以帮助 AI 生成更贴合其技术背景和阅读习惯的内容。

| 选项 | 名称 | 描述 |
|---|---|---|
| `endUsers` | 终端用户 (非技术) | 使用产品但不编写代码的人员。 |
| `developers` | 集成开发者 | 将此项目集成到他们自己项目中的工程师。 |
| `devops` | DevOps/基础设施工程师 | 负责部署、监控和维护系统的团队。 |
| `decisionMakers` | 技术决策者 | 评估或规划实施方案的架构师、技术主管。 |
| `supportTeams` | 支持团队 | 帮助他人使用产品的技术支持人员。 |
| `mixedTechnical` | 混合技术受众 | 开发者、DevOps 和其他技术用户的混合体。 |

### 3. 读者知识水平 (readerKnowledgeLevel)

此设置告知 AI 读者在阅读文档时已具备的知识水平，以便调整内容的深度和术语的解释程度。

| 选项 | 名称 | 描述 |
|---|---|---|
| `completeBeginners` | 完全初学者 | 对该领域或技术完全陌生。 |
| `domainFamiliar` | 熟悉领域，工具新手 | 了解问题领域，但对当前解决方案不熟悉。 |
| `experiencedUsers` | 经验丰富的用户 | 需要参考或高级主题的常规用户。 |
| `emergencyTroubleshooting` | 紧急排错 | 遇到问题，需要快速找到解决方案。 |
| `exploringEvaluating` | 探索/评估 | 尝试了解此方案是否满足其需求。 |

### 4. 文档深度 (documentationDepth)

这个选项决定了文档内容的全面性，从仅覆盖核心功能到包含所有边缘案例的详尽说明。

| 选项 | 名称 | 描述 |
|---|---|---|
| `essentialOnly` | 仅核心内容 | 覆盖80%的用例，保持简洁。 |
| `balancedCoverage` | 平衡覆盖 | 提供良好的深度和实用的示例 [推荐]。 |
| `comprehensive` | 全面详尽 | 覆盖所有功能、边缘案例和高级场景。 |
| `aiDecide` | AI 决定 | 根据代码复杂性分析并建议合适的深度。 |

### 5. 语言和路径设置

- **`locale`**: 设置文档的主要语言，例如 `en` 代表英语，`zh` 代表简体中文。
- **`translateLanguages`**: 一个列表，定义了需要将文档翻译成的其他语言。
- **`docsDir`**: 指定生成的文档最终存放的目录。
- **`sourcesPath`**: 指定需要 AI 分析以生成文档的源代码文件或目录路径。

---

## 深入了解

为了更详细地配置您的文档生成过程，请参阅以下指南：

- **[AI模型提供商](./configuration-llm-providers.md)**：学习如何配置不同的大型语言模型（LLM）提供商，包括无需API密钥的 AIGNE Hub。
- **[支持的语言](./configuration-supported-languages.md)**：查看 DocSmith 支持自动翻译的所有语言列表，并了解如何为您的文档启用多语言支持。

现在您已经了解了 DocSmith 的核心配置选项。配置完成后，您可以继续阅读 **[生成文档](./core-features-generate-docs.md)**，了解如何应用这些设置来创建您的第一份文档。