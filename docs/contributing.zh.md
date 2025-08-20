# 贡献指南

我们欢迎社区的任何形式的贡献，以帮助 AIGNE DocSmith 变得更好。无论您是发现了一个错误，有一个功能建议，还是希望直接贡献代码，您的参与对我们都至关重要。

您可以通过以下方式为项目做出贡献：

- **提交问题 (Issue):** 如果您在使用过程中发现任何错误 (Bug) 或有任何功能改进的建议，请随时提交 Issue。
- **提交拉取请求 (Pull Request):** 我们非常欢迎您通过提交拉取请求来直接修复问题或实现新功能。

## 本地开发与调试

如果您计划贡献代码，您可能需要在本地环境中运行和测试。为了方便开发和调试，您可以使用 `npx` 来执行本地代码库中的命令，这将绕过全局安装的 AIGNE CLI 版本。

以下是一些用于本地开发的命令示例：

**初始化配置**
```shell
npx --no doc-smith run --entry-agent init
```

**生成文档**
```shell
npx --no doc-smith run --entry-agent generate
```

**更新文档**
```shell
npx --no doc-smith run --entry-agent update
```

**重新翻译文档**
```shell
npx --no doc-smith run --entry-agent retranslate
```

**发布文档**
```shell
npx --no doc-smith run --entry-agent publish
```

使用这些命令可以确保您正在测试的是您本地所做的代码更改，而不是已发布的版本。