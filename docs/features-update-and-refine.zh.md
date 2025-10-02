# 更新与完善

让文档与不断演进的代码库保持同步是一个系统性的过程。AIGNE DocSmith 提供了直接而灵活的命令来保持内容最新，既可以通过基于代码变更的自动更新，也可以通过精确的、由反馈驱动的完善。

本指南涵盖了以下操作流程：

- 在源代码修改时自动更新文档。
- 使用针对性的反馈重新生成特定文档。
- 调整整体文档结构。

### 文档更新工作流

下图展示了更新文档可用的不同工作流：

```d2 文档更新工作流
direction: down

developer: {
  shape: c4-person
  label: "开发者"
}

codebase: {
  shape: cylinder
  label: "源代码"
}

updated-documentation: {
  shape: cylinder
  label: "更新后的\n文档"
}

workflows: {
  label: "文档更新工作流"
  shape: rectangle

  automatic-updates: {
    label: "自动更新（代码驱动）"
    shape: rectangle

    cmd-generate: {
      label: "aigne doc generate"
    }

    decision-force: {
      label: "--forceRegenerate?"
      shape: diamond
    }

    detect-changes: {
      label: "检测变更"
    }

    regen-affected: {
      label: "重新生成\n受影响的文档"
    }

    regen-all: {
      label: "重新生成\n所有文档"
    }
  }

  manual-refinements: {
    label: "手动完善（反馈驱动）"
    shape: rectangle
    grid-columns: 2
    grid-gap: 100

    refine-individual: {
      label: "完善单个文档"
      shape: rectangle

      cmd-update: {
        label: "aigne doc update\n--feedback"
      }

      regen-specific: {
        label: "重新生成\n特定文档"
      }
    }

    optimize-structure: {
      label: "优化整体结构"
      shape: rectangle

      cmd-generate-feedback: {
        label: "aigne doc generate\n--feedback"
      }

      re-evaluate-plan: {
        label: "重新评估\n文档计划"
      }
    }
  }
}

# --- 连接 ---

# 路径 1：自动更新
developer -> codebase: "1. 进行变更"
codebase -> workflows.automatic-updates.cmd-generate: "2. 运行命令"
workflows.automatic-updates.cmd-generate -> workflows.automatic-updates.decision-force
workflows.automatic-updates.decision-force -> workflows.automatic-updates.detect-changes: "否"
workflows.automatic-updates.detect-changes -> workflows.automatic-updates.regen-affected
workflows.automatic-updates.decision-force -> workflows.automatic-updates.regen-all: "是"
workflows.automatic-updates.regen-affected -> updated-documentation
workflows.automatic-updates.regen-all -> updated-documentation

# 路径 2：单个完善
developer -> workflows.manual-refinements.refine-individual.cmd-update: "3. 提供\n内容反馈"
workflows.manual-refinements.refine-individual.cmd-update -> workflows.manual-refinements.refine-individual.regen-specific
workflows.manual-refinements.refine-individual.regen-specific -> updated-documentation

# 路径 3：结构完善
developer -> workflows.manual-refinements.optimize-structure.cmd-generate-feedback: "4. 提供\n结构反馈"
workflows.manual-refinements.optimize-structure.cmd-generate-feedback -> workflows.manual-refinements.optimize-structure.re-evaluate-plan
workflows.manual-refinements.optimize-structure.re-evaluate-plan -> updated-documentation: "使用\n新结构重新生成"
```

---

## 通过变更检测实现自动更新

当您执行 `aigne doc generate` 命令时，DocSmith 会首先分析您的代码库以检测自上次生成以来的变更。然后，它仅重新生成受这些变更影响的文档。这种默认行为可以节省时间并减少 API 使用量。

```shell icon=lucide:terminal
# DocSmith 将检测变更并仅更新必要的部分
aigne doc generate
```

![DocSmith 检测变更并仅重新生成所需文档。](https://docsmith.aigne.io/image-bin/uploads/21a76b2f65d14d16a49c13d800f1e2c1.png)

### 强制完全重新生成

要从头开始重新生成所有文档，绕过缓存和变更检测，请使用 `--forceRegenerate` 标志。当您进行了重大的配置更改或需要完全重建以确保一致性时，此操作是必需的。

```shell icon=lucide:terminal
# 从头开始重新生成所有文档
aigne doc generate --forceRegenerate
```

---

## 完善单个文档

要在没有相应代码变更的情况下改进特定文档的内容，请使用 `aigne doc update` 命令。此命令允许您提供针对性的完善指令。

这可以通过交互方式或通过命令行参数以非交互方式完成。

### 交互模式

要进行引导式流程，请不带参数运行该命令。DocSmith 将会显示一个菜单，供您选择要更新的文档。选择后，系统将提示您输入反馈。

```shell icon=lucide:terminal
# 启动交互式更新流程
aigne doc update
```

![以交互方式选择您希望更新的文档。](https://docsmith.aigne.io/image-bin/uploads/75e9cf9823bb369c3d2b5a2e2da4ac06.png)

### 直接通过命令行更新

对于脚本化或更快速的工作流，您可以使用标志直接指定文档和反馈。这样可以实现精确的非交互式更新。

```shell icon=lucide:terminal
# 使用反馈更新特定文档
aigne doc update --docs overview.md --feedback "在末尾添加更详细的常见问题解答部分。"
```

`update` 命令的主要参数如下：

| 参数 | 描述 |
| --- | --- |
| `--docs` | 要更新的文档的路径。此标志可以多次使用以进行批量更新。 |
| `--feedback` | 重新生成内容时要使用的具体指令。 |

---

## 优化整体结构

除了完善单个文档内容外，您还可以调整整体文档结构。如果现有组织结构不理想或缺少某个部分，您可以向 `generate` 命令提供反馈。

这会指示 DocSmith 根据您的输入重新评估整个文档计划。

```shell icon=lucide:terminal
# 使用特定反馈重新生成文档结构
aigne doc generate --feedback "删除‘关于’部分，并添加详细的‘API 参考’。"
```

此方法适用于文档目录的高级别更改，而非次要内容编辑。

内容完善后，下一步是为全球受众做准备。有关说明，请参阅 [翻译文档](./features-translate-documentation.md) 指南。