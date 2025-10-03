# 進階主題

本節詳細探討 AIGNE DocSmith 的內部架構與運作機制。本節內容旨在協助希望深入了解此工具運作方式的使用者，這對於進階客製化或為專案做出貢獻將有所助益。標準使用情況下，並不需要這些資訊。

DocSmith 是 AIGNE 生態系統的一個組件，該生態系統為 AI 應用程式開發提供了一個平台。下圖說明了整體架構。

![AIGNE 生態系統架構圖](https://docsmith.aigne.io/image-bin/uploads/def424c20bbdb3c77483894fe0e22819.png)

若要探索 DocSmith 內部的具體流程與品質控制措施，請參考以下詳細章節。

<x-cards data-columns="2">
  <x-card data-title="運作方式" data-href="/advanced/how-it-works" data-icon="lucide:cpu">
    DocSmith 的架構總覽，解釋 AI Agent 在文件生成流程中的角色。
  </x-card>
  <x-card data-title="品質保證" data-href="/advanced/quality-assurance" data-icon="lucide:shield-check">
    了解 DocSmith 執行的內建檢查機制，以確保文件格式正確且無錯誤，包括連結檢查與圖表驗證。
  </x-card>
</x-cards>

透過回顧這些主題，您可以全面了解 DocSmith 的功能。若需所有可用指令及其參數的完整參考，請參閱 [CLI 指令參考](./cli-reference.md)。