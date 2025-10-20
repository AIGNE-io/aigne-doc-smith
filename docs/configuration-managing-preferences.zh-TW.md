# 管理偏好設定

當您產生或更新文件時，可以使用 `--feedback` 標誌提供回饋。此回饋會被儲存為「偏好設定」，以便在未來的會話中重複使用，確保 AI 與您先前的指示保持一致。`aigne doc prefs` 命令提供了直接管理這些已儲存偏好設定的方法。

本指南詳細說明如何列出、移除和切換已儲存偏好設定的啟用狀態。

## 檢視已儲存的偏好設定

若要檢視所有已儲存的偏好設定，請使用 `--list` 標誌。此命令會顯示每個偏好設定的狀態、範圍、唯一 ID 和內容。

```bash
aigne doc prefs --list
```

### 理解輸出內容

列表的格式旨在提供關於每個偏好設定規則的清晰資訊：

*   **狀態**：表示偏好設定為啟用或停用。
    *   `🟢`：啟用。該規則將在文件產生期間套用。
    *   `⚪`：停用。該規則已儲存但將被忽略。
*   **範圍**：偏好設定套用的情境（例如 `global`、`document`）。
*   **ID**：偏好設定的唯一識別碼，用於移除或切換。
*   **路徑**：如果偏好設定僅適用於特定檔案，此處會列出其路徑。
*   **規則內容**：偏好設定規則本身的文字。

**範例輸出：**

```
# 使用者偏好設定

**格式說明：**
- 🟢 = 啟用偏好設定，⚪ = 停用偏好設定
- [scope] = 偏好設定範圍 (global, structure, document, translation)
- ID = 唯一偏好設定識別碼
- Paths = 特定檔案路徑（如適用）

🟢 [document] pref_a1b2c3d4e5f6a7b8 | Paths: /guides/generating-documentation.md
   Focus on concrete, verifiable facts and information. Avoid using vague or empty words that don't provide measurable or specific d...

⚪ [global] pref_b8a7f6e5d4c3b2a1
   Use a formal and academic tone throughout the documentation.

```

## 移除偏好設定

當不再需要某個偏好設定時，您可以使用 `--remove` 標誌將其永久刪除。您可以透過指定其 ID 或透過互動式選單來移除偏好設定。

### 互動模式

若要從列表中選取偏好設定，請執行不含任何 ID 的命令。這將開啟一個互動式提示，您可以在其中勾選希望刪除的項目。

```bash
aigne doc prefs --remove
```

將會出現一個清單，讓您選取一個或多個偏好設定。這是確保您移除正確項目的建議方法。

### 直接模式

如果您已經知道要移除的偏好設定的唯一 ID，可以使用 `--id` 標誌來指定它們。如果您確定要刪除哪些項目，這種方式會更快。

```bash
# 移除單一偏好設定
aigne doc prefs --remove --id pref_a1b2c3d4e5f6a7b8

# 移除多個偏好設定
aigne doc prefs --remove --id pref_a1b2c3d4e5f6a7b8 --id pref_b8a7f6e5d4c3b2a1
```

## 切換偏好設定

您可以暫時啟用或停用偏好設定，而不是永久刪除它。當您想為特定任務暫停某個規則而不想遺失它時，這非常有用。使用 `--toggle` 標誌來變更偏好設定的啟用狀態。

### 互動模式

執行不含 ID 的命令將會啟動一個互動式清單，類似於移除命令。

```bash
aigne doc prefs --toggle
```

您可以選取希望啟用或停用的偏好設定。狀態圖示（`🟢`/`⚪`）將會更新以反映新的狀態。

### 直接模式

若要直接切換特定的偏好設定，請使用 `--id` 標誌。

```bash
# 切換單一偏好設定
aigne doc prefs --toggle --id pref_a1b2c3d4e5f6a7b8

# 切換多個偏好設定
aigne doc prefs --toggle --id pref_a1b2c3d4e5f6a7b8 --id pref_b8a7f6e5d4c3b2a1
```

---

透過管理您的偏好設定，您可以對文件產生過程進行精細的控制，確保輸出結果始終符合您專案的特定要求和風格。