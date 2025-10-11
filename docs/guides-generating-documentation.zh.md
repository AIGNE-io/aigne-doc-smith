# 生成文档

本指南提供了从项目源文件创建一套完整文档的系统化流程。该流程通过 `aigne doc generate` 命令启动，该命令会分析你的代码库，提出一个逻辑结构，然后为每个文档编写内容。

该命令是初次创建文档的主要工具。如需在文档创建后进行修改，请参阅[更新文档](./guides-updating-documentation.md)指南。

### 生成工作流

`generate` 命令会执行一系列自动化步骤来构建你的文档。该流程设计为交互式，允许你在内容写入前审查并批准建议的结构。

```d2
direction: down

start: {
  label: "开始"
  shape: oval
}

run_command: {
  label: "运行 'aigne doc generate'"
  shape: rectangle
}

check_config: {
  label: "配置文件是否存在？"
  shape: diamond
}

interactive_setup: {
  label: "引导进行交互式设置"
  shape: rectangle
  tooltip: "如果未找到 .aigne/doc-smith/config.yaml，则会触发交互式设置。"
}

propose_structure: {
  label: "分析项目并提出文档结构"
  shape: rectangle
}

review_structure: {
  label: "用户审查建议的结构"
  shape: rectangle
}

user_approve: {
  label: "批准结构？"
  shape: diamond
}

provide_feedback: {
  label: "提供反馈以优化结构"
  shape: rectangle
  tooltip: "用户可以请求更改，例如重命名、添加或删除章节。"
}

generate_content: {
  label: "为所有文档生成内容"
  shape: rectangle
}

end: {
  label: "结束"
  shape: oval
}

start -> run_command
run_command -> check_config
check_config -> interactive_setup: {
  label: "否"
}
interactive_setup -> propose_structure
check_config -> propose_structure: {
  label: "是"
}
propose_structure -> review_structure
review_structure -> user_approve
user_approve -> provide_feedback: {
  label: "否"
}
provide_feedback -> review_structure
user_approve -> generate_content: {
  label: "是"
}
generate_content -> end
```

## 分步流程

要生成文档，请在终端中导航到项目的根目录，并按照以下步骤操作。

### 1. 运行生成命令

执行 `generate` 命令以开始此过程。该工具将首先分析你项目的文件和结构。

```bash 基本生成命令
aigne doc generate
```

为简洁起见，你也可以使用别名 `gen` 或 `g`。

### 2. 审查文档结构

分析完成后，该工具将显示建议的文档结构并提示你进行审查：

```
你希望优化文档结构吗？
❯ 不，看起来不错
  是的，优化结构（例如，将“入门指南”重命名为“快速入门”，将“API 参考”移至“配置”之前）
```

-   **不，看起来不错**：选择此选项以批准建议的结构，并直接进入内容生成阶段。
-   **是的，优化结构**：选择此选项以修改计划。该工具将在一个交互式循环中征求你的反馈。你可以用纯文本提供指令，例如：
    -   `添加一个新文档“故障排除”`
    -   `删除“旧版功能”文档`
    -   `将“安装”移动到结构顶部`

    在每次反馈后，AI 将修订结构，你可以再次审查。不输入任何反馈直接按 Enter 键即可退出循环并批准最终结构。

### 3. 内容生成

文档结构一经批准，DocSmith 将开始为计划中的每个文档生成详细内容。此过程自动运行，其持续时间取决于项目的规模和复杂性。

完成后，生成的文件将保存到你在配置中指定的输出目录（例如 `./docs`）。

## 命令参数

`generate` 命令接受几个可选参数以控制其行为。

| 参数 | 描述 | 示例 |
|---|---|---|
| `--forceRegenerate` | 从头开始重建所有文档，忽略任何现有结构或内容。当你想要完全重置时，此选项非常有用。 | `aigne doc generate --forceRegenerate` |
| `--feedback` | 在交互式审查开始前，提供基于文本的初始指令，以在结构生成阶段指导 AI。 | `aigne doc generate --feedback "添加更多 API 示例"` |
| `--glossary` | 指定一个术语表文件（例如 `glossary.md`），以确保在整个文档中术语使用的一致性。 | `aigne doc generate --glossary @/path/to/glossary.md` |

### 示例：强制完全重建

如果你想丢弃所有先前生成的文档，并根据代码的当前状态创建一套新文档，请使用 `--forceRegenerate` 标志。

```bash 强制重新生成
aigne doc generate --forceRegenerate
```

## 总结

`generate` 命令协调了创建初始项目文档的整个过程。它将自动代码分析与交互式审查过程相结合，以生成一套结构化且相关的文档。

文档生成后，你可能希望：

-   [更新文档](./guides-updating-documentation.md)：对特定文档进行更改。
-   [翻译文档](./guides-translating-documentation.md)：将你的内容翻译成其他语言。
-   [发布你的文档](./guides-publishing-your-docs.md)：将你的文档在线发布。