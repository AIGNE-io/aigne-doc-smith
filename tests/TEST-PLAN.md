# Doc-Smith 单元测试计划

本文档规划项目中所有 .mjs 文件的单元测试实施方案。

## 测试框架

- **测试运行器**: Bun Test (内置)
- **代码覆盖**: Bun 内置 coverage 支持
- **代码规范**: Biome

## 目录结构

```
tests/
├── setup/
│   ├── mock-process-exit.mjs   # 拦截 process.exit()
│   └── test-utils.mjs          # 共享测试工具
├── utils/                       # 工具模块测试
├── agents/                      # Agent 模块测试
│   ├── bash-executor/
│   ├── clear/
│   ├── content-checker/
│   ├── generate-images/
│   ├── localize/
│   ├── publish/
│   ├── save-document/
│   ├── structure-checker/
│   └── update-image/
├── skills-entry/                # Skills 入口测试
└── TEST-PLAN.md                 # 本文档
```

## 实施阶段

### 第一阶段：基础工具模块 (优先级: 高)

这些模块被其他模块广泛依赖，应优先测试。

| 文件 | 行数 | 测试文件 | 状态 | 测试要点 |
|------|------|----------|------|----------|
| `utils/constants.mjs` | 32 | `utils/constants.test.mjs` | ✅ DONE | 常量值验证 |
| `utils/agent-constants.mjs` | 97 | `utils/agent-constants.test.mjs` | ✅ DONE | PATHS 常量、工作目录检测 |
| `utils/files.mjs` | 74 | `utils/files.test.mjs` | ✅ DONE | 文件操作工具函数 |
| `utils/config.mjs` | 261 | `utils/config.test.mjs` | ✅ DONE | 配置读取、写入、更新 |
| `utils/workspace.mjs` | 465 | `utils/workspace.test.mjs` | ✅ DONE | workspace 检测、初始化、模式判断 |

### 第二阶段：核心工具模块 (优先级: 高)

文档处理的核心工具。

| 文件 | 行数 | 测试文件 | 状态 | 测试要点 |
|------|------|----------|------|----------|
| `utils/docs.mjs` | 212 | `utils/docs.test.mjs` | ✅ DONE | 文档结构读取、语言处理 |
| `utils/document-paths.mjs` | 172 | `utils/document-paths.test.mjs` | ✅ DONE | 路径收集、格式化 |
| `utils/docs-converter.mjs` | 454 | `utils/docs-converter.test.mjs` | ✅ DONE | 文档转换逻辑 |
| `utils/sources-path-resolver.mjs` | 76 | `utils/sources-path-resolver.test.mjs` | ✅ DONE | sources 路径解析 |
| `utils/image-slots.mjs` | 57 | `utils/image-slots.test.mjs` | ✅ DONE | 图片槽位检测 |
| `utils/image-utils.mjs` | 114 | `utils/image-utils.test.mjs` | ✅ DONE | 图片处理工具 |

### 第三阶段：辅助工具模块 (优先级: 中)

| 文件 | 行数 | 测试文件 | 状态 | 测试要点 |
|------|------|----------|------|----------|
| `utils/auth.mjs` | 272 | `utils/auth.test.mjs` | ✅ DONE | 认证流程、token 管理 |
| `utils/branding.mjs` | 83 | `utils/branding.test.mjs` | ✅ DONE | 品牌信息处理 |
| `utils/deploy.mjs` | 86 | `utils/deploy.test.mjs` | ✅ DONE | 部署工具函数 |
| `utils/git.mjs` | 65 | `utils/git.test.mjs` | ✅ DONE | Git 操作工具 |
| `utils/http.mjs` | 122 | `utils/http.test.mjs` | ✅ DONE | HTTP 请求工具 |
| `utils/project.mjs` | 95 | `utils/project.test.mjs` | ✅ DONE | 项目信息工具 |
| `utils/upload.mjs` | 231 | `utils/upload.test.mjs` | ✅ DONE | 上传功能 |
| `utils/afs-factory.mjs` | 186 | `utils/afs-factory.test.mjs` | ✅ DONE | AFS 模块生成 |
| `utils/store/index.mjs` | ~100 | `utils/store.test.mjs` | ✅ DONE | 数据存储管理 |

### 第四阶段：Agent 模块 - bash-executor (优先级: 高)

安全关键模块，需要重点测试。

| 文件 | 行数 | 测试文件 | 状态 | 测试要点 |
|------|------|----------|------|----------|
| `agents/bash-executor/index.mjs` | 347 | `agents/bash-executor/index.test.mjs` | ✅ DONE | 命令白名单、安全验证、执行逻辑 |

**关键测试场景**:
- 白名单命令验证（仅允许 git 命令）
- 白名单子命令验证（init, clone, config 等）
- 非法命令拒绝测试
- 批量命令执行顺序
- 失败时停止后续执行
- 重试机制测试

### 第五阶段：Agent 模块 - content-checker (优先级: 高)

文档验证的核心模块。

| 文件 | 行数 | 测试文件 | 状态 | 测试要点 |
|------|------|----------|------|----------|
| `agents/content-checker/index.mjs` | 191 | `agents/content-checker/index.test.mjs` | ⬜ TODO | 入口逻辑、选择性检查 |
| `agents/content-checker/validate-content.mjs` | 983 | `agents/content-checker/validate-content.test.mjs` | ⬜ TODO | 内容验证逻辑 |
| `agents/content-checker/clean-invalid-docs.mjs` | 254 | `agents/content-checker/clean-invalid-docs.test.mjs` | ⬜ TODO | 无效文档清理 |

**关键测试场景**:
- Layer 0: 无效文档检测和清理
- Layer 1: 文件结构验证（.meta.yaml 格式、必需字段）
- Layer 2-4: 内容验证（标题层级、内部链接、图片路径）
- 链接格式检查（.md 后缀检测）
- Sources 绝对路径解析
- 错误分类（fatal/fixable/warnings）

### 第六阶段：Agent 模块 - structure-checker (优先级: 高)

| 文件 | 行数 | 测试文件 | 状态 | 测试要点 |
|------|------|----------|------|----------|
| `agents/structure-checker/index.mjs` | 307 | `agents/structure-checker/index.test.mjs` | ⬜ TODO | 结构检查入口 |
| `agents/structure-checker/validate-structure.mjs` | 477 | `agents/structure-checker/validate-structure.test.mjs` | ⬜ TODO | 结构验证逻辑 |

### 第七阶段：Agent 模块 - clear (优先级: 中)

| 文件 | 行数 | 测试文件 | 状态 | 测试要点 |
|------|------|----------|------|----------|
| `agents/clear/choose-contents.mjs` | 140 | `agents/clear/choose-contents.test.mjs` | ⬜ TODO | 选择逻辑 |
| `agents/clear/clear-auth-tokens.mjs` | 84 | `agents/clear/clear-auth-tokens.test.mjs` | ⬜ TODO | 授权清除 |
| `agents/clear/clear-deployment-config.mjs` | 58 | `agents/clear/clear-deployment-config.test.mjs` | ⬜ TODO | 配置清除 |

### 第八阶段：Agent 模块 - generate-images (优先级: 中)

| 文件 | 行数 | 测试文件 | 状态 | 测试要点 |
|------|------|----------|------|----------|
| `agents/generate-images/generate-summary.mjs` | 213 | `agents/generate-images/generate-summary.test.mjs` | ⬜ TODO | 摘要生成 |
| `agents/generate-images/prepare-generation.mjs` | 286 | `agents/generate-images/prepare-generation.test.mjs` | ⬜ TODO | 生成准备 |
| `agents/generate-images/prepare-image-generation.mjs` | 130 | `agents/generate-images/prepare-image-generation.test.mjs` | ⬜ TODO | 图片生成准备 |
| `agents/generate-images/save-image-result.mjs` | 247 | `agents/generate-images/save-image-result.test.mjs` | ⬜ TODO | 结果保存 |
| `agents/generate-images/scan-image-slots.mjs` | 247 | `agents/generate-images/scan-image-slots.test.mjs` | ⬜ TODO | 槽位扫描 |

### 第九阶段：Agent 模块 - localize (优先级: 中)

| 文件 | 行数 | 测试文件 | 状态 | 测试要点 |
|------|------|----------|------|----------|
| `agents/localize/translate-documents/generate-summary.mjs` | 163 | `agents/localize/translate-documents/generate-summary.test.mjs` | ⬜ TODO | 翻译摘要 |
| `agents/localize/translate-documents/load-glossary.mjs` | 52 | `agents/localize/translate-documents/load-glossary.test.mjs` | ⬜ TODO | 词汇表加载 |
| `agents/localize/translate-documents/prepare-translation.mjs` | 249 | `agents/localize/translate-documents/prepare-translation.test.mjs` | ⬜ TODO | 翻译准备 |
| `agents/localize/translate-documents/save-translation.mjs` | 171 | `agents/localize/translate-documents/save-translation.test.mjs` | ⬜ TODO | 翻译保存 |
| `agents/localize/translate-documents/translate-document-to-language.mjs` | 209 | `agents/localize/translate-documents/translate-document-to-language.test.mjs` | ⬜ TODO | 单文档翻译 |
| `agents/localize/translate-images/check-image-translation.mjs` | 225 | `agents/localize/translate-images/check-image-translation.test.mjs` | ⬜ TODO | 图片翻译检查 |
| `agents/localize/translate-images/prepare-image-input.mjs` | 124 | `agents/localize/translate-images/prepare-image-input.test.mjs` | ⬜ TODO | 图片输入准备 |
| `agents/localize/translate-images/save-image-translation.mjs` | 172 | `agents/localize/translate-images/save-image-translation.test.mjs` | ⬜ TODO | 图片翻译保存 |
| `agents/localize/translate-images/scan-doc-images.mjs` | 165 | `agents/localize/translate-images/scan-doc-images.test.mjs` | ⬜ TODO | 文档图片扫描 |
| `agents/localize/translate-images/detect-text/*.mjs` | ~250 | `agents/localize/translate-images/detect-text/*.test.mjs` | ⬜ TODO | 文字检测 |

### 第十阶段：Agent 模块 - publish (优先级: 中)

| 文件 | 行数 | 测试文件 | 状态 | 测试要点 |
|------|------|----------|------|----------|
| `agents/publish/check.mjs` | 107 | `agents/publish/check.test.mjs` | ⬜ TODO | 发布前检查 |
| `agents/publish/publish-docs.mjs` | 376 | `agents/publish/publish-docs.test.mjs` | ⬜ TODO | 文档发布 |
| `agents/publish/translate-meta.mjs` | 176 | `agents/publish/translate-meta.test.mjs` | ⬜ TODO | 元数据翻译 |

### 第十一阶段：其他 Agent 模块 (优先级: 低)

| 文件 | 行数 | 测试文件 | 状态 | 测试要点 |
|------|------|----------|------|----------|
| `agents/save-document/index.mjs` | 260 | `agents/save-document/index.test.mjs` | ⬜ TODO | 文档保存 |
| `agents/update-image/load-existing-image.mjs` | 211 | `agents/update-image/load-existing-image.test.mjs` | ⬜ TODO | 图片加载 |

### 第十二阶段：Skills Entry 模块 (优先级: 中)

| 文件 | 行数 | 测试文件 | 状态 | 测试要点 |
|------|------|----------|------|----------|
| `skills-entry/doc-smith/index.mjs` | 63 | `skills-entry/doc-smith/index.test.mjs` | ⬜ TODO | CLI 入口 |
| `skills-entry/doc-smith/workspace-init.mjs` | 31 | `skills-entry/doc-smith/workspace-init.test.mjs` | ⬜ TODO | workspace 初始化 |
| `skills-entry/doc-smith-docs-detail/index.mjs` | 95 | `skills-entry/doc-smith-docs-detail/index.test.mjs` | ⬜ TODO | 详情入口 |

## 测试核心原则

### 基于意图设计测试，而非基于实现

> **测试是为了验证功能，不是为了让测试通过**

1. **只看 Intent，不看代码实现**
   - 测试场景必须从 `ai/intent.md` 文档中分析得出
   - 禁止根据代码实现来设计测试用例
   - Intent 文档描述了"应该做什么"，测试验证"是否做到了"

2. **只看方法签名，不看方法体**
   - 阅读模块的导出函数签名和参数定义
   - 不阅读函数内部实现逻辑
   - 如果测试失败，很可能是代码 bug，而非测试问题

3. **不允许修改现有代码实现**
   - 测试失败时，记录为 bug 而非修改代码
   - 测试的目的是发现问题，不是掩盖问题
   - 代码修复应该是独立的、经过审查的变更

### 必需的测试场景覆盖

每个模块的测试必须包含以下场景类型：

#### 1. Happy Path（正常路径）- 必需

验证功能在正常输入和环境下的预期行为。

```javascript
describe('Happy Path', () => {
  test('should succeed with valid input', () => {
    // 标准的成功场景
  });

  test('should handle typical use case correctly', () => {
    // 典型使用场景
  });
});
```

#### 2. Unhappy Path（异常路径）- 必需

验证功能在非正常但可预期的输入下的行为。

```javascript
describe('Unhappy Path', () => {
  test('should handle empty input gracefully', () => {
    // 空输入处理
  });

  test('should return error for invalid parameters', () => {
    // 无效参数处理
  });

  test('should handle missing optional fields', () => {
    // 可选字段缺失
  });
});
```

#### 3. 严重异常场景 - 至少 3 个

验证系统在极端或边界条件下的健壮性。

```javascript
describe('Critical Error Scenarios', () => {
  test('should handle file system failure', () => {
    // 文件系统不可访问
  });

  test('should handle corrupted data gracefully', () => {
    // 数据损坏场景
  });

  test('should recover from partial operation failure', () => {
    // 操作中途失败
  });

  test('should handle resource exhaustion', () => {
    // 资源耗尽（内存、磁盘空间等）
  });

  test('should handle concurrent access conflicts', () => {
    // 并发访问冲突
  });
});
```

#### 4. 安全问题场景 - 至少 3 个

验证系统对潜在安全威胁的防护能力。

```javascript
describe('Security Scenarios', () => {
  test('should reject path traversal attempts', () => {
    // 路径遍历攻击: ../../../etc/passwd
  });

  test('should sanitize user input to prevent injection', () => {
    // 命令注入、代码注入
  });

  test('should not expose sensitive information in errors', () => {
    // 错误信息泄露
  });

  test('should validate and sanitize file paths', () => {
    // 恶意文件路径
  });

  test('should handle malformed YAML/JSON without code execution', () => {
    // 恶意格式文件
  });

  test('should enforce permission boundaries', () => {
    // 权限边界验证
  });
});
```

### 测试设计流程

```
1. 阅读 ai/intent.md
   ↓
2. 提取功能意图和约束条件
   ↓
3. 列出所有测试场景（不看代码）
   ↓
4. 查看模块导出的函数签名
   ↓
5. 编写测试用例
   ↓
6. 运行测试
   ↓
7. 测试失败 → 记录为潜在 bug（不修改代码）
   测试通过 → 继续下一个场景
```

### 测试场景检查清单

每个测试文件提交前，确认以下内容：

- [ ] 所有测试场景来源于 intent.md，而非代码实现
- [ ] 包含至少 1 个 Happy Path 场景
- [ ] 包含至少 1 个 Unhappy Path 场景
- [ ] 包含至少 3 个严重异常场景
- [ ] 包含至少 3 个安全问题场景
- [ ] 没有为了让测试通过而修改现有代码
- [ ] 失败的测试已记录为 bug issue

---

## 测试编写规范

### 文件命名

- 测试文件: `{模块名}.test.mjs`
- 位置: 与源文件对应的 tests/ 子目录中

### 测试结构

```javascript
import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { createTempDir, createMockOptions } from '../setup/test-utils.mjs';

describe('ModuleName', () => {
  describe('functionName', () => {
    test('should do something when condition', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### 测试隔离

- 使用 `createTempDir()` 创建临时目录
- 测试结束后清理资源
- 不依赖外部状态

### Mock 策略

- 使用 `createMockOptions()` 模拟 Function Agent 的 options
- 使用 `createMockWorkspace()` 创建测试 workspace
- 网络请求使用 mock，避免真实网络调用

## 运行命令

```bash
# 运行所有测试
pnpm test

# 运行特定模块测试
pnpm test tests/utils/config.test.mjs

# 运行测试并生成覆盖率
pnpm test:coverage

# 监听模式
pnpm test:watch
```

## 进度追踪

| 阶段 | 模块数 | 完成数 | 进度 |
|------|--------|--------|------|
| 第一阶段 | 5 | 5 | 100% |
| 第二阶段 | 6 | 6 | 100% |
| 第三阶段 | 9 | 9 | 100% |
| 第四阶段 | 1 | 1 | 100% |
| 第五阶段 | 3 | 0 | 0% |
| 第六阶段 | 2 | 0 | 0% |
| 第七阶段 | 3 | 0 | 0% |
| 第八阶段 | 5 | 0 | 0% |
| 第九阶段 | 10 | 0 | 0% |
| 第十阶段 | 3 | 0 | 0% |
| 第十一阶段 | 2 | 0 | 0% |
| 第十二阶段 | 3 | 0 | 0% |
| **总计** | **52** | **21** | **40%** |

## 自动化执行流程

### 阶段执行循环

测试实施采用自动化循环方式执行，每个阶段遵循以下流程：

```
┌─────────────────────────────────────────────────────────────┐
│                      开始新阶段                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  1. 清除上下文                                               │
│     - 清除之前阶段的工作上下文                                │
│     - 避免上下文堆积导致的混乱                                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  2. 读取计划文件                                             │
│     - 重新读取 tests/TEST-PLAN.md                           │
│     - 确认当前阶段和待处理的模块                              │
│     - 查看进度追踪表确定下一个目标                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  3. 执行当前阶段                                             │
│     - 读取对应模块的 ai/intent.md                            │
│     - 查看模块的函数签名（不看实现）                          │
│     - 按照测试核心原则编写测试用例                            │
│     - 运行测试并记录结果                                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  4. 提交代码修改                                             │
│     - git add 新增的测试文件                                 │
│     - git commit 提交本阶段完成的测试                        │
│     - 提交信息格式: "test: add tests for [模块名]"           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  5. 更新计划文件                                             │
│     - 在实施阶段表格中标记完成状态: ⬜ → ✅                   │
│     - 更新进度追踪表的完成数和进度百分比                      │
│     - 更新"最后更新"日期                                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  6. 检查是否全部完成                                         │
│     - 如果还有未完成的阶段 → 返回步骤 1                       │
│     - 如果全部完成 → 结束                                    │
└─────────────────────────────────────────────────────────────┘
```

### 执行命令

启动自动化测试实施：

```
继续执行测试计划
```

或指定特定阶段：

```
执行测试计划第 N 阶段
```

### 阶段完成标准

一个阶段被视为完成，必须满足：

1. **所有测试文件已创建** - 该阶段所有模块都有对应的 `.test.mjs` 文件
2. **测试场景完整** - 每个测试文件包含:
   - ≥1 Happy Path 场景
   - ≥1 Unhappy Path 场景
   - ≥3 严重异常场景
   - ≥3 安全问题场景
3. **测试可执行** - `pnpm test` 能够运行所有测试（通过或失败都可以）
4. **代码已提交** - 所有测试文件已通过 git commit 提交
5. **计划已更新** - TEST-PLAN.md 中的状态已更新

### 状态标记说明

| 标记 | 含义 |
|------|------|
| ⬜ TODO | 未开始 |
| 🔄 IN_PROGRESS | 进行中 |
| ✅ DONE | 已完成 |
| ⚠️ BLOCKED | 阻塞（需要额外信息或依赖） |

### Git 提交规范

```bash
# 单个模块测试完成
git commit -m "test: add tests for utils/config.mjs"

# 整个阶段完成
git commit -m "test: complete phase 1 - basic utils modules"

# 修复测试问题
git commit -m "test: fix flaky test in workspace.test.mjs"
```

### 上下文清除说明

开始新阶段时，需要清除以下内容：

- 之前阶段读取的源代码内容
- 之前阶段的测试编写细节
- 临时的调试信息

保留以下内容：

- TEST-PLAN.md 的整体结构理解
- 测试核心原则
- setup 目录中的共享工具用法

---

## 当前状态

**下一个待执行阶段**: 第五阶段

**启动命令**: `继续执行测试计划`

---

最后更新: 2026-01-19 (第四阶段完成)
