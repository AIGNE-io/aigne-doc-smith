# 進階主題

本節詳細介紹 AIGNE DocSmith 的內部架構和運作機制。它專為希望深入了解該工具如何運作的使用者而設計，這對於進階自訂或為專案做出貢獻非常有益。標準使用不需要這些資訊。

DocSmith 是 AIGNE 生態系的一個元件，該生態系為 AI 應用程式開發提供了一個平台。下圖說明了整體架構。

![AIGNE 生態系架構](https://docsmith.aigne.io/image-bin/uploads/def424c20bbdb3c77483894fe0e22819.png)

若要探索 DocSmith 內的具體流程和品質控制措施，請參閱以下詳細章節。

<x-cards data-columns="2">
  <x-card data-title="運作方式" data-href="/advanced/how-it-works" data-icon="lucide:cpu">
    DocSmith 的架構概覽，解釋 AI agent 在文件生成流程中的角色。
  </x-card>
  <x-card data-title="品質保證" data-href="/advanced/quality-assurance" data-icon="lucide:shield-check">
    了解 DocSmith 執行的內建檢查，以確保文件格式正確且無錯誤，包括連結檢查和圖表驗證。
  </x-card>
</x-cards>

透過回顧這些主題，您可以全面了解 DocSmith 的功能。有關所有可用指令及其參數的完整參考，請參閱 [CLI 指令參考](./cli-reference.md)。