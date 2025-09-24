# 核心功能

AIGNE DocSmith 提供了一組指令來管理您的文件生命週期，從初始建立到全球發布。整個過程被組織成一個標準化的工作流程：產生、優化、翻譯和發布您的文件。

```d2
direction: down

Generate: {
  label: "1. 產生\naigne doc generate"
  shape: rectangle
  description: "從您的原始碼建立一套完整的文件。"
}

Refine: {
  label: "2. 更新與優化\naigne doc update"
  shape: rectangle
  description: "保持文件與程式碼同步，並應用針對性的回饋。"
}

Translate: {
  label: "3. 翻譯\naigne doc translate"
  shape: rectangle
  description: "將內容本地化為多種語言，以服務全球受眾。"
}

Publish: {
  label: "4. 發布\naigne doc publish"
  shape: rectangle
  description: "將您的文件部署到公開或私有平台。"
}

Generate -> Refine -> Translate -> Publish
```

在以下章節中探索 DocSmith 的主要功能：

<x-cards data-columns="2">
  <x-card data-title="產生文件" data-icon="lucide:file-plus-2" data-href="/features/generate-documentation">
    使用單一指令從您的原始碼建立一套完整的文件。
  </x-card>
  <x-card data-title="更新與優化" data-icon="lucide:edit" data-href="/features/update-and-refine">
    讓您的文件與程式碼變更保持同步，或根據針對性的回饋重新產生特定文件。
  </x-card>
  <x-card data-title="翻譯文件" data-icon="lucide:languages" data-href="/features/translate-documentation">
    將您的內容翻譯成多種支援的語言，讓您的專案能接觸到全球受眾。
  </x-card>
  <x-card data-title="發布您的文件" data-icon="lucide:send" data-href="/features/publish-your-docs">
    將您產生的文件發布到官方 DocSmith 平台或您自己託管的實例。
  </x-card>
</x-cards>

這些功能為文件提供了一個結構化的工作流程。有關所有可用指令及其選項的詳細清單，請參閱 [CLI 指令參考](./cli-reference.md)。