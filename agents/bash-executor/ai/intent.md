# bash-executor 功能意图

## 功能概述

bash-executor 是一个安全的 Git 命令执行器，仅允许执行预定义的 Git 子命令，为 doc-smith 系统提供受控的 Git 操作能力。

## 功能意图

为 doc-smith 提供安全可控的 Git 命令执行能力，实现：

1. **安全执行**：通过白名单机制严格限制可执行的命令，防止任意命令注入
2. **批量操作**：支持按顺序执行多个 Git 命令，遇到失败立即停止
3. **网络容错**：对网络敏感命令（如 submodule update）提供自动重试机制
4. **环境适配**：自动在 workspace 目录下执行命令，适配项目模式和独立模式

## 工作流程

```
doc-smith 调用场景:
1. 初始化 Git 仓库
   └─ bash-executor({ commands: [{ command: "git", args: ["init"] }] })

2. 克隆文档仓库
   └─ bash-executor({ commands: [{ command: "git", args: ["clone", "url", "."] }] })

3. 提交文档变更
   └─ bash-executor({ commands: [
        { command: "git", args: ["add", "."] },
        { command: "git", args: ["commit", "-m", "message"] }
      ] })

4. 同步子模块
   └─ bash-executor({ commands: [
        { command: "git", args: ["submodule", "update", "--init", "--recursive"] }
      ] })
```

## 核心能力

### 1. 命令白名单验证

- 仅支持 `git` 命令
- Git 子命令限制：init、clone、config、status、log、diff、branch、show、add、commit、fetch、pull、submodule
- 不在白名单中的命令直接拒绝执行

### 2. 批量命令执行

- 按顺序依次执行命令列表
- 任一命令失败立即停止后续执行
- 返回已执行命令的完整结果

### 3. 自动重试机制

- 对特定命令配置重试策略
- 当前支持：`git submodule update`（最多重试 3 次，间隔 2 秒）
- 用于处理网络不稳定导致的临时失败

### 4. 工作目录管理

- 所有命令在 WORKSPACE_BASE 目录下执行
- 自动适配项目模式和独立模式的不同路径

## 输入参数

### 必需参数

**commands**（数组）
- 格式：`[{ command: "git", args: ["subcommand", ...args] }]`
- 说明：要执行的命令列表，command 必须为 "git"，args 第一个元素必须是支持的子命令

## 输出规范

### 返回格式

```javascript
{
  success: boolean,      // 是否至少有一个命令成功
  total: number,         // 命令总数
  succeeded: number,     // 成功数量
  failed: number,        // 失败数量
  results: [             // 各命令执行结果
    {
      success: boolean,  // 该命令是否成功
      command: string,   // 完整命令字符串
      output: string,    // 标准输出
      error: string      // 错误信息（成功时为空或包含警告）
    }
  ]
}
```

## 约束条件

### 安全限制

1. **命令限制**：仅支持 git 命令，不支持任何其他 shell 命令
2. **子命令限制**：仅支持白名单中的 Git 子命令
3. **参数传递**：使用数组形式传递参数，避免 shell 注入

### 执行环境

1. **工作目录**：固定在 WORKSPACE_BASE，不可自定义
2. **超时限制**：单个命令最长 10 分钟（适应大仓库克隆）
3. **输出限制**：最大 10MB 输出缓冲

### 职责边界

**必须执行**：
- ✅ 验证命令是否在白名单中
- ✅ 使用 spawn 安全执行命令
- ✅ 返回完整的执行结果
- ✅ 对配置的命令执行重试

**不应执行**：
- ❌ 不执行非 git 命令
- ❌ 不执行白名单外的 git 子命令
- ❌ 不支持 shell 管道或重定向
- ❌ 不支持自定义工作目录

## 预期结果

### 成功标准

1. **安全性**：所有执行的命令都在白名单中
2. **可靠性**：网络命令通过重试机制提高成功率
3. **透明性**：返回每个命令的完整执行结果
4. **快速失败**：批量执行中遇到错误立即停止

## 错误处理

### 常见错误

1. **命令验证失败**：命令不是 git 或子命令不在白名单中
2. **执行失败**：Git 命令本身执行失败（如仓库不存在、网络错误）
3. **超时**：命令执行超过 10 分钟

### 处理策略

1. 验证失败立即返回错误，不执行
2. 执行失败记录 stderr 信息并返回
3. 对配置了重试的命令自动重试
4. 批量执行中遇到失败立即停止后续命令

## 实现方式

### 技术选型

- **Function Agent**：纯 JS 实现，不依赖 LLM
- **进程执行**：使用 Node.js `spawnSync` 同步执行命令
- **参数隔离**：通过数组传递参数，避免 shell 解释

### 文件位置

```
agents/bash-executor/
├── index.mjs          # Function Agent 实现
└── ai/
    └── intent.md      # 本文档
```

### 注册方式

在需要 Git 操作能力的 agent 配置中引用：

```yaml
skills:
  - url: ../../agents/bash-executor/index.mjs
```

---

**注意**：本文档描述功能意图，不包含具体实现细节。
