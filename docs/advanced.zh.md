---
labels: ["Reference"]
---

# 高级主题

对于希望深入了解其内部机制的用户，本节将深入解析 AIGNE DocSmith 的架构。在这里，你将了解到该工具的运作方式、其在 AIGNE 生态系统中的定位，以及它用于生成高质量文档的内部机制。

虽然深入理解这些主题对于一般使用并非必要，但它对于自定义行为、排查问题或为项目做出贡献非常有价值。

## AIGNE 生态系统

AIGNE DocSmith 并非一个独立的工具，而是 [AIGNE 框架](https://www.aigne.io/en/framework) 的关键组件，该框架是一个用于 AI 应用开发的综合平台。这种集成使 DocSmith 能够利用该平台的先进 AI 功能和强大的基础设施。下图展示了 DocSmith 如何融入更广泛的生态系统。

![AIGNE 生态系统架构](https://docsmith.aigne.io/image-bin/uploads/def424c20bbdb3c77483894fe0e22819.png)

要更好地了解其内部流程和质量控制，请浏览以下章节。

<x-cards data-columns="2">
  <x-card data-title="工作原理" data-href="/advanced/how-it-works" data-icon="lucide:cpu">
    DocSmith 的架构概览，解释了 AI Agent 在文档生成流程中的作用。
  </x-card>
  <x-card data-title="质量保证" data-href="/advanced/quality-assurance" data-icon="lucide:shield-check">
    了解 DocSmith 为确保文档高质量、格式良好且无错误而执行的内置检查。
  </x-card>
</x-cards>

通过探索这些主题，你可以更全面地了解 DocSmith 的功能。要获取所有可用命令及其选项的详细说明，请参阅 [CLI 命令参考](./cli-reference.md)。