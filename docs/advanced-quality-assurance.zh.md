# 质量保证

为确保所有生成的文档功能正常、清晰且专业，DocSmith 引入了自动化的质量保证流程。该流程在发布前对 Markdown 内容执行一系列检查，以检测和报告常见问题，从损坏的链接到格式错误的图表。

这个自动化管道会验证内容结构、链接、媒体和语法，以保持一致的质量标准。

```d2
direction: down

Input-Markdown-Content: {
  label: "输入：Markdown 内容"
  shape: rectangle
}

QA-Pipeline: {
  label: "质量保证管道"
  shape: rectangle
  grid-columns: 1
  grid-gap: 50

  Structural-Checks: {
    label: "结构检查"
    shape: rectangle
    grid-columns: 2
    Completeness: "确保内容不被截断"
    Code-Blocks: "验证块语法和缩进"
  }

  Content-Validation: {
    label: "内容验证"
    shape: rectangle
    grid-columns: 2
    Link-Integrity: "验证内部链接"
    Image-Paths: "检查本地图片是否存在"
    Table-Formatting: "匹配列数"
  }

  Syntax-Validation: {
    label: "语法验证"
    shape: rectangle
    grid-columns: 2
    D2-Diagrams: "验证 D2 语法"
    Markdown-Linting: "强制执行样式规则"
  }
}

Output-Validated-Content-or-Error-Report: {
  label: "输出：已验证内容或错误报告"
  shape: rectangle
}

Input-Markdown-Content -> QA-Pipeline
QA-Pipeline -> Output-Validated-Content-or-Error-Report
```

### 核心验证领域

DocSmith 的质量保证流程涵盖了几个关键领域，以确保文档的完整性。

#### 内容结构与完整性

DocSmith 执行多项检查以确保内容的结构完整性：

- **不完整的代码块**：检测以 ` ``` ` 开始但未关闭的代码块。
- **缺少换行符**：识别出现在单行上的内容，这可能表示缺少换行符。
- **内容结尾**：验证内容是否以适当的标点符号（例如 `.`、`)`、`|`、`>`）结尾，以防止输出被截断。
- **代码块缩进**：分析代码块中不一致的缩进。如果某行代码的缩进小于起始的 ` ``` ` 标记，可能会导致渲染问题。此检查有助于保持正确的代码呈现。

#### 链接与媒体完整性

- **链接完整性**：文档中的所有相对链接都会根据文档结构计划进行验证，以防止出现死链接。这确保了所有内部导航都能正常工作。检查器会忽略外部链接（以 `http://` 或 `https://` 开头）和 `mailto:` 链接。

- **图片验证**：为避免图片损坏，检查器会验证文档中引用的任何本地图片文件是否存在于文件系统中。它会解析相对路径和绝对路径以确认文件存在。外部图片 URL 和数据 URL 不会被检查。

#### 图表语法验证

- **D2 图表**：DocSmith 通过尝试将代码编译成 SVG 图片来验证 D2 图表语法。这个过程可以在语法错误导致图形损坏之前捕获它们。

#### 格式与样式强制执行

- **表格格式化**：检查表格的表头、分隔线和数据行之间的列数是否不匹配。此检查可防止常见的表格渲染失败。

- **Markdown 语法检查**：内置的 linter 会强制执行一致的 Markdown 结构。关键规则包括：

| Rule ID | Description |
|---|---|
| `no-duplicate-headings` | 防止在同一部分中出现内容相同的多个标题。 |
| `no-undefined-references` | 确保所有链接和图片引用都已定义。 |
| `no-unused-definitions` | 标记未被使用的链接或图片定义。 |
| `no-heading-content-indent` | 禁止在标题内容前缩进。 |
| `no-multiple-toplevel-headings` | 每个文档只允许一个顶级标题 (H1)。 |
| `code-block-style` | 强制代码块使用一致的样式（例如，使用反引号）。 |

通过自动化这些检查，DocSmith 为文档维护了一致的标准，确保最终输出准确且易于导航。

要了解有关整体架构的更多信息，请参阅[工作原理](./advanced-how-it-works.md)部分。