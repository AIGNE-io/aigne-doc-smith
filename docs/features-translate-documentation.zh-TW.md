# 翻譯文件

AIGNE DocSmith 可以將您的文件翻譯成 12 種不同的語言，包括英文、中文和西班牙文，讓您的專案能觸及全球受眾。該工具提供兩種管理翻譯的方式：用於引導式設定的互動模式，以及用於精確控制和自動化的命令列參數。

## 互動式翻譯

若要獲得引導式體驗，請執行不含任何參數的 `translate` 命令。此方法非常適合偏好逐步操作的使用者。

```bash
aigne doc translate
```

此命令會啟動一個互動式精靈，引導您完成整個過程：

1.  **選擇要翻譯的文件：** 系統會顯示您現有文件的列表。使用空格鍵選擇您要翻譯的文件。

    ![選擇要翻譯的文件](../assets/screenshots/doc-translate.png)

2.  **選擇目標語言：** 選擇文件後，從支援的選項列表中選擇一種或多種目標語言。

    ![選擇要翻譯成的語言](../assets/screenshots/doc-translate-langs.png)

3.  **確認並執行：** DocSmith 隨後會處理翻譯，為您選擇的每個檔案生成對應各種語言的新版本。

## 命令列翻譯

對於在腳本或 CI/CD 流程中進行自動化，請使用命令列旗標來控制翻譯過程。此方法為開發人員和進階使用者提供了更大的靈活性。

### 命令參數

<x-field-group>
  <x-field data-name="--langs" data-type="string" data-required="false" data-desc="指定一種目標語言。此旗標可多次使用以包含多種語言（例如，--langs zh --langs ja）。"></x-field>
  <x-field data-name="--docs" data-type="string" data-required="false" data-desc="指定要翻譯的文件路徑。此旗標也可多次使用以進行批次翻譯。"></x-field>
  <x-field data-name="--feedback" data-type="string" data-required="false" data-desc="向 AI 提供建議以引導翻譯品質（例如，--feedback &quot;使用正式語氣&quot;）。"></x-field>
  <x-field data-name="--glossary" data-type="string" data-required="false" data-desc="使用 Markdown 格式的詞彙表檔案，以確保特定術語的一致性（例如，--glossary @path/to/glossary.md）。"></x-field>
  <x-field data-name="--model" data-type="string" data-required="false" data-desc="指定要使用的翻譯模型，例如 'openai:gpt-4o' 或 'google:gemini-2.5-pro'。"></x-field>
</x-field-group>

### 範例

#### 翻譯特定文件

若要將 `overview.md` 和 `examples.md` 翻譯成中文和日文，請執行以下命令：

```bash
aigne doc translate --langs zh --langs ja --docs overview.md --docs examples.md
```

#### 使用詞彙表和回饋

為確保品牌名稱和技術術語翻譯正確，您可以提供一個詞彙表檔案。您也可以提供回饋來改善翻譯風格。

```bash
aigne doc translate --glossary @path/to/glossary.md --feedback "Use technical terminology consistently" --docs overview.md --langs de
```

#### 指定翻譯模型

若要使用特定的 AI 模型執行翻譯任務，請使用 `--model` 旗標。

```bash
aigne doc translate --docs overview.md --langs fr --model openai:gpt-4o
```

## 支援的語言

DocSmith 支援以下 12 種語言的自動翻譯：

| 語言               | 代碼    |
| -------------------- | ------- |
| 英文                 | `en`    |
| 簡體中文             | `zh-CN` |
| 繁體中文             | `zh-TW` |
| 日文                 | `ja`    |
| 韓文                 | `ko`    |
| 西班牙文             | `es`    |
| 法文                 | `fr`    |
| 德文                 | `de`    |
| 葡萄牙文             | `pt-BR` |
| 俄文                 | `ru`    |
| 義大利文             | `it`    |
| 阿拉伯文             | `ar`    |

---

文件翻譯完成後，您就可以與全世界分享了。

<x-card data-title="下一步：發佈您的文件" data-icon="lucide:upload-cloud" data-href="/features/publish-your-docs" data-cta="閱讀更多">
  關於如何輕鬆將您的文件發佈到公共平台或您自己的私人網站的指南。
</x-card>