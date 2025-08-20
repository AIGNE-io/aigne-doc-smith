---
labels: ["Reference"]
---

# 贡献

欢迎为 AIGNE DocSmith 做出贡献。您的贡献有助于让这个工具变得更好，无论是报告错误、建议新功能，还是直接贡献代码。

## 如何贡献

主要有两种方式可以为项目做出贡献：

1.  **提交 Issue**：如果您发现错误、有改进建议或想提出新功能，最好的方式是在项目仓库中提交一个 Issue。请提供清晰详细的信息，以帮助我们理解您的反馈。

2.  **提交拉取请求 (Pull Request)**：如果您对代码进行了修改并希望分享，可以提交一个拉取请求 (Pull Request)。我们会审查所有提交，并感谢您为改进 DocSmith 所做的努力。

## 开发命令

对于贡献代码的开发者来说，需要在本地运行应用程序以进行开发和调试。这些命令使用 `npx` 来执行您的本地代码，从而绕过任何全局安装的 AIGNE CLI 版本。

以下是用于本地开发的主要命令：

| 命令 | 描述 |
| --- | --- |
| `npx --no doc-smith run --entry-agent init` | 运行本地版本的交互式配置 agent。 |
| `npx --no doc-smith run --entry-agent generate` | 使用您的本地代码执行文档生成过程。 |
| `npx --no doc-smith run --entry-agent update` | 从您的本地代码库运行文档更新 agent。 |
| `npx --no doc-smith run --entry-agent retranslate` | 使用您的本地代码触发重新翻译过程。 |
| `npx --no doc-smith run --entry-agent publish` | 从您的本地代码库运行发布 agent。 |

使用这些命令可以确保您在提交贡献之前，是基于本地代码库来测试您的更改。