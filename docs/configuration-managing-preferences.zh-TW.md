# 管理偏好設定

您是否曾希望您的 AI 助理能記住您的指示？本指南將說明如何檢視、移除和切換您儲存的文件產生偏好設定，讓您能精細地控制 AI 的輸出，並確保其始終遵循您專案的特定風格。

當您產生或更新文件時，可以使用 `--feedback` 旗標提供回饋。此回饋會被儲存為「偏好設定」，以便在未來的會話中重複使用，確保 AI 與您先前的指示保持一致性。`aigne doc prefs` 指令提供了一種直接管理這些已儲存偏好設定的方式。

本指南詳細說明如何列出、移除和切換已儲存偏好設定的啟用狀態。

```d2
direction: down

User: {
  shape: c4-person
}

CLI-Interface: {
  label: "CLI: aigne doc prefs"
  shape: rectangle

  List-Action: {
    label: "--list"
    shape: oval
  }

  Remove-Action: {
    label: "--remove"
    shape: diamond

    Interactive-Remove: {
      label: "互動模式"
      shape: rectangle
    }

    Direct-Remove: {
      label: "直接模式\n(使用 --id)"
      shape: rectangle
    }
  }

  Toggle-Action: {
    label: "--toggle"
    shape: diamond

    Interactive-Toggle: {
      label: "互動模式"
      shape: rectangle
    }

    Direct-Toggle: {
      label: "直接模式\n(使用 --id)"
      shape: rectangle
    }
  }
}

Preference-Storage: {
  label: "偏好設定儲存區"
  shape: cylinder
}

User -> CLI-Interface: "執行指令"
CLI-Interface.List-Action -> Preference-Storage: "讀取"
CLI-Interface.Remove-Action -> CLI-Interface.Interactive-Remove: "無 ID"
CLI-Interface.Remove-Action -> CLI-Interface.Direct-Remove: "指定 ID"
CLI-Interface.Interactive-Remove -> Preference-Storage: "刪除所選項目"
CLI-Interface.Direct-Remove -> Preference-Storage: "刪除指定項目"
CLI-Interface.Toggle-Action -> CLI-Interface.Interactive-Toggle: "無 ID"
CLI-Interface.Toggle-Action -> CLI-Interface.Direct-Toggle: "指定 ID"
CLI-Interface.Interactive-Toggle -> Preference-Storage: "更新所選項目"
CLI-Interface.Direct-Toggle -> Preference-Storage: "更新指定項目"
```

## 檢視已儲存的偏好設定

若要檢視所有已儲存的偏好設定，請使用 `--list` 旗標。此指令會顯示每個偏好設定的狀態、範圍、唯一 ID 和內容。

```bash icon=lucide:terminal
aigne doc prefs --list
```

### 理解輸出內容

列表的格式旨在提供關於每個偏好設定規則的清晰資訊：

*   **Status**：表示偏好設定是啟用或停用。
    *   `🟢`：啟用。此規則將在文件產生過程中被套用。
    *   `⚪`：停用。此規則已儲存但將被忽略。
*   **Scope**：偏好設定應用的情境（例如 `global`、`document`）。
*   **ID**：偏好設定的唯一識別碼，用於移除或切換狀態。
*   **Paths**：如果偏好設定僅適用於特定檔案，此處會列出其路徑。
*   **Rule Content**：偏好設定規則本身的文字內容。

**輸出範例：**

```
# User Preferences

**Format explanation:**
- 🟢 = Active preference, ⚪ = Inactive preference
- [scope] = Preference scope (global, structure, document, translation)
- ID = Unique preference identifier
- Paths = Specific file paths (if applicable)

🟢 [document] pref_a1b2c3d4e5f6a7b8 | Paths: /guides/generating-documentation.md
   Focus on concrete, verifiable facts and information. Avoid using vague or empty words that don't provide measurable or specific d...

⚪ [global] pref_b8a7f6e5d4c3b2a1
   Use a formal and academic tone throughout the documentation.

```

## 移除偏好設定

當不再需要某個偏好設定時，您可以使用 `--remove` 旗標將其永久刪除。您可以透過指定其 ID 或透過互動式選單來移除偏好設定。

### 互動模式

若要從列表中選擇偏好設定，請在不帶任何 ID 的情況下執行指令。這將開啟一個互動式提示，您可以在其中勾選希望刪除的項目。

```bash icon=lucide:terminal
aigne doc prefs --remove
```

將會出現一個清單，讓您選擇一個或多個偏好設定。這是確保您移除正確項目的建議方法。

### 直接模式

如果您已經知道要移除的偏好設定的唯一 ID，可以使用 `--id` 旗標來指定它們。如果您確定要刪除哪些項目，這種方式會更快。

```bash icon=lucide:terminal
# 移除單一偏好設定
aigne doc prefs --remove --id pref_a1b2c3d4e5f6a7b8

# 移除多個偏好設定
aigne doc prefs --remove --id pref_a1b2c3d4e5f6a7b8 --id pref_b8a7f6e5d4c3b2a1
```

## 切換偏好設定

您可以暫時啟用或停用偏好設定，而不是永久刪除它。當您想為特定任務暫停某個規則而不遺失它時，這非常有用。使用 `--toggle` 旗標來更改偏好設定的啟用狀態。

### 互動模式

在不帶 ID 的情況下執行指令將啟動一個互動式清單，類似於移除指令。

```bash icon=lucide:terminal
aigne doc prefs --toggle
```

您可以選擇希望啟用或停用的偏好設定。狀態圖示（`🟢`/`⚪`）將更新以反映新的狀態。

### 直接模式

若要直接切換特定偏好設定的狀態，請使用 `--id` 旗標。

```bash icon=lucide:terminal
# 切換單一偏好設定
aigne doc prefs --toggle --id pref_a1b2c3d4e5f6a7b8

# 切換多個偏好設定
aigne doc prefs --toggle --id pref_a1b2c3d4e5f6a7b8 --id pref_b8a7f6e5d4c3b2a1
```

---

透過管理您的偏好設定，您可以對文件產生過程進行精細控制，確保輸出始終符合您專案的特定要求和風格。