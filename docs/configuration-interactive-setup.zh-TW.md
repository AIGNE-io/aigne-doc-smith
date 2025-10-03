# 互動式設定

AIGNE DocSmith 包含一個互動式設定精靈，可透過 `aigne doc init` 指令啟動，以簡化專案設定。此引導式流程會詢問一系列關於您文件目標的問題，並根據您的回答產生一個 `config.yaml` 檔案。這是建議用來啟動新文件專案的方法，因為它有助於防止設定錯誤，並根據您的輸入提供具體建議。

## 執行精靈

若要開始此流程，請在您專案的根目錄中執行以下指令：

```bash aigne doc init icon=lucide:sparkles
npx aigne doc init
```

精靈接著會引導您完成一個 8 步驟的流程來設定您的文件。

## 引導式流程

精靈會提示您輸入以下關鍵設定細節：

1.  **主要目標**：定義讀者的主要目的（例如，快速入門、尋找答案）。
2.  **目標受眾**：指定文件的主要讀者（例如，非技術性終端使用者、開發者）。
3.  **讀者知識水平**：評估您受眾的典型起始知識水平。
4.  **文件深度**：決定內容的細節程度與範圍。
5.  **主要語言**：設定文件的主要語言。
6.  **翻譯語言**：選擇要翻譯的其他語言。
7.  **輸出目錄**：指定產生文件檔案的位置。
8.  **原始碼路徑**：定義要分析的檔案和目錄，支援 glob 模式。

## 輔助設定

精靈使用一套預定義的規則來幫助您建立一個一致且有效的設定。

```d2
direction: down

User-Selections: {
  label: "1. 使用者提供輸入\n（目的、受眾等）"
  shape: rectangle
}

Wizard-Engine: {
  label: "2. 精靈的規則引擎"
  shape: rectangle
  grid-columns: 2

  Filtering: {
    label: "選項篩選\n（防止不相容的選擇）"
  }

  Conflict-Detection: {
    label: "衝突偵測\n（識別複雜需求）"
  }
}

Guided-Experience: {
  label: "3. 引導式體驗"
  shape: rectangle
  content: "使用者看到簡化且相關的選項"
}

Final-Config: {
  label: "4. 最終設定"
  content: "config.yaml 根據\n衝突解決策略生成"
}

User-Selections -> Wizard-Engine
Wizard-Engine.Filtering -> Guided-Experience
Wizard-Engine.Conflict-Detection -> Final-Config
Guided-Experience -> User-Selections: "調整"
```

### 選項篩選

當您做出選擇時，精靈會篩選後續的選項，以引導您達成一個邏輯性的設定。這是基於一套跨問題衝突規則，可防止不相容的選擇。

例如，如果您選擇「終端使用者（非技術人員）」作為您的目標受眾，精靈將會隱藏「是專家」的知識水平選項。該規則的理由是「非技術性使用者通常不是經驗豐富的技術使用者」，從而防止不合邏輯的選擇。

### 衝突偵測與解決

在某些情況下，您可能有多個目標或受眾，需要特定的文件結構才能有效，例如為非技術性的**終端使用者**和專業的**開發者**建立文件。精靈會將這些識別為「可解決的衝突」。

然後，它會制定一個策略來在文件結構中滿足這些需求。對於終端使用者與開發者的例子，解決策略是建立獨立的使用者路徑：

-   **使用者指南路徑**：使用淺顯的語言，著重於 UI 互動，並以業務成果為導向。
-   **開發者指南路徑**：以程式碼優先，技術上精確，並包含 SDK 範例和設定片段。

這種方法確保最終的文件結構能有效地服務多個受眾，而不是創造一個單一、混亂的內容混合體。

## 產生的輸出

在您完成精靈後，它會在您的專案中儲存一個 `config.yaml` 檔案。此檔案有完整的註解，解釋了每個選項並列出所有可用選擇，這使得日後手動檢視和修改變得容易。

以下是產生的檔案片段：

```yaml config.yaml icon=logos:yaml
# 文件發布的專案資訊
projectName: your-project-name
projectDesc: Your project description.
projectLogo: ""

# =============================================================================
# 文件設定
# =============================================================================

# 目的：您希望讀者達成的最主要成果是什麼？
# 可用選項（取消註解並根據需要修改）：
#   getStarted       - 快速入門：幫助新使用者在 30 分鐘內從零到上手
#   completeTasks    - 完成特定任務：引導使用者完成常見工作流程與使用案例
documentPurpose:
  - completeTasks
  - findAnswers

# 目標受眾：誰會最常閱讀此文件？
# 可用選項（取消註解並根據需要修改）：
#   endUsers         - 終端使用者（非技術人員）：使用產品但不寫程式的人
#   developers       - 開發者整合您的產品/API：將此加入其專案的工程師
targetAudienceTypes:
  - endUsers
  - developers

# ... other settings
```

## 後續步驟

設定檔案就緒後，您就可以產生、翻譯或發布您的文件了。

<x-cards>
  <x-card data-title="產生文件" data-icon="lucide:play-circle" data-href="/features/generate-documentation">
    了解如何使用單一指令從您的原始碼自動建立一套完整的文件。
  </x-card>
  <x-card data-title="設定指南" data-icon="lucide:settings" data-href="/configuration">
    深入了解所有可用的設定，並學習如何手動微調 config.yaml 檔案。
  </x-card>
</x-cards>