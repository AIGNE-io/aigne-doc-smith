---
labels: ["Reference"]
---

# 高级主题

对于希望深入了解其内部机制的用户，本节将深入探讨 AIGNE DocSmith 的架构。在这里，你将了解该工具如何运作、其在 AIGNE 生态系统中的位置，以及它用于生成高质量文档的内部机制。

虽然深入理解这些主题对于一般使用并非必需，但它对于自定义行为、排查问题或为项目做出贡献非常有价值。

## AIGNE 生态系统

AIGNE DocSmith 不是一个独立的工具；它是 [AIGNE Framework](https://www.aigne.io/en/framework) 的一个关键组件，该框架是一个用于 AI 应用开发的综合平台。这种集成使 DocSmith 能够利用该平台的先进 AI 功能和强大的基础设施。下图说明了 DocSmith 如何融入更广泛的生态系统。

```d2
direction: down

User: { shape: person }

Source-Code: {
  label: "源代码"
  shape: document
}

AIGNE-Framework: {
  label: "AIGNE 框架"
  shape: package
  grid-columns: 1
  grid-gap: 100

  AIGNE-CLI: {
    label: "AIGNE CLI"
    shape: rectangle
    grid-columns: 3

    DocSmith: { label: "aigne doc\n(DocSmith)" }
    aigne-app: { label: "aigne app" }
    aigne-agent: { label: "aigne agent" }
  }

  AIGNE-Core: {
    label: "AIGNE Core"
    shape: rectangle
    grid-columns: 3

    Agent-Orchestration: { label: "Agent 编排" }
    Memory-Management: { label: "内存管理" }
    Tool-Integration: { label: "工具集成" }
  }

  AIGNE-Hub: {
    label: "AIGNE Hub"
    shape: rectangle

    LLM-Providers: {
      label: "LLM 提供商"
      shape: package
      grid-columns: 3

      OpenAI: { label: "OpenAI" }
      Google: { label: "Google" }
      Anthropic: { label: "Anthropic" }
    }
  }
}

Generated-Documentation: {
  label: "生成的\n文档"
  shape: document
}

Discuss-Kit-Platform: {
  label: "Discuss Kit 平台"
  shape: rectangle
}

# Connections
User -> AIGNE-Framework.AIGNE-CLI.DocSmith: "使用"
Source-Code -> AIGNE-Framework.AIGNE-CLI.DocSmith: "输入"
AIGNE-Framework.AIGNE-CLI.DocSmith -> AIGNE-Framework.AIGNE-Core: "利用"
AIGNE-Framework.AIGNE-Core -> AIGNE-Framework.AIGNE-Hub: "通过...连接"
AIGNE-Framework.AIGNE-CLI.DocSmith -> Generated-Documentation: "生成"
Generated-Documentation -> Discuss-Kit-Platform: "发布至"
```

要更好地了解内部流程和质量控制，请浏览以下部分。

<x-cards data-columns="2">
  <x-card data-title="工作原理" data-href="/advanced/how-it-works" data-icon="lucide:cpu">
    DocSmith 的架构概述，解释了 AI Agent 在文档生成流程中的作用。
  </x-card>
  <x-card data-title="质量保证" data-href="/advanced/quality-assurance" data-icon="lucide:shield-check">
    了解 DocSmith 为确保生成高质量、格式良好且无错误的文档而执行的内置检查。
  </x-card>
</x-cards>

通过探索这些主题，你可以更全面地了解 DocSmith 的功能。要获取所有可用命令及其选项的详细说明，请参阅 [CLI 命令参考](./cli-reference.md)。