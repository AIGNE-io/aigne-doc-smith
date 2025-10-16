# 入門指南

本指南提供安裝 AIGNE DocSmith 並產生您第一份文件的逐步流程。整個過程設計得相當簡單，幾分鐘內即可完成。

## 先決條件

在進行安裝之前，請確保您的系統符合以下要求：

*   **Node.js**：需要版本 20 或更新版本。DocSmith 是使用 Node Package Manager (npm) 安裝的，npm 已包含在 Node.js 的安裝中。若要安裝 Node.js，請造訪官方 [Node.js 網站](https://nodejs.org/) 並遵循您作業系統的指示。您可以開啟終端機並執行 `node -v` 和 `npm -v` 來驗證安裝。

*   **API 金鑰**：開始時不需要任何 API 金鑰。預設情況下，DocSmith 使用 AIGNE Hub 服務進行 AI 驅動的產生，讓您無需直接設定即可使用各種大型語言模型。

## 安裝

此工具是作為 AIGNE 命令列介面 (CLI) 的一部分發布。安裝過程包含兩個簡單的步驟。

### 步驟 1：安裝 AIGNE CLI

若要在您的系統上全域安裝 AIGNE CLI，請在終端機中執行以下命令：

```bash title="安裝 AIGNE CLI" icon=logos:npm-icon
npm install -g @aigne/cli
```

此命令會從 npm 註冊中心下載並安裝套件，讓您可以在終端機的任何目錄中使用 `aigne` 命令。

### 步驟 2：驗證安裝

安裝完成後，您可以執行文件工具的說明命令來進行驗證：

```bash title="驗證安裝"
aigne doc --help
```

此命令應會顯示 DocSmith 的可用命令及其選項列表，這表示安裝已成功。

## 產生您的第一份文件

請遵循以下步驟來分析您的專案並產生一套完整的文件。

### 步驟 1：導覽至您的專案目錄

開啟您的終端機，並使用 `cd` 命令將目前目錄變更為您想要建立文件的專案根目錄。

```bash title="變更目錄" icon=mdi:folder-open
cd /path/to/your/project
```

### 步驟 2：執行 generate 命令

執行主要的 `generate` 命令。這個單一命令會處理從分析到內容產生的整個文件建立過程。

```bash title="執行 generate 命令"
aigne doc generate
```

### 步驟 3：完成互動式設定

當您第一次在專案中執行 `generate` 命令時，DocSmith 將啟動一次性的互動式設定過程。系統將引導您回答一系列問題，以設定您的文件偏好，例如主要目的、目標受眾和語言。

![互動式設定過程的螢幕截圖](../assets/screenshots/doc-complete-setup.png)

您的回答會儲存至位於 `.aigne/doc-smith` 目錄中的 `config.yaml` 檔案。如果需要，您之後可以手動編輯此檔案。

### 步驟 4：等待產生

設定完成後，DocSmith 將自動執行以下操作：

1.  **分析程式碼庫**：掃描您的原始檔案以了解專案的結構、功能和邏輯。
2.  **規劃結構**：為文件建立一個邏輯計畫，概述章節和主題。
3.  **產生內容**：根據分析和您的設定撰寫文件內容。

完成後，將會出現一則確認訊息，產生的檔案將位於設定時指定的輸出目錄中（預設為 `.aigne/doc-smith/docs`）。

![產生成功後的成功訊息螢幕截圖](../assets/screenshots/doc-generated-successfully.png)

## 探索所有命令

DocSmith 提供了一組命令來管理您文件的完整生命週期。下表列出了所有可用的命令及其功能。

| Command     | Description                                                                                                   |
| :---------- | :------------------------------------------------------------------------------------------------------------ |
| `generate`  | 分析程式碼庫並根據設定產生一套完整的文件。               |
| `update`    | 以互動方式選取並重新產生現有文件的特定部分，通常會附上新的回饋。      |
| `translate` | 將現有文件翻譯成一種或多種支援的 12 種語言，例如 `zh` 或 `ja`。       |
| `publish`   | 將產生的文件發布到一個線上平台，使其可透過 URL 存取。                     |
| `init`      | 啟動互動式設定精靈以建立或覆寫 `config.yaml` 設定檔。              |
| `prefs`     | 顯示 `config.yaml` 檔案中目前的設定。                                      |
| `eval`      | 評估所產生文件的品質和完整性。                                        |
| `history`   | 顯示對文件所做的更新歷史記錄。                                                       |
| `clear`     | 移除產生的檔案、設定和快取資料。                                                     |

## 接下來呢？

您已成功產生第一份文件。以下是管理和強化您文件的常見後續步驟：

<x-cards data-columns="2">
  <x-card data-title="更新文件" data-icon="lucide:refresh-cw" data-href="/guides/updating-documentation">
    根據程式碼變更或新需求，修改或重新產生您文件的特定部分。
  </x-card>
  <x-card data-title="翻譯文件" data-icon="lucide:languages" data-href="/guides/translating-documentation">
    將您的文件翻譯成 12 種支援的語言中的任何一種，例如中文、西班牙文或德文。
  </x-card>
  <x-card data-title="發布您的文件" data-icon="lucide:rocket" data-href="/guides/publishing-your-docs">
    將您的文件發布到網路上，供您的團隊或大眾使用。
  </x-card>
  <x-card data-title="檢閱設定" data-icon="lucide:settings" data-href="/configuration/initial-setup">
    檢閱並修改在初始設定期間建立的 config.yaml 檔案，以調整您的偏好。
  </x-card>
</x-cards>