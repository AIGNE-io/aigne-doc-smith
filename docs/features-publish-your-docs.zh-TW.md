# 發布您的文件

產生文件後，`aigne doc publish` 指令會將您的內容上傳到 Discuss Kit 平台，使其可以在線上存取。本指南將說明如何將您的文件發布到官方平台或您自己託管的網站。

## 發布流程

`aigne doc publish` 指令會啟動一個互動式流程。當您首次發布到新目標時，它會引導您進行身份驗證。後續的發布將使用已儲存的憑證。

```d2 發布流程 icon=lucide:upload-cloud
direction: down
shape: sequence_diagram

使用者: { shape: c4-person }
CLI: { label: "AIGNE CLI" }
瀏覽器: { label: "瀏覽器" }
平台: { label: "Discuss Kit 平台" }

使用者 -> CLI: "aigne doc publish"

alt: "首次發布或缺少設定" {
  CLI -> 使用者: "選擇平台\n(官方 / 自行託管)"
  使用者 -> CLI: "提供選擇"
  CLI -> 瀏覽器: "開啟驗證 URL"
  使用者 -> 瀏覽器: "登入並授權"
  瀏覽器 -> 平台: "傳送憑證"
  平台 -> CLI: "返回存取權杖"
  CLI -> CLI: "儲存權杖以供未來使用"
}

CLI -> 平台: "上傳文件與媒體檔案"
平台 -> CLI: "成功回應"
CLI -> 使用者: "✅ 發布成功！"

```

## 發布選項

您有兩種主要選項來託管您的文件：

<x-cards data-columns="2">
  <x-card data-title="官方平台" data-icon="lucide:globe">
    發布到 [docsmith.aigne.io](https://docsmith.aigne.io/app/)，這是由 AIGNE 提供的免費公開託管平台。對於開源專案或需要快速分享文件的情況，這是一個不錯的選擇。
  </x-card>
  <x-card data-title="您自己的網站" data-icon="lucide:server">
    發布到您自己的 Discuss Kit 實例，以完全控制存取權限和品牌。這適用於內部或私密文件。您可以從 [Blocklet 商店](https://store.blocklet.dev/blocklets/z8ia1WEiBZ7hxURf6LwH21Wpg99vophFwSJdu) 取得 Discuss Kit 實例。
  </x-card>
</x-cards>

## 步驟指南

請按照以下步驟首次發布您的文件。

### 1. 執行發布指令

在您專案的根目錄中，執行以下指令：

```bash Terminal icon=lucide:terminal
aigne doc publish
```

### 2. 選擇您的平台

如果這是您第一次發布，系統會提示您選擇一個目標。請選擇符合您需求的選項。

![在官方平台或自行託管的實例之間選擇](https://docsmith.aigne.io/image-bin/uploads/9fd929060b5abe13d03cf5eb7aea85aa.png)

如果您選擇自己的網站，系統會要求您輸入其 URL。

### 3. 驗證您的帳戶

首次連接到新平台時，會開啟一個瀏覽器視窗讓您登入並授權 CLI。每個平台只需執行此步驟一次；您的存取權杖會儲存在本地的 `~/.aigne/doc-smith-connected.yaml` 檔案中，以供未來使用。

### 4. 確認

上傳完成後，您的終端機中會顯示一條成功訊息。

```
✅ 文件發布成功！
```

## 在 CI/CD 環境中發布

對於自動化工作流程，您可以提供參數和環境變數來繞過互動式提示。

| 方法 | 名稱 | 說明 |
|---|---|---|
| **參數** | `--appUrl` | 直接指定您的 Discuss Kit 實例的 URL。 |
| **環境變數** | `DOC_DISCUSS_KIT_ACCESS_TOKEN` | 提供存取權杖，跳過互動式登入。 |

以下是一個適合 CI/CD 管線的非互動式發布指令範例：

```bash CI/CD 範例 icon=lucide:workflow
export DOC_DISCUSS_KIT_ACCESS_TOKEN="your_access_token_here"
aigne doc publish --appUrl https://docs.mycompany.com
```

## 疑難排解

如果在發布過程中遇到問題，請檢查以下常見問題：

- **連線錯誤**：您提供的自行託管實例的 URL 可能不正確，或者伺服器無法連線。請驗證 URL 和您的網路連線。

- **無效的網站 URL**：該 URL 必須指向一個在 ArcBlock 平台上建立的有效網站。CLI 會顯示類似 `The provided URL is not a valid website on ArcBlock platform` 的錯誤。若要託管您的文件，您可以先從[商店取得 Discuss Kit 實例](https://store.blocklet.dev/blocklets/z8ia1WEiBZ7hxURf6LwH21Wpg99vophFwSJdu)。

- **缺少必要元件**：目標網站必須安裝 Discuss Kit 元件。如果缺少該元件，CLI 將返回類似 `This website does not have required components for publishing` 的錯誤。請參考 [Discuss Kit 文件](https://www.arcblock.io/docs/web3-kit/en/discuss-kit) 來新增必要的元件。

有關指令和選項的完整清單，請參考 [CLI 指令參考](./cli-reference.md)。