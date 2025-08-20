---
labels: ["Reference"]
---

# 高级主题

本部分为希望使用 AIGNE DocSmith 标准功能之外更多功能的用户提供信息。在这里，您将找到有关如何为项目做贡献以及使用命令进行本地开发的指南。

## 贡献

AIGNE DocSmith 是一个开放项目，欢迎大家贡献。无论您有建议、发现漏洞，还是想添加新功能，本指南都将为您提供参与所需的信息。

关于如何提交 pull request 或开启 issue 的详细说明，请参阅我们的专属指南。

[了解如何贡献](./advanced-contributing.md)

## 开发命令

如果您在本地开发或调试 DocSmith，可以使用 `npx` 从您的本地源代码运行命令，从而绕过全局安装的 CLI。这在创建 pull request 之前测试变更时非常有用。

```shell
# 使用 npx 运行本地代码进行开发和调试的命令
npx --no doc-smith run --entry-agent init
npx --no doc-smith run --entry-agent generate
npx --no doc-smith run --entry-agent update
npx --no doc-smith run --entry-agent retranslate
npx --no doc-smith run --entry-agent publish
```

这些命令可确保您正在执行当前工作目录中的代码版本，以用于测试。