# 翻譯文件

DocSmith 讓您能夠將文件翻譯成多種語言，讓您的內容觸及全球受眾。翻譯流程設計得簡單直接，利用 AI 提供與上下文相關且技術上準確的翻譯。本指南詳細介紹了使用 `translate` 指令翻譯文件的步驟。

DocSmith 支援 12 種語言的專業翻譯，確保為國際使用者提供廣泛的覆蓋範圍。

## 如何翻譯文件

主要的翻譯指令是 `aigne doc translate`。您可以互動式地執行它來選擇您想要的文件和語言，或者您也可以使用命令列旗標直接指定這些選項，以實現自動化工作流程。

### 互動模式

若要獲得引導式體驗，只需執行不含任何參數的指令。

```bash
aigne doc translate
```

該工具將提示您：
1.  從您現有的文件清單中**選取您希望翻譯的文件**。
2.  **選擇翻譯的目標語言**。為方便起見，先前選擇的語言將會被預先勾選。

![執行翻譯指令](https://docsmith.aigne.io/image-bin/uploads/9b47a9f979745a3089c287f73715c0a3.png)

選取文件後，您將看到可用語言的清單。

![選擇翻譯語言](https://docsmith.aigne.io/image-bin/uploads/c53f880f08a9f65f377038198f1a1d1d.png)

一旦您確認選擇，DocSmith 將會為每個文件進行每種所選語言的翻譯。

### 命令列用法

為了更直接的控制或在腳本中使用，您可以使用旗標來指定您的需求。

```bash
aigne doc translate [options]
```

#### 選項

`translate` 指令提供以下選項：

<x-field-group>
  <x-field data-name="--docs" data-type="array" data-required="false">
    <x-field-desc markdown>指定要翻譯的一個或多個文件路徑。如果未提供，系統將提示您以互動方式從清單中選擇。</x-field-desc>
  </x-field>
  <x-field data-name="--langs" data-type="array" data-required="false">
    <x-field-desc markdown>指定一個或多個目標語言代碼（例如 `zh`, `ja`）。如果未提供，您可以在互動模式下選擇語言。</x-field-desc>
  </x-field>
  <x-field data-name="--glossary" data-type="string" data-required="false">
    <x-field-desc markdown>詞彙表檔案的路徑（例如 `@/path/to/glossary.md`），以確保所有翻譯中的術語一致性。</x-field-desc>
  </x-field>
  <x-field data-name="--feedback" data-type="string" data-required="false">
    <x-field-desc markdown>提供具體指示或回饋來引導 AI 的翻譯風格（例如，「使用正式語氣並將技術術語保留為英文」）。此回饋會記錄在文件的歷史記錄中。</x-field-desc>
  </x-field>
</x-field-group>

#### 範例

要將 `overview.md` 和 `getting-started.md` 文件翻譯成中文和日文，您需要執行以下指令：

```bash
aigne doc translate --docs /overview --docs /getting-started --langs zh ja
```

若要提供風格上的回饋並確保術語一致，您可以加上 `--feedback` 和 `--glossary` 旗標：

```bash
aigne doc translate --docs /overview --langs de --feedback "Use a formal tone" --glossary @/path/to/glossary.md
```

## 支援的語言

DocSmith 為以下 12 種語言提供專業翻譯。透過 `--langs` 旗標指定語言時，請使用對應的代碼。

| 語言 | 代碼 |
|---|---|
| 英文 | `en` |
| 簡體中文 | `zh` |
| 繁體中文 | `zh-TW` |
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

您現在已經學會如何使用 `aigne doc translate` 指令，透過互動式流程或使用命令列選項進行自動化，將您的文件以多種語言提供。

翻譯文件後，下一個合理的步驟是將它們提供給您的使用者。有關如何執行的說明，請參閱 [發布您的文件](./guides-publishing-your-docs.md) 指南。