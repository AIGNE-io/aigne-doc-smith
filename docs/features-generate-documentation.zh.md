# 生成文档

`aigne doc generate` 命令是从源代码创建完整文档集的核心功能。该过程会分析你的代码库，规划逻辑化的文档结构，然后为每个部分生成内容。这是从零开始创建文档的主要方式。

## 首次生成

首先，请导航到项目的根目录并运行以下命令：

```bash
aigne doc generate
```

### 自动配置

如果这是你首次在项目中运行此命令，DocSmith 会检测到尚无配置。接着，它将启动一个交互式设置向导，引导你完成初始设置。这能确保在生成开始前，你拥有一个正确配置的环境。

![首次运行 generate 命令会触发设置向导](https://docsmith.aigne.io/image-bin/uploads/0c45a32667c5250e54194a61d9495965.png)

系统将询问你一系列问题，以定义：

- 文档生成规则和风格
- 目标受众
- 主要语言和翻译语言
- 源代码和输出路径

![回答问题以配置文档风格、语言和源路径](https://docsmith.aigne.io/image-bin/uploads/fbedbfa256036ad6375a6c18047a75ad.png)

配置完成后，DocSmith 将继续进行文档生成。

![DocSmith 分析你的代码、规划结构并生成每个文档](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

成功完成后，新创建的文档将位于你指定的输出目录中。

![完成后，你将在指定的输出目录中找到新文档](https://docsmith.aigne.io/image-bin/uploads/0967443611408ad9d0042793d590b8fd.png)

## 生成过程

`generate` 命令遵循一个自动化的工作流程。该过程可直观地表示如下：

```d2
direction: down

start: "开始" {
  shape: oval
}

run_cmd: "运行 `aigne doc generate`" {
  shape: rectangle
}

check_config: "找到配置？" {
  shape: diamond
}

interactive_setup: "启动交互式设置向导" {
  shape: rectangle
}

plan_structure: "1. 分析代码并规划结构" {
  shape: rectangle
}

gen_content: "2. 生成文档内容" {
  shape: rectangle
}

save_docs: "3. 保存文档" {
  shape: rectangle
}

end: "结束" {
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

## 命令选项

虽然默认的 `generate` 命令足以满足大多数使用场景，但你可以使用几个选项来控制生成过程。这些选项在重新生成内容或优化文档结构时非常有用。

| 选项                | 描述                                                                                                                             | 示例                                                                 |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------|
| `--forceRegenerate` | 删除所有现有文档并从头开始重新生成。在对源代码或配置进行重大更改后使用此选项。                                                     | `aigne doc generate --forceRegenerate`                                 |
| `--feedback`        | 提供高层反馈以优化整体文档结构，例如添加、删除或重组章节。                                                                       | `aigne doc generate --feedback "Add an API Reference section"`         |
| `--model`           | 指定 AIGNE Hub 中的特定大型语言模型用于内容生成，允许你切换模型。                                                                  | `aigne doc generate --model claude:claude-3-5-sonnet`                |

## 接下来做什么？

既然你已经生成了初始文档，你的项目将继续演进。为使文档与代码保持同步，你需要更新它们。请继续阅读下一部分，了解如何进行有针对性的更改和重新生成特定文件。

<x-card data-title="更新和优化" data-icon="lucide:file-edit" data-href="/features/update-and-refine">
  了解当代码变更时如何更新文档，或使用反馈进行特定改进。
</x-card>