---
labels: ["Reference"]
---

# 高级主题

本节适用于希望使用 AIGNE DocSmith 标准功能之外内容的用户。你将在这里找到有关如何为项目做贡献以及使用命令进行本地开发和测试的信息。

## 贡献

我们欢迎对 AIGNE DocSmith 的贡献。如果你有任何建议、发现错误或希望改进该工具，我们都鼓励你参与进来。关于如何提交拉取请求或开启问题的详细指南，请参阅我们的专门指南。

[了解更多关于贡献的信息](./advanced-contributing.md)

## 开发命令

如果你在本地开发 DocSmith 源代码，可以使用 `npx` 运行本地版本以进行开发和调试。这将绕过全局安装的 AIGNE CLI，并确保你测试的是自己的更改。

使用以下命令测试不同的 Agent：

```shell
# 使用 npx 运行本地代码进行开发和调试的命令
npx --no doc-smith run --entry-agent init
npx --no doc-smith run --entry-agent generate
npx --no doc-smith run --entry-agent update 
npx --no doc-smith run --entry-agent translate 
npx --no doc-smith run --entry-agent publish
```

这些命令对于在提交贡献前测试所做更改至关重要。