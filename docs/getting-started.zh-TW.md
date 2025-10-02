# 入門指南

本指南將逐步引導您安裝 AIGNE DocSmith、設定專案，並從您的原始碼產生一套完整的文件。

## 步驟 1：先決條件

在開始之前，請確保您的系統上已安裝 Node.js 及其套件管理器 npm。DocSmith 是一個在 Node.js 環境中運行的命令列工具。

### 安裝 Node.js

以下是在各種作業系統上安裝 Node.js 的簡要說明。

**Windows**
1.  從官方 [Node.js 網站](https://nodejs.org/) 下載安裝程式。
2.  執行 `.msi` 安裝程式並依照安裝精靈的步驟進行。

**macOS**

建議的方法是使用 [Homebrew](https://brew.sh/)：

```bash Terminal icon=lucide:apple
# 如果您尚未安裝 Homebrew，請先安裝
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安裝 Node.js
brew install node
```

或者，您也可以從 [Node.js 網站](https://nodejs.org/) 下載 `.pkg` 安裝程式。

**Linux**

對於基於 Ubuntu/Debian 的系統：

```bash Terminal icon=lucide:laptop
sudo apt update
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

對於 CentOS/RHEL/Fedora 系統：

```bash Terminal icon=lucide:laptop
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install nodejs
```

### 驗證

安裝完成後，請在您的終端機中執行以下指令，以驗證 Node.js 和 npm 是否可用：

```bash Terminal
node --version
npm --version
```

## 步驟 2：安裝 AIGNE CLI

DocSmith 工具包含在 AIGNE 命令列介面 (CLI) 中。請使用 npm 全域安裝最新版本的 AIGNE CLI：

```bash Terminal icon=logos:npm
npm i -g @aigne/cli
```

安裝完成後，請執行文件工具的說明指令來進行驗證：

```bash Terminal
aigne doc -h
```

此指令將顯示 DocSmith 的說明選單，確認其已準備就緒可供使用。

## 步驟 3：產生您的文件

安裝 CLI 後，您只需一個指令即可產生文件。請在終端機中導覽至您專案的根目錄並執行：

```bash Terminal icon=lucide:sparkles
aigne doc generate
```

### 自動設定

當您首次在專案中執行此指令時，DocSmith 會偵測到尚無設定檔，並自動啟動互動式設定精靈。

![執行 generate 指令會啟動設定精靈](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

系統將會提示您回答一系列問題，以定義文件的特性，包括：

- 主要目的與風格。
- 預期的目標讀者。
- 主要語言以及任何用於翻譯的其他語言。
- 供 AI 分析的原始碼路徑。
- 產生文件的輸出目錄。

![回答提示以完成專案設定](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

設定完成後，DocSmith 將會開始分析您的原始碼、規劃文件結構並產生內容。

![DocSmith 正在規劃結構並產生文件](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

## 步驟 4：檢視您的產出

產生過程結束後，您的終端機中將會顯示一則確認訊息。

![文件成功產生的訊息](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

您的新文件現在位於您在設定過程中指定的輸出目錄中。預設位置為 `.aigne/doc-smith/docs`。

## 下一步是什麼？

既然您已產生了第一份文件，您可以探索其他功能：

<x-cards>
  <x-card data-title="核心功能" data-icon="lucide:box" data-href="/features">
    探索主要指令與功能，從更新文件到線上發佈。
  </x-card>
  <x-card data-title="設定指南" data-icon="lucide:settings" data-href="/configuration">
    了解如何透過編輯 config.yaml 檔案來微調文件的風格、目標讀者和語言。
  </x-card>
  <x-card data-title="CLI 指令參考" data-icon="lucide:terminal" data-href="/cli-reference">
    取得所有可用的 `aigne doc` 指令及其選項的完整參考。
  </x-card>
</x-cards>