# 配置

合理的配置对于根据项目的具体需求定制文档生成过程至关重要。AIGNE DocSmith 使用一个主配置文件和命令行界面来管理您的设置。这种设置确保了生成的文档能够准确反映您的项目目标、目标受众和结构要求。

本节概述了如何配置该工具。有关分步说明，请参阅以下详细指南：

<x-cards>
  <x-card data-title="初始设置" data-icon="lucide:settings-2" data-href="/configuration/initial-setup">了解如何运行交互式设置来创建您的 config.yaml 文件。这是任何新项目的推荐第一步。</x-card>
  <x-card data-title="管理偏好设置" data-icon="lucide:list-checks" data-href="/configuration/managing-preferences">了解如何查看、启用、禁用或删除已保存的偏好设置，以便随着时间的推移优化文档生成过程。</x-card>
</x-cards>

## `config.yaml` 文件

所有项目级别的设置都存储在名为 `config.yaml` 的文件中，该文件位于您项目中的 `.aigne/doc-smith/` 目录内。`aigne doc init` 命令通过一个交互式过程为您创建此文件。您也可以随时使用文本编辑器手动修改此文件以调整设置。

以下是一个 `config.yaml` 文件的示例，其中包含解释每个部分的注释。

```yaml Example config.yaml icon=logos:yaml
# 用于文档发布的项目信息
projectName: AIGNE DocSmith
projectDesc: AIGNE DocSmith 是一款功能强大、由 AI 驱动的文档生成工具，构建于 AIGNE 框架之上。它可以直接从您的源代码中自动创建详细、结构化和多语言的文档。
projectLogo: https://docsmith.aigne.io/image-bin/uploads/9645caf64b4232699982c4d940b03b90.svg

# =============================================================================
# 文档配置
# =============================================================================

# 目的：您希望读者实现的主要成果是什么？
# 可用选项（取消注释并根据需要修改）：
#   getStarted       - 快速入门：帮助新用户在 30 分钟内从零开始上手
#   completeTasks    - 完成特定任务：引导用户了解常见工作流程和用例
#   findAnswers      - 快速查找答案：为所有功能和 API 提供可搜索的参考
#   understandSystem - 理解系统：解释其工作原理以及做出设计决策的原因
#   solveProblems    - 解决问题：帮助用户排查和修复问题
#   mixedPurpose     - 多种目的混合：涵盖多种需求的综合文档
documentPurpose:
  - getStarted
  - completeTasks

# 目标受众：谁会最常阅读这些文档？
# 可用选项（取消注释并根据需要修改）：
#   endUsers         - 最终用户（非技术人员）：使用产品但不编码的人
#   developers       - 集成开发者：将此添加到其项目中的工程师
#   devops           - DevOps/基础设施：部署、监控、维护系统的团队
#   decisionMakers   - 技术决策者：评估或规划实施的架构师、负责人
#   supportTeams     - 支持团队：帮助他人使用产品的人
#   mixedTechnical   - 混合技术受众：开发者、DevOps 和技术用户
targetAudienceTypes:
  - endUsers

# 读者知识水平：读者通常具备哪些知识？
# 可用选项（取消注释并根据需要修改）：
#   completeBeginners    - 完全初学者：完全不熟悉该领域/技术
#   domainFamiliar       - 熟悉领域，但工具是新的：了解问题领域，但对这个特定解决方案不熟悉
#   experiencedUsers     - 经验丰富的用户：需要参考/高级主题的常规用户
#   emergencyTroubleshooting - 紧急/故障排除：出现问题，需要快速修复
#   exploringEvaluating  - 探索/评估：试图了解这是否满足他们的需求
readerKnowledgeLevel: completeBeginners

# 文档深度：文档应有多全面？
# 可用选项（取消注释并根据需要修改）：
#   essentialOnly      - 仅包含基本内容：覆盖 80% 的用例，保持简洁
#   balancedCoverage   - 平衡覆盖：具有适当深度和实际示例 [推荐]
#   comprehensive      - 全面：覆盖所有功能、边缘情况和高级场景
#   aiDecide           - 让 AI 决定：分析代码复杂性并建议适当的深度
documentationDepth: comprehensive

# 自定义规则：定义具体的文档生成规则和要求
rules: |
  避免使用模糊或空洞的词语，这些词语无法提供可衡量或具体的细节，例如‘智能地’、‘无缝地’、‘全面地’或‘高质量地’。专注于具体、可验证的事实和信息。
  专注于具体、可验证的事实和信息。
  必须覆盖 DocSmith 的所有子命令

# 目标受众：描述您的具体目标受众及其特征
targetAudience: |

locale: en
translateLanguages:
  - zh
  - zh-TW
  - ja
docsDir: ./docs  # 保存生成文档的目录
sourcesPath:  # 要分析的源代码路径
  - ./README.md
  - ./CHANGELOG.md
  - ./aigne.yaml
  - ./agents
  - ./media.md
  - ./.aigne/doc-smith/config.yaml
```

## 总结

完成配置后，该工具将清楚地了解您的项目、受众和文档目标，从而生成更准确、更相关的内容。

要开始设置您的项目，请继续阅读[初始设置](./configuration-initial-setup.md)指南。