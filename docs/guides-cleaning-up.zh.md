# 清理

`aigne doc clear` 命令提供了一种系统化的方法，用于从项目中移除生成的文件、缓存数据和配置设置。当您需要重置文档工作区、从一个干净的状态开始，或解决可能由过时文件引起的问题时，这是一个很实用的步骤。

## 交互式清理

对于需要受控且精确的清理操作，建议不带任何参数直接运行该命令。

```bash
aigne doc clear
```

该操作会启动一个交互式提示，列出所有可用的清理选项。每个选项都会附有清晰的功能说明，让您可以选择要移除的确切项目。这种交互式方法可以防止意外删除重要数据。

## 清理选项

`clear` 命令可以移除几种不同类型的数据。下表详细列出了每个可用选项、其功能以及它所影响的具体文件或目录。

| 选项 | 描述 | 受影响的文件和目录 |
| :--- | :--- | :--- |
| `generatedDocs` | 删除输出目录中的所有生成文档。文档结构计划将被保留。 | 您配置中由 `docsDir` 指定的目录。 |
| `documentStructure` | 删除所有生成的文档和文档结构计划。此操作将重置所有文档内容。 | `.aigne/doc-smith/output/structure-plan.json` 文件和 `docsDir` 目录。 |
| `documentConfig` | 删除项目的配置文件。执行此操作后，必须运行 `aigne doc init` 来创建新配置。 | `.aigne/doc-smith/config.yaml` 文件。 |
| `authTokens` | 移除已保存的用于发布站点的授权令牌。系统将提示您选择要清除哪些站点的授权。 | 位于您主目录下的 `~/.aigne/doc-smith-connected.yaml` 文件。 |
| `deploymentConfig` | 仅从您的配置文件中移除 `appUrl` 设置，其他设置保持不变。 | `.aigne/doc-smith/config.yaml` 文件。 |
| `mediaDescription` | 删除为您的媒体文件缓存的、由 AI 生成的描述。这些描述将在下次构建文档时重新生成。 | `.aigne/doc-smith/cache/media-description.json` 文件。 |

## 非交互式清理

对于在自动化脚本中使用，或偏好直接命令行操作的用户，您可以使用 `--targets` 标志指定一个或多个清理目标。这将绕过交互式提示并立即执行清理操作。

### 清理单个选项

若要仅移除生成的文档，请执行以下命令：

```bash
aigne doc clear --targets generatedDocs
```

### 清理多个选项

您可以提供一个以空格分隔的目标名称列表，来一次性移除多个项目。例如，要同时删除文档配置和文档结构，请运行以下命令：

```bash
aigne doc clear --targets documentConfig documentStructure
```

清理配置后，您可以开始新的设置过程。

---

有关创建新配置的详细说明，请参阅 [初始设置](./configuration-initial-setup.md) 指南。