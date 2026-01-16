# PATCH 标记处理指南

## 核心定位

PATCH 是**文档内的确定性文本改动标记**，只执行准确的变更。

**关键特点**：
- 精确指定修改内容
- 执行后必须删除标记
- 优先级高于结构重写

## PATCH 标记格式

### 格式 1：替换内容（Original + Revised）

```markdown
::: PATCH
# Original
旧内容

# Revised
新内容
:::
```

### 格式 2：插入内容

```markdown
::: PATCH
# Insert After: "## 章节标题"

新增的内容
:::
```

支持的插入指令：
- `# Insert After: "锚点"` - 在锚点后插入
- `# Insert Before: "锚点"` - 在锚点前插入

### 格式 3：删除内容

```markdown
::: PATCH
# Delete

要删除的内容
:::
```

## 执行流程

### 1. 扫描 PATCH

使用 Grep 查找所有 PATCH 标记：

```bash
pattern: ":::\s*PATCH"
path: docs/
output_mode: files_with_matches
```

### 2. 执行 PATCH

对每个 PATCH 块：
1. 解析 PATCH 类型（替换/插入/删除）
2. 定位目标位置
3. 执行变更
4. **删除整个 `::: PATCH ... :::` 块**

### 3. 处理错误

| 错误类型 | 处理方式 |
|---------|---------|
| **Original 不存在** | 展示最接近内容，询问用户 |
| **多个匹配** | 列出所有匹配位置，询问用户 |
| **锚点不存在** | 展示文档结构，询问用户 |

## 执行要点

- **优先级**：PATCH 先于结构重写执行
- **批量处理**：一次性扫描所有文档
- **必须删除标记**：执行后删除 `::: PATCH ... :::` 块，避免重复执行

## 与 Changeset 的关系

- PATCH 直接标记在文档正文中，不要求写在 Changeset 文件中
- 执行顺序：`读取 Changeset → 扫描 PATCH → 执行 PATCH → 应用 Changeset 修改`

## 输出摘要

```markdown
✓ PATCH 应用：N 处精确修改
  - overview.md: 修正定位说明
  - quick-start.md: 新增环境要求章节
  - api.md: 删除过时说明
```
