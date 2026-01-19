# 文档自动更新功能 意图文档

## 功能概述

提供一套完整的命令体系，自动化文档更新的全流程：从检测代码变更、更新文档、预览审核、创建 PR 到自动发布。

## 功能意图

### 背景

文档更新涉及多个环节，每个环节都有重复操作：

1. **检测变更**：手动比对 commit、判断哪些文档需要更新
2. **更新文档**：运行 doc-smith、review、反馈修改
3. **分支管理**：手动创建分支、推送、创建 PR
4. **CI 配置**：需要手动配置 GitHub Actions
5. **发布流程**：手动发布到 staging、production

### 目标

- 提供三个核心命令覆盖全流程
- 自动化 CI 配置，无需手动编写 workflow
- 一个人工审核点（文档 PR），其余自动化

---

## 具体约束

### config.yaml 结构

变更检测依赖 config.yaml 中的以下字段：

| 字段 | 说明 |
|------|------|
| `lastGitHead` | 上次同步时项目仓库的 commit hash |
| `projectPath` | 项目仓库的本地路径 |

lastGitHead 更新时机：
- `/docs-sync` 完成文档更新后自动更新
- 记录的是项目仓库的 HEAD，不是文档仓库

### 变更检测规则

**文件变更 → 文档映射**：由 LLM 分析完成

1. 获取 lastGitHead 到当前 HEAD 之间的变更（文件列表 + commit 信息）
2. LLM 分析变更内容，结合现有文档结构，生成**文档更新计划**
3. 计划包含：
   - 新增哪些文档（及原因）
   - 更新哪些文档（及原因）
   - 删除哪些文档（及原因）
4. 用户确认计划
   - 可对计划提出修改意见
   - 确认后开始执行

**LLM 分析的优势**：
- 理解 commit message 的语义，不仅仅是文件路径匹配
- 识别跨文件的功能变更对文档的影响
- 判断变更是否需要新增文档还是更新现有文档

### Staging 部署约束

**部署目标**：
- 用户在 config.yaml 中配置 `stagingUrl`
- 如未配置，首次运行时询问用户提供
- doc-smith 已有部署能力，复用现有部署逻辑

**部署失败处理**：
- 保留本地构建产物
- 提示具体错误信息
- 用户可选择重试或手动部署

### 用户反馈迭代机制

**迭代方式**：通过自然语言对话

**流程**：
1. 用户查看 staging 预览
2. 用户用自然语言描述修改意见（如"这段描述不够清楚"）
3. 系统根据反馈修改文档
4. 重新发布到 staging
5. 循环直到用户满意

**退出条件**：用户决定何时满意，运行 `/docs-pr` 表示确认完成

---

## 命令体系

### 命令 1：`/docs-sync` - 同步文档

**功能**：检测代码变更并更新文档，发布到 staging 供预览

**执行流程**：

```
1. 分支检查
   ├─ 在 main 分支 → 自动创建 docs/sync-<timestamp> 分支
   └─ 在其他分支 → 继续使用当前分支

2. 变更检测
   → 读取 config.yaml 中的 lastGitHead 和 projectPath
   → 在项目仓库执行 git diff 获取变更文件和 commit 信息

3. LLM 分析 & 生成计划
   → 分析变更内容和 commit message
   → 结合现有文档结构
   → 生成文档更新计划（新增/更新/删除）

4. 用户确认计划
   → 展示文档更新计划及原因
   → 用户可提出修改意见
   → 确认后开始执行

5. 执行更新
   → 更新现有文档（直接在 SKILL 中处理）
   → 新增文档（调用 generateDocumentDetails）
   → 生成图片（如有 AFS Image Slot）
   → 翻译（如配置了 translateLanguages）
   → 更新 config.yaml 中的 lastGitHead

6. 发布到 staging
   → 检查 stagingUrl 配置（未配置则询问用户）
   → 构建文档站点
   → 部署到 staging 环境
   → 返回预览链接

7. 进入反馈循环
   → 用户通过自然语言提出修改意见
   → 修改文档并重新发布
   → 用户满意后运行 /docs-pr
```

---

### 命令 2：`/docs-pr` - 创建文档 PR

**功能**：将当前分支的文档变更创建为 PR，供团队 review

**前置条件**：
- 已运行 `/docs-sync` 完成文档更新
- 用户已在 staging 上 review 完成

**执行流程**：

```
1. 状态检查
   → 检查是否有未提交的更改
   → 检查当前分支状态

2. 推送分支
   → 推送到远程仓库

3. 创建 PR
   → 自动生成 PR 标题和描述
   → 包含变更摘要和 staging 预览链接
   → 调用 GitHub CLI 创建 PR

4. 返回结果
   → 返回 PR 链接
   → 提示团队 review
```

---

### 命令 3：`/docs-setup-ci` - 配置 CI 自动化

**功能**：一键配置文档仓库和项目仓库的 GitHub Actions

**执行流程**：

```
1. 收集信息
   → 检测文档仓库和项目仓库的 git remote
   → 询问确认仓库地址

2. 生成 workflow 文件
   → 文档仓库：PR 合并后发布 production + 触发项目仓库
   → 项目仓库：更新 submodule + 自动创建并合并 PR

3. 提示配置 secrets
   → 说明需要配置的 GitHub secrets
   → 提供配置指引链接

4. 提交 workflow 文件
   → 将 workflow 文件提交到对应仓库
```

---

## 完整工作流程

### 首次配置（一次性）

```
/docs-setup-ci
→ 配置 GitHub Actions
→ 配置 Secrets
```

### 日常更新流程

```
用户                         系统
 │                            │
 │  /docs-sync                │
 ├───────────────────────────→│
 │                            │  检测变更
 │                            │  创建分支
 │                            │  更新文档
 │                            │  发布 staging
 │  ← 预览链接 ───────────────│
 │                            │
 │  "这里描述不够清楚"         │
 ├───────────────────────────→│
 │                            │  修改文档
 │                            │  重新发布 staging
 │  ← 更新完成 ───────────────│
 │                            │
 │  /docs-pr                  │
 ├───────────────────────────→│
 │                            │  创建 PR
 │  ← PR 链接 ────────────────│
 │                            │
 │  [团队 review 并合并]       │
 │                            │
 │                            │  GitHub Actions 自动触发
 │                            │  → 发布到 production
 │                            │  → 创建 submodule PR
 │                            │  → 自动合并 submodule PR
 │                            │
 ▼                            ▼
                           完成
```

---

## 职责边界

**`/docs-sync` 负责**：
- 分支管理
- 变更检测与文档映射
- 文档更新（复用现有 doc-smith 能力）
- staging 发布
- 更新 lastGitHead

**`/docs-pr` 负责**：
- 推送分支
- 创建 PR

**`/docs-setup-ci` 负责**：
- 生成 workflow 文件
- 提交到仓库

**GitHub Actions 负责**：
- PR 合并后发布 production
- 同步 submodule
- 自动合并 submodule PR

### 人工审核点

**需要人工审核**：
- 文档 PR（团队 review）

**自动执行**：
- staging 发布
- production 发布
- submodule 同步与合并

---

## 命名规范

### 分支命名

| 仓库 | 格式 |
|------|------|
| 文档仓库 | `docs/sync-<timestamp>` 或 `docs/update-<feature>` |
| 项目仓库 | `chore/update-docs-submodule` |

### PR 命名

| 仓库 | 格式 |
|------|------|
| 文档仓库 | `docs: <描述>` |
| 项目仓库 | `chore: update docs submodule` |

---

## GitHub Actions 配置

### 文档仓库 Workflow

**触发条件**：main 分支 push

**职责**：
- 发布到 production
- 通过 repository_dispatch 触发项目仓库

### 项目仓库 Workflow

**触发条件**：repository_dispatch 事件

**职责**：
- 更新 submodule 引用到最新 commit
- 创建 PR
- 自动合并（配置 auto-merge）

### 权限要求

- GitHub Personal Access Token (PAT)
- 权限范围：repo, workflow
- 建议使用 fine-grained token 限制范围

---

## 错误处理

### 失败场景与恢复

| 场景 | 系统状态 | 恢复动作 |
|------|----------|----------|
| 变更检测失败 | 无变更 | 检查 projectPath 配置是否正确 |
| 无变更可同步 | 无变更 | 提示"源代码无新变更"，无需恢复 |
| 文档更新失败 | 部分文档已更新 | 提示错误，用户可继续或手动修复 |
| staging 发布失败 | 文档已更新，未部署 | 保留构建产物，用户可重试或手动部署 |
| PR 创建失败 | 分支已推送 | 提示用户手动创建 PR 或检查权限 |
| Actions 失败 | docs 已合并 | 通知用户，可手动触发 workflow 重试 |

### 回退机制

- 所有操作可通过 git 命令手动完成
- workflow 文件可手动编辑
- 支持手动触发 GitHub Actions

---

## 预期结果

### 成功标准

| 指标 | 目标 |
|------|------|
| 用户操作 | 2 个命令 + 自然语言反馈 |
| 人工审核点 | 1 个（文档 PR）|

### 用户体验对比

**之前**：
```
手动创建分支
运行 doc-smith
手动推送
手动创建 PR
等待合并
手动配置 CI
手动发布 staging
手动发布 production
手动更新 submodule
手动创建 submodule PR
等待合并
```

**之后**：
```
/docs-sync          # 一键更新 + staging 预览
"这里需要修改..."    # 自然语言反馈
/docs-pr            # 一键创建 PR
[团队合并 PR]        # 唯一人工步骤
[自动发布 + 同步]    # 全自动
```

---

## 实现方式

### `/docs-sync` 命令

- **实现为 Skill (SKILL.md)**
- 需要 LLM 分析 commit 变化与文档的关联
- 需要 LLM 判断哪些文档需要更新
- 需要 LLM 执行文档内容更新
- 复用 doc-smith 的部署能力

### `/docs-pr` 命令

- 实现为 Function Agent
- 确定性流程，无需 LLM 参与
- 使用 git 命令和 GitHub CLI

### `/docs-setup-ci` 命令

- 实现为 Function Agent
- 确定性流程，无需 LLM 参与
- 内置 workflow 模板
- 支持检测仓库信息并生成配置

### 部署能力

- staging/production 部署复用 doc-smith 现有部署逻辑
- 用户配置部署目标（stagingUrl、productionUrl）

---

**注意**：本文档描述功能意图，不包含具体实现代码。
