# Clear Agent 功能意图

## 功能概述

清除 Doc-Smith 工作空间中的授权信息和部署配置。

## 功能意图

在使用 Doc-Smith 进行文档发布后，用户可能需要：
- 切换到不同的发布站点，需要清除已保存的站点授权
- 重新配置发布目标，需要清除已保存的 appUrl
- 排查发布问题时，需要清理授权状态重新认证

本 agent 提供统一的清除入口，支持选择性清除 Authorizations（站点授权）和 Deployment Config（部署配置）。

## 工作流程

```
用户调用 clear agent
       ↓
  检查 targets 参数
       ↓
  ┌────┴────┐
  ↓         ↓
有参数    无参数
  ↓         ↓
直接执行  显示 checkbox 选择界面
  ↓         ↓
  └────┬────┘
       ↓
  遍历选中的目标
       ↓
  调用对应的 clear 子 agent
       ↓
  汇总结果并输出
```

## 核心能力

1. **统一清除入口**：通过单一命令访问所有清除功能
2. **交互式选择**：无参数时显示 checkbox 让用户选择要清除的项目
3. **参数化调用**：支持 targets 参数直接指定清除目标，跳过交互
4. **授权多选**：清除授权时支持选择特定站点或一键清除全部
5. **结果汇总**：执行后汇总所有清除操作的结果

## 输入输出

### 输入

- 可选输入：
  - `targets`: 字符串数组，指定要清除的目标，可选值：
    - `authTokens` - 清除站点授权信息
    - `deploymentConfig` - 清除部署配置（appUrl）

### 输出

- 输出内容：清除操作的执行结果摘要
- 输出格式：包含每个操作状态的结构化消息

## 约束条件

### 必须遵循的规范

- 清除授权使用 `utils/store` 模块管理
- 清除配置使用 `PATHS.CONFIG` 路径，保留配置文件其他内容
- 使用 yaml 库的 parseDocument/delete 方法删除字段，保留注释

### 职责边界

- 必须执行：
  - 验证清除目标的有效性
  - 调用对应的 clear 子 agent 执行清除
  - 汇总并返回执行结果

- 不应执行：
  - 不清除文档结构、生成的文档等其他内容（当前版本不包含）
  - 不自动重新初始化或重新认证

- 协作方式：
  - 入口 agent 负责选择和调度
  - 各 clear 子 agent 负责具体清除逻辑

## 预期结果

### 成功标准

- 用户选择的所有目标都被正确清除
- 清除授权后，store 中对应站点的数据被删除
- 清除部署配置后，config.yaml 中的 appUrl 字段被删除，其他内容保留
- 返回清晰的执行结果摘要

## 错误处理

### 常见错误

- 配置文件不存在（清除 deploymentConfig 时）
- 无授权信息可清除（清除 authTokens 时）
- 无效的 target 值

### 处理策略

- 配置文件不存在：返回提示信息，不视为错误
- 无授权信息：返回提示信息，不视为错误
- 无效 target：跳过并在结果中标记为错误

## 实现方式

### 技术选型

- **类型**：team 类型 agent（YAML 入口 + 多个 function agent）
- **入口文件**：`index.yaml`
- **子 agent**：
  - `choose-contents.mjs` - 选择控制逻辑
  - `clear-auth-tokens.mjs` - 清除授权
  - `clear-deployment-config.mjs` - 清除部署配置

### 文件结构

```
agents/clear/
├── ai/
│   └── intent.md           # 本文件
├── index.yaml              # 入口配置
├── choose-contents.mjs     # 选择和调度逻辑
├── clear-auth-tokens.mjs   # 清除授权实现
└── clear-deployment-config.mjs  # 清除部署配置实现
```

### 依赖模块

- `utils/store/index.mjs` - 授权数据管理（createStore, listMap, deleteItem, clear）
- `utils/agent-constants.mjs` - 路径常量（PATHS.CONFIG）
- `yaml` 库 - 配置文件操作（parseDocument, delete, toString）

### 框架 API

- `options.prompts.checkbox` - 多选交互界面
- `options.context.agents` - 获取注册的子 agent
- `options.context.invoke` - 调用子 agent

---
**注意**：本文档描述功能意图，不包含具体实现细节。
