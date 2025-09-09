---
labels: ["Reference"]
---

# 发布您的文档

当您的文档生成并完善后，最后一步是与您的受众分享。AIGNE DocSmith 通过一个简单的命令简化了这一过程，让您可以将内容发布到官方公共平台或您自己的自托管网站。

## 发布命令

发布过程通过 `aigne doc publish` 命令启动的交互式向导进行处理。该引导式流程让您无需复杂的配置即可轻松地将文档发布上线。

```bash CLI Command icon=lucide:terminal
# 启动交互式发布向导
aigne doc publish
```

首次运行此命令时，系统将提示您选择要将文档发布到何处。

![选择官方平台或自托管平台](https://docsmith.aigne.io/image-bin/uploads/9fd929060b5abe13d03cf5eb7aea85aa.png)

### 发布目的地

您有两个主要选项来托管您的文档：

<x-cards>
  <x-card data-title="官方 DocSmith 平台" data-icon="lucide:cloud">
    发布到 docsmith.aigne.io。此选项免费，无需服务器设置，是开源项目的理想选择。请注意，您的文档将可公开访问。
  </x-card>
  <x-card data-title="自托管平台" data-icon="lucide:server">
    发布到由 Discuss Kit 驱动的您自己的网站。这让您可以完全控制隐私和品牌。您需要部署和管理自己的 Discuss Kit 实例。
  </x-card>
</x-cards>

### 身份验证

首次发布到特定平台时，DocSmith 会自动打开浏览器窗口对 CLI 进行身份验证和授权。这是一个一次性的过程。然后，一个安全访问令牌会保存在您本地的主目录中 (`~/.aigne/doc-smith-connected.yaml`)，因此后续发布到同一平台时无需再次登录。

### 发布工作流

下图说明了从运行命令到看到文档上线的整个过程。

```d2 发布工作流
direction: down

shape: sequence_diagram

User: { 
  shape: c4-person 
}

CLI: { 
  label: "AIGNE CLI"
}

Platform: { 
  label: "Discuss Kit 平台\n（官方或自托管）" 
}

User -> CLI: "aigne doc publish"
CLI -> User: "1. 提示选择平台"
User -> CLI: "2. 选择平台"

opt "如果未认证" {
  CLI -> Platform: "3a. 请求认证 URL"
  Platform -> CLI: "3b. 返回认证 URL"
  CLI -> User: "4. 在浏览器中打开认证 URL"
  User -> Platform: "5. 认证并授权"
  Platform -> CLI: "6. 发送访问令牌"
  CLI -> CLI: "7. 本地保存令牌"
}

CLI -> Platform: "8. 上传文档文件"
Platform -> CLI: "9. 确认成功"
CLI -> User: "10. 显示成功消息"
```

## 命令行选项

虽然我们推荐大多数用户使用交互模式，但您也可以通过命令行参数直接指定发布目的地，以用于自动化或脚本编写。

| 选项 | 描述 |
|---|---|
| `--appUrl <url>` | 指定您的自托管 Discuss Kit 实例的 URL。此选项将绕过交互式平台选择。 |
| `--boardId <id>` | Discuss Kit 平台上的文档板的唯一 ID。如果未提供，将自动创建一个新的。 |

**自托管发布示例：**

```bash 发布到自定义 URL icon=lucide:terminal
# 直接发布到指定的自托管 Discuss Kit 实例
aigne doc publish --appUrl https://docs.my-company.com
```

---

文档发布后，您就成功完成了从代码到实时多语言文档的整个生命周期。要获取所有命令及其选项的完整列表，您可以浏览 [CLI 命令参考](./cli-reference.md)。