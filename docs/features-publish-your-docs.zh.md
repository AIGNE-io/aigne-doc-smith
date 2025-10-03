# 发布您的文档

生成文档后，`aigne doc publish` 命令会上传您的文件，并通过一个可共享的链接使其可访问。本指南提供了将文档发布到 AIGNE 官方平台或自托管实例的分步流程。

## 发布流程

`aigne doc publish` 命令会启动一个交互式工作流。当您首次发布到某个目的地时，CLI 会打开浏览器引导您完成一次性身份验证过程。对于后续的发布，它将使用存储在 `~/.aigne/doc-smith-connected.yaml` 中的已保存凭据。

```d2 发布工作流 icon=lucide:upload-cloud
shape: sequence_diagram

User: {
  label: "开发者 / CI-CD"
  shape: c4-person
}

CLI: {
  label: "CLI\n(aigne doc publish)"
}

Local-Config: {
  label: "本地配置\n(~/.aigne/...)"
  shape: cylinder
}

Browser

Platform: {
  label: "平台\n(官方或自托管)"
}

User -> CLI: "运行命令"

alt "交互模式" {
  CLI -> Local-Config: "检查凭据"
  opt "未找到凭据 (首次)" {
    CLI -> User: "提示选择平台"
    User -> CLI: "平台已选择"
    CLI -> Browser: "打开认证 URL"
    User -> Browser: "登录并授权"
    Browser -> Platform: "请求令牌"
    Platform -> Browser: "返回令牌"
    Browser -> CLI: "发送令牌到 CLI"
    CLI -> Local-Config: "保存凭据"
  }
  CLI -> Platform: "上传文档"
  Platform -> CLI: "确认成功"
  CLI -> User: "显示成功消息"
}

alt "CI/CD 模式" {
  note over CLI: "从环境变量读取令牌"
  CLI -> Platform: "上传文档"
  Platform -> CLI: "确认成功"
  CLI -> User: "返回成功状态"
}
```

## 发布选项

您可以选择两个主要的目的地来托管您的文档：

<x-cards data-columns="2">
  <x-card data-title="官方平台" data-icon="lucide:globe">
    发布到由 AIGNE 运营的服务 docsmith.aigne.io。对于开源项目或希望快速公开发布文档的用户来说，这是一个简单直接的选择。
  </x-card>
  <x-card data-title="自托管实例" data-icon="lucide:server">
    发布到您自己的 Discuss Kit 实例，以完全控制品牌、访问权限和数据隐私。这是内部或私有文档的推荐选项。您可以按照官方文档中的说明运行自己的 Discuss Kit 实例。
  </x-card>
</x-cards>

## 分步指南

请按照以下步骤发布您的文档。

### 1. 运行发布命令

导航到您项目的根目录并执行以下命令：

```bash 终端 icon=lucide:terminal
aigne doc publish
```

### 2. 选择您的平台

如果这是您第一次发布，系统将提示您选择一个目的地。请选择符合您需求的选项。

![在官方平台或自托管实例之间进行选择](https://docsmith.aigne.io/image-bin/uploads/9fd929060b5abe13d0_3cf5eb7aea85aa.png)

如果您选择自托管实例，系统将要求您输入其 URL。

### 3. 验证您的账户

对于首次连接，浏览器窗口将自动打开，以便您登录并授权 CLI。每个平台此步骤仅需执行一次。访问令牌会保存在本地以供将来使用。

### 4. 确认

上传完成后，您的终端将显示一条成功消息，确认文档已上线。

```
✅ Documentation Published Successfully!
```

## 在 CI/CD 环境中发布

要在 CI/CD 流水线等自动化工作流中使用发布命令，您可以通过参数和环境变量提供必要信息来绕过交互式提示。

| Method | Name | Description |
|---|---|---|
| **参数** | `--appUrl` | 指定您的 Discuss Kit 实例的 URL。 |
| **环境变量** | `DOC_DISCUSS_KIT_ACCESS_TOKEN` | 提供访问令牌以跳过交互式登录过程。 |

以下是一个适用于 CI/CD 脚本的非交互式发布命令示例：

```bash CI/CD 示例 icon=lucide:workflow
export DOC_DISCUSS_KIT_ACCESS_TOKEN="your_access_token_here"
aigne doc publish --appUrl https://docs.mycompany.com
```

## 问题排查

如果您在发布过程中遇到问题，可能是由以下常见问题之一引起的。

- **连接错误**：CLI 可能会返回类似 `Unable to connect to: <URL>` 的错误消息。这可能是由网络问题、服务器暂时不可用或 URL不正确引起的。请验证 URL 是否正确以及服务器是否可以访问。

- **无效的网站 URL**：命令可能会失败并显示消息 `The provided URL is not a valid website on ArcBlock platform`。目标 URL 必须是构建在 ArcBlock 平台上的网站。要托管您的文档，您可以运行自己的 Discuss Kit 实例。

- **缺少必需组件**：错误提示 `This website does not have required components for publishing` 表明目标网站没有安装 Discuss Kit 组件。请参阅 Discuss Kit 文档，为您的站点添加必要的组件。

有关命令和选项的完整列表，请参阅 [CLI 命令参考](./cli-reference.md)。