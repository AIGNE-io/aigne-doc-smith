---
labels: ["Reference"]
---

# 核心功能

AIGNE DocSmith 提供了一套全面的工具来管理您的文档生命周期，从初始创建到全球分发。它通过几个简单的命令简化了该流程，并利用 AI 自动化复杂的任务。

典型的工作流程遵循一个逻辑顺序，让您可以生成、优化、翻译并最终发布您的文档。

```d2
direction: right

"生成文档": {
  shape: step
  description: "从源代码自动创建"
}

"更新与优化": {
  shape: step
  description: "与代码变更同步并应用反馈"
}

"翻译": {
  shape: step
  description: "支持 12 种以上语言，触及全球受众"
}

"发布": {
  shape: step
  description: "将文档分享到公共或私有平台"
}

"生成文档" -> "更新与优化" -> "翻译" -> "发布" {
  style.animated: true
}
```

在以下部分探索 DocSmith 的主要功能：

<x-cards data-columns="2">
  <x-card data-title="生成文档" data-icon="lucide:file-plus-2" data-href="/features/generate-documentation">
    通过单个命令，直接从源代码自动创建一套完整、结构良好的文档。
  </x-card>
  <x-card data-title="更新与优化" data-icon="lucide:edit" data-href="/features/update-and-refine">
    保持文档与代码变更同步，或根据特定反馈重新生成特定部分以提高质量。
  </x-card>
  <x-card data-title="翻译文档" data-icon="lucide:languages" data-href="/features/translate-documentation">
    轻松将您的内容翻译成超过 12 种语言，使您的项目能够触及全球受众。
  </x-card>
  <x-card data-title="发布您的文档" data-icon="lucide:send" data-href="/features/publish-your-docs">
    通过一个交互式命令，将您生成的文档发布到 DocSmith 官方平台或您自己托管的实例上。
  </x-card>
</x-cards>

这些核心功能协同工作，共同打造无缝的文档工作流。要详细了解所有可用命令及其选项，请参阅 [CLI 命令参考](./cli-reference.md)。