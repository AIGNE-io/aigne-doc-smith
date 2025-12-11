# 生成文档结构

## 目标

{{ task }}

## 文档结构现状

文档结构:
{% if structureContent %}
```yaml
{{ structureContent  }}
```
{% else %}
文档结构未生成
{% endif %}

## 输出模式

最终输出必须是遵循此模式的 YAML 结构:

```yaml
project:
  title: string          # 项目名称(最多 40 个字符)
  description: string    # 项目描述(最多 160 个字符)

documents:
  - title: string        # 文档部分标题
    description: string  # 此部分涵盖的内容
    path: "xxx"          # 文档路径，示例： /overview.md 、/getting-started.md
    sourcePaths:         # 文件路径数组(不是目录) - 不带 'workspace:' 前缀的相对路径
      - string           # 例如: "README.md", "src/index.ts" (仅文件,不是 "src/" 或 "docs/")
    children:            # 嵌套的文档部分(递归结构)
      - title: string
        path: "xxx"          # 文档路径，示例： /overview.md 、/getting-started.md
        description: string
        sourcePaths: [string]  # 必须是文件,不是文件夹
        children: [...]
```

## 成功标准

### 设计要求

{% include "design-rules.md" %}

### 质量审查标准

{% include "review-criteria.md" %}

## 用户规则和反馈

{% if rules %}
<user_rules>
{{ rules }}

** 以 {{ locale }} 语言输出内容 **
</user_rules>
{% endif %}

**重要指南:**
- **用户规则**: 用户指定的要求,如"部分数量"、"必须包含 XXX"、"不能包含 XXX" - 这些具有最高优先级
- **用户语言环境**: 以 `{{ locale }}` 语言返回所有内容
- **如果存在以前的结构但没有给出反馈**: 直接返回以前的文档结构

## YAML 格式验证

**关键: 在保存 YAML 文件之前,严格验证格式:**

✅ **正确格式示例:**
```yaml
project:
  title: "我的项目"
  description: "项目的简要描述"

documents:
  - title: "概览"
    description: "项目介绍"
    path: /overview.md
    sourcePaths:
      - README.md
      - docs/intro.md
    children: []
  - title: "API 参考"
    description: "完整的 API 文档"
    path: /api-Reference.md
    sourcePaths:
      - docs/api.md
    children:
      - title: "核心 API"
        path: /core-api.md
        description: "核心功能"
        sourcePaths:
          - docs/api/core.md
        children: []
```

❌ **要避免的常见错误:**
1. 冒号后缺少空格: `title:"测试"` (错误) → `title: "测试"` (正确)
2. 错误的缩进: 每级必须恰好 2 个空格
3. 列表项缺少破折号: `documents: title: "测试"` (错误) → `documents: - title: "测试"` (正确)
4. sourcePaths 中的目录路径: `sourcePaths: - src/` (错误) → `sourcePaths: - src/index.ts` (正确)
5. 包含模块前缀: `/modules/workspace/README.md` (错误) → `README.md` (正确)
