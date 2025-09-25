# 发布您的文档

生成文档后，`aigne doc publish` 命令会将您的内容上传到 Discuss Kit 平台，使其可以在线访问。本指南将说明如何将您的文档发布到官方平台或您自己的自托管网站。

## 发布流程

`aigne doc publish` 命令会启动一个交互式流程。首次发布到新目的地时，它将引导您完成身份验证。后续的发布将使用已保存的凭据。

```d2 发布流程 icon=lucide:upload-cloud
direction: down
shape: sequence_diagram

User: { shape: c4-person }
CLI: { label: "AIGNE CLI" }
Browser: { label: "浏览器" }
Platform: { label: "Discuss Kit 平台" }

User -> CLI: "aigne doc publish"

alt: "首次发布或缺少配置" {
  CLI -> User: "选择平台\n(官方 / 自托管)"
  User -> CLI: "提供选择"
  CLI -> Browser: "打开认证 URL"
  User -> Browser: "登录并授权"
  Browser -> Platform: "发送凭据"
  Platform -> CLI: "返回访问令牌"
  CLI -> CLI: "保存令牌以备将来使用"
}

CLI -> Platform: "上传文档和媒体文件"
Platform -> CLI: "成功响应"
CLI -> User: "✅ 发布成功！"

```

## 发布选项

您有两个主要选项来托管您的文档：

<x-cards data-columns="2">
  <x-card data-title="官方平台" data-icon="lucide:globe">
    发布到 [docsmith.aigne.io](https://docsmith.aigne.io/app/)，这是 AIGNE 提供的一个免费的公共托管平台。对于开源项目或希望快速分享文档的用户来说，这是一个不错的选择。
  </x-card>
  <x-card data-title="您自己的网站" data-icon="lucide:server">
    发布到您自己的 Discuss Kit 实例，以完全控制访问和品牌。这适用于内部或私有文档。您可以从 [Blocklet 商店](https://store.blocklet.dev/blocklets/z8ia1WEiBZ7hxURf6LwH21Wpg99vophFwSJdu) 获取 Discuss Kit 实例。
  </x-card>
</x-cards>

## 分步指南

请按照以下步骤首次发布您的文档。

### 1. 运行发布命令

在您的项目根目录中，运行以下命令：

```bash Terminal icon=lucide:terminal
aigne doc publish
```

### 2. 选择您的平台

如果这是您第一次发布，系统将提示您选择一个目的地。请选择适合您需求的选项。

![在官方平台或自托管实例之间选择](https://docsmith.aigne.io/image-bin/uploads/9fd929060b5abe13d03cf5eb7aea85aa.png)

如果您选择自己的网站，系统将要求您输入其 URL。

### 3. 验证您的账户

首次连接到新平台时，将打开一个浏览器窗口供您登录并授权 CLI。每个平台只需执行一次此步骤；您的访问令牌将保存在本地的 `~/.aigne/doc-smith-connected.yaml` 文件中，以备将来使用。

### 4. 确认

上传完成后，您的终端将显示一条成功消息。

```
✅ 文档发布成功！
```

## 在 CI/CD 环境中发布

对于自动化工作流，您可以通过提供参数和环境变量来绕过交互式提示。

| 方法 | 名称 | 描述 |
|---|---|---|
| **参数** | `--appUrl` | 直接指定您的 Discuss Kit 实例的 URL。 |
| **环境变量** | `DOC_DISCUSS_KIT_ACCESS_TOKEN` | 提供访问令牌，跳过交互式登录。 |

以下是一个适用于 CI/CD 流程的非交互式发布命令示例：

```bash CI/CD Example icon=lucide:workflow
export DOC_DISCUSS_KIT_ACCESS_TOKEN="your_access_token_here"
aigne doc publish --appUrl https://docs.mycompany.com
```

## 问题排查

如果在发布过程中遇到问题，请检查以下常见问题：

- **连接错误**：您提供的自托管实例的 URL 可能不正确，或者服务器可能无法访问。请验证 URL 和您的网络连接。

- **无效的网站 URL**：该 URL 必须指向一个在 ArcBlock 平台上构建的有效网站。CLI 将显示类似 `The provided URL is not a valid website on ArcBlock platform` 的错误。要托管您的文档，您可以从[商店获取一个 Discuss Kit 实例](https://store.blocklet.dev/blocklets/z8ia1WEiBZ7hxURf6LwH21Wpg99vophFwSJdu)开始。

- **缺少必需组件**：目标网站必须安装 Discuss Kit 组件。如果缺少该组件，CLI 将返回类似 `This website does not have required components for publishing` 的错误。请参阅 [Discuss Kit 文档](https://www.arcblock.io/docs/web3-kit/en/discuss-kit)以添加必要的组件。

有关命令和选项的完整列表，请参阅 [CLI 命令参考](./cli-reference.md)。