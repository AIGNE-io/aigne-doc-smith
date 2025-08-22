---
labels: ["Reference"]
---

# 发布文档

文档生成后，下一步是让它可以在线访问。AIGNE DocSmith 提供了一个简化的流程，可以将您的内容发布到官方免费的 AIGNE 平台或您自己的自托管网站。本指南将引导您完成简单的 `publish` 命令。

## 发布命令

整个发布过程由一个命令处理：

```bash
aigne doc publish
```

运行此命令会启动一个交互式向导，引导您完成必要的步骤，因此是大多数用户的推荐方法。

### 交互式向导

当您首次运行 `aigne doc publish` 时，系统会提示您选择文档的发布位置。

![选择文档发布位置](https://docsmith.aigne.io/image-bin/uploads/9fd929060b5abe13d03cf5eb7aea85aa.png)

您有两个主要选项：

1.  **官方平台 (`docsmith.aigne.io`)**：这是一个免费使用的选项，您的文档将在此公开访问。对于开源项目或任何您希望广泛分享而无需管理自己基础设施的文档来说，这是一个绝佳的选择。

2.  **自托管平台**：此选项允许您将文档发布到自己的网站。这对于私有、内部或商业项目的文档非常理想。要使用此选项，您必须在您的网站上运行一个 [Discuss Kit](https://www.npmjs.com/package/@arcblock/discuss-kit) 实例。

### 授权

当您第一次发布到特定 URL 时，DocSmith 需要获得您的授权，以代表您发布内容。对于每个平台，这是一个安全的一次性过程：

1.  浏览器窗口将自动打开。
2.  系统将提示您连接并批准来自 AIGNE DocSmith 的访问请求。
3.  一旦批准，访问令牌将安全地保存在您的本地计算机上，用于将来所有发布到该 URL 的操作，因此您无需重复此步骤。

成功发布后，您将看到一条确认消息：

```
✅ Documentation Published Successfully!
```

## 直接发布到自定义 URL

对于自动化工作流或希望跳过交互式提示，您可以使用 `--appUrl` 标志直接指定目标 URL。

```bash
# 发布到自定义 Discuss Kit 实例
aigne doc publish --appUrl https://your-discuss-kit-instance.com
```

## 问题排查

如果您在发布过程中遇到问题，以下是一些常见问题及其解决方案：

*   **错误：`The provided URL is not a valid website`**：这意味着该 URL 未指向基于正确底层平台的网站。您可以按照 [Discuss Kit Store](https://www.npmjs.com/package/@arcblock/discuss-kit) 的指南开始搭建您自己的兼容网站。

*   **错误：`This website does not have required components for publishing`**：目标网站有效，但缺少托管文档所必需的“Discuss Kit”组件。请参阅[关于添加组件的文档](https://www.npmjs.com/package/@arcblock/discuss-kit)以解决此问题。

*   **错误：`Unable to connect to...`**：这通常是网络问题。请检查 URL 是否正确，以及服务器是否在线且可以从您的网络访问。

---

文档发布后，您可能希望让全球用户都能访问。请继续下一节，了解如何[翻译文档](./features-translate-documentation.md)。