# 疑難排解

本指南協助您診斷和修復使用 AIGNE DocSmith 時遇到的常見問題。如果您在產生、發布或設定過程中遇到問題，請查看以下情境的解決方案。

---

## 設定問題

### 問題 1：設定檔格式錯誤

**錯誤訊息：**
```
Error: Failed to parse config file: Implicit map keys need to be followed by map values at line 112, column 1:

lastGitHead: d9d2584f23aee352485f369f60142949db601283
appUrl： https://docsmith.aigne.io
```

```
Error: Failed to parse config file: Map keys must be unique at line 116, column 1:

docsDir: .aigne/doc-smith/docs
appUrl: https://docsmith.aigne.io
^
```

**可能原因：** 設定檔中的 YAML 語法錯誤，常見問題包括：
- 使用 tab 而不是空格進行縮排
- 使用中文冒號（：）而不是英文冒號（:）
- 缺少必要的引號
- 重複的設定項

**解決方案：**
1. 檢查錯誤訊息中的行號以定位問題
2. 確認縮排是否正確（使用空格，而非 tab）
3. 確保冒號是英文半形冒號（:），而不是中文全形冒號（：）
4. 使用線上 YAML 驗證器檢查語法
5. 修復後，再次執行 `aigne doc publish`

---

> **提示：** 除了修復設定檔格式錯誤外，如果某些參數未正確設定，系統會自動使用預設值，這不會影響基本功能。

## 產生問題

### 問題 2：產生的內容不符合預期

**您可能會遇到：**
- 產生的內容語氣不符合您的要求
- 文件結構與您的期望不符
- 缺少一些重要資訊

**可能原因：**
1. 設定中的 `rules` 描述不夠詳細或清晰
2. `targetAudienceTypes` 設定與實際目標受眾不符
3. `sourcesPath` 中的參考文件太少或不相關

**如何修復：**
1. **豐富 `rules`：** 在 `config.yaml` 中新增詳細的指導：
   ```yaml
   rules: |
     ### 文件結構要求
     1. 每份文件必須包含：
        * 清晰的標題和概述
        * 逐步說明
        * 適用的程式碼範例
        * 疑難排解部分
     
     ### 內容語氣
     - 使用清晰、簡潔的語言
     - 包含具體資料和範例
     - 避免行銷術語
     - 專注於可操作的資訊
   ```

2. **調整受眾：** 確保 `targetAudienceTypes` 與實際受眾相符：
   ```yaml
   targetAudienceTypes:
     - endUsers      # 針對終端使用者
     - developers     # 針對技術受眾
   ```

3. **新增更多來源：** 在 `sourcesPath` 中包含相關文件：
   ```yaml
   sourcesPath:
     - ./README.md
     - ./docs
     - ./CHANGELOG.md
     - ./src
     - ./package.json
   ```

---

### 問題 3：圖片品質低或缺失

**您可能會遇到：**
- 產生文件中圖片不夠清晰
- 預期的圖片沒有出現

**原因：** `media.minImageWidth` 設定值過高，過濾掉了一些圖片。

**如何修復：**
1. 開啟 `config.yaml` 檔案並找到 `media` 設定：
   ```yaml
   media:
     minImageWidth: 800  # 目前的閾值
   ```

2. 根據您的需求調整此值：
   - **400-600**：會包含更多圖片，但可能包含一些品質較低的圖片
   - **600-800**：平衡品質與數量（建議設定）
   - **800-1000**：僅高品質圖片，數量較少

3. 儲存檔案後，執行更新指令：
   ```bash
   aigne doc update
   ```

---

### 問題 4：文件缺失或不完整

**您可能會遇到：**
- 某些預期的文件未被產生
- 產生的文件不完整

**可能原因：**
1. `sourcesPath` 未包含所有必要的來源檔案
2. 來源檔案無法存取或有權限問題
3. `documentationDepth` 設定得太低

**如何修復：**
1. **檢查來源路徑：** 確認所有必要檔案都已包含：
   ```yaml
   sourcesPath:
     - ./README.md
     - ./src              # 包含原始碼目錄
     - ./docs             # 包含現有文件
     - ./package.json      # 包含設定檔
   ```

2. **增加文件深度：** 如果您需要全面的文件：
   ```yaml
   documentationDepth: comprehensive  # 而不是 essentialOnly
   ```

3. **驗證檔案權限：** 確保 DocSmith 對 `sourcesPath` 中的所有檔案都有讀取權限

---

## 翻譯問題

### 問題 5：翻譯失敗或品質不佳

**您可能會遇到：**
- 翻譯指令失敗
- 翻譯後的內容品質不佳或有錯誤

**可能原因：**
1. `locale` 和 `translateLanguages` 設定衝突
2. 來源文件有語法錯誤
3. 翻譯過程中的網路問題

**如何修復：**
1. **檢查語言設定：** 確保 `translateLanguages` 不包含與 `locale` 相同的語言：
   ```yaml
   locale: en
   translateLanguages:
     - zh        # 可以
     - ja        # 可以
     # - en      # ❌ 不要包含 locale 語言
   ```

2. **修復來源文件：** 翻譯前確保來源文件有效：
   ```bash
   # 首先驗證來源文件是否正確
   aigne doc create
   
   # 然後再進行翻譯
   aigne doc translate
   ```

3. **重試翻譯：** 如果發生網路問題，只需再次執行指令：
   ```bash
   aigne doc translate
   ```

---

## 發布問題

### 問題 6：發布失敗並出現無效 URL 錯誤

**錯誤訊息：**
```
Error: ⚠️  The provided URL is not a valid ArcBlock-powered website

💡 Solution: To host your documentation, you can get a website from the ArcBlock store:
```

**原因：** 設定中的 `appUrl` 為空或指向一個無效的網站地址。

**如何修復：**
在 `config.yaml` 中設定正確的部署地址：
```yaml
# 輸入您的網站地址
appUrl: https://your-site.user.aigne.io

# 如果您還沒有網站，可以暫時將此留空
# appUrl: ""
```

或者，您可以在發布時指定 URL：
```bash
aigne doc publish --appUrl https://your-docs-website.com
```

---

### 問題 7：發布失敗並出現授權錯誤

**錯誤訊息：**
```
❌ Publishing failed due to an authorization error:
💡 Please run aigne doc clear to reset your credentials and try again.
```

```
❌ Publishing failed due to an authorization error:
💡 You're not the creator of this document (Board ID: docsmith). You can change the board ID and try again.
💡  Or run aigne doc clear to reset your credentials and try again.
```

**原因：** 您的登入憑證已過期或您沒有權限發布到指定的看板。

**如何修復：**
依序執行以下指令：
```bash
# 首先清除舊的授權資訊
aigne doc clear

# 然後重新發布，系統會提示您重新登入
aigne doc publish
```

執行 `aigne doc clear` 時，選擇清除驗證權杖。之後，再次執行 `aigne doc publish`，系統將提示您重新進行驗證。

---

### 問題 8：因網路問題導致發布失敗

**錯誤訊息：**
```
❌ Could not connect to: https://your-site.com

Possible causes:
• There may be a network issue.
• The server may be temporarily unavailable.
• The URL may be incorrect.

Suggestion: Please check your network connection and the URL, then try again.
```

**如何修服：**
1. **檢查網路連線：** 確保您的網路可以存取目標 URL
2. **驗證 URL：** 確認 `appUrl` 正確且可存取
3. **重試：** 網路問題通常是暫時的，稍後再試一次：
   ```bash
   aigne doc publish
   ```

---

## 如何復原

### 方法 1：使用 Git 還原

如果您使用 Git 管理您的程式碼，您可以快速還原到先前可運作的設定：

```bash
# 暫存目前變更
git stash
```

然後重新產生文件：
```bash
aigne doc create
```

> **提示：** 如果您稍後想還原暫存的變更，可以執行 `git stash pop`

---

### 方法 2：清除並重新產生

如果您遇到無法定位的問題，可以清除所有產生的檔案並從頭開始重新產生：

```bash
# 清除所有產生的檔案，然後重新產生
aigne doc clear && aigne doc create
```

> **注意：** 這將刪除所有產生的內容，但不會影響您的設定檔。執行後，系統將根據目前的設定重新產生文件。

---

### 方法 3：重設設定

如果設定問題持續存在，您可以重設設定檔：

```bash
# 清除設定（在提示時選擇設定檔）
aigne doc clear

# 然後重新初始化
aigne doc init
```

> **警告：** 這將移除您目前的設定。在繼續之前，請務必備份重要設定。

---

## 最佳實踐

這裡有一些實用建議，幫助您避免常見問題：

1. **儲存修改歷史：** 如果使用 Git，每次修改設定檔後都進行提交，這樣在出現問題時可以輕鬆還原到先前的版本
2. **修改前備份：** 在修改重要設定前，將設定檔複製一份作為備份，以防萬一
3. **修改後立即測試：** 每次修改設定後，立即執行 `aigne doc create` 或 `aigne doc update` 進行測試，以便及早發現問題
4. **檢查格式正確性：** 修改 YAML 檔案後，使用線上工具檢查格式是否有誤
5. **從簡單開始：** 從最簡單的設定開始，確認一切正常後，再逐步增加更複雜的功能
6. **記錄您的修改：** 簡單記錄每次修改了什麼以及原因，這樣日後出現問題時更容易找到原因
7. **保持來源更新：** 定期更新 `sourcesPath` 以包含新的來源檔案和文件
8. **審查產生的內容：** 產生後，審查輸出內容以確保在發布前符合預期

---

## 取得更多協助

如果上述方法無法解決您的問題，您可以嘗試：

1. **查閱設定文件：** 查看 [設定參考](./configuration.md) 以了解每個設定項的詳細說明

2. **查看指令文件：** 參考指令文件以了解指令的詳細用法

3. **審查錯誤日誌：** 仔細閱讀終端機中顯示的錯誤訊息，其中通常包含具體的提示

4. **使用 AIGNE 可觀測性：** 使用下面描述的 AIGNE 可觀測性工具取得詳細的執行記錄

5. **尋求社群協助：** 前往 [AIGNE 社群](https://community.arcblock.io/discussions/boards/aigne) 提問，其他使用者或開發者可能會幫助您

---

## 使用 AIGNE 可觀測性進行疑難排解

當您遇到需要深入排查的複雜問題，或需要向社群回報問題時，可以使用 **AIGNE 可觀測性**。它詳細記錄了執行過程的每一步，幫助您或技術支援人員快速定位問題。

### 啟動可觀測性伺服器

執行以下指令以啟動本地可觀測性伺服器：

```bash 啟動可觀測性伺服器 icon=lucide:terminal
aigne observe
```

您將看到輸出顯示：
- 資料庫路徑：追蹤資料儲存的位置
- 伺服器地址：在瀏覽器中開啟此地址以查看可觀測性儀表板

![可觀測性指令](../../../assets/screenshots/doc-aigne-observe.png)

### 查看執行記錄

1. **開啟儀表板：** 點擊輸出中顯示的伺服器地址，或在瀏覽器中開啟它

2. **查看操作記錄：** 儀表板將顯示所有 DocSmith 操作，包括：
   - 輸入和輸出資料
   - 每一步驟所花費的時間
   - 執行的操作步驟和結果
   - 詳細的錯誤訊息

![可觀測性儀表板](../../../assets/screenshots/doc-observe-dashboard.png)

### 使用可觀測性回報問題

向社群回報問題時：

1. **擷取追蹤：** 在有問題的操作期間保持可觀測性伺服器運作
2. **匯出追蹤資料：** 從儀表板匯出相關的執行記錄
3. **回報問題：** 前往 [AIGNE 社群](https://community.arcblock.io/discussions/boards/aigne) 並附上：
   - 問題描述
   - 重現步驟
   - 匯出的追蹤檔案
   - 您的設定（如果相關）

> **提示：** 追蹤記錄包含 DocSmith 執行的完整資訊，包括每個操作和結果。將此資訊提供給技術支援或社群，可以大大提高問題解決效率。