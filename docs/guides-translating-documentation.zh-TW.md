# 翻譯文件

本指南說明如何使用 `aigne doc translate` 指令將您產生的文件翻譯成多種語言。此過程使用 AI 來確保翻譯具有上下文感知能力並保持技術準確性。

該工具支援 12 種語言，讓您能夠觸及全球受眾。您的源文件的主要語言將自動從可用的翻譯語言清單中排除。

## `translate` 指令

`aigne doc translate` 指令用於為您現有的文件檔案產生翻譯。您可以以互動模式執行它，以選擇您想要的文件和語言，或者您也可以使用命令列標誌直接指定這些選項，以實現自動化工作流程。

### 互動模式

若要獲得引導式體驗，請在不帶任何參數的情況下執行該指令：

```bash
aigne doc translate
```

執行後，該工具將執行以下步驟：
1.  掃描現有文件。
2.  提示您從清單中選擇要翻譯的特定文件。
3.  提示您選擇目標翻譯語言。為方便起見，先前選擇的語言將被預先勾選。
4.  為每個選定的文件和語言對開始翻譯過程。
5.  將翻譯後的文件儲存在相應的特定語言目錄中。

### 命令列選項

對於非互動式使用或腳本編寫，您可以使用以下命令列標誌來控制翻譯過程。

<x-field-group>
  <x-field data-name="--docs" data-type="array<string>">
    <x-field-desc markdown>指定一個或多個要翻譯的文件路徑。如果未提供，該工具將進入互動模式，讓您從可用文件清單中選擇。</x-field-desc>
  </x-field>
  <x-field data-name="--langs" data-type="array<string>">
    <x-field-desc markdown>指定一個或多個目標語言代碼（例如，`zh`、`ja`）。如果省略，系統將提示您以互動方式選擇語言。</x-field-desc>
  </x-field>
  <x-field data-name="--glossary" data-type="string">
    <x-field-desc markdown>提供一個詞彙表檔案的路徑（例如，`@path/to/glossary.md`）。這可以確保特定的技術術語在所有文件中得到一致的翻譯。</x-field-desc>
  </x-field>
  <x-field data-name="--feedback" data-type="string">
    <x-field-desc markdown>提供具體的說明或回饋來指導 AI 的翻譯風格，例如調整語氣或術語。</x-field-desc>
  </x-field>
</x-field-group>

### 使用範例

#### 1. 將特定文件翻譯成多種語言

要將 `overview.md` 和 `examples.md` 翻譯成中文（`zh`）和日文（`ja`）而無需互動式提示：

```bash
aigne doc translate --docs overview.md --docs examples.md --langs zh --langs ja
```

#### 2. 使用詞彙表以確保術語一致

為確保技術術語翻譯正確，請提供一個詞彙表檔案。這對於保持品牌名稱或專業詞彙的一致性非常有用。

```bash
aigne doc translate --glossary @./glossary.md
```

#### 3. 提供回饋以優化翻譯風格

您可以透過提供回饋來指導翻譯風格。例如，若要請求更正式的語氣：

```bash
aigne doc translate --feedback "Use a formal, technical tone for all translations."
```

此回饋將記錄在更新文件的歷史記錄中。

## 支援的語言

該工具提供 12 種語言的翻譯支援。文件的原生語言是英文（`en`）。

| 語言 | 代碼 |
| :--- | :--- |
| 簡體中文 | `zh` |
| 繁體中文| `zh-TW`|
| 日文 | `ja` |
| 韓文 | `ko` |
| 西班牙文 | `es` |
| 法文 | `fr` |
| 德文 | `de` |
| 葡萄牙文 | `pt` |
| 俄文 | `ru` |
| 義大利文 | `it` |
| 阿拉伯文 | `ar` |

## 總結

`translate` 指令為您的文件本地化提供了一種結構化的方法。您可以使用其互動模式進行引導式翻譯，或使用命令列選項進行自動化工作流程。使用詞彙表和回饋等功能有助於保持翻譯內容的品質和一致性。

翻譯完文件後，您可以繼續進行[發布您的文件](./guides-publishing-your-docs.md)。