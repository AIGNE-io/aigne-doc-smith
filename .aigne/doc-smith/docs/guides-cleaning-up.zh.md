# 清理

需要重置您的项目或移除敏感数据？本指南将说明如何使用 `aigne doc clear` 命令安全地移除生成的文件、配置设置和缓存信息，帮助您维护一个整洁有序的工作区。

`clear` 命令提供两种模式：用于引导式清理的交互式向导，以及用于快速执行特定操作的非交互式模式。

## 命令用法

要开始清理过程，请在您项目的根目录中执行以下命令：

```sh aigne doc clear icon=lucide:trash-2
aigne doc clear
```

不带任何参数运行该命令会启动一个交互式向导，它将提示您选择希望移除的项目。

为了更快地进行非交互式清理，您可以使用 `--targets` 标志直接指定一个或多个目标。

```sh aigne doc clear --targets generatedDocs icon=lucide:trash-2
aigne doc clear --targets <target1> <target2>
```

## 清理选项

交互式向导会呈现一个您可以移除的项目清单。下表详细说明了每个可用选项，这些选项也可以在非交互式模式下作为目标使用。

| Target | 描述 |
| :--- | :--- |
| **`generatedDocs`** | 允许您从输出目录（例如 `./docs`）中选择并删除特定的生成文档。整体文档结构将被保留。 |
| **`documentStructure`** | 删除所有生成的文档文件和结构计划文件（例如 `.aigne/doc-smith/output/structure-plan.json`）。 |
| **`documentConfig`** | 移除项目的主配置文件（例如 `.aigne/doc-smith/config.yaml`）。删除后，您需要运行 `aigne doc init` 来创建一个新的配置文件。 |
| **`authTokens`** | 删除用于发布的已保存授权凭证（例如，来自 `~/.aigne/doc-smith-connected.yaml`）。系统将提示您选择要清除哪些站点的授权。 |
| **`deploymentConfig`** | 仅从您项目的配置文件中移除 `appUrl` 键，所有其他设置保持不变。 |
| **`mediaDescription`** | 删除您项目媒体文件的 AI 生成描述的缓存（例如 `.aigne/doc-smith/media-description.yaml`）。这些描述将在下次需要时自动重新生成。 |

## 示例

### 交互式清理

要获得引导式体验，请不带任何参数运行该命令。您将看到一个清单。使用箭头键导航，使用空格键选择或取消选择项目，并使用回车键确认您的选择以继续清理。

```sh aigne doc clear icon=lucide:mouse-pointer-click
aigne doc clear
```

### 非交互式清理

要在没有提示的情况下清理特定项目，请使用 `--targets` 标志，后跟您希望移除的目标名称。

#### 仅清理生成的文档

此命令会删除生成的文档文件，但会保留 `structure-plan.json` 文件，以便您以后可以重新生成内容。

```sh aigne doc clear --targets generatedDocs icon=lucide:file-minus
aigne doc clear --targets generatedDocs
```

#### 清理结构和配置

此命令执行更彻底的清理，移除所有生成的文档、结构计划和主配置文件。

```sh aigne doc clear --targets documentStructure documentConfig icon=lucide:files
aigne doc clear --targets documentStructure documentConfig
```

## 总结

`clear` 命令为您管理项目生成的资产和配置提供了一种直接的方法。使用交互模式以获得安全、引导式的流程，或直接指定目标以实现自动化工作流。由于这些操作会永久删除文件，建议在继续操作前备份任何重要数据。