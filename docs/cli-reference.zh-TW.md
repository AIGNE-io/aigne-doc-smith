# CLI 指令參考

本指南為所有可用的 `aigne doc` 子指令、其參數和選項提供了全面的參考。旨在幫助使用者充分利用命令列介面。

通用語法為：

```bash command
aigne doc <command> [options]
```

### 指令工作流程

下圖說明了使用 DocSmith 的 CLI 指令建立和維護文件的典型生命週期，以及它們互動的資料。

```d2
direction: down

# Artifacts
Source-Code: {
  label: "原始碼"
  shape: cylinder
}
Configuration: {
  label: "設定檔\n(.aigne/doc-smith/config.yml)"
  shape: cylinder
}
Generated-Docs: {
  label: "產生的文件"
  shape: cylinder
}
Published-Docs: {
  label: "發佈的網站"
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
  label: "工具指令"
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
  label: "若無設定檔則執行"
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

手動啟動互動式設定精靈。這適用於設定新專案或修改現有專案的設定。此精靈會引導您定義原始碼路徑、設定輸出目錄、選擇語言，以及定義文件的風格和目標讀者。

### 使用範例

**啟動設定精靈：**

```bash
aigne doc init
```

有關如何根據您的需求客製化 DocSmith 的更多詳細資訊，請參閱[設定指南](./configuration.md)。

---

## `aigne doc generate`

分析您的原始碼並根據您的設定產生一套完整的文件。如果找不到設定檔，它會自動啟動互動式設定精靈 (`aigne doc init`)。

### 選項

| Option | Type | Description |
| :--- | :--- | :--- |
| `--forceRegenerate` | boolean | 捨棄現有內容並從頭開始重新產生所有文件。 |
| `--feedback` | string | 提供回饋以調整和優化整體文件結構。 |
| `--model` | string | 指定用於產生的特定大型語言模型（例如 `openai:gpt-4o`）。這會覆寫預設設定。 |

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

優化並重新產生特定文件。您可以以互動方式執行以選擇文件，或直接使用選項指定它們。這適用於根據回饋進行有針對性的改進，而無需重新產生整個專案。

### 選項

| Option | Type | Description |
| :--- | :--- | :--- |
| `--docs` | array | 要重新產生的文件路徑列表。可多次指定。 |
| `--feedback` | string | 提供具體回饋以改善所選文件的內容。 |

### 使用範例

**啟動互動式工作階段以選擇要更新的文件：**

```bash
aigne doc update
```

**透過有針對性的回饋更新特定文件：**

```bash
aigne doc update --docs /overview.md --feedback "Add more detailed FAQ entries"
```

---

## `aigne doc translate`

將現有文件翻譯成一種或多種語言。可以以互動方式執行以選擇文件和語言，或透過將它們指定為參數以非互動方式執行。

### 選項

| Option | Type | Description |
| :--- | :--- | :--- |
| `--docs` | array | 要翻譯的文件路徑列表。可多次指定。 |
| `--langs` | array | 目標語言代碼列表（例如 `zh-CN`、`ja`）。可多次指定。 |
| `--feedback` | string | 提供回饋以提高翻譯品質。 |
| `--glossary` | string | 詞彙表檔案的路徑，以確保跨語言的術語一致性。使用 `@path/to/glossary.md`。 |

### 使用範例

**啟動互動式翻譯工作階段：**

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

發佈您的文件並產生一個可分享的連結。此指令會將您的內容上傳到一個 Discuss Kit 執行個體。您可以使用官方的 AIGNE DocSmith 平台，或執行您自己的 [Discuss Kit](https://www.web3kit.rocks/discuss-kit) 執行個體。

### 選項

| Option | Type | Description |
| :--- | :--- | :--- |
| `--appUrl` | string | 您自行託管的 Discuss Kit 執行個體的 URL。如果未提供，指令將以互動方式執行。 |

### 使用範例

**啟動互動式發佈工作階段：**

```bash
aigne doc publish
```

**直接發佈到自行託管的執行個體：**

```bash
aigne doc publish --appUrl https://your-discuss-kit-instance.com
```

---

## `aigne doc prefs`

管理使用者偏好設定和由回饋驅動的規則。隨著時間的推移，DocSmith 會從您的回饋中學習並建立持久的偏好設定。此指令允許您檢視、切換或移除這些學習到的規則。

### 選項

| Option | Type | Description |
| :--- | :--- | :--- |
| `--list` | boolean | 列出所有已儲存的偏好設定。 |
| `--remove` | boolean | 以互動方式提示選擇並移除一個或多個偏好設定。 |
| `--toggle` | boolean | 以互動方式提示選擇並切換偏好設定的啟用狀態。 |
| `--id` | string | 指定要直接移除或切換的偏好設定 ID。 |

### 使用範例

**列出所有已儲存的偏好設定：**

```bash
aigne doc prefs --list
```

**啟動互動式移除模式：**

```bash
aigne doc prefs --remove
```

**透過 ID 切換特定偏好設定：**

```bash
aigne doc prefs --toggle --id "pref_2a1dfe2b09695aab"
```

---

## `aigne doc clear`

啟動一個互動式工作階段以清除本地儲存的資料。這可用於移除產生的文件、文件結構設定或快取的驗證權杖。

### 使用範例

**啟動互動式清理過程：**

```bash
aigne doc clear
```