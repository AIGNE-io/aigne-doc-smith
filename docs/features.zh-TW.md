# 核心功能

AIGNE DocSmith 提供了一組指令來管理文件的生命週期，從初始建立到全球分發。整個過程被組織成一個標準的工作流程：產生、優化、翻譯和發布您的文件。

```d2
direction: down

source-code: {
  label: "原始碼"
  shape: rectangle
}

generate-documentation: {
  label: "產生文件"
  shape: rectangle
}

update-and-refine: {
  label: "更新與優化"
  shape: rectangle
}

translate-documentation: {
  label: "翻譯文件"
  shape: rectangle
}

publish-docs: {
  label: "發布您的文件"
  shape: rectangle
}

platform: {
  label: "DocSmith 平台\n（或自行託管）"
  shape: cylinder
}

source-code -> generate-documentation
generate-documentation -> update-and-refine
update-and-refine -> translate-documentation
translate-documentation -> publish-docs
publish-docs -> platform
```

在以下章節中探索 DocSmith 的主要功能：

<x-cards data-columns="2">
  <x-card data-title="產生文件" data-icon="lucide:file-plus-2" data-href="/features/generate-documentation">
    使用單一指令從您的原始碼建立一套完整的文件。
  </x-card>
  <x-card data-title="更新與優化" data-icon="lucide:edit" data-href="/features/update-and-refine">
    讓您的文件與程式碼變更保持同步，或根據具體回饋重新產生特定文件。
  </x-card>
  <x-card data-title="翻譯文件" data-icon="lucide:languages" data-href="/features/translate-documentation">
    將您的內容翻譯成多種支援的語言，讓您的專案能夠觸及全球使用者。
  </x-card>
  <x-card data-title="發布您的文件" data-icon="lucide:send" data-href="/features/publish-your-docs">
    將您產生的文件發布到官方 DocSmith 平台或您自行託管的實例。
  </x-card>
</x-cards>

這些功能提供了一個結構化的工作流程，用於建立和維護文件。有關所有可用指令及其選項的詳細列表，請參閱 [CLI 指令參考](./cli-reference.md)。