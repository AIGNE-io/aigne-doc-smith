# 文档结构 Schema

本参考定义了 `document-structure.yaml` 的完整 schema。

## 完整的 YAML 结构

```yaml
project:
  title: "项目名称"           # 必需：项目名称
  description: "项目概述"     # 必需：项目简要描述

documents:                    # 必需：文档对象数组
  - title: "文档标题"         # 必需：文档标题
    description: "简要摘要"   # 必需：此文档涵盖的内容
    path: "/filename"         # 必需：相对于 docs/ 的文件夹路径
                              # 示例：/overview, /getting-started, /api/authentication
    sourcePaths:              # 必需：源文件路径数组（相对路径，不使用 'workspace:' 前缀）
      - "src/main.py"         # 为此文档内容提供信息的文件
      - "README.md"           # 如果没有特定源文件则使用空数组 []
    icon: "lucide:book-open"  # 仅顶层文档必需
                              # 必须是有效的 Lucide 图标名称："lucide:icon-name"
                              # 示例：lucide:book-open, lucide:settings, lucide:code
                              # 嵌套文档省略此字段
    children:                 # 可选：嵌套文档（相同结构）
      - title: "嵌套文档"
        description: "详细信息"
        path: "/section/nested"
        sourcePaths:
          - "src/utils.py"
        # 嵌套文档不需要 icon
```

## 字段详解

### project
- **title**：项目名称（字符串）
- **description**：项目简要概述（字符串）

### documents（数组）
每个文档对象包含：

- **title**（必需）：文档的显示标题
- **description**（必需）：内容简要摘要
- **path**（必需）：相对于 `docs/` 的文件夹路径
  - 必须以 `/` 开头
  - 可以包含子目录：`/api/authentication`
- **sourcePaths**（必需）：源文件路径数组
  - 相对于工作区根目录的路径
  - 不要包含 `workspace:` 前缀
  - 如果没有特定源文件则使用 `[]`
- **icon**（仅顶层文档必需）：Lucide 图标标识符
  - 格式：`lucide:icon-name`
  - 仅用于根级别的文档（不是子文档）
  - 示例：`lucide:home`, `lucide:file-text`, `lucide:settings`
  - 可用图标请参见 https://lucide.dev/icons
- **children**（可选）：具有相同结构的嵌套文档数组
  - 可以嵌套多层
  - 子文档不需要 icons

## 示例

基本的 YAML 结构示例：

### 扁平结构示例
```yaml
project:
  title: "项目名称"
  description: "项目简要描述"

documents:
  - title: "概述"
    description: "项目介绍和核心概念"
    path: "/overview"
    sourcePaths:
      - "README.md"
    icon: "lucide:home"

  - title: "快速开始"
    description: "安装、配置和第一个示例"
    path: "/getting-started"
    sourcePaths:
      - "docs/installation.md"
    icon: "lucide:rocket"

  - title: "API 参考"
    description: "API 使用说明"
    path: "/api"
    sourcePaths:
      - "src/api/"
    icon: "lucide:code"
```

### 嵌套结构示例
```yaml
project:
  title: "项目名称"
  description: "项目简要描述"

documents:
  - title: "概述"
    description: "项目介绍"
    path: "/overview"
    sourcePaths:
      - "README.md"
    icon: "lucide:home"

  - title: "核心功能"
    description: "主要功能模块说明"
    path: "/features"
    sourcePaths:
      - "src/core/"
    icon: "lucide:box"
    children:
      - title: "子功能 A"
        description: "子功能详细说明"
        path: "/features/feature-a"
        sourcePaths:
          - "src/feature-a/"

      - title: "子功能 B"
        description: "子功能详细说明"
        path: "/features/feature-b"
        sourcePaths:
          - "src/feature-b/"
```

**注意**：选择扁平还是嵌套结构应基于 SKILL.md 中的判断标准，而非模仿示例。

## 最佳实践

1. **基于实际内容决策**：根据实际的源文件内容量和独立性选择结构，参考 SKILL.md 中的判断标准
2. **避免内容重复**：如果子文档之间有重复内容，应该合并
3. **逻辑层次**：在父主题下组织相关文档
4. **清晰路径**：使用与文档标题匹配的描述性路径名称
5. **相关源文件**：包含所有为文档内容提供信息的文件
6. **合适的图标**：选择代表文档用途的图标（仅顶层文档需要）
7. **控制深度**：避免嵌套过深（建议最多 2 层）
8. **一致的描述**：保持描述简洁但信息丰富
