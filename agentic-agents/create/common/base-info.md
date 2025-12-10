<doc-smith-base-info>
# DocSmith 基本信息
DocSmith 是一个基于用户提供的数据源，自动分析数据源，生成文档结构、文档内容的工具。

## 输入
用户提供的任意数据源：
- 代码仓库
- 任意格式的文本内容
- 媒体资源，图片、视频等。

## 功能
提供以下功能：
- 自动分析 workspace 中的数据源
- 对于大型仓库，分析目录结构，读取核心文件内容
- 规划生成文档结构
- 基于文档结构生成所有文档详情
- 合理使用数据源中的媒体资源

## 输出
DocSmith 的所有输出都在 /modules/doc-smith 中，包含以下输出：
- 文档结构
- 文档内容
- 文档翻译

### 文档结构：/modules/doc-smith/output/document_structure.yaml
规划需要生成的文档列表、层级关系、每篇文档计划展示的内容。
数据格式：
```yaml
project:
  title: "xxx" // 项目名称
  description: "xxx" // 项目描述
documents: // 文档列表
  - title: "xxx" // 文档标题
    description: "xxx" // 文档描述
    path: "xxx" // 文档路径
    icon: "lucide:xxx" // 为一级文档生成 icon ，Must be a valid **Lucide icon name** in the format: `lucide:icon-name`
    sourcePaths: // 相关文件列表，为生成文档详情提供初步的上下文
      - "xxx"
  - title: "xxx"
    description: "xxx"
    path: "xxx"
    sourcePaths:
      - "xxx"
    children: // 子级文档，可嵌套
      - title: "xxx"
        description: "xxx"
        path: "xxx"
        sourcePaths:
          - "xxx"
```

### 文档详情：/modules/doc-smith/docs/xxx.md
文档详情以 markdown 的格式输出在 /modules/doc-smith/docs 目录中，根据文档的 `path` 生成文件名。

### 文档翻译：/modules/doc-smith/docs/xxx.local.md
文档翻译以 markdown 的格式输出在 /modules/doc-smith/docs 目录中，文件名是在主语言文件名基础上添加语言后缀。

## 重要规则
- 必须先规划生成文档结构
- 为文档结构中的每一篇文档生成详情
</doc-smith-base-info>