# 清理

本指南说明了如何使用 `aigne doc clear` 命令从您的项目中移除生成的文件、配置和缓存数据。此命令对于重新开始或删除敏感信息非常有用。

`clear` 命令可以以两种模式运行：交互式和非交互式。不带任何参数运行该命令将启动一个交互式向导，引导您完成可用的清理选项。

## 命令用法

要在终端中使用清理命令，请运行以下命令：

```bash
aigne doc clear
```

或者，您可以直接将一个或多个目标作为参数指定，以非交互方式运行该命令。

```bash
aigne doc clear --targets <target1> <target2> ...
```

## 清理选项

当您运行不带参数的 `aigne doc clear` 命令时，您将看到一个可供移除项目的交互式清单。您可以一次选择多个项目进行清理。

可用的清理目标详情如下。

| Target | Description |
| :--- | :--- |
| **`generatedDocs`** | 删除输出目录（例如 `./docs`）中的所有已生成文档文件。此操作会保留文档结构文件。 |
| **`documentStructure`** | 删除所有已生成的文档和文档结构文件（例如 `.aigne/doc-smith/output/structure-plan.json`）。 |
| **`documentConfig`** | 删除主项目配置文件（例如 `.aigne/doc-smith/config.yaml`）。您必须运行 `aigne doc init` 以重新生成该文件。 |
| **`authTokens`** | 从文件（例如 `~/.aigne/doc-smith-connected.yaml`）中删除已保存的授权令牌。系统将提示您选择要清除哪些站点的授权。 |
| **`deploymentConfig`** | 从文档配置文件中移除 `appUrl`，但保留其他设置不变。 |
| **`mediaDescription`** | 删除媒体文件的缓存 AI 生成描述（例如，来自 `.aigne/doc-smith/media-description.yaml`）。这些描述将在下次运行时重新生成。 |

## 示例

### 交互式清理

要启动交互式清理过程，请不带任何参数运行该命令。这将呈现一个清单，您可以使用空格键选择希望移除的项目，并按 Enter 键确认。

```bash
aigne doc clear
```

### 非交互式清理

要直接清理特定项目，请将其目标名称作为参数提供。

#### 仅清理生成的文档

此命令会移除 `docs` 目录，但保留 `structure-plan.json` 文件。

```bash
aigne doc clear --targets generatedDocs
```

#### 清理结构和配置

此命令会移除生成的文档、结构计划和配置文件。

```bash
aigne doc clear --targets documentStructure documentConfig
```

## 总结

`clear` 命令是管理项目状态的工具。使用交互模式以获得引导式流程，或直接指定目标以加快执行速度。由于这些操作是不可逆的，请确保在执行清理前已备份所有关键数据。