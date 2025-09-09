---
labels: ["Reference"]
---

# 核心功能

AIGNE DocSmith 通过一套强大、直观的命令，简化了整个文档生命周期。从最初的创建到全球分发，这些核心功能能够自动化处理最耗时的任务，让您能够专注于编写优秀的代码，而 DocSmith 则负责处理文档工作。

探索 DocSmith 的主要功能，每个功能都旨在处理文档流程的特定阶段：

<x-cards data-columns="2">
  <x-card data-title="生成文档" data-icon="lucide:wand-2" data-href="/features/generate-documentation">
    只需一条命令，即可将您的源代码转化为一套完整且结构清晰的文档。DocSmith 会分析您的项目，并从零开始构建所有内容。
  </x-card>
  <x-card data-title="更新与优化" data-icon="lucide:refresh-cw" data-href="/features/update-and-refine">
    保持文档与代码库同步。根据代码变更智能更新文档，或利用针对性的反馈优化特定章节。
  </x-card>
  <x-card data-title="翻译文档" data-icon="lucide:languages" data-href="/features/translate-documentation">
    轻松触达全球受众。以高准确度自动将您的文档翻译成超过 12 种语言，并保持术语的一致性。
  </x-card>
  <x-card data-title="发布文档" data-icon="lucide:rocket" data-href="/features/publish-your-docs">
    与世界分享您的文档。通过一个交互式命令，直接将文档发布到官方 DocSmith 平台或您自托管的 Discuss Kit 实例。
  </x-card>
</x-cards>

## 文档工作流

这些功能旨在协同工作，形成一个无缝的工作流，引导您从原始源代码完成一个已发布的、支持多语言的文档网站。

```d2
direction: down

generate: {
  label: "1. 生成文档"
  shape: rectangle
}

update: {
  label: "2. 更新与优化"
  shape: rectangle
}

translate: {
  label: "3. 翻译"
  shape: rectangle
}

publish: {
  label: "4. 发布"
  shape: rectangle
}

generate -> update: "代码变更与反馈"
update -> translate: "定稿内容"
translate -> publish: "上线发布"
```

这些功能都兼具简洁性与强大的功能。深入阅读具体指南，学习如何掌握每个命令，并根据项目需求自定义工作流。要获取完整的命令及其选项列表，请查看 [CLI 命令参考](./cli-reference.md)。