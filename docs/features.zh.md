---
labels: ["Reference"]
---

# 核心功能

AIGNE DocSmith 提供了一套全面的工具来管理您的文档生命周期，从最初创建到全球分发。它通过几个简单的命令简化流程，利用 AI 自动化复杂任务。

典型的工作流程遵循一个逻辑顺序，让您可以生成、优化、翻译并最终发布您的文档。

```d2
direction: down

Generate: {
  label: "1. 生成\naigne doc generate"
  shape: step
  description: "从您的源代码创建一套完整的文档。"
}

Refine: {
  label: "2. 更新与优化\naigne doc update"
  shape: step
  description: "保持文档与代码同步，并应用有针对性的反馈。"
}

Translate: {
  label: "3. 翻译\naigne doc translate"
  shape: step
  description: "将内容本地化为 12 种以上语言，以面向全球受众。"
}

Publish: {
  label: "4. 发布\naigne doc publish"
  shape: step
  description: "将您的文档部署到公共或私有平台。"
}

Generate -> Refine -> Translate -> Publish
```

在以下部分探索 DocSmith 的主要功能：

<x-cards data-columns="2">
  <x-card data-title="生成文档" data-icon="lucide:file-plus-2" data-href="/features/generate-documentation">
    通过一个命令，直接从您的源代码自动创建一套完整、结构良好的文档。
  </x-card>
  <x-card data-title="更新与优化" data-icon="lucide:edit" data-href="/features/update-and-refine">
    保持您的文档与代码更改同步，或根据有针对性的反馈重新生成特定部分以提高质量。
  </x-card>
  <x-card data-title="翻译文档" data-icon="lucide:languages" data-href="/features/translate-documentation">
    轻松将您的内容翻译成超过 12 种语言，让您的项目能够触达全球受众。
  </x-card>
  <x-card data-title="发布您的文档" data-icon="lucide:send" data-href="/features/publish-your-docs">
    通过一个交互式命令，将您生成的文档发布到官方 DocSmith 平台或您自己托管的实例。
  </x-card>
</x-cards>

这些核心功能协同工作，创建一个无缝的文档工作流程。要详细查看所有可用命令及其选项，请前往 [CLI 命令参考](./cli-reference.md)。