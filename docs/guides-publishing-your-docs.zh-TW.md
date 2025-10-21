# 發佈您的文件

產生文件後，下一步是讓它在線上可供存取。本指南提供了使用 `aigne doc publish` 指令發佈文件的系統性步驟。

## 發佈指令

`aigne doc publish` 指令會將您產生的文件檔案上傳到網路服務，讓您的受眾可以透過網頁瀏覽器存取。

為了方便起見，您可以使用其完整名稱或別名之一來執行此指令。

```bash Command Execution icon=lucide:terminal
# 完整指令
aigne doc publish

# 別名
aigne doc pub
aigne doc p
```

首次執行此指令時，它會啟動一個互動式提示，引導您選擇發佈平台。

![Publish Documentation Dialog](../assets/screenshots/doc-publish.png)

## 發佈目的地

此工具提供了幾個託管您文件的目的地。互動式設定將會呈現以下選項。

### 選項 1：DocSmith Cloud

此選項會將您的文件發佈到 `docsmith.aigne.io`，這是一個免費的託管服務。

*   **預期用途**：此方法適用於開源專案或任何旨在供公眾存取的文件。
*   **費用**：免費。
*   **結果**：發佈流程完成後，您的文件將在一個提供的 URL 上公開可用。

### 選項 2：您現有的網站

此選項可讓您將文件發佈到您已經擁有並管理的網站。它需要您運行自己的 Discuss Kit 實例。

*   **預期用途**：這適用於將文件直接整合到現有的公司網站、產品入口網站或個人網域。
*   **要求**：您必須擁有自己的託管基礎設施和一個正在運行的 Discuss Kit 實例。
*   **流程**：
    1.  從互動式提示中選擇「Your existing website」選項。
    2.  出現提示時，輸入您網站的完整 URL（例如：`https://docs.your-company.com`）。
    3.  若要設定您自己的文件網站，您可以從官方商店取得 Discuss Kit 實例：[https://www.web3kit.rocks/discuss-kit](https://www.web3kit.rocks/discuss-kit)。Discuss Kit 是一個非開源服務，提供託管所需的後端。

### 選項 3：新網站

此選項可協助您為您的文件建立一個新的專用網站。

*   **預期用途**：這適用於需要獨立文件入口網站但沒有現有網站的使用者。
*   **費用**：這是一項付費服務。
*   **流程**：命令列介面將引導您完成部署和設定新 Discuss Kit 實例的過程。如果您之前已開始此過程，也會提供一個恢復設定的選項。

## 自動化發佈

對於自動化環境，例如持續整合/持續部署 (CI/CD) 管線，您可以透過直接指定目的地 URL 來繞過互動式提示。

使用指令的 `--appUrl` 旗標來定義發佈目標。

```bash Direct Publishing Example icon=lucide:terminal
aigne doc publish --appUrl https://docs.your-company.com
```

當您首次發佈到特定 URL（無論是透過互動式提示還是 `--appUrl` 旗標），此工具會將此 URL 儲存到您的本地設定檔中。後續執行 `aigne doc publish` 時將自動使用已儲存的 URL，從而簡化更新流程。

## 疑難排解

### 授權錯誤

如果發佈過程失敗，並出現包含「401」或「403」的錯誤訊息，這表示您的驗證權杖有問題。該權杖可能無效、已過期或缺少必要的權限。

若要解決此問題，您可以重設您的本地驗證權杖。`clear` 指令提供了一個清除您已儲存憑證的選項。

```bash Clear Configuration icon=lucide:terminal
aigne doc clear
```

出現提示時，您可以選擇清除 `authTokens` 以重設您的登入會話。指令完成後，再次執行 `aigne doc publish`。系統會提示您重新驗證，這將產生一個新的有效權杖。

---

成功發佈文件後，您可能需要隨著專案的演進而更新它。有關此過程的說明，請參閱 [更新文件](./guides-updating-documentation.md) 指南。