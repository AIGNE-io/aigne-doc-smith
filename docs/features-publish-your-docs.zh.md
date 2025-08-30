---
labels: ["Reference"]
---

# 发布文档

文档生成后，下一步是将其发布到线上。AIGNE DocSmith 通过 `aigne doc publish` 命令简化了这一过程，该命令会将您的内容上传到 Discuss Kit 平台，使其即时对您的受众可用。

本指南将介绍如何发布您的文档，无论您使用的是免费的官方平台还是自托管的实例。

## 发布流程

`aigne doc publish` 命令会启动一个交互式流程，引导您完成必要的步骤。下图展示了首次发布文档的典型工作流程。

```d2
shape: sequence_diagram

用户; CLI; "Discuss Kit 平台"

用户 -> CLI: 运行 `aigne doc publish`

alt "首次使用或未配置"
  CLI -> 用户: "提示：选择平台"
  用户 -> CLI: "选择官方或自托管"
  CLI -> 用户: "打开浏览器进行身份验证"
  用户 -> "Discuss Kit 平台": "登录并授权"
  "Discuss Kit 平台" -> CLI: "提供访问令牌"
  CLI -> CLI: "保存令牌供将来使用"
end

CLI -> "Discuss Kit 平台": "上传文档和媒体文件"
"Discuss Kit 平台" -> CLI: "确认成功"
CLI -> 用户: "✅ 文档发布成功！"
```

## 发布选项

您有两种主要选项来托管您的文档，以满足不同的可见性和控制需求。

<x-cards data-columns="2">
  <x-card data-title="官方平台" data-icon="lucide:globe">
    发布到官方托管平台 docsmith.aigne.io。该选项免费，非常适合开源项目，并能让您的文档公开访问。
  </x-card>
  <x-card data-title="自托管平台" data-icon="lucide:server">
    发布到您自己的 Discuss Kit 私有实例。这使您可以完全控制谁可以访问您的文档，适合内部或私有项目。
  </x-card>
</x-cards>

## 分步指南

首次发布文档是一个简单的交互式过程。

### 1. 运行发布命令

在终端中，导航到您项目的根目录并运行以下命令：

```bash
aigne doc publish
```

### 2. 选择您的平台

如果您之前没有配置过发布目标，系统将提示您在官方平台和自托管平台之间进行选择。请选择最适合您需求的选项。

![在官方平台或自托管实例之间选择](https://docsmith.aigne.io/image-bin/uploads/9fd929060b5abe13d03cf5eb7aea85aa.png)

如果您选择自托管选项，系统将要求您输入您的 Discuss Kit 实例的 URL。

### 3. 验证您的账户

首次连接到新平台时，DocSmith 会自动打开一个浏览器窗口，供您登录并授权 CLI。这是一个一次性步骤；您的访问令牌将被保存在本地，用于将来向该平台进行的所有发布。

### 4. 确认

上传完成后，您将在终端中看到一条成功消息，您的文档即已上线。

```
✅ 文档发布成功！
```

## 在 CI/CD 环境中发布

对于自动化工作流，您可以通过使用命令行参数或环境变量来绕过交互式提示。

| 方法 | 名称 | 描述 | 示例 |
|---|---|---|---|
| **参数** | `--appUrl` | 直接指定您自托管的 Discuss Kit 实例的 URL。 | `aigne doc publish --appUrl https://docs.mycompany.com` |
| **环境变量** | `DOC_DISCUSS_KIT_URL` | 设置目标平台 URL，覆盖任何其他配置。 | `export DOC_DISCUSS_KIT_URL=...` |
| **环境变量** | `DOC_DISCUSS_KIT_ACCESS_TOKEN` | 直接提供访问令牌，跳过交互式登录。 | `export DOC_DISCUSS_KIT_ACCESS_TOKEN=...` |

## 故障排除

如果您在发布过程中遇到问题，以下是一些常见原因及其解决方案：

-   **无效的 URL 或连接错误**：这通常发生在为自托管实例提供的 URL 不正确或服务器无法访问时。请仔细检查 URL 和您的网络连接。
-   **缺少必需组件**：目标网站必须安装 Discuss Kit 组件才能托管文档。如果缺少该组件，CLI 将返回错误并提供安装指导。

有关命令和选项的完整列表，请参阅 [CLI 命令参考](./cli-reference.md)。