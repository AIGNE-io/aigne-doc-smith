# 更新內容

本指南說明如何使用 `update` 指令來修改現有文件。您可以更新文件內容、新增或更新圖表，以及透過回饋移除圖表。

## 基本用法

### 互動模式

不帶任何參數執行指令以進入互動模式：

```bash icon=lucide:terminal
aigne doc update
```

選擇文件並提供回饋以更新它們。

### 命令列模式

使用命令列旗標直接更新文件：

```bash icon=lucide:terminal
aigne doc update --docs /overview --feedback "Add a more detailed explanation of the core features."
```

## 更新圖表

您可以透過提供回饋來更新文件中的圖表。此工具支援更新現有圖表或新增圖表。

### 更新特定圖表

提供回饋以更新圖表：

```bash icon=lucide:terminal
aigne doc update --docs /overview --feedback "Update the diagram to show the new architecture"
```

### 更新所有圖表

使用 `--diagram` 旗標來篩選並選擇帶有圖表的文件：

```bash icon=lucide:terminal
aigne doc update --diagram
```

或者使用 `--diagram-all` 自動更新所有帶有圖表的文件：

```bash icon=lucide:terminal
aigne doc update --diagram-all
```

### 刪除圖表

透過提供回饋來移除圖表：

```bash icon=lucide:terminal
aigne doc update --docs /overview --feedback "Remove the diagram"
```

## 圖表樣式

DocSmith 支援多種圖表樣式。您可以在回饋中指定樣式或設定預設樣式。支援的樣式包括：

### 現代風格
簡潔、專業的風格，具備現代設計元素。

![Modern Style](../../../assets/images/diagram-styles/modern.jpg)

### 標準流程圖
傳統的流程圖樣式，使用常規符號。

![Standard Flowchart Style](../../../assets/images/diagram-styles/standard.jpg)

### 手繪風格
素描般的風格，線條自然、有機。

![Hand-drawn Style](../../../assets/images/diagram-styles/hand-drawn.jpg)

### 擬人風格
將元素擬人化，具有生動、類人的特徵。

![Anthropomorphic Style](../../../assets/images/diagram-styles/anthropomorphic.jpg)

### 扁平化設計
沒有陰影或 3D 效果的扁平化設計。

![Flat Design Style](../../../assets/images/diagram-styles/flat.jpg)

### 極簡風格
以最少的元素達到最高的清晰度。

![Minimalist Style](../../../assets/images/diagram-styles/minimalist.jpg)

### 3D 風格
具有深度和透視感的三維效果。

![3D Style](../../../assets/images/diagram-styles/3d.jpg)

## 指令參數

| 參數 | 說明 | 必填 |
| :--- | :--- | :--- |
| `--docs` | 指定要更新的一或多個文件的路徑。可多次使用。 | 選填 |
| `--feedback` | 提供要進行變更的文字說明。 | 選填 |
| `--reset` | 從頭重新建立文件，忽略現有內容。 | 選填 |
| `--glossary` | 指定詞彙表檔案的路徑 (`@/path/to/glossary.md`)。 | 選填 |
| `--diagram` | 篩選僅顯示帶有圖表的文件，並讓使用者選擇要更新哪些文件。 | 選填 |
| `--diagram-all` | 自動選擇所有帶有圖表的文件並更新它們，無需使用者選擇。 | 選填 |

---

有關新增或移除文件的資訊，請參閱[新增文件](./guides-adding-a-document.md)和[移除文件](./guides-removing-a-document.md)指南。