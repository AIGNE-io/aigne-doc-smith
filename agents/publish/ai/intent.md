# Publish Agent 功能意图

## 功能概述

文档发布工具，将 DocSmith 生成的文档发布到在线平台。

## 功能意图

DocSmith 生成的文档存储在本地 workspace 目录中，使用特定的目录结构（文件夹 + .meta.yaml + 语言文件）。用户需要将这些文档发布到在线平台供他人访问。Publish Agent 负责完成发布前检查、格式转换、图片处理和上传等全流程。

## 工作流程

```
用户调用 publish
    ↓
1. check.mjs - 发布前检查
   ├─ 检查配置文件存在性
   ├─ 检查项目元数据（projectName、projectDesc、projectLogo）
   │   └─ 如果为空，尝试自动更新
   ├─ 检查文档结构（checkStructure）
   └─ 检查文档内容（checkContent）
    ↓
2. translate-meta.mjs - 翻译元数据（可选）
   ├─ 如果只有一种语言，跳过翻译，直接保存到缓存
   └─ 如果有多种语言，将项目名称和描述翻译为目标语言
    ↓
3. publish-docs.mjs - 执行发布
   ├─ 加载文档结构
   ├─ docs-converter 转换文档格式
   │   ├─ 扫描文档目录
   │   ├─ 替换 AFS image slots 为真实图片
   │   ├─ 处理 /sources/... 绝对路径图片 ← 本次新增
   │   ├─ 添加 .md 后缀到内部链接
   │   └─ 调整图片相对路径
   ├─ 生成 _sidebar.md
   ├─ 选择发布平台
   └─ 上传文档到平台
```

## 核心能力

1. **发布前检查**：验证配置、结构、内容的完整性和正确性
   - 检查项目元数据（projectName、projectDesc、projectLogo）
   - 若元数据为空，尝试自动填充更新
2. **格式转换**：将 workspace 目录结构转换为发布格式
3. **图片处理**：
   - 替换 AFS image slots 为真实图片引用
   - 处理 `/sources/...` 绝对路径图片，支持两种格式：
     - Markdown 格式：`![alt](/sources/path/to/image.png)`
     - HTML 格式：`<img src="/sources/path/to/image.png" ... />`
   - 调整相对路径以适应发布后的目录结构
4. **多平台支持**：DocSmith Cloud、自有网站、新建网站
5. **元数据翻译**：支持将项目信息翻译为多语言
   - 单语言时跳过翻译，直接缓存原始内容
   - 多语言时才调用 AI 进行翻译

## 输入输出

### 输入

- 可选输入：
  - `appUrl`: 发布目标网站 URL
  - `boardId`: 文档集合 ID
  - `projectName`, `projectDesc`, `projectLogo`: 项目信息
  - `with-branding`: 是否更新网站品牌信息
  - `translatedMetadata`: 翻译后的元数据

- 自动获取：
  - 从 `config.yaml` 读取配置信息
  - 从 `planning/document-structure.yaml` 读取文档结构
  - 从 `docs/` 目录读取文档内容

### 输出

- 输出内容：发布结果消息
  - 成功：文档访问 URL
  - 失败：错误信息和建议

## 约束条件

### 必须遵循的规范

1. **发布前必须通过检查**：元数据检查、结构检查和内容检查都必须通过
   - 元数据检查：projectName、projectDesc、projectLogo 不能为空
   - 若元数据为空，尝试自动更新后重新检查
2. **图片路径转换规则**：
   - AFS image slots → 真实图片路径
   - `/sources/...` → 复制图片并转换为相对路径
   - 相对路径根据文档深度调整
3. **链接格式**：内部链接添加 `.md` 后缀

### Sources 绝对路径处理

文档中使用 `/sources/...` 格式引用数据源中的图片时：

1. **识别**：匹配 `/sources/` 开头的图片路径，支持两种格式：
   - **Markdown 格式**：`![alt](/sources/path/to/image.png)`
   - **HTML 格式**：`<img src="/sources/path/to/image.png" ... />`
2. **解析**：从 config.yaml 获取 sources 配置，依次在每个 source 中查找图片
3. **复制**：将源图片复制到临时目录的 `sources/` 子目录（保持相同路径结构）
4. **转换**：将绝对路径替换为相对路径（根据文档深度计算）

**Markdown 格式转换示例**：
```
原始：![screenshot](/sources/assets/screenshot.png)
转换后：![screenshot](../sources/assets/screenshot.png)（depth=1）
       ![screenshot](../../sources/assets/screenshot.png)（depth=2）
```

**HTML 格式转换示例**：
```
原始：<img src="/sources/blocklets/core/public/logo/doubao.png" alt="Doubao" style="width: 48px;" />
转换后：<img src="../sources/blocklets/core/public/logo/doubao.png" alt="Doubao" style="width: 48px;" />（depth=1）
       <img src="../../sources/blocklets/core/public/logo/doubao.png" alt="Doubao" style="width: 48px;" />（depth=2）
```

### 职责边界

- **必须执行**：
  - 发布前检查配置、元数据和文档
  - 元数据为空时尝试自动更新
  - 转换文档格式到发布格式
  - 处理所有图片路径（包括 sources 绝对路径）
  - 上传文档到指定平台

- **不应执行**：
  - 不修改原始文档文件
  - 不修改文档结构文件
  - 不生成新文档内容

- **协作方式**：
  - 依赖 `structure-checker` 检查文档结构
  - 依赖 `content-checker` 检查文档内容
  - 依赖 `docs-converter.mjs` 转换文档格式
  - 依赖 `sources-path-resolver.mjs` 解析 sources 路径
  - 依赖 `@aigne/publish-docs` 执行实际上传

## 预期结果

### 成功标准

1. 文档成功发布到在线平台
2. 所有图片正确显示（包括 sources 中的图片）
3. 所有内部链接正常工作
4. 返回可访问的文档 URL

## 错误处理

### 常见错误

1. **检查失败**：配置缺失、元数据不完整、结构错误、内容问题
2. **认证失败**：无效的访问令牌
3. **网络错误**：上传失败
4. **图片处理失败**：图片不存在、路径无法解析

### 处理策略

1. **检查失败**：
   - 元数据为空时，尝试自动更新后继续
   - 自动更新失败或其他检查失败，抛出错误提示用户修复
2. **认证失败**：提示用户重新认证
3. **网络错误**：返回错误消息
4. **图片处理**：跳过无法处理的图片并警告

## 实现方式

### 文件组成

- `index.yaml`: Agent 配置，定义 skills 列表
- `check.mjs`: 发布前检查
- `translate-meta.mjs`: 元数据翻译
- `publish-docs.mjs`: 发布主流程

### 依赖工具

- `utils/docs-converter.mjs`: 文档格式转换
- `utils/sources-path-resolver.mjs`: sources 路径解析
- `utils/config.mjs`: 配置文件操作
- `@aigne/publish-docs`: 发布上传

---
**注意**：本文档描述功能意图，不包含具体实现细节。
