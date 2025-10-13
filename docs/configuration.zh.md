# 配置

合理的配置是根据您项目的具体需求定制文档生成过程的基础。AIGNE DocSmith 使用一个主配置文件进行项目范围的设置，并使用一个单独的命令来管理个人偏好。这种方法确保生成的文档能准确地与您的项目目标、目标受众和结构需求保持一致。

本节对配置过程进行了高层次的概述。有关详细的分步说明，请参阅以下指南：

<x-cards>
  <x-card data-title="初始设置" data-icon="lucide:settings-2" data-href="/configuration/initial-setup">学习如何运行交互式设置来创建您的 config.yaml 文件。这是任何新项目的推荐首要步骤。</x-card>
  <x-card data-title="管理偏好设置" data-icon="lucide:list-checks" data-href="/configuration/managing-preferences">了解如何查看、启用、禁用或删除已保存的偏好设置，以便随着时间的推移优化文档生成过程。</x-card>
</x-cards>

## `config.yaml` 文件

所有项目级别的设置都存储在名为 `config.yaml` 的文件中，该文件位于您项目的 `.aigne/doc-smith/` 目录中。`aigne doc init` 命令通过一个交互式的引导过程为您创建此文件。您也可以随时使用文本编辑器手动修改此文件以调整设置。

以下是一个 `config.yaml` 文件示例，其中包含解释每个配置选项的注释。

```yaml config.yaml icon=logos:yaml
# 用于文档发布的项目信息
projectName: AIGNE DocSmith
projectDesc: AIGNE DocSmith is a powerful, AI-driven documentation generation tool built on the AIGNE Framework. It automates the creation of detailed, structured, and multi-language documentation directly from your source code.
projectLogo: https://docsmith.aigne.io/image-bin/uploads/9645caf64b4232699982c4d940b03b90.svg

# =============================================================================
# 文档配置
# =============================================================================

# 目的：您希望读者达成的核心成果是什么？
# 可用选项：getStarted, completeTasks, findAnswers, understandSystem, solveProblems, mixedPurpose
documentPurpose:
  - getStarted
  - completeTasks

# 目标受众：谁会最常阅读这份文档？
# 可用选项：endUsers, developers, devops, decisionMakers, supportTeams, mixedTechnical
targetAudienceTypes:
  - endUsers

# 读者知识水平：读者在阅读文档时通常具备哪些知识？
# 可用选项：completeBeginners, domainFamiliar, experiencedUsers, emergencyTroubleshooting, exploringEvaluating
readerKnowledgeLevel: completeBeginners

# 文档深度：文档应达到何种程度的全面性？
# 可用选项：essentialOnly, balancedCoverage, comprehensive, aiDecide
documentationDepth: comprehensive

# 自定义规则：定义具体的文档生成规则和要求
rules: |
  避免使用模糊或空洞的词语，这些词语无法提供可衡量或具体的细节，例如“智能地”、“无缝地”、“全面地”或“高质量地”。专注于具体、可验证的事实和信息。
  专注于具体、可验证的事实和信息。
  必须涵盖 DocSmith 的所有子命令

# 目标受众：详细描述您的特定目标受众及其特征
targetAudience: |
  
# 术语表：定义项目特定的术语和定义
# glossary: "@glossary.md"  # 包含术语表定义的 Markdown 文件路径

# 文档的主要语言
locale: en

# 用于翻译的其他语言列表
translateLanguages:
  - zh
  - zh-TW
  - ja

# 生成的文档将被保存的目录
docsDir: ./docs

# 用于分析以生成文档的源代码路径
sourcesPath:
  - ./README.md
  - ./CHANGELOG.md
  - ./aigne.yaml
  - ./agents
  - ./.aigne/doc-smith/config.yaml

# =============================================================================
# 媒体设置
# =============================================================================

# 图像质量筛选：只有宽度大于此值的图像才会被包含
# 这有助于通过筛选掉低分辨率图像来保持文档质量
# 推荐值：一般文档为 800px，高质量文档为 1200px
media:
  minImageWidth: 800
```

## 管理用户偏好设置

除了项目范围的 `config.yaml` 文件外，您还可以管理个人偏好设置，以根据您的特定需求微调 AI 的行为。这些偏好设置存储在本地，可以被激活、停用或移除，而不会更改项目的配置文件。

偏好设置使用 `aigne doc prefs` 命令进行管理，该命令支持以下操作：
*   `--list`：查看所有已保存的偏好设置及其状态（激活/未激活）。
*   `--remove`：删除一个或多个已保存的偏好设置。
*   `--toggle`：启用或禁用特定的偏好设置。

有关使用这些命令的完整指南，请参阅[管理偏好设置](./configuration-managing-preferences.md)。

## 总结

通过正确配置 `config.yaml` 并管理您的个人偏好，您可以为工具提供关于项目、受众和文档目标的明确指令。这将生成更准确、更相关的内容。

要开始设置您的项目，请继续阅读[初始设置](./configuration-initial-setup.md)指南。