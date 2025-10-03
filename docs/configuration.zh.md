# 配置指南

AIGNE DocSmith 的行为由一个中央配置文件 `.aigne/doc-smith/config.yaml` 控制。该文件允许你根据具体需求自定义文档的风格、目标受众、语言和结构。

你可以通过运行 `aigne doc init` 使用交互式设置向导来创建和管理此文件。有关分步演练，请参阅 [交互式设置](./configuration-interactive-setup.md) 指南。此外，你也可以直接编辑该文件以进行更精细的控制。

下图说明了配置工作流程：

```d2 配置工作流
direction: down

User: {
  shape: c4-person
}

CLI: {
  label: "运行命令\n'aigne doc init'"
  shape: rectangle
}

Setup-Wizard: {
  label: "交互式设置向导"
  shape: rectangle
}

Config-File: {
  label: ".aigne/doc-smith/config.yaml"
  shape: rectangle
}

AIGNE-DocSmith-Engine: {
  label: "AIGNE DocSmith Engine"
}

# 路径 1：交互式设置（推荐）
User -> CLI: "推荐路径"
CLI -> Setup-Wizard: "启动"
Setup-Wizard -> Config-File: "创建/修改"

# 路径 2：手动编辑
User -> Config-File: "备用路径：\n直接编辑"

# 最后一步
Config-File -> AIGNE-DocSmith-Engine: "配置"
```

## 核心配置区域

你的文档由几个关键的配置区域决定。浏览这些指南，了解如何微调生成过程的每个方面。

<x-cards data-columns="2">
  <x-card data-title="交互式设置" data-icon="lucide:wand-2" data-href="/configuration/interactive-setup">
    了解引导式向导如何帮助你配置文档项目，包括设置建议和冲突检测。
  </x-card>
  <x-card data-title="LLM 设置" data-icon="lucide:brain-circuit" data-href="/configuration/llm-setup">
    了解如何连接不同的 AI 模型，包括使用无需 API 密钥的内置 AIGNE Hub。
  </x-card>
  <x-card data-title="语言支持" data-icon="lucide:languages" data-href="/configuration/language-support">
    查看支持的语言完整列表，并了解如何设置主语言和启用自动翻译。
  </x-card>
  <x-card data-title="管理偏好" data-icon="lucide:sliders-horizontal" data-href="/configuration/preferences">
    了解 DocSmith 如何利用你的反馈创建持久规则，以及如何通过 CLI 管理这些规则。
  </x-card>
</x-cards>

## 参数参考

`config.yaml` 文件包含几个控制文档输出的键值对。以下是每个参数的详细参考。

### 项目信息

这些设置提供了关于项目的基本背景信息，用于发布文档。

| 参数 | 描述 |
|---|---|
| `projectName` | 你的项目名称。如果 `package.json` 文件存在，则从中检测。 |
| `projectDesc` | 你的项目的简短描述。从 `package.json` 文件中检测。 |
| `projectLogo` | 你的项目徽标图片的路径或 URL。 |

### 文档策略

这些参数定义了生成内容的基调、风格和深度。

#### `documentPurpose`
定义你希望读者实现的主要成果。此设置会影响文档的整体结构和重点。

| 选项 | 名称 | 描述 |
|---|---|---|
| `getStarted` | 快速入门 | 帮助新用户在 <30 分钟内从零开始上手。 |
| `completeTasks` | 完成特定任务 | 引导用户完成常见的工作流程和用例。 |
| `findAnswers` | 快速查找答案 | 为所有功能和 API 提供可搜索的参考。 |
| `understandSystem`| 理解系统 | 解释其工作原理以及做出设计决策的原因。 |
| `solveProblems` | 排查常见问题 | 帮助用户排查和修复问题。 |
| `mixedPurpose` | 服务于多种目的 | 涵盖多种需求的文档。 |

#### `targetAudienceTypes`
定义最常阅读此文档的受众。此选择会影响写作风格和示例。

| 选项 | 名称 | 描述 |
|---|---|---|
| `endUsers` | 最终用户（非技术人员） | 使用产品但不编码的人员。 |
| `developers` | 集成你的产品/API 的开发者 | 将此添加到其项目中的工程师。 |
| `devops` | DevOps / SRE / 基础设施团队 | 部署、监控和维护系统的团队。 |
| `decisionMakers`| 技术决策者 | 评估或规划实施的架构师或负责人。 |
| `supportTeams` | 支持团队 | 帮助他人使用产品的人员。 |
| `mixedTechnical`| 混合技术受众 | 开发者、DevOps 和其他技术用户。 |

#### `readerKnowledgeLevel`
定义读者通常具备的知识水平。这会调整所假设的基础知识量。

| 选项 | 名称 | 描述 |
|---|---|---|
| `completeBeginners` | 完全是初学者，从零开始 | 完全不熟悉此领域/技术。 |
| `domainFamiliar` | 以前使用过类似的工具 | 了解问题领域，但对这个具体解决方案不熟悉。 |
| `experiencedUsers` | 是试图做特定事情的专家 | 需要参考或高级主题的常规用户。 |
| `emergencyTroubleshooting`| 紧急情况/故障排查 | 某些东西坏了，需要快速修复。 |
| `exploringEvaluating` | 正在评估此工具并与其他工具进行比较 | 试图了解这是否符合他们的需求。 |

#### `documentationDepth`
定义文档的全面程度。

| 选项 | 名称 | 描述 |
|---|---|---|
| `essentialOnly` | 仅限基本内容 | 覆盖 80% 的用例，保持简洁。 |
| `balancedCoverage`| 均衡覆盖 | 具有良好深度和实际示例 [推荐]。 |
| `comprehensive` | 全面 | 覆盖所有功能、边缘情况和高级场景。 |
| `aiDecide` | 让 AI 决定 | 分析代码复杂性并建议适当的深度。 |

### 自定义指令

为了进行更精细的控制，你可以提供自由文本指令。

| 参数 | 描述 |
|---|---|
| `rules` | 一个多行字符串，你可以在其中定义具体的文档生成规则（例如，“始终包含性能基准测试”）。 |
| `targetAudience`| 一个多行字符串，用于比预设更详细地描述你的特定目标受众。 |

### 语言和路径配置

这些设置控制本地化和文件位置。

| 参数 | 描述 |
|---|---|
| `locale` | 文档的主要语言（例如，`en`、`zh`）。 |
| `translateLanguages` | 要将文档翻译成的语言代码列表（例如，`[ja, fr, es]`）。 |
| `docsDir` | 保存生成的文档文件的目录。 |
| `sourcesPath` | 供 DocSmith 分析的源代码路径或 glob 模式列表（例如，`['./src', './lib/**/*.js']`）。 |
| `glossary` | 包含项目特定术语的 markdown 文件（`@glossary.md`）的路径，以确保翻译一致。 |

## config.yaml 示例

这是一个完整的配置文件示例。你可以随时直接编辑此文件来更改设置。

```yaml config.yaml 示例 icon=logos:yaml
# 用于文档发布的项目信息
projectName: AIGNE DocSmith
projectDesc: An AI-driven documentation generation tool.
projectLogo: https://docsmith.aigne.io/image-bin/uploads/def424c20bbdb3c77483894fe0e22819.png

# =============================================================================
# 文档配置
# =============================================================================

# 目的：你希望读者实现的主要成果是什么？
# 选项：getStarted, completeTasks, findAnswers, understandSystem, solveProblems, mixedPurpose
documentPurpose:
  - completeTasks
  - findAnswers

# 目标受众：谁会最常阅读此文档？
# 选项：endUsers, developers, devops, decisionMakers, supportTeams, mixedTechnical
targetAudienceTypes:
  - developers

# 读者知识水平：读者通常具备哪些知识？
# 选项：completeBeginners, domainFamiliar, experiencedUsers, emergencyTroubleshooting, exploringEvaluating
readerKnowledgeLevel: domainFamiliar

# 文档深度：文档应有多全面？
# 选项：essentialOnly, balancedCoverage, comprehensive, aiDecide
documentationDepth: balancedCoverage

# 自定义规则：定义具体的文档生成规则和要求
rules: |+
  

# 目标受众：描述你的特定目标受众及其特征
targetAudience: |+
  

# 术语表：包含项目特定术语和定义的 markdown 文件路径
# glossary: "@glossary.md"

# 文档的主要语言
locale: en

# 要将文档翻译成的语言列表
# translateLanguages:
#   - zh
#   - fr

# 保存生成的文档的目录
docsDir: .aigne/doc-smith/docs

# 要分析的源代码路径
sourcesPath:
  - ./
```

配置设置完成后，你就可以创建符合项目需求的文档了。下一步是运行生成命令。

➡️ **下一步：** [生成文档](./features-generate-documentation.md)