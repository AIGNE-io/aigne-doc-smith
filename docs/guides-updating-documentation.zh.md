# 更新文档

保持文档的准确性和相关性是一个持续的过程。随着项目的发展，更新文档的需求也会随之增加。本指南提供了修改现有文档的分步流程，无论您是需要采纳用户反馈、反映代码变更，还是完全重新生成某个部分。

`update` 命令为此提供了两种主要模式：用于优化单个文档的交互模式，以及用于将更改应用于多个文档或重置内容的批处理模式。

## 交互式文档更新

交互模式非常适合对单个文档进行迭代式更改。它允许您提供反馈、审阅更新后的内容，并持续优化，直到您对结果满意为止。当您运行命令而未指定特定文档时，这是默认模式。

要开始交互式更新会话，请按以下步骤操作：

1.  在您的终端中运行 `update` 命令：

    ```bash command aigne doc update icon=lucide:terminal
    aigne doc update
    ```

2.  该工具将显示您现有文档的列表。使用箭头键选择您希望修改的文档，然后按 Enter 键。

    ![交互式文档更新提示的屏幕截图，显示可供选择的文档列表。](../assets/screenshots/doc-update.png)

3.  选择文档后，您将进入一个包含以下选项的审阅循环：
    *   **View document**：直接在终端中显示文档当前版本的全部内容以供审阅。
    *   **Give feedback**：提示您输入关于您希望更改内容的文本反馈。例如，“简化配置过程的说明”或“为常见错误添加故障排除部分”。
    *   **Done**：退出交互式会话并保存文档的最新版本。

4.  在您提供反馈后，该工具将重新生成文档内容。然后，您可以查看更改并在需要时提供更多反馈。这个循环可以重复进行，直到文档满足您的要求。

## 批量文档更新

批处理模式专为进行非交互式更改而设计。当您确切知道需要进行哪些更改并希望直接应用它们，或者当您需要同时更新多个文档时，此模式非常有用。

### 使用特定反馈进行更新

您可以直接从命令行提供反馈来更新一个或多个文档。这将绕过交互式会话并立即应用更改。

使用 `--docs` 标志指定文档的路径，并使用 `--feedback` 标志提供您的指令。

```bash command aigne doc update with feedback icon=lucide:terminal
aigne doc update --docs /guides/overview.md --feedback "Add a more detailed explanation of the core features."
```

要更新多个文档，只需提供多个 `--docs` 标志：

```bash command aigne doc update multiple docs icon=lucide:terminal
aigne doc update --docs /guides/overview.md --docs /guides/getting-started.md --feedback "Ensure the tone is consistent across both documents."
```

### 重置文档内容

在某些情况下，您可能希望放弃文档的当前版本，并根据最新的源代码从头开始重新生成。`--reset` 标志会指示工具完全忽略现有内容。

```bash command aigne doc update with reset icon=lucide:terminal
aigne doc update --docs /guides/overview.md --reset
```

当文档因底层代码的重大变更而变得严重过时时，此命令非常有用。

## 命令参数

`update` 命令接受多个参数来控制其行为。以下是可用选项的摘要：

| 参数 | 描述 | 示例 |
| :--------- | :------------------------------------------------------------------------------------------------------ | :------------------------------------------------------- |
| `--docs` | 指定要更新的一个或多个文档的路径。可多次使用以指定多个文件。 | `--docs /overview.md` |
| `--feedback` | 为指定文档的更改提供文本指令。 | `--feedback "Clarify the installation steps."` |
| `--reset` | 一个布尔标志，存在时会使文档从头开始重新生成。 | `--reset` |
| `--glossary` | 指定词汇表文件的路径，以确保在更新过程中术语的一致性。 | `--glossary @/path/to/glossary.md` |