# 語言支援

AIGNE DocSmith 使用 AI 提供 12 種語言的自動化文件翻譯。這讓您可以使用 `aigne doc translate` 命令為全球使用者產生和維護文件。

翻譯工作流程會透過 AI 引擎處理您的來源文件，以產生您所選目標語言的本地化版本。

```d2
direction: down

Source-Doc: {
  label: "來源文件\n（例如，英文）"
  shape: rectangle
}

AI-Engine: {
  label: "AIGNE DocSmith\nAI 翻譯引擎"
  shape: rectangle
}

Translated-Docs: {
  label: "翻譯後的文件"
  shape: rectangle
  grid-columns: 3

  zh: "简体中文"
  ja: "日本語"
  es: "Español"
  fr: "Français"
  de: "Deutsch"
  more: "..."
}

Source-Doc -> AI-Engine: "`aigne doc translate`"
AI-Engine -> Translated-Docs: "產生"
```

## 支援的語言

DocSmith 為以下語言提供 AI 驅動的翻譯。您可以在初始設定時定義專案的主要語言，並選擇任意數量的目標語言進行翻譯。

| 語言 | 語言代碼 | 範例文字 |
|---|---|---|
| English | `en` | Hello |
| 简体中文 | `zh` | 你好 |
| 繁體中文 | `zh-TW` | 你好 |
| 日本語 | `ja` | こんにちは |
| 한국어 | `ko` | 안녕하세요 |
| Español | `es` | Hola |
| Français | `fr` | Bonjour |
| Deutsch | `de` | Hallo |
| Português | `pt` | Olá |
| Русский | `ru` | Привет |
| Italiano | `it` | Ciao |
| العربية | `ar` | مرحبا |

## 如何設定與使用翻譯

翻譯語言是在您使用 `aigne doc init` 初始化專案時設定的。您可以隨時使用 `aigne doc translate` 命令新增語言或翻譯文件，該命令有兩種操作模式。

### 用於引導式翻譯的互動模式

若要獲得逐步引導的體驗，請在不帶任何參數的情況下執行此命令。這是對大多數使用者推薦的方法。

```bash Interactive Translation icon=lucide:wand
aigne doc translate
```

互動模式將會顯示一系列提示，讓您可以：

1.  從清單中選擇要翻譯的現有文件。
2.  從支援的清單中選擇一種或多種目標語言。
3.  如果專案設定中尚未包含新的翻譯語言，則可以將其新增。

### 用於自動化的命令列參數

若要直接控制或在自動化腳本中使用，您可以直接將文件和語言指定為命令列參數。這對於開發人員和 CI/CD 管線來說是理想的選擇。

```bash Command Example icon=lucide:terminal
# 將 overview.md 和 examples.md 翻譯成中文和日文
aigne doc translate --langs zh --langs ja --docs overview.md --docs examples.md
```

該命令的主要參數包括：

| 參數 | 說明 |
|---|---|
| `--langs` | 指定目標語言代碼。此旗標可以多次使用以選擇多種語言。 |
| `--docs` | 指定要翻譯的文件的路徑（例如，`overview.md`）。此旗標也可以多次使用。 |
| `--feedback` | 提供具體說明以指導翻譯模型（例如，`"使用正式語氣"`）。 |
| `--glossary` | 使用自訂詞彙表檔案（例如，`@path/to/glossary.md`）以確保專案特定術語的翻譯一致性。 |

---

本節介紹了可用的語言以及如何啟用它們。有關翻譯工作流程的完整指南，請參閱 [翻譯文件](./features-translate-documentation.md) 指南。