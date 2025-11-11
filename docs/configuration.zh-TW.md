# 設定

正確的設定是引導 AIGNE DocSmith 產生符合您專案特定需求文件的基礎。此過程涉及透過中央設定檔定義專案層級的設定，並管理個人偏好以微調產生過程。

本節概述如何設定此工具。有關詳細的逐步說明，請參閱下方連結的具體指南。

<x-cards data-columns="2">
  <x-card data-title="初始設定" data-icon="lucide:settings-2" data-href="/configuration/initial-setup">
    遵循互動式設定指南來建立主要的 `config.yaml` 檔案。這是任何新文件專案必不可少的第一步。
  </x-card>
  <x-card data-title="管理偏好" data-icon="lucide:user-cog" data-href="/configuration/managing-preferences">
    瞭解如何檢視、啟用、停用或刪除個人偏好。這些偏好讓您可以應用特定規則，以補充主要的專案設定。
  </x-card>
</x-cards>

## 瞭解 `config.yaml` 檔案

`config.yaml` 檔案是您文件專案的主要指令來源。它在初始設定過程中產生，並包含 AI 用於分析您的原始碼和產生內容的所有核心指令。一個正確設定的檔案可確保輸出內容符合您預期的受眾、目的和風格。

以下是您將在 `config.yaml` 檔案中找到的關鍵參數的詳細說明。

### 核心設定參數

<x-field-group>
  <x-field data-name="projectName" data-type="string" data-required="true">
    <x-field-desc markdown>您專案的正式名稱。此名稱將用於文件的標題和其他中繼資料中。</x-field-desc>
  </x-field>
  <x-field data-name="projectDesc" data-type="string" data-required="true">
    <x-field-desc markdown>一句簡潔描述您專案目的和功能的句子。</x-field-desc>
  </x-field>
  <x-field data-name="projectLogo" data-type="string" data-required="false">
    <x-field-desc markdown>指向您專案標誌圖片的 URL。此 URL 用於為已發佈的文件網站加上品牌標誌。</x-field-desc>
  </x-field>
  <x-field data-name="thinking" data-type="object" data-required="false">
    <x-field-desc markdown>設定 AI 的推理精力。</x-field-desc>
    <x-field data-name="effort" data-type="string" data-default="standard" data-required="false">
      <x-field-desc markdown>決定推理的深度。選項包括 `lite`（快速、基本）、`standard`（平衡）和 `pro`（深入、較慢）。</x-field-desc>
    </x-field>
  </x-field>
  <x-field data-name="documentPurpose" data-type="array" data-required="true">
    <x-field-desc markdown>定義文件的主要目標。範例包括用於入門指南的 `getStarted` 或用於程序性說明的 `completeTasks`。</x-field-desc>
  </x-field>
  <x-field data-name="targetAudienceTypes" data-type="array" data-required="true">
    <x-field-desc markdown>指定預期的讀者。範例包括非技術人員的 `endUsers` 或工程師的 `developers`。</x-field-desc>
  </x-field>
  <x-field data-name="readerKnowledgeLevel" data-type="string" data-required="true">
    <x-field-desc markdown>描述目標受眾假定的技術知識水平，例如 `completeBeginners`。</x-field-desc>
  </x-field>
  <x-field data-name="documentationDepth" data-type="string" data-required="true">
    <x-field-desc markdown>控制所產生內容的詳細程度。選項範圍從 `essentialOnly` 到 `comprehensive`。</x-field-desc>
  </x-field>
  <x-field data-name="rules" data-type="string" data-required="false">
    <x-field-desc markdown>一組自訂指令或約束，供 AI 在內容產生過程中遵循。</x-field-desc>
  </x-field>
  <x-field data-name="locale" data-type="string" data-required="true" data-default="en">
    <x-field-desc markdown>文件的主要語言代碼，例如 `en` 代表英文。</x-field-desc>
  </x-field>
  <x-field data-name="translateLanguages" data-type="array" data-required="false">
    <x-field-desc markdown>文件應翻譯成的語言代碼列表，例如 `zh`（中文）或 `ja`（日文）。</x-field-desc>
  </x-field>
  <x-field data-name="docsDir" data-type="string" data-required="true">
    <x-field-desc markdown>儲存所產生文件檔案的本地目錄路徑。</x-field-desc>
  </x-field>
  <x-field data-name="sourcesPath" data-type="array" data-required="true">
    <x-field-desc markdown>工具應分析以產生文件的來源檔案、目錄或 glob 模式的列表。</x-field-desc>
  </x-field>
  <x-field data-name="media" data-type="object" data-required="false">
    <x-field-desc markdown>媒體檔案處理的設定。</x-field-desc>
    <x-field data-name="minImageWidth" data-type="number" data-default="800" data-required="false">
      <x-field-desc markdown>只有寬度超過此值（以像素為單位）的圖片才會用於頁面產生。</x-field-desc>
    </x-field>
  </x-field>
</x-field-group>

## 總結

一個定義明確的設定對於產生準確、相關且有效的文件至關重要。透過完成初始設定並瞭解 `config.yaml` 檔案，您為所有文件任務奠定了堅實的基礎。

若要繼續設定您的專案，請參閱以下指南：

*   **[初始設定](./configuration-initial-setup.md)**：建立您專案的 `config.yaml` 檔案。
*   **[管理偏好](./configuration-managing-preferences.md)**：使用個人規則自訂工具的行為。