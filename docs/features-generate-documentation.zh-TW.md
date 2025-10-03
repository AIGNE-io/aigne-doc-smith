# 產生文件

`aigne doc generate` 指令是從原始程式碼建立完整文件集的主要功能。此指令會啟動一個流程，分析您的程式碼庫、規劃邏輯性的文件結構，然後為每個部分產生內容。這是從初始狀態建立文件的標準方法。

## 首次產生

首先，請導覽至您專案的根目錄並執行以下指令：

```bash aigne doc generate icon=lucide:play-circle
aigne doc generate
```

### 自動設定

如果您是首次在專案中執行此指令，DocSmith 將偵測到沒有任何設定存在。然後，它會自動啟動一個互動式設定精靈，引導您完成所需的設定步驟。此過程可確保在開始產生文件之前，有一個有效的設定。

![執行 generate 指令，智慧執行初始化](../assets/screenshots/doc-generate.png)

系統會提示您回答一系列問題，以定義文件的關鍵面向，包括：

*   文件產生規則與風格
*   目標受眾
*   主要語言及任何其他翻譯語言
*   原始程式碼輸入與文件輸出路徑

![回答問題以完成專案設定](../assets/screenshots/doc-complete-setup.png)

設定完成後，DocSmith 會繼續進行文件產生。

![執行結構規劃並產生文件](../assets/screenshots/doc-generate-docs.png)

成功完成後，新建立的文件將可在設定時指定的輸出目錄中找到。

![文件成功產生](../assets/screenshots/doc-generated-successfully.png)

## 產生流程

`generate` 指令會執行一個自動化的多步驟工作流程。流程概述如下：

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-CLI: {
  label: "AIGNE CLI"

  config-check: {
    label: "設定檔是否存在？"
    shape: diamond
  }

  interactive-setup: {
    label: "互動式設定精靈"
  }

  generation-process: {
    label: "3. 產生流程"

    analyze-code: "分析程式碼"
    plan-structure: "規劃結構"
    generate-content: "產生內容"

    analyze-code -> plan-structure -> generate-content
  }

  output: {
    label: "輸出目錄"
  }
}

User -> AIGNE-CLI.config-check: "'aigne doc generate'"
AIGNE-CLI.config-check -> AIGNE-CLI.interactive-setup: "[否] 2. 啟動設定"
AIGNE-CLI.interactive-setup -> AIGNE-CLI.generation-process: "建立設定檔"
AIGNE-CLI.config-check -> AIGNE-CLI.generation-process: "[是]"
AIGNE-CLI.generation-process -> AIGNE-CLI.output: "4. 寫入文件"
```

## 指令選項

預設的 `generate` 指令足以應付大多數使用情境。然而，有幾個選項可用於修改其行為，這對於強制完整重新產生或完善文件結構非常有用。

| 選項 | 描述 | 範例 |
| :------------------ | :----------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------- |
| `--forceRegenerate` | 刪除所有現有文件並從頭開始重新產生。在對原始程式碼或設定進行重大變更後使用此選項。 | `aigne doc generate --forceRegenerate` |
| `--feedback` | 提供高層次的回饋以完善整體文件結構，例如新增、移除或重組章節。 | `aigne doc generate --feedback "Add an API Reference"` |
| `--model` | 指定從 AIGNE Hub 使用特定的大型語言模型來產生內容，讓您可以在不同模型之間切換。 | `aigne doc generate --model openai:gpt-4o` |

## 下一步是什麼？

產生初始文件後，您的專案將會持續演進。為了讓您的文件與程式碼保持同步，您需要執行更新。下一節將說明如何根據新的需求或程式碼修改進行針對性變更並重新產生特定檔案。

<x-card data-title="更新與完善" data-icon="lucide:file-edit" data-href="/features/update-and-refine">學習如何在程式碼變更時更新文件，或使用回饋進行特定改進。</x-card>