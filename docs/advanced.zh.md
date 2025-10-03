# 高级主题

本节详细介绍了 AIGNE DocSmith 的内部架构和运行机制。本节内容面向希望深入了解该工具工作原理的用户，这对于高级定制或为项目做出贡献大有裨益。标准使用无需了解此信息。

DocSmith 是 AIGNE 生态系统的一个组件，该生态系统为 AI 应用开发提供了一个平台。下图展示了其整体架构。

![AIGNE 生态系统架构](https://docsmith.aigne.io/image-bin/uploads/def424c20bbdb3c77483894fe0e22819.png)

要了解 DocSmith 内部的具体流程和质量控制措施，请参阅以下详细章节。

<x-cards data-columns="2">
  <x-card data-title="工作原理" data-href="/advanced/how-it-works" data-icon="lucide:cpu">
    DocSmith 的架构概述，解释了 AI Agent 在文档生成流程中的作用。
  </x-card>
  <x-card data-title="质量保证" data-href="/advanced/quality-assurance" data-icon="lucide:shield-check">
    了解 DocSmith 为确保文档格式良好且无错误而执行的内置检查，包括链接检查和图表验证。
  </x-card>
</x-cards>

通过阅读这些主题，您可以全面了解 DocSmith 的功能。有关所有可用命令及其参数的完整参考，请参阅 [CLI 命令参考](./cli-reference.md)。