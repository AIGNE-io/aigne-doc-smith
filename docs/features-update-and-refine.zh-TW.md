# 更新與完善

讓文件與不斷演進的程式碼庫保持同步是一項有條不紊的過程。AIGNE DocSmith 提供直接而靈活的指令，讓您能透過程式碼變更自動更新，或透過精確、由回饋驅動的完善方式，來保持內容的最新狀態。

本指南提供執行以下任務的程序：

*   在原始碼修改時自動更新文件。
*   使用針對性的回饋重新產生特定文件。
*   調整整體文件結構。

### 文件更新工作流程

下圖說明了更新文件可用的不同工作流程：

```d2 文件更新工作流程
direction: down

Developer: {
  shape: c4-person
  label: "開發者"
}

Source-Code: {
  label: "原始碼"
}

Documentation: {
  label: "文件"
}

Action-Choice: {
  label: "選擇操作"
  shape: diamond
}

Generate-Sync: {
  label: "aigne doc generate"
  shape: rectangle

  Change-Detection: {
    label: "偵測變更？"
    shape: diamond
  }
  Regenerate-Affected: "重新產生受影響部分"
  Regenerate-All: "全部重新產生"

  Change-Detection -> Regenerate-Affected: "是 (預設)"
  Change-Detection -> Regenerate-All: "否\n(--forceRegenerate)"
}

Refine-Content: {
  label: "aigne doc update"
}

Refine-Structure: {
  label: "aigne doc generate\n--feedback"
}

Developer -> Action-Choice

Action-Choice -> Generate-Sync: "與程式碼同步"
Action-Choice -> Refine-Content: "完善文件內容"
Action-Choice -> Refine-Structure: "完善文件結構"

Source-Code -> Generate-Sync

Generate-Sync.Regenerate-Affected -> Documentation: "更新"
Generate-Sync.Regenerate-All -> Documentation: "更新"
Refine-Content -> Documentation: "更新"
Refine-Structure -> Documentation: "更新"
```

---

## 透過變更偵測自動更新

當您執行 `aigne doc generate` 指令時，DocSmith 會先分析您的程式碼庫，以偵測自上次產生以來的變更。然後，它只會重新產生受這些變更影響的文件。這種預設行為可以節省時間並減少 API 使用量，避免了多餘的操作。

```shell icon=lucide:terminal
# DocSmith 將偵測變更並僅更新必要的部分
aigne doc generate
```

![DocSmith 偵測變更並僅重新產生所需的文件。](../assets/screenshots/doc-regenerate.png)

### 強制完整重新產生

若要從頭開始重新產生所有文件，繞過快取和變更偵測，請使用 `--forceRegenerate` 旗標。當您進行了重大的設定變更或需要完全重建以確保所有檔案的一致性時，這項操作是必要的。

```shell icon=lucide:terminal
# 從頭開始重新產生所有文件
aigne doc generate --forceRegenerate
```

---

## 透過回饋完善文件

您可以透過向 CLI 指令提供直接回饋，在沒有相應程式碼變更的情況下完善文件。這對於提高清晰度、新增範例或調整結構很有用。

### 完善個別文件內容

若要改善特定文件的內容，請使用 `aigne doc update` 指令。此指令允許您提供針對性的完善指示，並可以互動或非互動兩種模式執行。

#### 互動模式

若要進行引導式流程，請在不帶任何參數的情況下執行該指令。DocSmith 將會顯示一個選單，讓您選擇要更新的文件。選擇後，系統會提示您輸入回饋。

```shell icon=lucide:terminal
# 開始互動式更新流程
aigne doc update
```

![以互動方式選擇您希望更新的文件。](../assets/screenshots/doc-update.png)

#### 非互動模式

對於腳本化或更快速的工作流程，您可以使用旗標直接指定文件和回饋。這可以實現精確的非互動式更新。

```shell icon=lucide:terminal
# 透過回饋更新特定文件
aigne doc update --docs overview.md --feedback "Add a more detailed FAQ section at the end."
```

`update` 指令的主要參數如下：

| 參數 | 說明 |
| :--- | :--- |
| `--docs` | 要更新的文件的路徑。此旗標可多次使用以進行批次更新。 |
| `--feedback` | 一個字串，包含重新產生文件內容時要使用的具體指示。 |

### 最佳化整體結構

除了完善個別文件外，您還可以調整整體文件結構。如果現有組織結構不佳或缺少某個部分，您可以向 `generate` 指令提供回饋。這會指示 DocSmith 根據您的輸入重新評估整個文件計畫。

```shell icon=lucide:terminal
# 透過特定回饋重新產生文件結構
aigne doc generate --feedback "Remove the 'About' section and add a detailed 'API Reference'."
```

此方法適用於對文件目錄進行高層次的變更，而非針對單一檔案內的微小內容編輯。

內容完善後，下一步是為全球受眾做準備。相關說明，請參閱 [翻譯文件](./features-translate-documentation.md) 指南。