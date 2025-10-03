# 管理偏好設定

AIGNE DocSmith 的設計旨在從您的回饋中學習。當您優化或修正生成的內容時，DocSmith 可以將該回饋轉化為持久性規則，稱為偏好設定。這些規則確保您特定的風格、結構要求和內容策略在未來的文檔任務中得到一致應用。所有偏好設定都儲存在您專案根目錄下一個人類可讀的 YAML 檔案中，路徑為 `.aigne/doc-smith/preferences.yml`。

## 偏好設定的生命週期

下圖說明了您的回饋如何成為一個可重複使用的規則，該規則可應用於未來的任務，並可透過命令列進行管理。

```d2 偏好設定的生命週期
direction: down

developer: {
  label: "開發者"
  shape: person
}

docsmith_system: {
  label: "AIGNE DocSmith 系統"
  shape: rectangle

  cli: {
    label: "CLI 指令\n(refine / translate)"
    shape: rectangle
  }

  agent: {
    label: "內部分析 Agent"
    shape: rectangle
  }

  decision: {
    label: "回饋是否為\n可重複使用的策略？"
    shape: diamond
  }

  create_rule: {
    label: "建立新的偏好設定規則"
    shape: rectangle
  }
}

preferences_file: {
  label: ".aigne/doc-smith/preferences.yml"
  shape: cylinder
}

one_time_fix: {
  label: "作為一次性修復應用"
  shape: oval
}

developer -> docsmith_system.cli: "1. 提供回饋"
docsmith_system.cli -> docsmith_system.agent: "2. 捕捉回饋"
docsmith_system.agent -> docsmith_system.decision: "3. 進行分析"
docsmith_system.decision -> docsmith_system.create_rule: "是"
docsmith_system.create_rule -> preferences_file: "4. 將規則儲存至檔案"
docsmith_system.decision -> one_time_fix: "否"
```

### 如何建立偏好設定

當您在 `refine` 或 `translate` 階段提供回饋時，一個內部 Agent 會分析您的輸入。它會判斷該回饋是一次性修復（例如，修正一個錯字）還是可重複使用的策略（例如，「程式碼註解必須以英文撰寫」）。如果它代表一個持久性的指令，它會建立一個新的偏好設定規則，並將其儲存到您專案的 `preferences.yml` 檔案中。

### 規則屬性

儲存在 `preferences.yml` 中的每個規則都具有以下結構：

<x-field-group>
  <x-field data-name="id" data-type="string" data-desc="規則的唯一隨機生成識別碼（例如：pref_a1b2c3d4e5f6g7h8）。"></x-field>
  <x-field data-name="active" data-type="boolean" data-desc="表示規則目前是否啟用。未啟用的規則在生成任務期間會被忽略。"></x-field>
  <x-field data-name="scope" data-type="string">
    <x-field-desc markdown>定義規則應在何時應用。有效的範圍為 `global`、`structure`、`document` 或 `translation`。</x-field-desc>
  </x-field>
  <x-field data-name="rule" data-type="string" data-desc="在未來任務中將傳遞給 AI 的具體、精煉的指令。"></x-field>
  <x-field data-name="feedback" data-type="string" data-desc="使用者提供的原始自然語言回饋，保留以供參考。"></x-field>
  <x-field data-name="createdAt" data-type="string" data-desc="表示規則建立時間的 ISO 8601 時間戳記。"></x-field>
  <x-field data-name="paths" data-type="string[]" data-required="false">
    <x-field-desc markdown>可選的檔案路徑列表。如果存在，此規則僅適用於為這些特定來源檔案生成的內容。</x-field-desc>
  </x-field>
</x-field-group>

## 使用 CLI 管理偏好設定

您可以使用 `aigne doc prefs` 指令來檢視和管理所有已儲存的偏好設定。這讓您可以列出、啟用、停用或永久移除規則。

### 列出所有偏好設定

要查看所有已儲存偏好設定的完整列表（包括啟用和未啟用的），請使用 `--list` 標記。

```bash 列出所有偏好設定 icon=lucide:terminal
aigne doc prefs --list
```

該指令會顯示一個格式化的列表，顯示每個規則的狀態、範圍、ID 以及任何路徑限制。

```text 輸出範例 icon=lucide:clipboard-list
# 使用者偏好設定

**格式說明：**
- 🟢 = 啟用中的偏好設定，⚪ = 未啟用的偏好設定
- [scope] = 偏好設定範圍 (global, structure, document, translation)
- ID = 唯一偏好設定識別碼
- Paths = 特定檔案路徑（如果適用）

🟢 [structure] pref_a1b2c3d4e5f6g7h8 | Paths: overview.md
   在概覽文件的末尾新增一個「後續步驟」部分。
 
⚪ [document] pref_i9j0k1l2m3n4o5p6
   程式碼註解必須以英文撰寫。
```

### 停用與重新啟用偏好設定

如果您需要暫時停用一個規則而不刪除它，您可以使用 `--toggle` 標記來切換其啟用狀態。若執行指令時不帶 ID，將會啟動互動模式，讓您選擇一個或多個偏好設定進行切換。

```bash 以互動模式切換偏好設定 icon=lucide:terminal
aigne doc prefs --toggle
```

要直接切換特定規則，請使用 `--id` 標記提供其 ID。此操作會更改規則的 `active` 屬性。

```bash 切換特定偏好設定 icon=lucide:terminal
aigne doc prefs --toggle --id pref_i9j0k1l2m3n4o5p6
```

### 移除偏好設定

要永久刪除一個或多個偏好設定，請使用 `--remove` 標記。此操作無法復原。

若要進入互動式選擇提示，請在不帶 ID 的情況下執行該指令。

```bash 以互動模式移除偏好設定 icon=lucide:terminal
aigne doc prefs --remove
```

要直接移除特定規則，請使用 `--id` 標記提供其 ID。

```bash 移除特定偏好設定 icon=lucide:terminal
aigne doc prefs --remove --id pref_a1b2c3d4e5f6g7h8
```

## 後續步驟

管理偏好設定是根據您專案的特定需求量身打造 DocSmith 的關鍵部分。如需更多自訂選項，請探索主要的[設定指南](./configuration.md)。