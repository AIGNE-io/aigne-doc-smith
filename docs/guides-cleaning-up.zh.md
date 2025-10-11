# 清理

`aigne doc clear` 命令提供了一种简单直接的方法来移除生成的文件、缓存数据和配置设置。当您想要重置文档项目、从干净的状态开始或排查与过时或损坏文件相关的问题时，这个命令非常有用。

## 交互式清理

使用该命令最简单的方法是不带任何参数运行它：

```bash
aigne doc clear
```

执行此命令将启动一个交互式提示，让您能够精确选择要移除的项目。这是大多数用例的推荐方法，因为它为每个选项提供了清晰的描述，并能防止意外的数据丢失。

## 清理目标

`clear` 命令可以移除几种不同类型的数据。下表详细说明了每个可用的目标、其功能以及所影响的具体文件或目录。

| Target | Description | Files and Directories Affected |
| :--- | :--- | :--- |
| `generatedDocs` | 删除输出目录中所有生成的文档，但保留文档结构计划。 | 您配置中由 `docsDir` 指定的目录。 |
| `documentStructure` | 删除所有生成的文档和文档结构计划，从而有效重置您的文档内容。 | `.aigne/doc-smith/output/structure-plan.json` 文件和 `docsDir` 目录。 |
| `documentConfig` | 删除项目的配置文件。执行此操作后，您需要重新运行 `aigne doc init`。 | `.aigne/doc-smith/config.yaml` 文件。 |
| `authTokens` | 移除已保存的用于发布站点的授权令牌。系统将提示您选择要清除哪些站点。 | 您主目录下的 `~/.aigne/doc-smith-connected.yaml` 文件。 |
| `deploymentConfig` | 从您的配置文件中删除 `appUrl`。 | `.aigne/doc-smith/config.yaml` 文件。 |

## 非交互式清理

对于自动化脚本或偏好使用命令行的用户，您可以使用 `--targets` 标志直接指定一个或多个要清理的目标。这将绕过交互式提示。

### 清理单个目标

要仅清理生成的文档，请使用以下命令：

```bash
aigne doc clear --targets generatedDocs
```

### 清理多个目标

您可以提供多个目标名称以一次性清理多个项目。例如，要同时移除文档配置和文档结构，请运行：

```bash
aigne doc clear --targets documentConfig documentStructure
```

清理配置后，您可以通过再次运行设置过程来重新开始。

---

有关初始设置的更多信息，请参阅 [初始设置](./configuration-initial-setup.md) 指南。