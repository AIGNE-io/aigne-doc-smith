# 發佈您的文件

在產生您的文件後，`aigne doc publish` 指令會上傳您的檔案，並透過一個可分享的連結讓它們可以被存取。本指南提供了將您的文件發佈到 AIGNE 官方平台或自架實例的逐步流程。

## 發佈流程

`aigne doc publish` 指令會啟動一個互動式工作流程。當您第一次發佈到特定目的地時，CLI 會開啟一個瀏覽器來引導您完成一次性的身份驗證過程。對於後續的發佈，它將使用儲存在 `~/.aigne/doc-smith-connected.yaml` 中的已存認證資訊。

```d2 The Publishing Workflow icon=lucide:upload-cloud
shape: sequence_diagram

User: {
  label: "開發者 / CI-CD"
  shape: c4-person
}

CLI: {
  label: "CLI\n(aigne doc publish)"
}

Local-Config: {
  label: "本機設定\n(~/.aigne/...)"
  shape: cylinder
}

Browser

Platform: {
  label: "平台\n(官方或自架)"
}

User -> CLI: "執行指令"

alt "互動模式" {
  CLI -> Local-Config: "檢查認證資訊"
  opt "未找到認證資訊 (首次)" {
    CLI -> User: "提示選擇平台"
    User -> CLI: "已選擇平台"
    CLI -> Browser: "開啟驗證 URL"
    User -> Browser: "登入並授權"
    Browser -> Platform: "請求權杖"
    Platform -> Browser: "返回權杖"
    Browser -> CLI: "將權杖傳送至 CLI"
    CLI -> Local-Config: "儲存認證資訊"
  }
  CLI -> Platform: "上傳文件"
  Platform -> CLI: "確認成功"
  CLI -> User: "顯示成功訊息"
}

alt "CI/CD 模式" {
  note over CLI: "從環境變數讀取權杖"
  CLI -> Platform: "上傳文件"
  Platform -> CLI: "確認成功"
  CLI -> User: "返回成功狀態"
}
```

## 發佈選項

您可以選擇兩個主要的目的地來託管您的文件：

<x-cards data-columns="2">
  <x-card data-title="官方平台" data-icon="lucide:globe">
    發佈到 docsmith.aigne.io，這是由 AIGNE 營運的服務。對於開源專案或希望快速公開分享文件的使用者來說，這是一個直接的選項。
  </x-card>
  <x-card data-title="自架實例" data-icon="lucide:server">
    發佈到您自己的 Discuss Kit 實例，以完全控制品牌、存取權限和資料隱私。對於內部或私有文件，這是建議的選項。您可以按照官方文件中提供的說明來運行您自己的 Discuss Kit 實例。
  </x-card>
</x-cards>

## 逐步指南

請按照以下步驟發佈您的文件。

### 1. 執行發佈指令

導覽至您專案的根目錄並執行以下指令：

```bash Terminal icon=lucide:terminal
aigne doc publish
```

### 2. 選擇您的平台

如果這是您第一次發佈，系統將提示您選擇一個目的地。請選擇符合您需求的選項。

![將文件發佈到官方平台或自架平台](../assets/screenshots/doc-publish.png)

如果您選擇自架實例，系統會要求您輸入其 URL。

### 3. 驗證您的帳戶

對於初次連線，瀏覽器視窗將自動開啟，讓您登入並授權 CLI。此步驟每個平台僅需執行一次。存取權杖會儲存在本機以供未來使用。

### 4. 確認

上傳完成後，您的終端機中將會出現一條成功訊息，確認文件已上線。

```
✅ 文件發佈成功！
```

## 在 CI/CD 環境中發佈

若要在 CI/CD 管線等自動化工作流程中使用發佈指令，您可以透過參數和環境變數提供必要的資訊，以繞過互動式提示。

| 方法 | 名稱 | 描述 |
|---|---|---|
| **參數** | `--appUrl` | 指定您的 Discuss Kit 實例的 URL。 |
| **環境變數** | `DOC_DISCUSS_KIT_ACCESS_TOKEN` | 提供存取權杖以跳過互動式登入過程。 |

以下是一個適用於 CI/CD 指令碼的非互動式發佈指令範例：

```bash CI/CD Example icon=lucide:workflow
export DOC_DISCUSS_KIT_ACCESS_TOKEN="your_access_token_here"
aigne doc publish --appUrl https://docs.mycompany.com
```

## 疑難排解

如果您在發佈過程中遇到問題，可能是由以下常見問題之一所引起。

- **連線錯誤**：CLI 可能會返回類似 `Unable to connect to: <URL>` 的錯誤訊息。這可能是由網路問題、伺服器暫時無法使用或 URL 不正確所引起。請確認 URL 是否正確且伺服器是否可連線。

- **無效的網站 URL**：指令可能會失敗並顯示訊息 `The provided URL is not a valid website on ArcBlock platform`。目的地 URL 必須是建立在 ArcBlock 平台上的網站。若要託管您的文件，您可以運行自己的 Discuss Kit 實例。

- **缺少必要元件**：出現 `This website does not have required components for publishing` 的錯誤訊息表示目的地網站未安裝 Discuss Kit 元件。請參考 Discuss Kit 文件，將必要的元件新增至您的網站。

有關完整的指令和選項列表，請參閱 [CLI 指令參考](./cli-reference.md)。