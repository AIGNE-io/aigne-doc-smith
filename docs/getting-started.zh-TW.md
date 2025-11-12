# 入門指南

本指南提供安裝 AIGNE DocSmith 並產生第一組文件的直接、逐步程序。此過程設計為在幾分鐘內完成，讓您能夠以最少的設定從專案檔案中產生文件。

下圖說明了從安裝到產生的關鍵步驟：

```d2
direction: down

Developer: {
  shape: c4-person
}

Terminal: {
  label: "終端機"
  shape: rectangle
}

Installation: {
  label: "安裝"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  Install-CLI: {
    label: "1. 安裝 AIGNE CLI"
    shape: oval
  }

  Verify-Installation: {
    label: "2. 驗證安裝"
    shape: oval
  }
}

Generation: {
  label: "產生"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  Run-Generate: {
    label: "3. 執行產生指令"
    shape: oval
  }

  Interactive-Setup: {
    label: "4. 完成互動式設定"
    shape: diamond
  }

  Automated-Process: {
    label: "5. 自動化產生"
    shape: rectangle

    Analyze-Code: {
      label: "分析程式碼庫"
    }

    Plan-Structure: {
      label: "規劃結構"
    }

    Generate-Content: {
      label: "產生內容"
    }
  }

  Output-Docs: {
    label: "6. 文件已產生"
    shape: oval
  }

  Analyze-Code -> Plan-Structure
  Plan-Structure -> Generate-Content
}

Developer -> Terminal: "執行指令"
Terminal -> Installation.Install-CLI: "`npm install -g @aigne/cli`"
Installation.Install-CLI -> Installation.Verify-Installation: "`aigne doc --help`"
Installation.Verify-Installation -> Generation.Run-Generate: "`aigne doc create`"
Generation.Run-Generate -> Generation.Interactive-Setup: "首次執行"
Generation.Interactive-Setup -> Generation.Automated-Process: "儲存 config.yaml"
Generation.Automated-Process -> Generation.Output-Docs: "輸出至 docs/ 資料夾"
Generation.Output-Docs -> Developer: "檢閱文件"
```

## 先決條件

在進行安裝之前，請確保您的系統符合以下要求：

*   **Node.js**：需要 20 或更新版本。AIGNE DocSmith 使用 Node Package Manager (npm) 安裝，該工具隨 Node.js 一併安裝。若要安裝 Node.js，請造訪官方 [Node.js 網站](https://nodejs.org/) 並遵循您作業系統的指示。您可以透過開啟終端機並執行 `node -v` 和 `npm -v` 來驗證安裝。

開始時無需任何 API 金鑰。預設情況下，DocSmith 使用 AIGNE Hub 服務進行 AI 驅動的產生，無需直接設定即可存取各種大型語言模型。

## 安裝

該工具是作為 AIGNE 命令列介面 (CLI) 的一部分發布。安裝過程包含兩個主要步驟。

### 步驟 1：安裝 AIGNE CLI

若要在您的系統上全域安裝 AIGNE CLI，請在您的終端機中執行以下指令。這將使 `aigne` 指令在任何目錄中都可使用。

```bash 安裝 AIGNE CLI icon=lucide:terminal
npm install -g @aigne/cli
```

### 步驟 2：驗證安裝

安裝完成後，您可以透過執行文件工具的說明指令來確認其是否成功。

```bash 驗證安裝 icon=lucide:terminal
aigne doc --help
```

成功的安裝將會顯示 DocSmith 可用指令及其選項的列表。

## 產生您的第一份文件

請遵循以下步驟來分析您的專案並產生一套完整的文件。

### 步驟 1：導覽至您的專案目錄

開啟您的終端機並使用 `cd` 指令將目前目錄變更為您打算撰寫文件之專案的根目錄。

```bash 變更目錄 icon=mdi:folder-open
cd /path/to/your/project
```

### 步驟 2：執行產生指令

執行 `generate` 指令。這個單一指令會啟動整個文件建立過程，從專案分析到內容產生。

```bash 執行產生指令 icon=lucide:terminal
aigne doc create
```

### 步驟 3：完成互動式設定

當您首次在專案中執行 `generate` 指令時，DocSmith 會啟動一次性的互動式設定過程。系統將引導您回答一系列問題，以設定您的文件偏好，例如其目的、目標受眾和主要語言。

![互動式設定過程的螢幕截圖](../assets/screenshots/doc-complete-setup.png)

這些設定會儲存到位於 `.aigne/doc-smith` 目錄中的 `config.yaml` 檔案，您可以隨時手動修改。

### 步驟 4：等待產生

設定完成後，DocSmith 將自動執行以下操作：

1.  **分析程式碼庫**：掃描您的原始檔以了解專案的結構和邏輯。
2.  **規劃結構**：為文件建立一個邏輯大綱，定義章節和主題。
3.  **產生內容**：根據分析和您指定的設定來撰寫文件。

完成後，將會顯示一則確認訊息。產生的檔案將位於設定過程中指定的輸出目錄中，預設為 `.aigne/doc-smith/docs`。

![產生成功後的成功訊息螢幕截圖](../assets/screenshots/doc-generated-successfully.png)

## 接下來呢？

您現在已成功產生了第一組文件。以下是管理和增強文件的常見後續步驟：

<x-cards data-columns="2">
  <x-card data-title="更新文件" data-icon="lucide:refresh-cw" data-href="/guides/updating-documentation">
    修改或重新建立文件的特定部分，以反映程式碼變更或整合新的回饋。
  </x-card>
  <x-card data-title="本地化文件" data-icon="lucide:languages" data-href="/guides/translating-documentation">
    將您的文件本地化成 12 種支援的語言之一，包括中文、西班牙文和德文。
  </x-card>
  <x-card data-title="發布您的文件" data-icon="lucide:rocket" data-href="/guides/publishing-your-docs">
    讓您的文件在線上可供您的團隊或公眾存取。
  </x-card>
  <x-card data-title="檢閱設定" data-icon="lucide:settings" data-href="/configuration/initial-setup">
    檢閱並修改在初始設定期間建立的 `config.yaml` 檔案，以調整您的偏好。
  </x-card>
</x-cards>
