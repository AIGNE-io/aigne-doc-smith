# 核心功能

AIGNE DocSmith 提供了一套命令来管理文档的整个生命周期，从初始创建到全球分发。该过程被组织成一个标准工作流程：生成、优化、翻译和发布您的文档。

```d2
direction: down

source-code: {
  label: "源代码"
  shape: rectangle
}

generate-documentation: {
  label: "生成文档"
  shape: rectangle
}

update-and-refine: {
  label: "更新与优化"
  shape: rectangle
}

translate-documentation: {
  label: "翻译文档"
  shape: rectangle
}

publish-docs: {
  label: "发布文档"
  shape: rectangle
}

platform: {
  label: "DocSmith 平台\n(或自托管)"
  shape: cylinder
}

source-code -> generate-documentation
generate-documentation -> update-and-refine
update-and-refine -> translate-documentation
translate-documentation -> publish-docs
publish-docs -> platform
```

在以下部分中，探索 DocSmith 的主要功能：

<x-cards data-columns="2">
  <x-card data-title="生成文档" data-icon="lucide:file-plus-2" data-href="/features/generate-documentation">
    使用单个命令从您的源代码创建一整套文档。
  </x-card>
  <x-card data-title="更新与优化" data-icon="lucide:edit" data-href="/features/update-and-refine">
    让您的文档与代码更改保持同步，或根据特定反馈重新生成特定文档。
  </x-card>
  <x-card data-title="翻译文档" data-icon="lucide:languages" data-href="/features/translate-documentation">
    将您的内容翻译成多种支持的语言，使您的项目能够面向全球受众。
  </x-card>
  <x-card data-title="发布文档" data-icon="lucide:send" data-href="/features/publish-your-docs">
    将您生成的文档发布到官方 DocSmith 平台或您自己的自托管实例。
  </x-card>
</x-cards>

这些功能为创建和维护文档提供了一个结构化的工作流程。有关所有可用命令及其选项的详细列表，请参阅 [CLI 命令参考](./cli-reference.md)。