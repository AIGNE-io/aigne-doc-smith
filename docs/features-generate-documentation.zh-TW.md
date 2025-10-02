# 產生文件

`aigne doc generate` 指令是從您的原始碼建立一套完整文件的主要功能。此指令會啟動一個流程，分析您的程式碼庫、規劃一個合乎邏輯的文件結構，然後為每個部分產生內容。這是從初始狀態建立文件的標準方法。

## 首次產生

首先，請導覽至您專案的根目錄並執行以下指令：

```bash aigne doc generate icon=lucide:play-circle
aigne doc generate
```

### 自動設定

如果您是首次在專案中執行此指令，DocSmith 會偵測到沒有任何設定存在。接著，它會自動啟動一個互動式設定精靈，引導您完成所需的設定步驟。此流程確保在產生開始前，已有一份有效的設定。

![首次執行 generate 指令會觸發設定精靈](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

系統將提示您回答一系列問題，以定義您文件的關鍵面向，包括：

- 文件產生規則與風格
- 目標受眾
- 主要語言及任何額外的翻譯語言
- 原始碼輸入與文件輸出路徑

![回答問題以設定您的文件風格、語言及原始碼路徑](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

設定完成後，DocSmith 會繼續進行文件產生。

![DocSmith 會分析您的程式碼、規劃結構並產生每個文件](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

成功完成後，新建立的文件將可在設定期間指定的輸出目錄中找到。

![完成後，您將在指定的輸出目錄中找到新文件](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

## 產生流程

`generate` 指令會執行一個自動化的多步驟工作流程。流程概述如下：

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-CLI: {
  label: "AIGNE CLI"
}

Config-Check: {
  label: "設定檔\n是否存在？"
  shape: diamond
}

Setup-Wizard: {
  label: "互動式\n設定精靈"
}

Generation-Process: {
  label: "產生流程"
  grid-columns: 1

  Analyze: { label: "分析程式碼庫" }
  Plan: { label: "規劃結構" }
  Generate: { label: "產生內容" }
}

Source-Code: {
  label: "原始碼"
  shape: cylinder
}

Config-File: {
  label: "config.yaml"
  shape: cylinder
}

Output-Directory: {
  label: "輸出目錄"
  shape: cylinder
}

User -> AIGNE-CLI: "1. aigne doc generate"
AIGNE-CLI -> Config-Check: "2. 檢查設定檔"

Config-Check -> Setup-Wizard: "3a. 否"
Setup-Wizard -> User: "提示輸入"
User -> Setup-Wizard: "提供答案"
Setup-Wizard -> Config-File: "建立"
Config-File -> Generation-Process: "使用"
Setup-Wizard -> Generation-Process: "4. 繼續"

Config-Check -> Generation-Process: "3b. 是"

Source-Code -> Generation-Process.Analyze: "輸入"
Generation-Process.Analyze -> Generation-Process.Plan
Generation-Process.Plan -> Generation-Process.Generate
Generation-Process.Generate -> Output-Directory: "5. 寫入文件"

Output-Directory -> User: "6. 檢閱文件"
```

## 指令選項

預設的 `generate` 指令足以應對大多數使用情境。然而，有幾個選項可用於修改其行為，這在強制進行完整重新產生或改善文件結構時非常有用。

| 選項              | 說明                                                                                                                             | 範例                                                                 |
|---------------------|------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------|
| `--forceRegenerate` | 刪除所有現有文件並從頭開始重新產生。在對原始碼或設定進行重大變更後使用此選項。                                                       | `aigne doc generate --forceRegenerate`                                 |
| `--feedback`        | 提供高階回饋以改善整體文件結構，例如新增、移除或重組章節。                                                                 | `aigne doc generate --feedback "Add an API Reference section"`         |
| `--model`           | 指定使用 AIGNE Hub 中的特定大型語言模型來產生內容。這讓您可以在不同模型之間切換。                                                | `aigne doc generate --model anthropic:claude-3-5-sonnet`                |

## 下一步是什麼？

產生初始文件後，您的專案將繼續發展。為了讓您的文件與程式碼保持同步，您需要執行更新。下一節將說明如何根據新需求或程式碼修改進行針對性變更並重新產生特定檔案。

<x-card data-title="更新與改善" data-icon="lucide:file-edit" data-href="/features/update-and-refine">
  了解當您的程式碼變更時如何更新文件，或使用回饋進行特定改進。
</x-card>