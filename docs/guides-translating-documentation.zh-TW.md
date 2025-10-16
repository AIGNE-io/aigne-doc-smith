# 翻譯文件

DocSmith 讓您能夠將文件翻譯成多種語言，讓您的內容觸及全球受眾。翻譯流程設計得簡單直接，利用 AI 提供與上下文相關且技術上準確的翻譯。本指南詳細說明了使用 `translate` 指令翻譯文件的步驟。

DocSmith 支援 12 種語言的專業翻譯，確保為國際使用者提供廣泛的覆蓋範圍。

## 如何翻譯文件

主要的翻譯指令是 `aigne doc translate`。您可以以互動模式執行它來選取您想要的文件和語言，或者您也可以使用命令列旗標直接指定這些選項，以實現自動化工作流程。

### 互動模式

若要獲得引導式體驗，只需執行不帶任何參數的指令即可。

```bash
aigne doc translate
```

該工具將提示您：
1.  **選取文件**：從您現有的文件列表中選擇您希望翻譯的文件。
2.  **選擇目標語言**：選擇翻譯的目標語言。為方便起見，先前選取的語言將被預先勾選。

![執行翻譯指令](../assets/screenshots/doc-translate.png)

選取文件後，您將看到可用語言的列表。

![選擇翻譯語言](../assets/screenshots/doc-translate-langs.png)

一旦您確認選擇，DocSmith 將會為每個文件翻譯成每個選定的語言。

### 命令列用法

若要進行更直接的控制或在腳本中使用，您可以使用旗標來指定您的需求。

```bash
aigne doc translate [options]
```

#### 選項

`translate` 指令提供以下選項：

<x-field-group>
  <x-field data-name="--docs" data-type="array" data-required="false">
    <x-field-desc markdown>指定要翻譯的一個或多個文件路徑。若未提供，系統將提示您以互動方式從列表中選取。</x-field-desc>
  </x-field>
  <x-field data-name="--langs" data-type="array" data-required="false">
    <x-field-desc markdown>指定一個或多個目標語言代碼（例如 `zh`、`ja`）。若未提供，您可以以互動方式選取語言。</x-field-desc>
  </x-field>
  <x-field data-name="--glossary" data-type="string" data-required="false">
    <x-field-desc markdown>詞彙表檔案的路徑（例如 `@/path/to/glossary.md`），以確保所有翻譯中的術語一致。</x-field-desc>
  </x-field>
  <x-field data-name="--feedback" data-type="string" data-required="false">
    <x-field-desc markdown>提供具體說明或回饋以指導 AI 的翻譯風格（例如「使用正式語氣，並將技術術語保留為英文」）。此回饋會記錄在文件的歷史記錄中。</x-field-desc>
  </x-field>
</x-field-group>

#### 範例

若要將 `overview.md` 和 `getting-started.md` 文件翻譯成中文和日文，您需要執行以下指令：

```bash
aigne doc translate --docs /overview --docs /getting-started --langs zh ja
```

若要提供風格回饋並確保術語一致，您可以新增 `--feedback` 和 `--glossary` 旗標：

```bash
aigne doc translate --docs /overview --langs de --feedback "Use a formal tone" --glossary @/path/to/glossary.md
```

## 支援的語言

DocSmith 為以下 12 種語言提供專業翻譯。透過 `--langs` 旗標指定語言時，請使用對應的代碼。

| 語言 | 代碼 |
|---|---|
| English | `en` |
| 简体中文 | `zh` |
| 繁體中文 | `zh-TW` |
| 日本語 | `ja` |
| 한국어 | `ko` |
| Español | `es` |
| Français | `fr` |
| Deutsch | `de` |
| Português | `pt` |
| Русский | `ru` |
| Italiano | `it` |
| العربية | `ar` |

## 總結

您現在已經學會如何使用 `aigne doc translate` 指令，透過互動式流程或使用命令列選項進行自動化，將您的文件提供給多種語言的讀者。

翻譯文件後，下一個合理的步驟是將它們提供給您的使用者。有關如何執行此操作的說明，請參閱 [發佈您的文件](./guides-publishing-your-docs.md) 指南。