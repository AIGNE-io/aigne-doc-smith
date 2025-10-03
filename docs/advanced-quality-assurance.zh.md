# 质量保证

为确保所有生成的文档都符合高质量、一致性和准确性的标准，DocSmith 包含一个全面的自动化质量保证流程。这些内置检查会自动运行，以在发布前识别并标记常见的格式错误、断开的链接和结构性问题。此过程保证最终输出专业、可靠且易于用户浏览。

```d2 质量保证流程 icon=lucide:shield-check
direction: down

Documentation-Content: {
  label: "文档内容"
  shape: rectangle
}

Quality-Assurance-Pipeline: {
  label: "质量保证流程"
  shape: rectangle
  grid-columns: 3
  grid-gap: 50

  Markdown-Validation: {
    label: "1. Markdown 和内容验证\n（基于 remark-lint）"
    shape: rectangle

    Check-1: "有效的 Markdown 语法"
    Check-2: "标题完整性"
    Check-3: "表格格式"
    Check-4: "代码块完整性"
    Check-5: "内容完整性"
  }

  Link-Asset-Validation: {
    label: "2. 链接和资产完整性"
    shape: rectangle

    Check-6: "死链检测"
    Check-7: "本地图片验证"
  }

  D2-Diagram-Validation: {
    label: "3. D2 图表验证"
    shape: rectangle

    Check-8: "D2 语法检查"
  }
}

Validation-Result: {
  label: "所有检查是否通过？"
  shape: diamond
}

Published-Documentation: {
  label: "已发布的文档"
  shape: rectangle
  style.fill: "#d4edda"
}

Error-Report: {
  label: "错误报告"
  shape: rectangle
  style.fill: "#f8d7da"
}

Documentation-Content -> Quality-Assurance-Pipeline: "输入"
Quality-Assurance-Pipeline -> Validation-Result: "验证"
Validation-Result -> Published-Documentation: "是"
Validation-Result -> Error-Report: "否"
```

## Markdown 和内容结构验证

质量保证的基础是确保核心 Markdown 格式良好且结构合理。DocSmith 采用基于 `remark-lint` 的精密 linter，并辅以自定义检查来捕获常见的结构性问题。

关键的结构和格式检查包括：

*   **有效的 Markdown 语法**：遵循标准 Markdown 和 GFM（GitHub Flavored Markdown）规范。
*   **标题完整性**：检测同一文档中重复的标题、不正确的标题缩进以及使用多个顶级标题（H1）等问题。
*   **表格格式**：验证表格结构是否正确，特别是检查表头、分隔行和数据行之间的列数是否不匹配。
*   **代码块完整性**：确保所有代码块都使用 ``` 正确地开始和结束。它还会检查代码块内不一致的缩进，这可能会影响渲染。
*   **内容完整性**：一个验证步骤，通过检查生成的内容是否以适当的标点符号结尾，来确保内容没有被截断。

## 链接和资产完整性

断开的链接和缺失的图片会降低用户体验。DocSmith 会执行检查以验证所有本地资源。

*   **死链检测**：系统会扫描所有相对 Markdown 链接，并验证目标路径是否对应于项目文档结构中定义的有效文档。此检查可防止用户在浏览文档时遇到“404 Not Found”错误。以 `http://` 或 `https://` 开头的外部链接不会被检查。
*   **本地图片验证**：对于所有通过 `![]()` 包含的本地图片，验证器会确认引用的图片文件是否存在于指定路径。这可以确保最终输出中不会出现损坏的图片。

## D2 图表验证

为保证所有图表都能正确渲染，DocSmith 会验证每个 D2 图表的语法。

每个标记为 `d2` 的代码块都会经过严格的语法检查器处理。如果发现任何语法错误，生成过程将停止并显示描述性错误消息。这可以防止发布包含损坏或渲染不当的可视图表的文档。