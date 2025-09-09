---
labels: ["Reference"]
---

# 质量保证

为确保每一篇文档都高质量、格式良好且无错误，DocSmith 内置了强大的质量保证 (QA) 引擎。该引擎会自动扫描生成的内容，检查从失效链接到格式错误的图表等常见问题，在发布前捕获潜在错误。这一自动化流程建立在强大的 `unified` 和 `remark-lint` 生态系统之上，并通过量身定制的特定检查来维持专业标准。

### 核心验证检查

DocSmith 的 QA 引擎会执行一系列有针对性的检查，涵盖最常见的文档错误来源：

<x-cards data-columns="2">
  <x-card data-title="结构完整性" data-icon="lucide:scan-line">
    DocSmith 会验证 Markdown 的整体结构。它能检测不完整的代码块，检查代码内缩进的一致性，并确保内容正常结束，以防止意外截断。
  </x-card>
  <x-card data-title="链接和资产验证" data-icon="lucide:link">
    所有内部链接都会与项目结构规划进行交叉引用，以捕获失效链接。该引擎还会确认文档中引用的所有本地图片都存在于文件系统中。
  </x-card>
  <x-card data-title="D2 图表验证" data-icon="lucide:network">
    为防止图表损坏，DocSmith 会验证所有 D2 代码块的语法。它会与外部渲染服务通信，以确认图表代码有效且能够成功生成。
  </x-card>
  <x-card data-title="表格格式化" data-icon="lucide:table">
    格式错误的表格是常见的渲染问题。QA 引擎会检查表格的表头、分隔线和数据行的列数是否一致，以防止显示失败。
  </x-card>
</x-cards>

### QA 流程

当文档生成或更新时，内容会经过一个多阶段的验证流程。该流程旨在实现快速和全面的检查，识别各种潜在问题，如下所示。

```d2 DocSmith QA 流程
direction: down

markdown-content: {
  label: "Markdown 内容"
  shape: rectangle
}

qa-engine: {
  label: "DocSmith QA 引擎\n(checkMarkdown)"
  shape: rectangle

  checks: {
    grid-columns: 2
    grid-gap: 40

    link-check: "失效链接检查"
    image-check: "本地图片检查"
    structure-check: "结构完整性"
    diagram-check: "D2 图表验证"
    table-check: "表格格式化"
    lint-check: "通用 Linting 检查"
  }
}

output: {
  label: "验证结果"
  shape: diamond
}

success: "有效内容"
errors: "错误列表"

markdown-content -> qa-engine
qa-engine -> output
output -> success: "通过"
output -> errors: "失败"
```

通过自动化这些检查，DocSmith 能以最小的成本帮助您维持高标准的质量，让您能够专注于编写优质内容，而不是修复格式错误。这些检查的结果通常会通过 CLI 反馈显示，以便快速修正。

若要了解支持这些功能的底层架构，请参阅 [工作原理](./advanced-how-it-works.md) 部分。