# 入門指南

本指南將逐步引導您安裝 AIGNE DocSmith、設定專案，並在幾分鐘內從您的原始碼產生一套完整的文件。

## 步驟 1：先決條件

在開始之前，請確保您的系統已安裝 Node.js 20 或更高版本。DocSmith 是一個在 Node.js 環境中運作的命令列工具。我們建議使用 Node.js 內建的 Node Package Manager (npm) 進行安裝。

關於詳細的安裝說明，請參閱官方 [Node.js 網站](https://nodejs.org/)。以下提供了適用於常見作業系統的簡要指南。

**Windows**
1.  從 [Node.js 下載頁面](https://nodejs.org/en/download) 下載 Windows 安裝程式 (`.msi`)。
2.  執行安裝程式，並依照設定精靈的提示進行操作。

**macOS**

建議的安裝方式是使用 [Homebrew](https://brew.sh/)，這是一個 macOS 的套件管理器。

```bash Terminal icon=lucide:apple
# 若尚未安裝 Homebrew，請先安裝
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安裝 Node.js
brew install node
```

或者，您也可以直接從 [Node.js 網站](https://nodejs.org/) 下載 macOS 安裝程式 (`.pkg`)。

**Linux**

對於 Debian 和基於 Ubuntu 的發行版，請使用以下指令：

```bash Terminal icon=lucide:laptop
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

對於 Red Hat、CentOS 和 Fedora，請使用以下指令：

```bash Terminal icon=lucide:laptop
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install nodejs
```

### 驗證安裝

安裝完成後，請開啟您的終端機並執行以下指令，以確認 Node.js 和 npm 已正確安裝：

```bash Terminal
node --version
npm --version
```

## 步驟 2：安裝 AIGNE CLI

DocSmith 工具是作為官方 AIGNE 命令列介面 (CLI) 的一部分發布的。請使用 npm 在您的系統上全域安裝 CLI：

```bash Terminal icon=logos:npm
npm install -g @aigne/cli
```

安裝完成後，請執行其說明指令來驗證 DocSmith 是否可用：

```bash Terminal
aigne doc --help
```

此指令應會顯示 DocSmith 的說明選單，確認其已安裝並可供使用。

## 步驟 3：產生您的文件

安裝 AIGNE CLI 後，您現在可以產生您的文件了。在您的終端機中，導覽至專案的根目錄，並執行以下指令：

```bash Terminal icon=lucide:sparkles
aigne doc generate
```

### 自動設定

當您首次在新專案中執行此指令時，DocSmith 會偵測到沒有設定檔存在，並會自動啟動一個互動式設定精靈來引導您完成整個過程。

此精靈將會詢問一系列問題，以定義您文件的特性，包括：

*   主要目的與寫作風格。
*   預期的目標讀者（例如：開發者、終端使用者）。
*   主要語言以及任何需要翻譯的其他語言。
*   供 AI 分析的原始碼路徑。
*   產生文件檔案的輸出目錄。

在您回答完提示後，DocSmith 會將您的選擇儲存到一個設定檔中，接著開始分析您的程式碼庫、規劃文件結構並產生內容。

## 步驟 4：檢視您的產出

當產生過程完成後，您的終端機中會出現一則確認訊息，表示您的文件已成功建立。您的新文件現在位於您在設定過程中指定的輸出目錄中。若您使用預設設定，可以在 `.aigne/doc-smith/docs` 中找到它。

## 接下來呢？

您已成功產生第一份文件。現在，您可以開始探索更進階的功能與自訂選項。

<x-cards>
  <x-card data-title="核心功能" data-icon="lucide:box" data-href="/features">
    探索主要指令與功能，從更新文件到線上發布。
  </x-card>
  <x-card data-title="設定指南" data-icon="lucide:settings" data-href="/configuration">
    學習如何透過編輯設定檔來微調您文件的風格、目標讀者及語言。
  </x-card>
  <x-card data-title="CLI 指令參考" data-icon="lucide:terminal" data-href="/cli-reference">
    取得所有可用 `aigne doc` 指令及其選項的完整參考。
  </x-card>
</x-cards>