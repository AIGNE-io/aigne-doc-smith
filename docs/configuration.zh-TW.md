# 設定

正確的設定是引導 AIGNE DocSmith 工具產生符合您專案特定需求文件的基礎。此過程涉及透過一個中央設定檔來定義專案層級的設定，並管理個人偏好設定以微調產生過程。

本節將概覽如何設定此工具。有關詳細的逐步說明，請參考下方連結的具體指南。

<x-cards data-columns="2">
  <x-card data-title="初始設定" data-icon="lucide:settings-2" data-href="/configuration/initial-setup">
    遵循互動式設定指南來建立主要的 `config.yaml` 檔案。這是任何新文件專案的必要第一步。
  </x-card>
  <x-card data-title="管理偏好設定" data-icon="lucide:user-cog" data-href="/configuration/managing-preferences">
    了解如何檢視、啟用、停用或刪除個人偏好設定。這些設定可讓您應用特定規則來補充主要的專案設定。
  </x-card>
</x-cards>

## 了解 `config.yaml` 檔案

`config.yaml` 檔案是您文件專案的唯一可信來源。它在初始設定過程中產生，並包含 AI 用於分析您的原始碼及產生內容的所有核心指令。一個設定正確的檔案可確保輸出內容是為您預期的受眾、目的和風格量身打造。

以下是您會在 `config.yaml` 檔案中找到的關鍵參數的詳細說明。

### 核心設定參數

<x-field-group>
  <x-field data-name="projectName" data-type="string" data-required="true">
    <x-field-desc markdown>您專案的正式名稱。此名稱將用於整份文件的標題和其他元資料中。</x-field-desc>
  </x-field>
  <x-field data-name="projectDesc" data-type="string" data-required="true">
    <x-field-desc markdown>用一句話簡潔描述您專案的目的和功能。</x-field-desc>
  </x-field>
  <x-field data-name="projectLogo" data-type="string" data-required="false">
    <x-field-desc markdown>指向您專案標誌圖片的 URL。此圖片將用於已發佈文件網站的品牌識別。</x-field-desc>
  </x-field>
  <x-field data-name="documentPurpose" data-type="array" data-required="true">
    <x-field-desc markdown>定義文件的主要目標。範例包含用於入門指南的 `getStarted` 或用於程序說明的 `completeTasks`。</x-field-desc>
  </x-field>
  <x-field data-name="targetAudienceTypes" data-type="array" data-required="true">
    <x-field-desc markdown>指定預期的讀者。範例包含針對非技術人員的 `endUsers` 或針對工程師的 `developers`。</x-field-desc>
  </x-field>
  <x-field data-name="readerKnowledgeLevel" data-type="string" data-required="true">
    <x-field-desc markdown>描述目標受眾的預期技術知識和背景，例如 `completeBeginners`。</x-field-desc>
  </x-field>
  <x-field data-name="documentationDepth" data-type="string" data-required="true">
    <x-field-desc markdown>控制產生內容的詳細程度。選項範圍從 `essentialOnly` 到 `comprehensive`。</x-field-desc>
  </x-field>
  <x-field data-name="rules" data-type="string" data-required="false">
    <x-field-desc markdown>一組自訂指令、指南或限制，供 AI 在內容產生過程中遵循。</x-field-desc>
  </x-field>
  <x-field data-name="locale" data-type="string" data-required="true">
    <x-field-desc markdown>文件的主要語言代碼，例如 `en` 代表英文。</x-field-desc>
  </x-field>
  <x-field data-name="translateLanguages" data-type="array" data-required="false">
    <x-field-desc markdown>應將主要文件翻譯成的語言代碼列表，例如 `zh` (中文) 或 `ja` (日文)。</x-field-desc>
  </x-field>
  <x-field data-name="docsDir" data-type="string" data-required="true">
    <x-field-desc markdown>儲存所產生文件檔案的本機目錄路徑。</x-field-desc>
  </x-field>
  <x-field data-name="sourcesPath" data-type="array" data-required="true">
    <x-field-desc markdown>工具應分析以產生文件的來源檔案、目錄或 glob 模式的列表。</x-field-desc>
  </x-field>
</x-field-group>

## 總結

一個定義完善的設定對於產出準確、相關且有效的文件至關重要。透過完成初始設定並了解 `config.yaml` 檔案，您為所有的文件任務奠定了堅實的基礎。

若要繼續設定您的專案，請參考以下指南：
*   **[初始設定](./configuration-initial-setup.md)**：建立您專案的 `config.yaml` 檔案。
*   **[管理偏好設定](./configuration-managing-preferences.md)**：使用個人規則自訂工具的行為。