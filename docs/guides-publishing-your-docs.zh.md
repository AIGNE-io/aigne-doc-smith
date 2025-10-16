# 发布您的文档

生成文档后，下一步是使其能够在线访问。本指南提供了使用 `aigne doc publish` 命令发布文档的系统性步骤。

## 发布命令

`aigne doc publish` 命令会将您生成的文档文件上传到 Web 服务，使您的受众可以通过 Web 浏览器访问这些文件。

为方便起见，您可以使用完整名称或其别名之一来执行该命令。

```bash 命令执行 icon=lucide:terminal
# 完整命令
aigne doc publish

# 别名
aigne doc pub
aigne doc p
```

首次运行此命令时，它会启动一个交互式提示，引导您选择发布平台。

![发布文档对话框](../assets/screenshots/doc-publish.png)

## 发布目的地

该工具提供了几个用于托管文档的目的地。交互式设置将提供以下选项。

### 选项 1：DocSmith Cloud

此选项会将您的文档发布到免费托管服务 `docsmith.aigne.io`。

*   **预期用途**：此方法适用于开源项目或任何旨在供公众访问的文档。
*   **成本**：免费。
*   **结果**：发布过程完成后，您的文档将通过提供的 URL 公开可用。

### 选项 2：您现有的网站

此选项允许您将文档发布到您已拥有并管理的网站。这需要您运行自己的 Discuss Kit 实例。

*   **预期用途**：这用于将文档直接集成到现有的公司网站、产品门户或个人域名中。
*   **要求**：您必须拥有自己的托管基础设施和正在运行的 Discuss Kit 实例。
*   **步骤**：
    1.  从交互式提示中选择“您现有的网站”选项。
    2.  出现提示时，输入您网站的完整 URL（例如，`https://docs.your-company.com`）。
    3.  要建立您自己的文档网站，您可以从官方商店获取 Discuss Kit 实例：[https://www.web3kit.rocks/discuss-kit](https://www.web3kit.rocks/discuss-kit)。Discuss Kit 是一项非开源服务，提供托管所需的后端。

### 选项 3：新网站

此选项可帮助您为文档建立一个新的专用网站。

*   **预期用途**：这适用于需要独立文档门户但没有现有网站的用户。
*   **成本**：这是一项付费服务。
*   **步骤**：命令行界面将引导您完成部署和配置新 Discuss Kit 实例的过程。如果您之前已开始此过程，也会提供一个恢复设置的选项。

## 自动化发布

对于自动化环境，例如持续集成/持续部署 (CI/CD) 管道，您可以通过直接指定目标 URL 来绕过交互式提示。

使用命令的 `--appUrl` 标志来定义发布目标。

```bash 直接发布示例 icon=lucide:terminal
aigne doc publish --appUrl https://docs.your-company.com
```

当您首次发布到特定 URL 时（无论是通过交互式提示还是 `--appUrl` 标志），该工具都会将此 URL 保存到您的本地配置文件中。后续执行 `aigne doc publish` 将自动使用已保存的 URL，从而简化更新过程。

## 问题排查

### 授权错误

如果发布过程失败，并出现包含“401”或“403”的错误消息，则表示您的身份验证令牌存在问题。该令牌可能无效、已过期或缺少所需权限。

要解决此问题，请运行 `clear` 命令以重置您的本地配置和凭据：

```bash 清除配置 icon=lucide:terminal
aigne doc clear
```

命令完成后，再次运行 `aigne doc publish`。系统将提示您重新进行身份验证并配置您的发布目的地。

---

成功发布文档后，您可能需要随着项目的发展而更新它。有关此过程的说明，请参阅[更新文档](./guides-updating-documentation.md)指南。