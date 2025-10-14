# 配置

正确的配置是指导 AIGNE DocSmith 工具生成符合项目特定需求的文档的基础。该过程涉及通过中央配置文件定义项目级设置，以及管理个人偏好以微调生成过程。

本节概述了如何配置该工具。有关详细的分步说明，请参阅下面链接的具体指南。

<x-cards data-columns="2">
  <x-card data-title="初始设置" data-icon="lucide:settings-2" data-href="/configuration/initial-setup">
    遵循交互式设置指南创建主 `config.yaml` 文件。这是任何新文档项目必不可少的第一步。
  </x-card>
  <x-card data-title="管理偏好设置" data-icon="lucide:user-cog" data-href="/configuration/managing-preferences">
    了解如何查看、启用、禁用或删除个人偏好设置。这些设置允许您应用特定规则来补充主项目配置。
  </x-card>
</x-cards>

## 理解 `config.yaml` 文件

`config.yaml` 文件是您文档项目的主要可信来源。它在初始设置过程中生成，包含了 AI 用来分析源代码和生成内容的所有核心指令。正确配置的文件可确保输出内容符合您预期的受众、目的和风格。

以下是您将在 `config.yaml` 文件中找到的关键参数的分解说明。

### 核心配置参数

<x-field-group>
  <x-field data-name="projectName" data-type="string" data-required="true">
    <x-field-desc markdown>您项目的官方名称。该名称将用于整个文档的标题和其他元数据中。</x-field-desc>
  </x-field>
  <x-field data-name="projectDesc" data-type="string" data-required="true">
    <x-field-desc markdown>关于您项目目的和功能的简明单句描述。</x-field-desc>
  </x-field>
  <x-field data-name="projectLogo" data-type="string" data-required="false">
    <x-field-desc markdown>指向您项目徽标图像的 URL。该 URL 将用于已发布文档网站的品牌塑造。</x-field-desc>
  </x-field>
  <x-field data-name="documentPurpose" data-type="array" data-required="true">
    <x-field-desc markdown>定义文档的主要目标。示例包括用于入门指南的 `getStarted` 或用于流程说明的 `completeTasks`。</x-field-desc>
  </x-field>
  <x-field data-name="targetAudienceTypes" data-type="array" data-required="true">
    <x-field-desc markdown>指定预期的读者。示例包括非技术人员的 `endUsers` 或工程师的 `developers`。</x-field-desc>
  </x-field>
  <x-field data-name="readerKnowledgeLevel" data-type="string" data-required="true">
    <x-field-desc markdown>描述目标受众假定的技术知识和背景，例如 `completeBeginners`。</x-field-desc>
  </x-field>
  <x-field data-name="documentationDepth" data-type="string" data-required="true">
    <x-field-desc markdown>控制生成内容的详细程度。选项范围从 `essentialOnly` 到 `comprehensive`。</x-field-desc>
  </x-field>
  <x-field data-name="rules" data-type="string" data-required="false">
    <x-field-desc markdown>一组供 AI 在内容生成过程中遵循的自定义指令、指南或约束。</x-field-desc>
  </x-field>
  <x-field data-name="locale" data-type="string" data-required="true">
    <x-field-desc markdown>文档的主要语言代码，例如 `en` 代表英语。</x-field-desc>
  </x-field>
  <x-field data-name="translateLanguages" data-type="array" data-required="false">
    <x-field-desc markdown>主要文档应翻译成的语言代码列表，例如 `zh`（中文）或 `ja`（日语）。</x-field-desc>
  </x-field>
  <x-field data-name="docsDir" data-type="string" data-required="true">
    <x-field-desc markdown>用于保存生成的文档文件的本地目录路径。</x-field-desc>
  </x-field>
  <x-field data-name="sourcesPath" data-type="array" data-required="true">
    <x-field-desc markdown>工具为生成文档而应分析的源文件、目录或 glob 模式的列表。</x-field-desc>
  </x-field>
</x-field-group>

## 总结

定义良好的配置对于生成准确、相关且有效的文档至关重要。通过完成初始设置并理解 `config.yaml` 文件，您为所有文档任务奠定了坚实的基础。

要继续配置您的项目，请参阅以下指南：
*   **[初始设置](./configuration-initial-setup.md)**：创建您项目的 `config.yaml` 文件。
*   **[管理偏好设置](./configuration-managing-preferences.md)**：使用个人规则自定义工具的行为。