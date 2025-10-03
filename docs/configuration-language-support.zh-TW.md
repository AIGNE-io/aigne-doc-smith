# 語言支援

AIGNE DocSmith 使用 AI 提供 12 種語言的自動化文件翻譯。此功能讓您可以使用 `aigne doc translate` 命令為全球受眾產生並維護文件。

翻譯工作流程會透過 AI 引擎處理您的來源文件，以在您選定的目標語言中產生本地化版本。

```d2
direction: down

Developer: {
  shape: c4-person
}

Source-Documents: {
  label: "來源文件\n（主要語言）"
  shape: rectangle
}

AIGNE-CLI: {
  label: "`aigne doc translate`"
  shape: rectangle
}

AI-Engine: {
  label: "AI 翻譯引擎"
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
}

Translated-Documents: {
  label: "翻譯後的文件\n（目標語言）"
  shape: rectangle
}

Developer -> AIGNE-CLI: "1. 執行命令"
AIGNE-CLI -> Source-Documents: "2. 讀取內容"
AIGNE-CLI -> AI-Engine: "3. 傳送進行翻譯"
AI-Engine -> AIGNE-CLI: "4. 返回翻譯結果"
AIGNE-CLI -> Translated-Documents: "5. 寫入本地化檔案"
```

## 支援的語言

DocSmith 為以下語言提供 AI 驅動的翻譯。您可以在使用 `aigne doc init` 進行初始設定時定義專案的主要語言，並選擇任意數量的目標語言進行翻譯。

| 語言 | 語言代碼 | 範例文字 |
|---|---|---|
| 英文 | `en` | Hello |
| 簡體中文 | `zh` | 你好 |
| 繁體中文 | `zh-TW` | 你好 |
| 日文 | `ja` | こんにちは |
| 韓文 | `ko` | 안녕하세요 |
| 西班牙文 | `es` | Hola |
| 法文 | `fr` | Bonjour |
| 德文 | `de` | Hallo |
| 葡萄牙文 | `pt` | Olá |
| 俄文 | `ru` | Привет |
| 義大利文 | `it` | Ciao |
| 阿拉伯文 | `ar` | مرحبا |

## 如何設定和使用翻譯

翻譯語言在您初始化專案時進行設定。您可以隨時使用 `aigne doc translate` 命令新增語言或翻譯文件，此命令支援兩種操作模式。

### 互動模式以進行引導式翻譯

若要獲得逐步引導的體驗，請在不帶任何參數的情況下執行此命令。這是我們為大多數使用者推薦的方法。

```bash 互動式翻譯 icon=lucide:wand
aigne doc translate
```

互動模式將會顯示一系列提示，讓您能夠：

1.  從清單中選擇要翻譯的現有文件。
2.  從支援的語言清單中選擇一個或多個目標語言。
3.  如果專案設定中尚未包含新的翻譯語言，則可以將其新增。

### 用於自動化的命令列參數

若要直接控制或用於自動化腳本，您可以將文件和語言指定為命令列參數。此方法非常適合開發人員以及整合到 CI/CD 管線中。

```bash 命令範例 icon=lucide:terminal
# 將 overview.md 和 examples.md 翻譯成中文和日文
aigne doc translate --langs zh --langs ja --docs overview.md --docs examples.md
```

`translate` 命令的主要參數包括：

| 參數 | 描述 |
|---|---|
| `--langs` | 指定目標語言代碼。此旗標可多次使用以選擇多種語言。 |
| `--docs` | 指定要翻譯的文件的路徑（例如，`overview.md`）。此參數也可以多次使用。 |
| `--feedback` | 提供具體指示以引導翻譯模型（例如，`"使用正式語氣"`）。 |
| `--glossary` | 使用自訂詞彙表檔案（例如，`@path/to/glossary.md`）以確保專案特定術語的翻譯一致性。 |

---

本節介紹了可用的語言以及如何啟用它們。有關翻譯工作流程的完整指南，請參閱 [翻譯文件](./features-translate-documentation.md) 指南。