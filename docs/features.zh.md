# 核心功能

AIGNE DocSmith 提供了一系列命令来管理您的文档生命周期，从初始创建到全球分发。整个过程被组织成一个标准工作流：生成、优化、翻译和发布您的文档。

```d2
direction: down

AIGNE-DocSmith-Workflow: {
  label: "AIGNE DocSmith 文档生命周期"
  
  source-code: "源代码"

  generate: "生成文档"

  refine: "更新与优化"

  translate: "翻译文档"

  publish: "发布文档"

  destinations: {
    grid-columns: 2
    grid-gap: 50

    docsmith-platform: {
      label: "DocSmith 平台"
      shape: cylinder
    }

    self-hosted: {
      label: "自托管实例"
      shape: cylinder
    }
  }
}

AIGNE-DocSmith-Workflow.source-code -> AIGNE-DocSmith-Workflow.generate
AIGNE-DocSmith-Workflow.generate -> AIGNE-DocSmith-Workflow.refine
AIGNE-DocSmith-Workflow.refine -> AIGNE-DocSmith-Workflow.translate
AIGNE-DocSmith-Workflow.translate -> AIGNE-DocSmith-Workflow.publish
AIGNE-DocSmith-Workflow.publish -> AIGNE-DocSmith-Workflow.destinations.docsmith-platform
AIGNE-DocSmith-Workflow.publish -> AIGNE-DocSmith-Workflow.destinations.self-hosted
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
    将您的内容翻译成多种支持的语言，使您的项目能够触及全球受众。
  </x-card>
  <x-card data-title="发布文档" data-icon="lucide:send" data-href="/features/publish-your-docs">
    将您生成的文档发布到官方 DocSmith 平台或您自己的自托管实例。
  </x-card>
</x-cards>

这些功能为创建和维护文档提供了一个结构化的工作流。有关所有可用命令及其选项的详细列表，请参阅 [CLI 命令参考](./cli-reference.md)。