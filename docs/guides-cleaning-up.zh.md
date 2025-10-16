# 清理

本指南将说明如何使用 `aigne doc clear` 命令从您的项目中移除生成的文件、配置和缓存数据。该命令可用于从头开始或移除敏感信息。

`clear` 命令可以以两种模式运行：交互式和非交互式。不带任何参数运行该命令将启动一个交互式向导，引导您了解可用的清理选项。

```d2
direction: down

User: {
  shape: c4-person
}

Command-Execution: {
  label: "命令执行"
  shape: rectangle

  CLI: {
    label: "`aigne doc clear [targets]`"
  }

  Decision: {
    label: "是否提供\n参数？"
    shape: diamond
  }

  Interactive-Wizard: {
    label: "交互式向导\n（目标清单）"
  }
}

Cleanup-Targets: {
  label: "清理目标"
  shape: rectangle
  grid-columns: 3

  generatedDocs: {}
  documentStructure: {}
  documentConfig: {}
  authTokens: {}
  deploymentConfig: {}
  mediaDescription: {}
}

Project-Artifacts: {
  label: "项目产物"
  shape: rectangle
  grid-columns: 3

  docs: {
    label: "./docs"
  }
  structure-plan: {
    label: "structure-plan.json"
  }
  config-yaml: {
    label: "config.yaml"
  }
  auth-config: {
    label: "~/.aigne/doc-smith-connected.yaml"
  }
  media-cache: {
    label: "媒体描述\n缓存"
  }
}

User -> Command-Execution.CLI

Command-Execution.CLI -> Command-Execution.Decision

Command-Execution.Decision -> Command-Execution.Interactive-Wizard: "否"
Command-Execution.Decision -> Cleanup-Targets: "是"

Command-Execution.Interactive-Wizard -> Cleanup-Targets: "用户选择"

Cleanup-Targets.generatedDocs -> Project-Artifacts.docs: "删除"
Cleanup-Targets.documentStructure -> Project-Artifacts.docs: "删除"
Cleanup-Targets.documentStructure -> Project-Artifacts.structure-plan: "删除"
Cleanup-Targets.documentConfig -> Project-Artifacts.config-yaml: "删除"
Cleanup-Targets.authTokens -> Project-Artifacts.auth-config: "删除"
Cleanup-Targets.deploymentConfig -> Project-Artifacts.config-yaml: "移除 appUrl"
Cleanup-Targets.mediaDescription -> Project-Artifacts.media-cache: "删除"
```

## 命令用法

要使用清理命令，请在您的终端中运行以下命令：

```bash
aigne doc clear
```

或者，您也可以直接将一个或多个目标作为参数指定，以非交互式方式运行该命令。

```bash
aigne doc clear --targets <target1> <target2> ...
```

## 清理选项

当您运行不带参数的 `aigne doc clear` 命令时，系统将为您呈现一个可移除项目的交互式清单。您可以一次选择多个项目进行清理。

可用的清理目标详情如下。

| Target | 描述 |
| :--- | :--- |
| **`generatedDocs`** | 删除输出目录（例如 `./docs`）中所有生成的文档文件。此操作会保留文档结构文件。 |
| **`documentStructure`** | 删除所有生成的文档和文档结构文件（例如 `.aigne/doc-smith/output/structure-plan.json`）。 |
| **`documentConfig`** | 删除主项目配置文件（例如 `.aigne/doc-smith/config.yaml`）。您必须运行 `aigne doc init` 以重新生成该文件。 |
| **`authTokens`** | 从文件（例如 `~/.aigne/doc-smith-connected.yaml`）中删除已保存的授权令牌。系统将提示您选择要清除哪些站点的授权。 |
| **`deploymentConfig`** | 从文档配置文件中移除 `appUrl`，其他设置保持不变。 |
| **`mediaDescription`** | 删除媒体文件的缓存 AI 生成描述（例如来自 `.aigne/doc-smith/media-description.yaml`）。这些描述将在下次运行时重新生成。 |

## 示例

### 交互式清理

要启动交互式清理过程，请运行不带任何参数的命令。这将呈现一个清单，您可以使用空格键选择希望移除的项目，并按 Enter 键确认。

```bash
aigne doc clear
```

### 非交互式清理

要直接清理特定项目，请提供其目标名称作为参数。

#### 仅清理生成的文档

此命令会移除 `docs` 目录，但会保留 `structure-plan.json` 文件。

```bash
aigne doc clear --targets generatedDocs
```

#### 清理结构和配置

此命令会移除生成的文档、结构计划和配置文件。

```bash
aigne doc clear --targets documentStructure documentConfig
```

## 总结

`clear` 命令是管理项目状态的工具。使用交互模式进行引导式操作，或直接指定目标以加快执行速度。由于这些操作不可逆，请确保在执行清理前已备份所有关键数据。