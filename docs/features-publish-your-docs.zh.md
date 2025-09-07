# 发布你的文档

文档生成后，下一步就是使其可以在线访问。AIGNE DocSmith 通过 `aigne doc publish` 命令简化了这一过程，该命令会将你的内容上传到 Discuss Kit 平台，让你的受众可以立即访问。

本指南将介绍如何发布你的文档，无论你是使用免费的官方平台还是你自己的网站。

## 发布流程

`aigne doc publish` 命令会启动一个交互式流程，引导你完成必要的步骤。下图展示了首次发布文档的典型工作流程。

```d2
direction: down

User: { shape: person }
CLI: { label: "AIGNE CLI" }
Browser: { label: "浏览器" }
Platform: { label: "Discuss Kit 平台" }

User -> CLI: aigne doc publish

alt: "首次发布或缺少配置" {
  CLI -> User: "选择平台\n(官方 / 自托管)"
  User -> CLI: "提供选择"
  CLI -> Browser: "打开认证 URL"
  User -> Browser: "登录并授权"
  Browser -> Platform: "发送凭证"
  Platform -> CLI: "返回访问令牌"
  CLI -> CLI: "保存令牌以备将来使用"
}

CLI -> Platform: "上传文档和媒体文件"
Platform -> CLI: "成功响应"
CLI -> User: "✅ 发布成功！"
```

## 发布选项

你有两个主要选项来托管你的文档，以满足对可见性和控制的不同需求。

### 官方平台

发布到官方托管平台 [docsmith.aigne.io](https://docsmith.aigne.io)。此选项免费，可使你的文档公开访问，推荐用于开源项目。

### 你自己的网站

通过运行 Discuss Kit 实例来发布到你自己的网站。这让你能够完全控制谁可以访问你的文档，使其适用于内部或私有项目。你可以从[官方文档](https://www.arcblock.io/docs/web3-kit/en/discuss-kit)开始运行你自己的 Discuss Kit。

## 分步指南

首次发布文档是一个简单的交互式过程。

### 1. 运行发布命令

在终端中进入你项目的根目录，并运行以下命令：

```bash
aigne doc publish
```

### 2. 选择你的平台

如果你之前没有配置过发布目的地，系统将提示你在官方平台和自托管平台之间进行选择。请选择最适合你需求的选项。

![在官方平台或自托管实例之间选择](https://docsmith.aigne.io/image-bin/uploads/9fd929060b5abe13d03cf5eb7aea85aa.png)

如果你选择自己的网站，系统会要求你输入 Discuss Kit 实例的 URL。

### 3. 认证你的账户

首次连接到新平台时，DocSmith 会自动打开一个浏览器窗口，供你登录并授权 CLI。这是一个一次性步骤；你的访问令牌将被保存在本地，用于将来对该平台的所有发布。

### 4. 确认

上传完成后，你将在终端中看到一条成功消息，你的文档即已上线。

```
✅ 文档发布成功！
```

## 在 CI/CD 环境中发布

对于自动化工作流，你可以使用命令行参数或环境变量来绕过交互式提示。

| 方法 | 名称 | 描述 | 示例 |
|---|---|---|---|
| **参数** | `--appUrl` | 直接指定你的 Discuss Kit 实例的 URL。 | `aigne doc publish --appUrl https://docs.mycompany.com` |
| **环境变量** | `DOC_DISCUSS_KIT_URL` | 设置目标平台 URL，覆盖任何其他配置。 | `export DOC_DISCUSS_KIT_URL=...` |
| **环境变量** | `DOC_DISCUSS_KIT_ACCESS_TOKEN` | 直接提供访问令牌，跳过交互式登录。 | `export DOC_DISCUSS_KIT_ACCESS_TOKEN=...` |

## 故障排查

如果你在发布过程中遇到问题，以下是一些常见原因及其解决方案：

-   **无效的 URL 或连接错误**：如果你为自己的实例提供的 URL 不正确或服务器无法访问，通常会出现此问题。请仔细检查 URL 和你的网络连接。
-   **缺少必需组件**：目标网站必须安装 Discuss Kit 组件才能托管文档。如果缺少该组件，CLI 将返回错误并提供安装指导。

有关命令和选项的完整列表，请参阅 [CLI 命令参考](./cli-reference.md)。