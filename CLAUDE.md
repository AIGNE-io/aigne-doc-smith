# 项目自定义要求

## 项目概述

本项目用于维护和管理 Claude Code Agent Skills。

## 核心规则

1. **项目结构**
   - 每个文件夹是一个独立的 Skill
   - 每个 Skill 必须包含 `SKILL.md` 文件作为主文档

2. **语言要求**
   - 所有 Skill 的提示词必须使用中文编写

3. **开发规范**
   - 创建或修改 Skill 时，必须使用 `/skill-creator` 获取最佳实践和开发指导
   - 遵循 skill-creator 中定义的所有规范和要求

## 工作流程

### 创建新 Skill

```bash
# 1. 使用 skill-creator 获取指导
/skill-creator

# 2. 按照 skill-creator 的指导创建 Skill 文件夹和内容
```

### 修改现有 Skill

```bash
# 1. 如需要，使用 skill-creator 获取更新指导
/skill-creator

# 2. 编辑 Skill 文件
```

## 重要提醒

- 具体的 Skill 开发规范、文件结构、内容要求等，请通过 `/skill-creator` 动态获取
- skill-creator 会提供最新的最佳实践和详细指导

## Intent 文档编写规范

### Intent 文档的作用

Intent 文档用于描述功能的意图、约束和预期结果，是任何新功能实施前的设计文档。

**适用场景**：
- 创建新的 Skill
- 开发新的 Agent 工具
- 添加新的功能模块
- 实现新的特性或能力

**文件位置**：
- Skill：`skills/{skill-name}/ai/intent.md`
- Agent：`agents/{agent-name}/ai/intent.md`
- 功能模块：`feature-design/{feature-name}/intent.md`
- 其他：在相关目录下创建 `ai/intent.md` 或 `intent.md`

**重要原则**：
- ✅ **描述意图**，不包含具体实现细节和伪代码
- ✅ **说明约束**，明确功能边界和职责
- ✅ **定义预期**，清晰的成功标准
- ❌ 不包含伪代码或具体实现步骤

### Intent 文档通用结构

```markdown
# {功能名称} 功能意图

## 功能概述
[一句话概述功能是什么]

## 功能意图
[为什么需要这个功能，要解决什么问题，背景是什么]

## 工作流程
[在整体系统中的位置，与其他组件的交互时序，调用关系]

## 核心能力
[功能的主要能力点，列举 3-5 个关键能力]

## 输入输出
### 输入
- 必需输入：[必须提供的信息]
- 可选输入：[可选提供的信息]
- 自动获取：[从配置或上下文自动获取的信息]

### 输出
- 输出内容：[功能产生的结果]
- 输出格式：[结果的格式或结构]

## 约束条件
### 必须遵循的规范
[格式规范、标准、协议等]

### 职责边界
- 必须执行：[这个功能必须做的事]
- 不应执行：[这个功能不应该做的事]
- 协作方式：[与其他组件的协作关系]

## 预期结果
### 成功标准
[如何判断功能成功，具体的标准]

## 错误处理
### 常见错误
[可能遇到的错误场景]

### 处理策略
[如何处理这些错误]

## 实现方式
[实现的技术选型、架构设计、集成方式等说明]

---
**注意**：本文档描述功能意图，不包含具体实现细节。
```

### 编写要点

1. **保持精简**
   - 减少冗长的示例和解释
   - 每个部分点到即止，突出核心要点
   - 避免重复说明相同的内容

2. **不包含代码**
   - ❌ 不要写伪代码或代码示例
   - ❌ 不要写函数签名或类定义
   - ✅ 可以用文字描述逻辑流程
   - ✅ 可以用流程图（文本格式）展示步骤
   - ✅ 可以用目录结构（文本格式）展示文件组织

3. **明确实现类型**
   - 说明功能是 Skill、Agent、JS 脚本还是其他类型
   - 对于 JS 脚本：说明它是纯 JS 实现，不依赖 LLM 能力
   - 对于 Agent：说明它是 LLM 驱动的对话式功能

4. **框架 API 说明**
   - 列出使用的框架 API 名称和用途，但不写代码示例
   - 例如：使用 `options.prompts.select` 实现语言选择（单选列表）
   - 例如：使用 `options.context.invoke()` 调用其他 agent
   - 例如：使用 `options.context.userContext` 存储全局状态

5. **明确输入输出**
   - 区分"必需输入"、"可选输入"和"自动获取"
   - 必需输入：调用时必须提供的参数
   - 可选输入：可以选择性提供的参数
   - 自动获取：从配置文件、上下文、环境变量等自动获取的信息
   - 输出要明确格式和内容范围

6. **清晰的职责边界**
   - 明确功能"必须执行"的操作（核心职责）
   - 明确功能"不应执行"的操作（边界约束）
   - 说明与其他组件的协作方式和依赖关系

7. **节省上下文考虑**
   - 如果功能生成大量内容，考虑返回摘要而非完整内容
   - 在输出格式中明确说明返回内容的范围
   - 避免在流程中传递过大的数据

8. **实现方式指导**
   - 说明技术选型和架构设计思路
   - 对于 Skill：说明 skills-entry 配置结构、需要注册的工具
   - 对于 Agent：说明输入输出 schema、依赖的其他 agent
   - 对于 JS 脚本：说明文件位置、注册方式、依赖的框架 API

### 设计与实施的关系

Intent 文档是设计阶段的产物，实施阶段会基于它创建具体的实现：

| 阶段 | 文档 | 内容 |
|------|------|------|
| **设计** | intent.md | 描述"做什么"和"为什么" |
| **实施** | 实现文件 | 描述"怎么做"的具体流程 |

**不同场景的实施文件**：
- Skill → `SKILL.md`（使用 `/skill-creator` 创建）
- Agent → `index.yaml` 或 `index.mjs`
- 模块 → 源代码文件（`.js`, `.mjs`, `.py` 等）

### 工作流程

1. **创建 intent.md**
   - 在相应目录下创建 `ai/intent.md` 或 `intent.md`
   - 与相关人员讨论确认设计方案
   - 明确功能边界、输入输出、约束条件

2. **基于 intent 实施**
   - Skill：使用 `/skill-creator` 基于 intent.md 创建 SKILL.md
   - Agent：创建 agent 实现和配置文件
   - 模块：编写源代码实现

3. **完善配置**
   - 创建必要的 entry 配置（如 `skills-entry/` 中的 yaml）
   - 注册到父级组件中
   - 添加必要的依赖和工具

### 示例参考

- **Skill Intent**：`skills/doc-smith-docs-detail/ai/intent.md`
- **功能设计**：`feature-design/` 目录下的设计文档

## 代码质量规范

### 安全性

- **路径验证**：处理用户输入的路径时，必须拒绝包含 `..` 的路径遍历序列
- **命令执行**：优先使用 `spawn` 配合参数数组，避免 shell 字符串拼接

### 代码组织

- **单一职责**：每个模块只负责一类功能，避免混合多种职责
- **消除重复**：相同逻辑必须提取到共享模块（如 `utils/`），不要复制粘贴
- **删除死代码**：未使用的函数、变量必须删除，不要保留"以备后用"

### 共享模块位置

| 功能 | 模块 |
|------|------|
| Workspace 检测和初始化 | `utils/workspace.mjs` |
| AFS 模块生成 | `utils/afs-factory.mjs` |
| 路径常量 | `utils/agent-constants.mjs` |
| 配置文件操作 | `utils/config.mjs` |

### 危险操作

- **文件删除**：必须提供 `dryRun` 选项，允许预览将要删除的内容
- **批量操作**：在执行前应验证数据源（如 YAML 文件）的完整性

### 代码检查

- **每次修改后检查 lint**：执行 `pnpm lint:fix` 检查并自动修复问题
- **提交前确保通过**：不要提交带有 lint 错误的代码

## AIGNE 框架开发指南

### Function Agent 基本结构

Function Agent 是纯 JS 实现的 agent，不依赖 LLM 能力，用于执行确定性逻辑。

```javascript
// 基本结构
export default async function agentName(input, options) {
  const { prompts, context } = options;

  // 业务逻辑...

  return { success: true, data: result };
}

// 可选：描述和输入 schema
agentName.description = "Agent 功能描述";
agentName.input_schema = {
  type: "object",
  properties: {
    param1: { type: "string", description: "参数说明" }
  }
};
```

### Prompts API（用户交互）

通过 `options.prompts` 访问交互 API：

| API | 用途 | 示例 |
|-----|------|------|
| `select(config)` | 单选列表 | 语言选择、模式选择 |
| `checkbox(config)` | 多选列表 | 功能开关、多语言选择 |
| `input(config)` | 文本输入 | URL 输入、名称输入 |
| `search(config)` | 搜索选择 | 文件路径搜索 |

**select 配置**：
```javascript
const result = await prompts.select({
  message: "提示信息",
  choices: [
    { name: "显示名称", value: "返回值", description: "描述" }
  ],
  default: "默认值"
});
```

**checkbox 配置**：
```javascript
const results = await prompts.checkbox({
  message: "提示信息",
  choices: [...],
  validate: (input) => input.length > 0 || "至少选择一项"
});
```

**input 配置**：
```javascript
const text = await prompts.input({
  message: "提示信息",
  default: "默认值",
  validate: (input) => input.trim() !== "" || "不能为空"
});
```

**search 配置**：
```javascript
const selected = await prompts.search({
  message: "提示信息",
  source: async (input) => {
    // 根据 input 返回选项数组
    return [{ name: "显示", value: "值", description: "描述" }];
  }
});
```

### Context API（上下文和调用）

通过 `options.context` 访问上下文 API：

| API | 用途 |
|-----|------|
| `context.agents` | 已注册的 agent 字典 |
| `context.invoke(agent, params)` | 调用其他 agent |
| `context.userContext` | 全局用户上下文（可读写） |

**获取 agent**：
```javascript
const agent = context.agents?.["agentName"];
if (!agent) {
  throw new Error("Agent not found");
}
```

**调用 agent**：
```javascript
const result = await context.invoke(agent, { message: "输入内容" });
// 或直接传入参数对象
const result = await context.invoke(agent, { param1: "value1" });
```

**全局上下文**：
```javascript
// 写入
context.userContext.customField = "value";

// 读取（在其他 agent 中）
const value = context.userContext.customField;
```

### aigne.yaml 配置结构

```yaml
#!/usr/bin/env aigne

model: anthropic/claude-sonnet-4-5

# 注册 agents（供 context.agents 访问）
agents:
  - path/to/agent.yaml
  - path/to/function-agent.mjs

# CLI 命令配置
cli:
  agents:
    - name: command-name      # CLI 命令名
      alias: ["alias1"]       # 命令别名
      url: path/to/entry.mjs  # 入口文件
```

### Agent YAML 配置

```yaml
type: "@aigne/agent-library/agent-skill-manager"
name: agentName  # context.agents 中的键名
instructions:
  url: ./prompt.md

input_key: message  # 输入参数键名

skills:
  - path/to/skill.yaml
  - path/to/function.mjs

afs:
  modules:
    - module: local-fs
      options:
        name: moduleName
        localPath: ./path
```

### 常见开发模式

**1. 入口 Agent 模式**

入口 agent（如 init.mjs）负责初始化，然后调用主 agent：

```javascript
export default async function init(input, options) {
  // 1. 初始化逻辑
  // 2. 设置全局上下文
  options.context.userContext.workspace = "/path";

  // 3. 调用主 agent
  const mainAgent = options.context.agents?.["main"];
  if (mainAgent) {
    await options.context.invoke(mainAgent, { message: "初始化完成" });
  }

  return { success: true };
}
```

**2. 条件调用模式**

根据条件决定是否调用其他 agent：

```javascript
export default async function wrapper(input, options) {
  if (input.skipCondition) {
    return input;  // 跳过，直接返回
  }

  const agent = options.context.agents?.["targetAgent"];
  const result = await options.context.invoke(agent, input);
  return { ...input, ...result };
}
```

**3. 任务渲染模式**

控制 agent 在 UI 中的显示方式：

```javascript
// 隐藏任务
agentName.task_render_mode = "hide";

// 折叠任务
agentName.task_render_mode = "collapse";
```

### 参考实现

- **入口 Agent**：`skills-entry/doc-smith/index.mjs`
- **Function Agent**：`agents/content-checker/index.mjs`
- **共享模块**：`utils/workspace.mjs`、`utils/afs-factory.mjs`

## 设计决策原则

### KISS 原则应用

在设计功能时，优先考虑最简方案。复杂度不是功能强大的标志，往往是设计不成熟的表现。

**案例：Workspace 与主项目的关系**

| 方案 | 复杂度 | 问题 |
|------|--------|------|
| ❌ 自动添加 submodule | 高 | 本地路径无法共享、需要手动同步远程 |
| ✅ 添加到 .gitignore | 低 | 简单、无副作用、用户自主选择 |

**决策过程**：
1. 先问"为什么需要这个功能？"而不是"如何实现这个功能？"
2. 识别出 submodule 解决的是"追踪子项目版本"，但 doc-smith 不需要这种强耦合
3. 最简方案：独立 git 仓库 + gitignore，用户需要时自行决定如何关联

### 问对的问题

遇到技术问题时，先审视问题本身是否正确：

| 错误的问题 | 正确的问题 |
|-----------|-----------|
| 如何让 submodule URL 自动同步？ | 为什么需要 submodule？ |
| 如何处理复杂的边界情况？ | 这个功能是否应该存在？ |
| 如何让用户更容易使用？ | 用户真正需要什么？ |

**原则**：如果一个功能需要大量边界处理，可能说明功能本身的抽象层次有问题。

### 默认行为设计

- **默认做最少的事**：不自作主张添加可能有问题的配置
- **复杂操作由用户显式触发**：提供可选命令而非自动执行
- **松耦合优于强耦合**：让组件独立存在，用户自主决定关联方式