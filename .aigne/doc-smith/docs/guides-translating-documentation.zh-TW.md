# 本地化文件

將您的文件提供多種語言版本，對於觸及全球受眾至關重要。本指南提供逐步流程，說明如何使用 `aigne doc localize` 命令將您的內容翻譯成 12 種支援的語言之一，確保您的文件易於各地使用者存取和理解。

## 本地化流程概覽

本地化文件的主要命令是 `aigne doc localize`。此命令可以透過兩種模式執行：互動式或非互動式（使用命令列旗標）。兩種方法都設計得簡單明瞭，讓您能有效率地管理單一或多語言的本地化。

### 互動模式

若想獲得引導式體驗，請在不帶任何參數的情況下執行此命令。對於初次使用翻譯功能或偏好逐步流程的使用者，建議採用此方法。

```bash icon=lucide:terminal
aigne doc localize
```

當您執行此命令時，DocSmith 將啟動一個互動式會話：

1.  首先，系統會提示您從專案中所有可用的文件檔案清單中，選取您希望翻譯的特定文件。
2.  接著，系統會要求您選擇目標語言。本系統支援 12 種語言，您先前選擇過的任何語言都會被預先勾選，以簡化流程。

![執行翻譯命令](../../../assets/screenshots/doc-translate.png)

選取文件後，您將看到可供選擇的語言清單。

![選取翻譯語言](../../../assets/screenshots/doc-translate-langs.png)

一旦您的選擇被確認，DocSmith 將開始為每份文件進行您所選的每種語言的翻譯工作。

### 命令列用法

若要實現自動化、指令稿編寫或更直接的控制，您可以直接在命令列中提供參數。

```bash icon=lucide:terminal
aigne doc localize [options]
```

#### 選項

`translate` 命令接受以下選項來指定文件、語言和其他設定。

<x-field-group>
  <x-field data-name="--docs" data-type="array" data-required="false">
    <x-field-desc markdown>指定一或多個要翻譯的文件路徑。若省略此選項，工具將進入互動模式以供選擇文件。</x-field-desc>
  </x-field>
  <x-field data-name="--langs" data-type="array" data-required="false">
    <x-field-desc markdown>目標語言代碼清單（例如 `zh`、`ja`、`de`）。若未提供，系統將提示您以互動方式選擇語言。</x-field-desc>
  </x-field>
  <x-field data-name="--glossary" data-type="string" data-required="false">
    <x-field-desc markdown>詞彙表檔案的路徑（例如 `@/path/to/glossary.md`）。此檔案有助於在所有翻譯中維持特定術語的一致性。</x-field-desc>
  </x-field>
  <x-field data-name="--feedback" data-type="string" data-required="false">
    <x-field-desc markdown>向 AI 提供具體指示以引導其翻譯風格（例如：「使用正式語氣並保留技術術語為英文」）。此回饋也會記錄在文件的歷史記錄中，以供未來參考。</x-field-desc>
  </x-field>
</x-field-group>

#### 範例

1.  **將特定文件翻譯成多種語言：**

    若要將 `overview.md` 和 `getting-started.md` 翻譯成中文和日文，請使用以下命令：
    ```bash icon=lucide:terminal
    aigne doc localize --docs overview.md --docs getting-started.md --langs zh ja
    ```

2.  **使用詞彙表和風格回饋進行翻譯：**

    若要將 `overview.md` 翻譯成德文，同時確保術語一致性和正式語氣，您可以包含 `--glossary` 和 `--feedback` 選項：
    ```bash icon=lucide:terminal
    aigne doc localize --docs overview.md --langs de --feedback "Use a formal tone" --glossary @/path/to/glossary.md
    ```

## 支援的語言

DocSmith 為 12 種語言提供專業級的翻譯。使用 `--langs` 旗標時，請使用下表中的語言代碼。

| Language | Code |
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

本指南介紹了如何使用 `aigne doc localize` 命令，讓您的文件能夠觸及全球受眾。您可以使用互動模式進行引導式操作，或使用命令列選項以實現自動化和精確控制。

文件本地化完成後，下一步就是發佈它們。有關此流程的詳細說明，請參閱[發佈您的文件](./guides-publishing-your-docs.md)指南。
