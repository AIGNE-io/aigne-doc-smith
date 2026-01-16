# 文档内容生成指南

本指南定义了生成 markdown 文档时的内容要求和格式规范。

## 基本要求

为结构中的每个文档在 `docs/` 目录中创建文档文件夹和文件：
- 使用 YAML 中的 `path` 创建文件夹
- 生成 `.meta.yaml` 元信息文件
- 生成语言版本的 markdown 文件
- 从 `sourcePaths` 提取信息
- 编写清晰、结构化的内容
- **在生成文档内容时主动添加图片**（参见"媒体资源"章节）

## 文档生成步骤

### 6.1 读取配置

读取 `config.yaml` 获取输出语言(locale)：

### 6.2 使用 saveDocument 工具

**重要**：新增文档时，必须使用 `saveDocument` 工具，不要手动创建文件和文件夹。
**工具功能**：
- 自动创建文档文件夹（`docs/overview/`）
- 自动生成 `.meta.yaml`：
- 自动保存语言文件（`docs/overview/zh.md`）

### 6.3 编辑已有文档

直接使用 Edit 工具修改对应的语言文件：
### 6.4 批量生成

为提高效率，批量生成多个文档内容，然后批量调用 saveDocument。

## 导航链接

在每个文档中添加导航链接，引导用户在文档之间流畅跳转。
只能链接生成的其他文档，不能链接到工作目录中的 markdown 文件，文档发布后会导致无法访问。
导航链接应该使用文档结构中文档的 `path`

### 文档开头导航

在文档正文开始前添加：
- **前置条件**：阅读本文档前建议先了解的内容
- **父主题**：当前文档所属的上级主题

### 文档结尾导航

在文档末尾添加：
- **相关主题**：与当前文档相关的其他文档
- **下一步**：建议阅读的后续内容
- **子文档**：当前文档包含的子主题列表

## 媒体资源

### 前置准备：确定文档和媒体的位置关系

**在开始生成文档前，必须完成以下步骤：**

#### 1. 确定文档输出目录

从 `planning/document-structure.yaml` 的文档配置中读取，文档输出目录固定为：`docs/`

#### 2. 查找所有媒体文件

执行以下命令查找工作区中的所有媒体文件：

```bash
find . -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.svg" -o -name "*.mp4" -o -name "*.webp" \)
```

记录所有结果，例如：
- `./assets/create/screenshot1.png`
- `./assets/run/screenshot2.png`
- `./images/architecture.png`

#### 3. 图片路径格式

**sources 中的图片使用绝对路径**：

对于数据源中的图片，使用 `/sources/` 开头的绝对路径格式：

```
/sources/<path-to-image>
```

**示例**：
- 图片路径：`modules/sources/assets/run/screenshot.png`
- 文档中引用：`![截图](/sources/assets/run/screenshot.png)`

**注意**：
- 直接使用在 sources 目录下看到的路径
- 不需要计算相对路径层级，统一使用绝对路径
- 路径区分大小写
- 检查和发布阶段会自动解析并处理图片路径

### 生成文档时的图片处理

在编写每个文档的内容时，必须主动添加图片以增强文档的可读性和专业性。

#### 1. 图片分类与要求

**A. 技术图表（必须生成）**

以下类型的内容**必须包含相应的技术图表**，没有已有图片时必须生成 AFS Image Slot：

- **架构说明** → 架构图（系统架构、模块关系、组件结构）
- **流程说明** → 流程图（业务流程、数据流向、状态转换）
- **时序说明** → 时序图（交互时序、调用链路）
- **概念解释** → 概念图（概念关系、层次结构）
- **数据结构** → 数据模型图（类图、ER 图）

**B. 应用截图（必须使用已有）**

以下类型必须使用工作区中的已有截图，因为必须使用真实的应用截图：

- **界面介绍** → UI 截图
- **操作步骤** → 操作演示截图
- **功能展示** → 功能界面截图

**强制性要求：**

1. **技术文档必须包含技术图表**：
   - 架构文档：至少 1 个架构图
   - API 文档：至少 1 个时序图或流程图
   - 概念说明：至少 1 个概念图
   - 数据模型：至少 1 个数据结构图

2. **用户指南需要包含应用截图**：
   - 操作指南：每个主要操作步骤至少 1 张截图
   - 功能介绍：每个功能至少 1 张界面截图

3. **综合文档建议配比**：
   - 技术图表：1-3 个
   - 应用截图：1-2 个

#### 2. 图片处理流程

**对于应用截图（B 类）：**

1. 只能从前置准备的查找结果中匹配图片
2. 根据文件名判断用途（如 login.png、dashboard.png、settings.png）
3. 使用绝对路径格式引用：`![截图说明](/sources/assets/screenshot.png)`
4. 如果仓库未提供相关截图，可以不展示

**对于技术图表（A 类）：**

1. 检查是否有对应的技术图表（架构图、流程图等）
2. 如果没有，**必须生成 AFS Image Slot**（不是可选）
3. 即使有应用截图，也不能用应用截图替代技术图表

**关键区别：**
- ❌ 错误：架构说明章节使用应用截图代替架构图
- ✅ 正确：架构说明章节生成架构图 slot，另外可以添加应用截图作为补充

#### 3. 生成 AFS Image Slot

``` text AFS Image Slot Instructions

Use an AFS image slot only when you want the framework to generate a new image.

Slot format (single line):
<!-- afs:image id="architecture-overview" desc="..." -->

Optional stable intent key (for reuse across edits or documents):
<!-- afs:image id="architecture-overview" key="aigne-cli-architecture" desc="..." -->

Rules:
- Insert a slot only for new image generation.
  If the source already provides an image (existing URL/path/asset), reference it directly; do not create a slot.
- id is required and must be a semantic identifier describing the image's role or position
  (e.g. architecture-overview, core-flow, deployment-banner).
  It must be unique in the same document and match: [a-z0-9._-]+.
- desc is required, concise, double-quoted, and must not contain ".
  It describes what the image should depict.
- key is optional. Use a short, stable token ([a-z0-9._-]+) when you want the same image intent to be reused across sections or documents.
```

**何时必须生成 Slot：**

1. 文档内容需要技术图表（架构图、流程图、时序图等）
2. 工作区中没有对应的技术图表

**AFS Image Slot 不能用于**

1. 应用界面必须使用真实截图，不能用 Slot 生成虚构的界面


### 图片使用检查清单

生成每个文档时，确认以下项目：

**技术图表检查：**
- [ ] 架构说明章节是否包含架构图？（没有则生成 slot）
- [ ] 流程说明章节是否包含流程图？（没有则生成 slot）
- [ ] 时序说明章节是否包含时序图？（没有则生成 slot）
- [ ] 概念解释章节是否包含概念图？（没有则生成 slot）

**应用截图检查：**
- [ ] 是否有可用的应用截图可以引用？
- [ ] 引用路径是否使用正确的绝对路径格式？

**数量检查：**
- [ ] 技术文档是否至少包含 1 个技术图表？
- [ ] 用户指南是否包含足够的应用截图？

## 内容组织原则

1. **层次清晰**：使用恰当的标题层级（H1-H6）
2. **段落简洁**：每个段落专注于单一主题
3. **描述丰富**：每个段落有详细描述，帮助用户理解主题
4. **列表使用**：用列表组织并列信息
5. **强调重点**：使用粗体、引用等方式突出重要信息
