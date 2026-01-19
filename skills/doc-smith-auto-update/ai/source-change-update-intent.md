# 源代码变更自动更新文档 功能意图

## 功能概述

在对话开始时自动检测源代码的 commit 变化，引导用户确认后自动更新相关文档。

## 功能意图

### 背景

- 文档与代码的同步是一个持续性问题
- 开发者完成功能开发后，往往忘记或不确定哪些文档需要更新
- 手动检查代码变更并映射到文档费时费力

### 目标

- 自动检测源代码是否有新的 commit
- 分析变更内容，识别需要更新的文档
- 向用户展示变更摘要，获得确认后执行更新
- 完成文档更新、图片生成、多语言翻译的完整流程

## 工作流程

### 在整体系统中的位置

```
Workspace 检测（步骤 0）
    ↓
源代码变更检测（步骤 0.1）← 本功能
    ↓
正常文档生成/更新流程
```

### 执行时序

```
1. 版本检测
   读取 config.yaml 中的 lastGitHead
   获取源代码当前 HEAD
   比较是否有新 commit
       ↓ 有变化
2. 变更分析
   git log 获取 commit 列表
   git diff 获取变更文件
   映射变更文件到相关文档
       ↓
3. 用户确认
   展示变更摘要和受影响文档
   用户选择：全部更新 / 跳过 / 选择性更新
       ↓ 用户确认更新
4. 判断更新类型
   新增文档 → 调用 generateDocumentDetails
   更新文档 → 在 SKILL 中直接更新
       ↓
5. 执行文档更新
   参考 update-workflow.md 更新文档章节
   调用 checkStructure / checkContent 验证
       ↓
6. 图片生成
   检查是否有新增的 AFS Image Slot
   如有，调用 generateImages 工具
       ↓
7. 多语言翻译
   检查 translateLanguages 配置
   如有，调用 localize agent 翻译
       ↓
8. 版本信息更新
   更新 lastGitHead 为当前 HEAD
   自动提交所有变更
```

## 核心能力

1. **版本对比**：比较 config.yaml 中记录的版本与当前 HEAD
2. **变更分析**：提取 commit 列表和变更文件
3. **文档映射**：根据 sourcePaths 映射变更文件到文档
4. **增量更新**：区分新增文档和更新文档，采用不同策略
5. **完整流程**：串联图片生成和多语言翻译

## 输入输出

### 输入

**必需输入**：无（自动从 config.yaml 和 git 获取）

**自动获取**：
- `config.yaml` 中的 `lastGitHead` 字段
- 源代码当前 HEAD（通过 git rev-parse HEAD）
- `planning/document-structure.yaml` 中的文档映射

### 输出

- 更新后的文档文件
- 生成的图片（如有 AFS Image Slot）
- 翻译后的多语言版本（如配置）
- 更新后的 `lastGitHead`
- 变更摘要报告

## 约束条件

### 必须遵循的规范

- 版本信息存储在 `config.yaml` 的 `lastGitHead` 字段
- 文档映射基于 `document-structure.yaml` 中的 `sourcePaths` 字段
- 更新文档时参考 `references/update-workflow.md`
- 新增文档时调用 `generateDocumentDetails`

### 职责边界

**必须执行**：
- 检测源代码版本变化
- 分析并展示变更内容
- 获取用户确认后执行更新
- 无论用户选择更新还是跳过，都更新 lastGitHead

**不应执行**：
- 未经用户确认自动更新文档
- 删除文档（应询问用户确认）

**协作方式**：
- 新增文档 → 调用 `generateDocumentDetails` 工具
- 图片生成 → 调用 `generateImages` 工具
- 多语言翻译 → 调用 `localize` 工具
- 验证 → 调用 `checkStructure` 和 `checkContent` 工具

## 预期结果

### 成功标准

1. 准确检测源代码版本变化
2. 正确映射变更文件到相关文档
3. 清晰展示变更摘要，用户能快速理解
4. 更新的文档内容准确反映代码变更
5. lastGitHead 正确更新，避免重复提示

## 错误处理

### 常见错误

| 错误场景 | 处理方式 |
|----------|----------|
| lastGitHead 为空 | 跳过变更检测（首次运行）|
| docs/ 目录不存在 | 跳过变更检测（没有文档可更新）|
| 变更文件无法映射 | 列为"其他变更"，不强制更新 |
| git 命令执行失败 | 提示错误，跳过变更检测 |

### 处理策略

- 边界情况优雅降级，不阻塞正常流程
- 用户选择跳过时，仍更新 lastGitHead 避免重复提示
- 如有疑问的文档更新，标记为需要人工审核

## 实现方式

### 技术选型

- **实现类型**：SKILL.md 指令增强
- **调度方式**：由 LLM 根据 SKILL.md 指令执行
- **不新增**：CLI 命令、agent、配置文件

### 修改文件

| 文件 | 修改内容 |
|------|----------|
| `skills/doc-smith/SKILL.md` | 新增场景 C 和步骤 0.1 |
| `skills/doc-smith/references/source-change-update.md` | 新增参考文档 |

### 版本信息管理

**存储位置**：config.yaml 中的 `lastGitHead` 字段

**更新时机**：
- 首次生成文档完成后
- 用户确认更新文档后
- 用户选择跳过更新后（避免重复提示）

---

**注意**：本文档描述功能意图，不包含具体实现细节。
