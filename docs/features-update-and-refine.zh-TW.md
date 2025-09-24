# 更新與優化

讓文件與不斷演進的程式碼庫保持同步是一項關鍵任務。AIGNE DocSmith 提供了直接且靈活的方法來讓您的內容保持最新，無論是透過基於程式碼變更的自動更新，還是透過精確、由回饋意見驅動的優化。

本指南涵蓋如何：

- 在您的原始碼變更時自動更新文件。
- 使用針對性的回饋意見重新生成特定文件。
- 調整整體文件結構。

### 文件更新工作流程

下圖說明了更新文件的不同路徑：

```d2 更新工作流程
direction: down

Start: {
  shape: circle
  label: "開始"
}

Code-Change: {
  label: "原始碼或\n設定檔變更"
  shape: rectangle
}

Content-Tweak: {
  label: "需要內容\n改善？"
  shape: rectangle
}

Structure-Tweak: {
  label: "需要結構\n改善？"
  shape: rectangle
}

Start -> Code-Change
Start -> Content-Tweak
Start -> Structure-Tweak

Code-Change -> Generate-Command: "aigne doc generate"

Generate-Command -> Change-Detection: {
  label: "變更偵測"
  shape: diamond
}
Change-Detection -> Auto-Regen: "重新生成\n受影響文件"

Content-Tweak -> Update-Command: "aigne doc update\n--feedback"
Update-Command -> Manual-Regen: "重新生成\n特定文件"

Structure-Tweak -> Generate-Feedback-Command: "aigne doc generate\n--feedback"
Generate-Feedback-Command -> Replan: "重新規劃文件\n結構"

End: {
  shape: circle
  label: "文件已更新"
}

Auto-Regen -> End
Manual-Regen -> End
Replan -> End
```

---

## 透過變更偵測自動更新

當您執行 `aigne doc generate` 命令時，DocSmith 會分析您的程式碼庫，偵測自上次執行以來的任何變更，並僅重新生成受影響的文件。此過程可節省時間並減少不必要的 API 呼叫。

```shell icon=lucide:terminal
# DocSmith 將偵測變更並僅更新必要部分
aigne doc generate
```

![DocSmith 偵測變更並僅重新生成所需文件。](https://docsmith.aigne.io/image-bin/uploads/21a76b2f65d14d16a49c13d800f1e2c1.png)

### 強制完整重新生成

如果您需要從頭開始重新生成所有文件，忽略任何快取或先前的狀態，請使用 `--forceRegenerate` 標記。這在進行重大的設定變更後，或當您想確保一個完全全新的建置時非常有用。

```shell icon=lucide:terminal
# 從頭開始重新生成所有文件
aigne doc generate --forceRegenerate
```

---

## 優化單一文件

若要在沒有相應程式碼變更的情況下改善特定文件，`aigne doc update` 命令允許您提供針對內容優化的具體指示。

您可以用兩種方式使用此命令：互動式或直接透過命令列參數。

### 互動模式

若要獲得引導式體驗，請在不帶任何參數的情況下執行此命令。DocSmith 將會顯示一個選單，讓您選擇要更新的文件。選擇後，系統會提示您輸入回饋意見。

```shell icon=lucide:terminal
# 開始互動式更新流程
aigne doc update
```

![以互動方式選擇您想更新的文件。](https://docsmith.aigne.io/image-bin/uploads/75e9cf9823bb369c3d2b5a2e2da4ac06.png)

### 直接透過命令列更新

為了更快速的工作流程或撰寫腳本，您可以使用標記直接指定文件和回饋意見。這允許進行精確、非互動式的更新。

```shell icon=lucide:terminal
# 帶有回饋意見以更新特定文件
aigne doc update --docs overview.md --feedback "Add a more detailed FAQ section at the end."
```

`update` 命令的主要參數：

| 參數 | 說明 |
| ---------- | ------------------------------------------------------------------------------------------------ |
| `--docs` | 您想更新的文件的路徑。您可以多次使用此標記進行批次更新。 |
| `--feedback` | 重新生成內容時要使用的具體指示。 |

---

## 優化整體結構

除了優化單一文件的內容，您還可以調整整體的文件結構。如果某個部分缺失或現有組織可以改進，您可以向 `generate` 命令提供回饋意見。

此命令指示 DocSmith 根據您的新輸入重新評估整個文件計畫。

```shell icon=lucide:terminal
# 帶有特定回饋意見以重新生成文件結構
aigne doc generate --feedback "Remove the 'About' section and add a detailed 'API Reference'."
```

這種方法最適合對文件的目錄進行高層次的變更，而非逐行的內容編輯。

有了這些工具，您可以維護與您的專案一同演進的準確文件。一旦您的內容被優化，您就可以將其提供給全球的受眾。請在[翻譯文件](./features-translate-documentation.md)指南中了解如何操作。