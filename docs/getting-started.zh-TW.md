# 入門指南

本指南提供安裝 AIGNE DocSmith 並產生您第一份文件的逐步流程。此過程設計得簡單明瞭，可在幾分鐘內完成。

## 先決條件

在開始安裝之前，請確保您的系統符合以下要求：

*   **Node.js**：需要版本 20 或更新版本。DocSmith 使用節點套件管理器 (npm) 安裝，該管理器隨附於 Node.js 的安裝中。若要安裝 Node.js，請造訪官方 [Node.js 網站](https://nodejs.org/) 並按照您作業系統的說明進行操作。您可以透過開啟終端機並執行 `node -v` 和 `npm -v` 來驗證安裝。

*   **API 金鑰**：開始時不需要任何 API 金鑰。預設情況下，DocSmith 使用 AIGNE Hub 服務進行 AI 驅動的產生，讓您無需直接設定即可使用各種大型語言模型。

## 安裝

此工具作為 AIGNE 命令列介面 (CLI) 的一部分進行分發。安裝過程包含兩個簡單的步驟。

### 步驟 1：安裝 AIGNE CLI

若要在您的系統上全域安裝 AIGNE CLI，請在終端機中執行以下指令：

```bash title="Install AIGNE CLI" icon=logos:npm-icon
npm install -g @aigne/cli
```

此指令會從 npm 註冊庫下載並安裝套件，讓 `aigne` 指令在您終端機的任何目錄中都可用。

### 步驟 2：驗證安裝

安裝完成後，您可以執行文件工具的說明指令來進行驗證：

```bash title="Verify Installation"
aigne doc --help
```

此指令應會顯示可用的 DocSmith 指令及其選項列表，這確認了安裝已成功。

## 產生您的第一份文件

請按照以下步驟分析您的專案並產生一套完整的文件。

### 步驟 1：導覽至您的專案目錄

開啟您的終端機並使用 `cd` 指令將目前目錄切換到您希望建立文件的專案根目錄。

```bash title="Change Directory" icon=mdi:folder-open
cd /path/to/your/project
```

### 步驟 2：執行產生指令

執行主要的 `generate` 指令。這個單一指令會處理從分析到內容產生的整個文件建立過程。

```bash title="Run Generate Command"
aigne doc generate
```

### 步驟 3：完成互動式設定

當您首次在專案中執行 `generate` 指令時，DocSmith 將啟動一次性的互動式設定過程。系統將引導您回答一系列問題，以設定您的文件偏好，例如其主要目的、目標受眾和語言。

![互動式設定過程的螢幕截圖](../assets/screenshots/doc-complete-setup.png)

您的答案會儲存到位於 `.aigne/doc-smith` 目錄中的 `config.yaml` 檔案。如果需要，此檔案稍後可以手動編輯。

### 步驟 4：等待產生

設定完成後，DocSmith 將自動執行以下操作：

1.  **分析程式碼庫**：掃描您的原始檔案以了解專案的結構、功能和邏輯。
2.  **規劃結構**：為文件建立一個邏輯計畫，概述章節和主題。
3.  **產生內容**：根據分析和您的設定撰寫文件內容。

完成後，將會出現一則確認訊息，產生的檔案將位於設定期間指定的輸出目錄中（預設為 `.aigne/doc-smith/docs`）。

![產生成功後的訊息螢幕截圖](../assets/screenshots/doc-generated-successfully.png)

## 接下來呢？

您已成功產生您的第一份文件。以下是管理和增強您文件的常見後續步驟：

<x-cards data-columns="2">
  <x-card data-title="更新文件" data-icon="lucide:refresh-cw" data-href="/guides/updating-documentation">
    根據程式碼變更或新需求，修改或重新產生文件的特定部分。
  </x-card>
  <x-card data-title="翻譯文件" data-icon="lucide:languages" data-href="/guides/translating-documentation">
    將您的文件翻譯成 12 種支援的任何一種語言，例如中文、西班牙文或德文。
  </x-card>
  <x-card data-title="發佈您的文件" data-icon="lucide:rocket" data-href="/guides/publishing-your-docs">
    將您的文件發佈到網路上，供您的團隊或公眾使用。
  </x-card>
  <x-card data-title="檢視設定" data-icon="lucide:settings" data-href="/configuration/initial-setup">
    檢視並修改在初始設定期間建立的 config.yaml 檔案，以調整您的偏好設定。
  </x-card>
</x-cards>