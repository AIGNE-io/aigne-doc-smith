# 问题排查

本指南帮助你诊断和修复使用 AIGNE DocSmith 时的常见问题。如果在生成、发布或配置过程中遇到问题，请查看以下场景的解决方案。

---

## 配置问题

### 问题 1: 配置文件格式错误

**错误消息：**
```
Error: Failed to parse config file: Implicit map keys need to be followed by map values at line 112, column 1:

lastGitHead: d9d2584f23aee352485f369f60142949db601283
appUrl： https://docsmith.aigne.io
```

```
Error: Failed to parse config file: Map keys must be unique at line 116, column 1:

docsDir: .aigne/doc-smith/docs
appUrl: https://docsmith.aigne.io
^
```

**可能的原因：** 配置文件中的 YAML 语法有误，常见问题包括：
- 缩进使用了制表符而不是空格
- 使用了中文冒号（：）而不是英文冒号（:）
- 缺少必要的引号
- 重复的配置项

**解决方法：**
1. 查看错误提示中的行号，定位问题位置
2. 检查该行的缩进是否正确（使用空格，不要用 Tab）
3. 确认冒号是英文半角冒号（:），不是中文全角冒号（：）
4. 使用在线 YAML 验证工具检查语法
5. 修复后重新运行 `aigne doc publish`

---

> **提示：** 除了配置文件格式错误需要修复外，如果某些参数未正确配置，系统会自动使用默认值，不会影响基本功能。

## 生成问题

### 问题 2: 生成的内容不符合预期

**你可能会遇到：**
- 生成的内容语气不符合你的要求
- 文档结构与你期望的不一致
- 缺少一些重要的信息

**可能的原因：**
1. 配置中的 `rules` 描述不够详细或不够清晰
2. `targetAudienceTypes` 设置与实际目标受众不匹配
3. `sourcesPath` 中的参考文档太少或不够相关

**如何解决：**
1. **丰富 `rules`：** 在 `config.yaml` 中添加详细指导：
   ```yaml
   rules: |
     ### 文档结构要求
     1. 每个文档必须包含：
        * 清晰的标题和概述
        * 分步骤说明
        * 适用的代码示例
        * 故障排除部分
     
     ### 内容语气
     - 使用清晰、简洁的语言
     - 包含具体数据和示例
     - 避免营销术语
     - 专注于可操作的信息
   ```

2. **调整受众：** 确保 `targetAudienceTypes` 与实际受众匹配：
   ```yaml
   targetAudienceTypes:
     - endUsers      # 面向最终用户
     - developers     # 面向技术受众
   ```

3. **添加更多来源：** 在 `sourcesPath` 中包含相关文档：
   ```yaml
   sourcesPath:
     - ./README.md
     - ./docs
     - ./CHANGELOG.md
     - ./src
     - ./package.json
   ```

---

### 问题 3: 图片质量低或缺失

**你可能会遇到：**
- 生成的文档中图片清晰度不够
- 期望出现的图片没有显示出来

**原因：** 这是因为 `media.minImageWidth` 设置的值太高，过滤掉了一些图片。

**如何解决：**
1. 打开 `config.yaml` 文件，找到 `media` 配置项：
   ```yaml
   media:
     minImageWidth: 800  # 当前阈值
   ```

2. 根据你的需求调整这个值：
   - **400-600**：会包含更多图片，但可能有一些质量较低的图片
   - **600-800**：质量和数量比较平衡（推荐设置）
   - **800-1000**：只保留高质量图片，数量会减少

3. 保存文件后运行更新命令：
   ```bash
   aigne doc update
   ```

---

### 问题 4: 文档缺失或不完整

**你可能会遇到：**
- 某些预期的文档没有生成
- 生成的文档不完整

**可能的原因：**
1. `sourcesPath` 没有包含所有必要的源文件
2. 源文件无法访问或存在权限问题
3. `documentationDepth` 设置过低

**如何解决：**
1. **检查源路径：** 确保包含所有必要的文件：
   ```yaml
   sourcesPath:
     - ./README.md
     - ./src              # 包含源代码目录
     - ./docs             # 包含现有文档
     - ./package.json      # 包含配置文件
   ```

2. **增加文档深度：** 如果需要全面的文档：
   ```yaml
   documentationDepth: comprehensive  # 而不是 essentialOnly
   ```

3. **验证文件权限：** 确保 DocSmith 对 `sourcesPath` 中的所有文件具有读取权限

---

## 翻译问题

### 问题 5: 翻译失败或质量差

**你可能会遇到：**
- 翻译命令失败
- 翻译内容质量差或有错误

**可能的原因：**
1. `locale` 和 `translateLanguages` 设置有冲突
2. 源文档存在语法错误
3. 翻译过程中网络问题

**如何解决：**
1. **检查语言设置：** 确保 `translateLanguages` 不包含与 `locale` 相同的语言：
   ```yaml
   locale: en
   translateLanguages:
     - zh        # 可以
     - ja        # 可以
     # - en      # ❌ 不要包含 locale 语言
   ```

2. **修复源文档：** 在翻译前确保源文档有效：
   ```bash
   # 首先验证源文档是否正确
   aigne doc create
   
   # 然后翻译
   aigne doc translate
   ```

3. **重试翻译：** 如果出现网络问题，只需再次运行命令：
   ```bash
   aigne doc translate
   ```

---

## 发布问题

### 问题 6: 发布时提示 URL 无效

**错误提示：**
```
Error: ⚠️  The provided URL is not a valid ArcBlock-powered website

💡 Solution: To host your documentation, you can get a website from the ArcBlock store:
```

**原因：** 配置中的 `appUrl` 为空或指向了一个无效的网站地址。

**如何解决：**
在 `config.yaml` 中设置正确的部署地址：
```yaml
# 填入你的网站地址
appUrl: https://your-site.user.aigne.io

# 如果暂时没有网站，可以先清空这个配置
# appUrl: ""
```

或者，你可以在发布时指定 URL：
```bash
aigne doc publish --appUrl https://your-docs-website.com
```

---

### 问题 7: 发布时提示授权已过期

**错误提示：**
```
❌ Publishing failed due to an authorization error:
💡 Please run aigne doc clear to reset your credentials and try again.
```

```
❌ Publishing failed due to an authorization error:
💡 You're not the creator of this document (Board ID: docsmith). You can change the board ID and try again.
💡  Or run aigne doc clear to reset your credentials and try again.
```

**原因：** 你的登录凭证已过期，或者你没有权限发布到指定的文档板。

**如何解决：**
按顺序运行以下命令：
```bash
# 先清理旧的授权信息
aigne doc clear

# 然后重新发布，系统会提示你重新登录
aigne doc publish
```

运行 `aigne doc clear` 时，选择清除身份验证令牌。之后，再次运行 `aigne doc publish`，系统会提示你重新授权。

---

### 问题 8: 发布时网络连接失败

**错误提示：**
```
❌ Could not connect to: https://your-site.com

Possible causes:
• There may be a network issue.
• The server may be temporarily unavailable.
• The URL may be incorrect.

Suggestion: Please check your network connection and the URL, then try again.
```

**如何解决：**
1. **检查网络连接：** 确保你的网络可以访问目标 URL
2. **验证 URL：** 确认 `appUrl` 正确且可访问
3. **重试：** 网络问题通常是暂时的，稍等片刻后重试：
   ```bash
   aigne doc publish
   ```

---

## 如何恢复

### 方法 1: 使用 Git 恢复

如果你使用 Git 管理代码，可以快速恢复到之前正常工作的配置：

```bash
# 暂存当前更改
git stash
```

然后重新生成文档：
```bash
aigne doc create
```

> **提示：** 如果之后想恢复刚才暂存的更改，可以运行 `git stash pop`

---

### 方法 2: 清理后重新生成

如果遇到无法定位的问题，可以清除所有生成的文件，然后从头开始重新生成：

```bash
# 清理所有生成的文件，然后重新生成
aigne doc clear && aigne doc create
```

> **注意：** 这会删除所有已生成的内容，但不会影响你的配置文件。执行后系统会基于当前配置重新生成文档。

---

### 方法 3: 重置配置

如果配置问题持续存在，可以重置配置文件：

```bash
# 清理配置（提示时选择配置文件）
aigne doc clear

# 然后重新初始化
aigne doc init
```

> **警告：** 这将删除你当前的配置。请确保在继续之前备份重要设置。

---

## 使用建议

以下是一些实用的建议，可以帮助你避免常见问题：

1. **保存修改历史：** 如果使用 Git，每次修改配置文件后记得提交，这样出问题时可以轻松回到之前的版本
2. **修改前先备份：** 在修改重要配置前，先复制一份配置文件作为备份，以防万一
3. **修改后立即测试：** 每次修改配置后，马上运行 `aigne doc create` 或 `aigne doc update` 测试一下，有问题可以及时发现
4. **检查格式是否正确：** 修改 YAML 文件后，可以用在线工具检查一下格式有没有错误
5. **从简单开始：** 刚开始时使用最简单的配置，确认一切正常后，再慢慢添加更复杂的功能
6. **记录你的修改：** 简单记录一下每次修改了什么、为什么修改，以后遇到问题时更容易找到原因
7. **保持源文件更新：** 定期更新 `sourcesPath` 以包含新的源文件和文档
8. **审查生成的内容：** 生成后，在发布前审查输出以确保符合预期

---

## 获取更多帮助

如果以上方法都无法解决你的问题，可以尝试：

1. **查阅配置文档：** 查看 [配置参考](./configuration.zh.md) 了解每个配置项的详细说明

2. **查看命令文档：** 参考命令文档了解命令的详细用法

3. **查看错误日志：** 仔细阅读终端中显示的错误信息，通常会有具体的提示

4. **使用 AIGNE Observability：** 使用下文介绍的 AIGNE Observability 工具，获取详细的执行记录

5. **寻求社区帮助：** 访问 [AIGNE 社区](https://community.arcblock.io/discussions/boards/aigne) 提问，其他用户或开发者可能会帮助你

---

## 使用 AIGNE Observability 排查问题

当你遇到复杂问题需要深入排查，或者要向社区报告问题时，可以使用 **AIGNE Observability**。它会详细记录每一步的执行过程，帮助你或技术支持人员快速找到问题所在。

### 启动 Observability 服务器

运行以下命令启动本地 Observability 服务器：

```bash 启动 Observability 服务器 icon=lucide:terminal
aigne observe
```

你会看到输出显示：
- 数据库路径：追踪数据保存的位置
- 服务器地址：在浏览器中打开这个地址可以查看 Observability 仪表板

![Observability Dashboard](../../../assets/screenshots/doc-aigne-observe.png)

### 查看执行记录

1. **打开仪表板：** 点击输出中显示的服务器地址，或在浏览器中打开

2. **查看操作记录：** 仪表板会显示所有 DocSmith 的操作，包括：
   - 输入和输出的数据
   - 每一步花费的时间
   - 执行的操作步骤和结果
   - 详细的错误信息

![Observability Dashboard](../../../assets/screenshots/doc-observe-dashboard.png)

### 使用 Observability 报告问题

向社区报告问题时：

1. **捕获追踪：** 在出现问题的操作期间保持 Observability 服务器运行
2. **导出追踪数据：** 从仪表板导出相关的执行记录
3. **报告问题：** 访问 [AIGNE 社区](https://community.arcblock.io/discussions/boards/aigne) 并附上：
   - 问题描述
   - 重现步骤
   - 导出的追踪文件
   - 你的配置（如相关）

> **提示：** 追踪记录包含了 DocSmith 执行的完整信息，包括每一步的操作和结果。将这些信息提供给技术支持或社区，可以大大提高问题解决的效率。
