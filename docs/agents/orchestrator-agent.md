# ⭐ Orchestrator Agent 使用说明

Orchestrator Agent 是 AIGNE 的高级能力，通过 **Planner → Worker → Completer** 三段式架构实现复杂任务的自动规划、执行与结果综合。该模式特别适用于多步骤任务、探索式流程、可分解的大目标处理。

本文档基于官方页面内容，并结合实践中验证的原则，为你提供 **全面、通用、可落地的使用说明与自定义配置示例**。

---

# 1. 📘 架构概览

Orchestrator Agent 由以下组件组成：

### **1) Planner（规划器）**

根据 objective（目标）与 executionState（执行状态）确定下一步执行的任务。

### **2) Worker（执行器）**

执行 Planner 分配的任务，可使用技能（skills）与 AFS 操作资源。

### **3) Completer（完成器）**

综合所有任务的结果，生成最终结构化输出。

### **4) Execution State（执行状态）**

记录所有任务的历史、结果以及错误信息。

组件之间通过迭代循环工作，直至完成目标或达到设定的迭代上限。

---

# 2. 🔁 执行流程说明

完整流程包括：

1. **初始化**：渲染 objective 模板，创建空状态
2. **迭代循环**（核心）

   * 状态压缩（可选）
   * Planner 分配任务
   * Worker 执行任务
   * 写入 executionState
3. **完成阶段**：Completer 生成最终响应

---

# 3. 🧩 各组件职责边界（通用原则）

### **Objective（目标）**

* 描述总体目标
* 明确输出要求
* 不进行任务拆解

### **Planner**

* 读取 executionState 及 objective
* 决定单个下一步任务（nextTask）
* 或标记 finished:true
* 不执行任务、不指示工具调用细节

### **Worker**

* 只执行 task，不规划任务
* 可使用 skills / AFS
* 返回 success / result / error

### **Completer**

* 读取 executionState
* 整合所有任务结果
* 输出指定结构结果（由 output_schema 定义）

---

# 4. 📦 自定义项配置示例（全部来自当前帖子资料）

以下示例均为通用示例，不包含任何具体业务，仅演示官方支持的自定义配置能力。

---

## 4.1 🔷 定义 Orchestrator（完整基础示例）

```yaml
type: "@aigne/agent-library/orchestrator"
name: orchestrator

input_schema:
  type: object
  properties:
    message:
      type: string
      description: 用户自定义指令
  required: []

objective:
  url: objective.md

state_management:
  max_iterations: 20
  max_tokens: 100000
  keep_recent: 20

afs:
  modules:
    - module: local-fs
      options:
        name: workspace
        localPath: .
        description: 工作目录
```

`objective.md`：

```markdown
分析项目并生成综合报告。

{% if message %}
## 用户指令
{{ message }}
{% endif %}
```

---

# 5. 🧠 自定义 Planner 配置示例

### YAML 中声明 Planner：

```yaml
planner:
  type: ai
  instructions:
    url: custom-planner.md
```

### `custom-planner.md` 示例（页面内容 + 最佳实践）

```markdown
## 你的角色
你负责根据目标和执行状态规划下一步任务。

## 目标
{{ objective }}

## 当前执行状态
{{ executionState | yaml.stringify }}

## 规划指南
- 一次只规划一个具体任务
- 不要执行任务，只决定做什么
- 避免重复任务
- 检查历史任务
- 在完成全部工作后设置 finished: true

## 输出格式
返回包含以下字段的对象：

- `nextTask`: 下一个任务描述（如果已完成可省略）
- `finished`: 布尔值
- `reasoning`: 可选，用于调试的规划理由
```

---

# 6. 🛠 自定义 Worker 配置示例

### YAML 中声明 Worker：

```yaml
worker:
  type: ai
  instructions:
    url: custom-worker.md
```

### `custom-worker.md`

```markdown
## 你的角色
你负责执行 Planner 分配的具体任务。

## 总体目标（仅供参考）
{{ objective }}

## 当前任务
{{ task }}

## 执行状态
{{ executionState | yaml.stringify }}

## 执行指南
- 专注当前任务，不要修改任务内容
- 可以参考已有任务结果
- 使用可用技能和工具
- 如果无法完成任务，在 error 中说明原因

## 输出格式
- `success`: boolean
- `result`: 成功时的结果
- `error`: 失败时包含 message 字段
```

---

# 7. 🧩 自定义 Completer 配置示例

### YAML 中声明 Completer：

```yaml
completer:
  type: ai
  instructions:
    url: custom-completer.md
  output_schema:
    type: object
    properties:
      summary:
        type: string
      details:
        type: object
      recommendations:
        type: array
        items:
          type: string
    required: [summary]
```

### `custom-completer.md`

```markdown
## 你的角色
根据全部任务结果生成最终输出。

## 用户目标
{{ objective }}

## 执行结果
{{ executionState | yaml.stringify }}

## 指南
- 结合所有任务结果
- 区分成功和失败任务
- 整理为结构化内容，符合 output_schema

## 输出格式
严格遵循 output_schema
```

---

# 8. 🔧 StateManagement 配置示例（文档中提供）

```yaml
state_management:
  max_iterations: 50
  max_tokens: 80000
  keep_recent: 30
```

原理：

1. 先裁剪到 recent N 项
2. 再根据 max_tokens 裁剪

适用于长时间运行、探索式任务。

---

# 9. 📁 AFS 配置示例（来自当前帖子）

```yaml
afs:
  modules:
    - module: local-fs
      options:
        name: workspace
        localPath: .

    - module: local-fs
      options:
        name: output
        localPath: ./output
```

所有组件可通过 AFS：

* 读取文件
* 写入文件
* 共享中间结果

---

# 10. 🧰 Skills（执行器可调用的工具）

```yaml
skills:
  - type: ai
    name: code-analyzer
    instructions: ...
  - type: ai
    name: summarizer
    instructions: ...
```

Planner 将看到 skills 列表，但不会使用它们；Worker 会实际调用它们。

---

# 11. 📐 Input / Output Schema 示例（当前帖子内容）

### Input Schema

```yaml
input_schema:
  type: object
  properties:
    topic:
      type: string
    depth:
      type: string
      enum: [basic, detailed, comprehensive]
  required: [topic]
```

### Output Schema

```yaml
output_schema:
  type: object
  properties:
    summary:
      type: string
    findings:
      type: array
    recommendations:
      type: array
```

Schema 的作用：

* 限制输入合法性
* 限制最终输出格式
* 提示模型如何组织内容

---

# 12. 🧪 错误处理（页面内容）

任务失败时记录：

```yaml
task: "..."
status: "failed"
error:
  message: "失败原因"
```

Planner 会根据这些错误决定：

* 重试
* 选择替代任务
* 标记任务不可恢复

---

# 13. 🧭 最佳实践（总结页内容 + 实践经验）

### ✔ 提示词越短越稳定

Planner 尤其如此。

### ✔ 一次只规划一个任务

### ✔ Planner 与 Worker 职责保持严格边界

### ✔ 长流程需配置状态压缩

### ✔ Planner、Worker、Completer 可使用不同模型

（快速模型执行任务，强模型规划与综合）

### ✔ 尽量通过 AFS 共享上下文，避免重复读取文件

### ✔ 可加入额外验证 Agent 检查输出格式

---