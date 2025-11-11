# 互動式聊天

是否對命令列選項感到不知所措？本指南將說明如何使用互動式聊天助理，這是一個對話式介面，能簡化文件處理過程的每一步。讀完本指南後，您將能夠使用簡單、自然的語言指令來生成、更新、翻譯和發布您的文件。

聊天助理是管理文件的建議方法，因为它提供了一個引導式工作流程，無需記憶特定的指令及其參數。

## 啟動互動式會話

若要啟動聊天助理，請在您專案的根目錄中執行 `chat` 指令。

```bash aigne doc chat icon=lucide:terminal
aigne doc chat
```

此指令將啟動互動式會話，助理會提示您輸入指令。

## 核心功能

聊天助理將多個核心功能整合到一個單一的對話式介面中，從而簡化了整個文件生命週期。您可以用淺白的語言說明您的目標，助理將執行必要的步驟。

<x-cards data-columns="2">
  <x-card data-title="生成文件" data-icon="lucide:file-plus-2">
    透過分析您專案的原始碼，建立完整的文件結構和初始內容。
  </x-card>
  <x-card data-title="更新與優化" data-icon="lucide:edit">
    根據您的回饋或原始碼的最新變更，修改特定文件或整個章節。
  </x-card>
  <x-card data-title="翻譯內容" data-icon="lucide:languages">
    將您的文件翻譯成多種支援的語言，以服務全球受眾。
  </x-card>
  <x-card data-title="發布您的文件" data-icon="lucide:upload-cloud">
    遵循引導式流程來發布您的文件，並使其在線上可用。
  </x-card>
</x-cards>

## 互動方式

您主要可以透過兩種方式與助理互動：

1.  **自然語言指令**：描述您想要完成的任務。助理會解讀您的請求並啟動適當的工作流程。例如，您可以輸入「為這個專案生成文件」或「將安裝指南翻譯成德文和法文」。
2.  **直接指令**：您也可以直接在聊天提示中輸入特定功能的指令名稱來呼叫它，例如 `update` 或 `publish`。

## 可用指令

聊天助理能理解一系列與其主要功能相對應的指令。雖然您可以使用自然語言觸發這些功能，但也可以直接使用這些指令。

| Command | Description |
| :--- | :--- |
| `generate` | 啟動工作流程，從原始檔案建立新的文件結構和內容。 |
| `update` | 根據程式碼變更或使用者回饋，開始修改現有文件的流程。 |
| `translate` | 開始將文件翻譯成一種或多種支援語言的流程。 |
| `publish` | 引導您完成將文件發布到線上的步驟。 |
| `init` | 協助為專案建立初始設定檔（`docsmith.config.js`）。 |
| `clear` | 從您的專案中移除已生成的檔案、設定和快取資料。 |
| `prefs` | 讓您檢視和管理已儲存的文件生成偏好設定。 |
| `evaluate` | 評估您生成文件的品質和完整性，並提供一份報告。 |
| `history` | 顯示您文件的更新和變更歷史記錄。 |
| `exit` | 終止互動式聊天會話，並返回標準的終端機提示符。 |

## 互動範例

以下對話記錄展示了使用聊天助理生成新文件的一般工作流程。

```text
You:
> I need to create documentation for this project.

AI Assistant:
Understood. I will start the documentation generation process for the current directory.
First, I will analyze your project to propose a documentation structure. This may take a few moments...
...
Analysis complete. I have created a proposed structure. Would you like to review it before I generate the content? (yes/no)

You:
> yes

AI Assistant:
(The proposed documentation structure is displayed here for your review.)
...
You can request changes, such as 'add a guide for API authentication' or 'merge the installation and setup guides'. If the structure is correct, simply type 'continue'.

You:
> continue

AI Assistant:
Great. I will now proceed with generating the content for each document. This may take some time depending on the size of your project.
```

此互動展示了助理如何引導使用者完成分析、審查和內容生成，僅需簡單的文字回應。

## 總結

互動式聊天助理提供了一種系統化且引導式的文件管理方法。它將工具的完整功能整合到一個單一的對話式介面中，確保了工作流程的精確與高效。

若要查看聊天助理的實際應用，請參考 [生成文件](./guides-generating-documentation.md) 指南，其中有詳細的逐步解說。