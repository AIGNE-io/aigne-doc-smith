# 核心功能

AIGNE DocSmith 提供了一组命令来管理您的文档生命周期，从初始创建到全球分发。该过程被组织成一个标准工作流：生成、优化、翻译和发布您的文档。

```d2
direction: down

Generate: {
  label: "1. 生成\naigne doc generate"
  shape: rectangle
  description: "从您的源代码创建一套完整的文档。"
}

Refine: {
  label: "2. 更新与优化\naigne doc update"
  shape: rectangle
  description: "保持文档与代码同步，并应用有针对性的反馈。"
}

Translate: {
  label: "3. 翻译\naigne doc translate"
  shape: rectangle
  description: "将内容本地化为多种语言，以面向全球受众。"
}

Publish: {
  label: "4. 发布\naigne doc publish"
  shape: rectangle
  description: "将您的文档部署到公共或私有平台。"
}

Generate -> Refine -> Translate -> Publish
```

在以下部分中探索 DocSmith 的主要功能：

<x-cards data-columns="2">
  <x-card data-title="生成文档" data-icon="lucide:file-plus-2" data-href="/features/generate-documentation">
    使用单个命令从您的源代码创建一套完整的文档。
  </x-card>
  <x-card data-title="更新与优化" data-icon="lucide:edit" data-href="/features/update-and-refine">
    使您的文档与代码更改保持同步，或根据有针对性的反馈重新生成特定文档。
  </x-card>
  <x-card data-title="翻译文档" data-icon="lucide:languages" data-href="/features/translate-documentation">
    将您的内容翻译成多种支持的语言，使您的项目能够触达全球受众。
  </x-card>
  <x-card data-title="发布您的文档" data-icon="lucide:send" data-href="/features/publish-your-docs">
    将您生成的文档发布到官方 DocSmith 平台或您自己自托管的实例。
  </x-card>
</x-cards>

这些功能为文档工作提供了一个结构化的工作流。有关所有可用命令及其选项的详细列表，请参阅 [CLI 命令参考](./cli-reference.md)。