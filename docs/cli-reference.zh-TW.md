# CLI 命令參考

本指南為所有可用的 `aigne doc` 子命令、其參數和選項提供了全面的參考。它旨在幫助使用者充分利用命令列介面的全部潛力。

一般語法為：

```bash command
aigne doc <command> [options]
```

### 命令工作流程

下圖說明了使用 DocSmith 的 CLI 命令建立和維護文件的一般生命週期，以及它們互動的資料。

```d2
direction: down

# Artifacts
Source-Code: {
  label: "原始碼"
  shape: cylinder
}
Configuration: {
  label: "設定\n(.aigne/doc-smith/config.yml)"
  shape: cylinder
}
Generated-Docs: {
  label: "產生的文件"
  shape: cylinder
}
Published-Docs: {
  label: "已發佈的網站"
  shape: cylinder
}

# --- Core Workflow ---
Lifecycle: {
  label: "文件生命週期"
  
  init: {
    label: "1. 初始化\n`aigne doc init`"
    shape: rectangle
  }

  generate: {
    label: "2. 產生\n`aigne doc generate`"
    shape: rectangle
  }

  Refinement: {
    label: "3. 優化 (迭代)"
    grid-columns: 2

    update: {
      label: "更新\n`aigne doc update`"
      shape: rectangle
    }
    translate: {
      label: "翻譯\n`aigne doc translate`"
      shape: rectangle
    }
  }

  publish: {
    label: "4. 發佈\n`aigne doc publish`"
    shape: rectangle
  }
}

# --- Utility Commands ---
Utilities: {
  label: "工具命令"
  grid-columns: 2
  
  prefs: {
    label: "檢視設定\n`aigne doc prefs`"
    shape: rectangle
  }
  clear: {
    label: "清除資料\n`aigne doc clear`"
    shape: rectangle
  }
}


# --- Connections ---

# Setup and Generation
Lifecycle.init -> Configuration: "建立"
Source-Code -> Lifecycle.generate: "讀取"
Configuration -> Lifecycle.generate: "讀取"
Lifecycle.generate -> Generated-Docs: "建立 / 覆寫"
Lifecycle.generate -> Lifecycle.init: {
  label: "若無設定則執行"
  style.stroke-dash: 4
}

# Refinement Loop
Generated-Docs <-> Lifecycle.Refinement: "讀取與寫入"

# Publishing
Lifecycle.Refinement -> Lifecycle.publish
Lifecycle.publish -> Published-Docs: "上傳至"

# Utility Connections
Utilities.prefs -> Configuration: "讀取"
Utilities.clear -> Configuration: "刪除"
Utilities.clear -> Generated-Docs: "刪除"
```

---

## `aigne doc init`

手動啟動互動式設定精靈。這對於設定新專案或修改現有專案的設定很有用。此精靈會引導您定義原始碼路徑、設定輸出目錄、選擇語言，以及定義文件的風格和目標受眾。

### 使用範例

**啟動設定精靈：**

```bash
aigne doc init
```

有關如何根據您的需求客製化 DocSmith 的更多詳細資訊，請參閱 [設定指南](./configuration.md)。

---

## `aigne doc generate`

分析您的原始碼並根據您的設定產生一套完整的文件。如果找不到設定，它會自動啟動互動式設定精靈 (`aigne doc init`)。

### 選項

| Option              | Type    | Description                                                                                                   |
| ------------------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| `--forceRegenerate` | boolean | 捨棄現有內容並從頭開始重新產生所有文件。                                     |
| `--feedback`        | string  | 提供回饋以調整和優化整體文件結構。                                   |
| `--model`           | string  | 指定用於產生的特定大型語言模型（例如 `anthropic:claude-3-5-sonnet`）。此選項會覆寫預設設定。 |

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

**使用特定模型產生：**

```bash
aigne doc generate --model openai:gpt-4o
```

---

## `aigne doc update`

優化並重新產生特定文件。您可以以互動方式執行以選擇文件，或直接使用選項指定它們。這對於根據回饋進行有針對性的改進，而無需重新產生整個專案，非常有用。

### 選項

| Option     | Type  | Description                                                                                 |
| ---------- | ----- | ------------------------------------------------------------------------------------------- |
| `--docs`     | array | 要重新產生的文件路徑列表。可多次指定。                         |
| `--feedback` | string | 提供具體回饋以改善所選文件的內容。              |

### 使用範例

**啟動互動式會話以選擇要更新的文件：**

```bash
aigne doc update
```

**使用針對性回饋更新特定文件：**

```bash
aigne doc update --docs /overview.md --feedback "Add more detailed FAQ entries"
```

---

## `aigne doc translate`

將現有文件翻譯成一種或多種語言。它可以以互動方式執行以選擇文件和語言，也可以透過將它們指定為參數以非互動方式執行。

### 選項

| Option       | Type  | Description                                                                                                |
| ------------ | ----- | ---------------------------------------------------------------------------------------------------------- |
| `--docs`       | array | 要翻譯的文件路徑列表。可多次指定。                                         |
| `--langs`      | array | 目標語言代碼列表（例如 `zh-CN`、`ja`）。可多次指定。                            |
| `--feedback`   | string | 提供回饋以改善翻譯品質。                                               |
| `--glossary`   | string | 詞彙表檔案的路徑，以確保跨語言的術語一致性。使用 `@path/to/glossary.md`。 |

### 使用範例

**啟動互動式翻譯會話：**

```bash
aigne doc translate
```

**將特定文件翻譯成中文和日文：**

```bash
aigne doc translate --langs zh-CN --langs ja --docs /features/generate-documentation.md --docs /overview.md
```

**使用詞彙表和回饋進行翻譯以提高品質：**

```bash
aigne doc translate --glossary @glossary.md --feedback "Use technical terminology consistently"
```

---

## `aigne doc publish`

發佈您的文件並產生一個可分享的連結。此命令會將您的內容上傳到一個 Discuss Kit 實例。您可以使用官方的 AIGNE DocSmith 平台或執行您自己的 [Discuss Kit](https://www.web3kit.rocks/discuss-kit) 實例。

### 選項

| Option     | Type   | Description                                                                                          |
| ---------- | ------ | ---------------------------------------------------------------------------------------------------- |
| `--appUrl` | string | 您自行託管的 Discuss Kit 實例的 URL。若未提供，此命令將以互動模式執行。 |

### 使用範例

**啟動互動式發佈會話：**

```bash
aigne doc publish
```

**直接發佈至自行託管的實例：**

```bash
aigne doc publish --appUrl https://your-discuss-kit-instance.com
```

---

## `aigne doc prefs`

顯示專案目前的設定。這是一個唯讀命令，可幫助您驗證在 `init` 或 `generate` 過程中應用的設定。

### 使用範例

**檢視目前專案設定：**

```bash
aigne doc prefs
```

---

## `aigne doc clear`

啟動一個互動式會話以清除本地儲存的資料。這可用於移除產生的文件、文件結構設定或快取的驗證權杖。

### 使用範例

**啟動互動式清理程序：**

```bash
aigne doc clear
```