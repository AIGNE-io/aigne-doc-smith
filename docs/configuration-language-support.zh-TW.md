# 語言支援

AIGNE DocSmith 提供 12 種語言的自動化文件翻譯功能，讓您能夠為全球受眾產生並維護本地化內容。此功能主要透過 `aigne doc translate` 命令進行管理。

翻譯工作流程使用 AI 引擎處理您的來源文件，並產生您所選目標語言的版本。`aigne doc translate` 命令提供一個互動式介面，引導您選擇要翻譯的文件和語言。

![互動式文件翻譯流程](../assets/screenshots/doc-translate.png)

## 支援的語言

DocSmith 支援以下語言的 AI 翻譯。您可以在使用 `aigne doc init` 進行初始設定時定義專案的主要語言，並可選擇以下任何數量的語言進行翻譯。

| 語言 | 語言代碼 |
|---|---|
| 英語 | `en` |
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

## 如何設定與使用翻譯功能

語言設定在您初始化專案時進行配置。您可以隨時使用 `aigne doc translate` 命令新增語言或翻譯現有文件，該命令支援兩種操作模式。

### 用於引導式翻譯的互動模式

若要進行逐步引導的流程，請執行不含任何參數的命令。建議大多數使用者使用此方法。

```bash 互動式翻譯 icon=lucide:wand
aigne doc translate
```

互動模式會顯示一系列提示，讓您能夠選擇要翻譯的文件，並從清單中選擇您的目標語言。如果專案設定中尚未包含新的翻譯語言，此模式也允許您新增。

![選擇目標翻譯語言](../assets/screenshots/doc-translate-langs.png)

### 用於自動化的命令列參數

為了直接控制或在自動化腳本中使用，您可以將文件和語言指定為命令列參數。此方法適合整合到 CI/CD 管線中。

```bash 命令範例 icon=lucide:terminal
# 將 overview.md 和 examples.md 翻譯成中文和日文
aigne doc translate --langs zh --langs ja --docs overview.md --docs examples.md
```

下表詳細說明了 `translate` 命令的主要參數：

| 參數 | 說明 |
|---|---|
| `--langs` | 指定目標語言代碼。此旗標可多次使用以選擇多種語言。 |
| `--docs` | 指定要翻譯的文件的路徑（例如 `overview.md`）。此旗標也可多次使用。 |
| `--feedback` | 提供具體指令以引導翻譯模型（例如 `「使用正式語氣」`）。 |
| `--glossary` | 使用自訂詞彙表檔案（例如 `@path/to/glossary.md`）以確保專案特定術語的翻譯一致性。 |

---

本節概述了可用的語言以及如何啟用它們。有關翻譯工作流程的完整指南，請參閱 [翻譯文件](./features-translate-documentation.md) 指南。