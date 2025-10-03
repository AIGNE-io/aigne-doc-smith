# 核心功能

AIGNE DocSmith 提供了一組指令來管理您的文件生命週期，從初始建立到全球分發。整個流程被組織成一個標準的工作流程：產生、優化、翻譯和發佈您的文件。

```d2
direction: down

AIGNE-DocSmith-Workflow: {
  label: "AIGNE DocSmith 文件生命週期"
  
  source-code: "原始碼"

  generate: "產生文件"

  refine: "更新與優化"

  translate: "翻譯文件"

  publish: "發佈您的文件"

  destinations: {
    grid-columns: 2
    grid-gap: 50

    docsmith-platform: {
      label: "DocSmith 平台"
      shape: cylinder
    }

    self-hosted: {
      label: "自行託管的實例"
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

在以下各節中探索 DocSmith 的主要功能：

<x-cards data-columns="2">
  <x-card data-title="產生文件" data-icon="lucide:file-plus-2" data-href="/features/generate-documentation">
    使用單一指令從您的原始碼建立一套完整的文件。
  </x-card>
  <x-card data-title="更新與優化" data-icon="lucide:edit" data-href="/features/update-and-refine">
    讓您的文件與程式碼變更保持同步，或根據特定回饋重新產生特定文件。
  </x-card>
  <x-card data-title="翻譯文件" data-icon="lucide:languages" data-href="/features/translate-documentation">
    將您的內容翻譯成多種支援的語言，讓您的專案能夠觸及全球受眾。
  </x-card>
  <x-card data-title="發佈您的文件" data-icon="lucide:send" data-href="/features/publish-your-docs">
    將您產生的文件發佈到官方 DocSmith 平台或您自行託管的實例。
  </x-card>
</x-cards>

這些功能為建立和維護文件提供了一個結構化的工作流程。有關所有可用指令及其選項的詳細清單，請參閱 [CLI 指令參考](./cli-reference.md)。