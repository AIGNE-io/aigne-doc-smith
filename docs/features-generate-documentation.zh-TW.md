# 產生文件

`aigne doc generate` 命令是從您的原始碼建立完整文件集的核心功能。此過程會分析您的程式碼庫、規劃邏輯性的文件結構，然後為每個部分產生內容。這是從零開始建立文件的主要方式。

## 您的首次產生

首先，請導覽至您專案的根目錄並執行以下命令：

```bash
aigne doc generate
```

### 自動設定

當您首次在專案中執行此命令時，DocSmith 會偵測到尚無設定。接著，它會啟動一個互動式設定精靈，引導您完成初始設定。這能確保在開始產生文件前，您擁有一個正確配置的環境。

![首次執行 generate 命令會觸發設定精靈](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

系統會詢問您一系列問題以定義：

- 文件產生規則與風格
- 目標讀者
- 主要語言與翻譯語言
- 原始碼與輸出路徑

![回答問題以設定您的文件風格、語言和來源路徑](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

設定完成後，DocSmith 將繼續進行文件產生。

![DocSmith 會分析您的程式碼、規劃結構並產生每個文件](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

成功完成後，您新建立的文件將會出現在您指定的輸出目錄中。

![完成後，您將在指定的輸出目錄中找到新文件](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

## 產生過程

`generate` 命令遵循一個自動化的工作流程。其過程可視覺化如下：

```d2
direction: down

start: "開始" {
  shape: oval
}

run_cmd: "執行 `aigne doc generate`" {
  shape: rectangle
}

check_config: "找到設定檔？" {
  shape: diamond
}

interactive_setup: "啟動互動式設定精靈" {
  shape: rectangle
}

plan_structure: "1. 分析程式碼並規劃結構" {
  shape: rectangle
}

gen_content: "2. 產生文件內容" {
  shape: rectangle
}

save_docs: "3. 儲存文件" {
  shape: rectangle
}

end: "結束" {
  shape: oval
}

start -> run_cmd
run_cmd -> check_config
check_config -> interactive_setup: "否"
interactive_setup -> plan_structure
check_config -> plan_structure: "是"
plan_structure -> gen_content
gen_content -> save_docs
save_docs -> end
```

## 命令選項

雖然預設的 `generate` 命令已足夠應付大多數使用情境，但您仍可使用數個選項來控制產生過程。這些選項對於重新產生內容或優化文件結構很有幫助。

| Option              | Description                                                                                                                              | Example                                                              |
|---------------------|------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------|
| `--forceRegenerate` | 刪除所有現有文件並從頭開始重新產生。當您的原始碼或設定有重大變更時，請使用此選項。 | `aigne doc generate --forceRegenerate`                                 |
| `--feedback`        | 提供高層次的回饋以優化整體文件結構，例如新增、移除或重組章節。           | `aigne doc generate --feedback "Add an API Reference section"`         |
| `--model`           | 指定一個來自 AIGNE Hub 的特定大型語言模型用於內容產生，讓您可以在不同模型之間切換。       | `aigne doc generate --model claude:claude-3-5-sonnet`                |

## 接下來呢？

既然您已經產生了初始文件，您的專案將會持續發展。為了讓文件與程式碼保持同步，您需要更新它們。請前往下一節，學習如何進行針對性修改並重新產生特定檔案。

<x-card data-title="更新與優化" data-icon="lucide:file-edit" data-href="/features/update-and-refine">
  了解當程式碼變更時如何更新文件，或利用回饋進行特定改進。
</x-card>