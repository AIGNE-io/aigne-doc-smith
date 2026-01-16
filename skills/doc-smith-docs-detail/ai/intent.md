# doc-smith-docs-detail 功能意图

## 功能概述

doc-smith-docs-detail 是 doc-smith 文档生成系统的核心内容生成组件，负责根据已规划的文档结构和用户意图，生成单个文档的详细内容。

## 功能意图

为 doc-smith 提供专门的文档内容生成能力，将文档详情生成从主流程中解耦，实现：

1. **聚焦内容生成**：专注于文档内容的智能生成，不涉及 workspace 管理、结构规划等职责
2. **上下文感知**：充分理解并应用用户意图、文档结构上下文、源代码信息
3. **规范遵循**：严格遵循 doc-smith 的文档规范，包括格式、导航、图片处理等
4. **质量保证**：生成后自动校验内容，确保符合标准

## 工作流程

```
doc-smith 主流程:
1. Workspace 检测与初始化
2. 分析数据源
3. 推断用户意图
4. 规划文档结构 → 生成 document-structure.yaml
5. 确认文档结构
6. [批量调用 doc-smith-docs-detail] 生成各文档内容
   ├─ 调用 agent(path: "/overview")
   ├─ 调用 agent(path: "/api/auth")
   └─ 调用 agent(path: "/guides/install")
7. 生成 AFS 图片
8. 最终校验与提交
```

## 核心能力

### 1. 源代码理解与分析

- 读取和分析 `sourcePaths` 指定的源代码文件
- 提取关键信息：API 接口、类定义、函数签名、配置项等
- 理解代码结构和依赖关系
- 识别需要文档化的核心概念

### 2. 意图驱动的内容生成

- 解读 `user-intent.md` 中的目标用户、使用场景、文档侧重点
- 根据文档类型（教程/参考/指南）调整内容风格
- 确定内容详细程度和组织方式
- 选择合适的示例和说明方式

### 3. 结构化内容组织

- 生成符合规范的文档章节结构
- 包含必要的导航元素：
  - 前置条件（prerequisites）
  - 父主题（parent topic）
  - 相关主题（related topics）
  - 下一步（next steps）
  - 子文档（child documents）
- 构建清晰的信息层次

### 4. 技术图表规划

- 识别需要技术图表的场景：
  - 架构图（architecture diagrams）
  - 流程图（flow charts）
  - 时序图（sequence diagrams）
  - 概念图（concept diagrams）
  - 数据模型（data models）
- 生成 AFS image slots 标记
- 提供准确的图表描述（desc 字段）

### 5. 代码示例生成

- 提供实际可运行的代码示例
- 包含完整的上下文和说明
- 确保示例与源代码一致
- 覆盖常见使用场景

## 输入参数

### 必需参数

**path**（字符串）
- 格式：`/path/to/document`
- 说明：与 document-structure.yaml 中的 path 字段一致
- 用途：确定生成哪篇文档

### 可选参数

**customRequirements**（字符串）
- 说明：用户在当前对话中提出的额外要求
- 示例：
  - "重点说明安全注意事项"
  - "包含性能优化建议"
  - "补充错误处理的最佳实践"
- 用途：
  - 指导生成内容的侧重点
  - 可根据要求补充相关源文件到分析范围

## 自动获取的信息

agent 会从 workspace 约定目录自动读取：

1. **planning/document-structure.yaml**
   - 文档的 title、description、sourcePaths
   - 文档在层级中的位置、父子关系

2. **intent/user-intent.md**
   - 目标用户、使用场景、文档侧重点

3. **config.yaml**
   - 语言配置（locale）

## 输出规范

### 生成的文档内容要求

1. **基本结构**
   - 标题和简介
   - 导航元素（文档开头：前置条件、父主题；文档结尾：相关主题、下一步、子文档）
   - 主体内容（结构化章节、代码示例、注意事项）

2. **技术图表**
   - 必要时生成 AFS image slots：`<!-- afs:image id="unique-id" desc="图表描述" -->`
   - 引用现有图片使用相对路径：`(../ × 文档层级) + 图片路径`

3. **代码示例**
   - 使用正确的语言标识符
   - 提供完整上下文
   - 确保可运行

### agent 返回格式

```javascript
{
  success: boolean,
  path: string,              // 文档路径，如 "/api/overview"
  summary: string,           // 文档摘要（200-300字）
  sections: string[],        // 主要章节列表
  imageSlots: string[],      // 生成的 AFS image slots ID 列表
  validationResult: object   // checkContent 的校验结果
}
```

**重要**：不返回完整的文档内容，以节省主 agent 的上下文。

## 约束条件

### 必须遵循的规范

1. **文档格式**：Markdown 格式，遵循 doc-smith 章节组织规范
2. **图片处理**：技术图表生成 AFS image slot，应用截图引用现有图片
3. **代码示例**：使用正确的语言标识符，确保可运行
4. **内部链接**：使用相对路径指向 Markdown 文件

### agent 职责边界

**必须执行**：
- ✅ 读取 workspace 约定目录中的配置信息
- ✅ 分析源代码并生成文档内容
- ✅ 调用 saveDocument 保存文档
- ✅ 调用 checkContent 校验文档
- ✅ 返回摘要信息

**不应执行**：
- ❌ 不创建或修改 document-structure.yaml
- ❌ 不执行结构校验（checkStructure 由 doc-smith 负责）
- ❌ 不进行 Git 操作
- ❌ 不生成空洞的占位内容
- ❌ 不偏离用户意图

## 预期结果

### 成功标准

1. **完整性**：包含所有必需章节、导航链接完整、代码示例可运行
2. **准确性**：与源代码一致、技术细节正确
3. **可读性**：结构清晰、语言流畅、示例恰当
4. **一致性**：风格符合用户意图、格式遵循 doc-smith 规范
5. **校验通过**：checkContent 校验无错误

## 错误处理

### 常见错误

1. **输入错误**：缺少 path 参数、document-structure.yaml 中找不到对应文档
2. **配置读取失败**：无法读取 workspace 配置文件
3. **源代码分析失败**：源文件不存在或格式无法解析
4. **内容校验失败**：checkContent 检测到问题

### 处理策略

1. 提前验证输入和配置文件
2. 优雅降级：信息缺失时使用合理默认值
3. 明确报错：返回 `{ success: false, error: "错误描述" }`
4. 保持一致：确保生成的内容符合规范

## 实现方式

### 1. 创建 Agent Skill

在 `skills/doc-smith-docs-detail/` 创建 SKILL.md 文件，描述完整的处理流程。

### 2. 创建 Entry 配置

在 `skills-entry/doc-smith-docs-detail/` 创建 agent 配置文件：

```yaml
# skills-entry/doc-smith-docs-detail/index.mjs
# 导出 JavaScript 配置对象
type: "@aigne/agent-library/agent-skill-manager"
name: generateDocumentDetail
description: 根据文档路径和用户要求生成文档详细内容

instructions: ../../skills/doc-smith-docs-detail/SKILL.md

skills:
  - url: ../../agents/save-document/index.mjs    # 保存文档工具

input_schema:
  type: object
  required:
    - path
  properties:
    path:
      type: string
      description: 文档路径，与 document-structure.yaml 中的 path 一致
    customRequirements:
      type: string
      description: 用户在对话中提出的额外要求（可选）

output_schema:
  type: object
  required:
    - success
  properties:
    success:
      type: boolean
    path:
      type: string
    summary:
      type: string
      description: 文档摘要（200-300字）
    sections:
      type: array
      items:
        type: string
      description: 主要章节列表
    imageSlots:
      type: array
      items:
        type: string
      description: 生成的 AFS image slots ID 列表
    validationResult:
      type: object
      description: checkContent 的校验结果
```

### 3. 在 doc-smith 中注册

在 doc-smith 的 entry 配置中注册：

```yaml
# skills-entry/doc-smith/index.yaml
skills:
  - url: ../doc-smith-docs-detail/index.mjs
  # ... 其他 skills
```

---

**注意**：本文档描述功能意图，不包含具体实现细节。使用 `/skill-creator` 创建 SKILL.md。
