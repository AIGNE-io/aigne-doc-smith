# CLI 命令參考

本指南為所有可用的 `aigne doc` 子命令、其參數和選項提供參考。它旨在幫助使用者充分利用命令列介面。

一般語法為：

```bash
aigne doc <command> [options]
```

### 命令工作流程

下圖說明了使用 DocSmith 的 CLI 命令建立和維護文件的典型生命週期：

```d2
direction: down

Start: {
  label: "專案設定"
  shape: circle
}

init: {
  label: "aigne doc init\n(互動式設定)"
  shape: rectangle
}

generate: {
  label: "aigne doc generate\n(建立/更新所有文件)"
  shape: rectangle
}

refinement-cycle: {
  label: "優化週期"
  shape: rectangle
  grid-columns: 2

  update: {
    label: "aigne doc update\n(優化單一文件)"
  }
  translate: {
    label: "aigne doc translate\n(內容本地化)"
  }
}

publish: {
  label: "aigne doc publish\n(部署文件)"
  shape: rectangle
}

End: {
  label: "文件上線"
  shape: circle
  style.fill: "#a2eeaf"
}

Start -> init: "可選" {
  style.stroke-dash: 4
}
init -> generate: "配置"
Start -> generate: "直接"
generate -> refinement-cycle: "優化"
refinement-cycle -> publish: "就緒"
generate -> publish: "直接部署"
publish -> End
```

---

## `aigne doc generate`

分析您的原始碼並根據您的設定產生一套完整的文件。如果找不到設定，它會自動啟動互動式設定精靈。

### 選項

| Option              | Type    | Description                                                                                                   |
| ------------------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| `--feedback`        | string  | 提供回饋以調整和優化整體文件結構。                                                                            |
| `--forceRegenerate` | boolean | 捨棄現有內容並從頭開始重新產生所有文件。                                                                        |
| `--model`           | string  | 指定用於產生的特定大型語言模型（例如 `openai:gpt-4o`）。此選項會覆蓋預設設定。                                    |

### 使用範例

**產生或更新文件：**

```bash
aigne doc generate
```

**強制完整重新產生所有文件：**

```bash
aigne doc generate --forceRegenerate
```

**透過回饋優化文件結構：**

```bash
aigne doc generate --feedback "Add a new section for API examples and remove the 'About' page."
```

**使用 AIGNE Hub 中的特定模型產生：**

```bash
aigne doc generate --model google:gemini-1.5-flash
```

---

## `aigne doc update`

優化並重新產生特定文件。您可以以互動方式執行以選擇文件，或使用選項直接指定。這對於根據回饋進行有針對性的改進，而無需重新產生整個專案非常有用。

### 選項

| Option     | Type  | Description                                                                                 |
| ---------- | ----- | ------------------------------------------------------------------------------------------- |
| `--docs`     | array | 要重新產生的文件路徑列表。可多次使用。                                                        |
| `--feedback` | string | 提供具體回饋以改善所選文件的內容。                                                            |

### 使用範例

**啟動互動式會話以選擇要更新的文件：**

```bash
aigne doc update
```

**使用針對性回饋更新特定文件：**

```bash
aigne doc update --docs overview.md --feedback "Add more detailed FAQ entries"
```

---

## `aigne doc translate`

將現有文件翻譯成一種或多種語言。可以互動方式執行以選擇文件和語言，或透過將它們指定為參數以非互動方式執行。

### 選項

| Option       | Type  | Description                                                                                                |
| ------------ | ----- | ---------------------------------------------------------------------------------------------------------- |
| `--docs`       | array | 要翻譯的文件路徑列表。可多次使用。                                                                           |
| `--langs`      | array | 目標語言代碼列表（例如 `zh`、`ja`）。可多次使用。                                                               |
| `--feedback`   | string | 提供回饋以改善翻譯品質。                                                                                   |
| `--glossary`   | string | 詞彙表檔案的路徑，以確保跨語言的術語一致性。使用 `@path/to/glossary.md`。                                  |

### 使用範例

**啟動互動式翻譯會話：**

```bash
aigne doc translate
```

**將特定文件翻譯成中文和日文：**

```bash
aigne doc translate --langs zh --langs ja --docs examples.md --docs overview.md
```

**使用詞彙表和回饋進行翻譯以獲得更高品質：**

```bash
aigne doc translate --glossary @glossary.md --feedback "Use technical terminology consistently"
```

---

## `aigne doc publish`

將您產生的文件發佈到 Discuss Kit 平台。您可以發佈到官方的 AIGNE DocSmith 平台或您自己託管的實例。

### 選項

| Option     | Type   | Description                                                                                          |
| ---------- | ------ | ---------------------------------------------------------------------------------------------------- |
| `--appUrl` | string | 您自行託管的 Discuss Kit 實例的 URL。如果未提供，此命令將以互動方式執行。                                |

### 使用範例

**啟動互動式發佈會話：**

```bash
aigne doc publish
```

**直接發佈到自行託管的實例：**

```bash
aigne doc publish --appUrl https://your-discuss-kit-instance.com
```

---

## `aigne doc init`

手動啟動互動式設定精靈。這對於設定新專案或修改現有專案的設定很有用。此精靈會引導您定義原始碼路徑、設定輸出目錄、選擇語言以及定義文件的風格和目標受眾。

### 使用範例

**啟動設定精靈：**

```bash
aigne doc init
```

有關如何根據您的需求量身訂做 DocSmith 的更多詳細資訊，請參閱 [設定指南](./configuration.md)。