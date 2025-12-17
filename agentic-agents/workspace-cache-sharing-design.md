# Workspace 信息共享缓存设计

## 问题背景

在 aigentic-agents 目录下的三个 agent（create、structure、detail）执行过程中，都需要通过 AFS 访问 workspace 目录：

- 使用 `afs_list` 分析目录结构
- 使用 `afs_read` 读取文件内容（如 README.md、package.json 等核心文件）

这导致存在重复读取问题：
1. **Token 浪费**：相同的文件内容被多次读取并注入到不同的 LLM 调用上下文中
2. **时间浪费**：重复的工具调用增加了执行时间
3. **LLM 调用次数增加**：每次工具调用都需要 LLM 决策

在一次完整执行中（从 create agent 启动到结束），workspace 内容不会变化，因此这些信息完全可以共享。

## 设计目标

1. **减少工具调用次数**：避免重复的 `afs_list` 和 `afs_read` 调用
2. **减少 LLM 调用**：通过共享数据，让 LLM 直接使用缓存信息而无需触发工具
3. **控制上下文大小**：不能将所有 workspace 信息都放入 prompt，需要智能选择
4. **保持灵活性**：允许 agent 在需要时仍然可以读取未缓存的文件

## 技术方案

### 1. 利用 userContext 机制

AIGNE Framework 提供 `options.context.userContext` 机制，可以在运行期间共享数据：

```javascript
// 设置共享数据
options.context.userContext.workspaceCache = {
  directoryTree: '...',
  coreFiles: { ... }
};
```

在 prompt 模板中可以引用：

```yaml
{{ $context.userContext.workspaceCache | yaml.stringify }}
```

### 2. 缓存策略（混合方案）

#### 静态预缓存（Static Pre-cache）

**时机**：在 create agent 初始化时收集
**内容**：workspace 根目录的浅层结构（3 层）
**用途**：提供项目整体结构概览，覆盖 80% 的常见场景

**限制机制**：
- **最大深度**：3 层（避免深层嵌套导致内容过大）
- **最大字符数**：10,000 字符（约 10KB）
- **过滤规则**：
  - 排除常见的大目录：`node_modules/`, `.git/`, `dist/`, `build/`, `coverage/`
  - 排除隐藏目录（以 `.` 开头）除了 `.github/`, `.aigne/`

**示例输出**：
```javascript
workspaceCache.static = {
  tree: `
├── README.md
├── package.json
├── src/
│   ├── index.js
│   └── utils/
│       ├── helper.js
│       └── config.js
└── docs/
    ├── README.md
    └── guide.md
`,
  metadata: { depth: 3, size: 850 }
}
```

#### 动态缓存（Dynamic Cache）

**时机**：运行时 agent 调用 `afs_list` 后
**内容**：按需缓存已访问的目录结构
**用途**：补充静态缓存，支持深层目录访问

**实现方式**：

**选项 1：通过工具约束（推荐）**
```markdown
在 planner.md 和 worker.md 中添加工具使用规则：

## 工具使用规则

### afs_list 使用规范
当你需要调用 `afs_list` 工具时：
1. **优先检查缓存**：先查看 `{{ workspaceCache }}` 中是否已有该目录信息
2. **调用后更新缓存**：调用 `afs_list` 后，必须立即调用 `cache_directory` 工具缓存结果
3. **示例**：
   - ✅ 正确：先查缓存 → 未命中 → afs_list → cache_directory
   - ❌ 错误：直接 afs_list，不更新缓存

可用工具：
- `afs_list`: 列出目录内容
- `cache_directory`: 将目录结构缓存到 userContext（调用 afs_list 后必须调用）
```

提供 `cache_directory` 工具：
```javascript
// agentic-agents/utils/cache-directory.mjs
export default async function cacheDirectory(input, options) {
  const { path, items } = input;

  if (!options.context.userContext.workspaceCache) {
    options.context.userContext.workspaceCache = { static: {}, dynamic: {} };
  }

  // 缓存到 dynamic 部分
  options.context.userContext.workspaceCache.dynamic[path] = {
    items,
    cachedAt: new Date().toISOString(),
  };

  return {
    message: `Cached directory: ${path} (${items.length} items)`,
    cached: true
  };
}

cacheDirectory.inputSchema = {
  type: 'object',
  properties: {
    path: { type: 'string', description: 'Directory path that was listed' },
    items: {
      type: 'array',
      description: 'Items returned by afs_list',
      items: { type: 'object' }
    }
  },
  required: ['path', 'items']
};
```

**选项 2：拦截器方式（更可靠但需要框架支持）**
```javascript
// 如果 AIGNE Framework 支持工具拦截器
options.context.afs.list = wrapWithCache(originalList, (path, result) => {
  // 自动缓存
  options.context.userContext.workspaceCache.dynamic[path] = result;
});
```

**选项 3：仅静态缓存（最简单，推荐 MVP）**
- 只使用静态预缓存
- 深度限制设为 3-4 层，覆盖大部分场景
- 如果不够用，AI 自然会调用 afs_list
- 第一版先实现这个，观察效果后再决定是否需要动态缓存

#### 缓存结构

```javascript
userContext.workspaceCache = {
  static: {
    tree: '...',           // 树形视图字符串
    metadata: { ... }
  },
  dynamic: {               // 可选，支持动态缓存时使用
    '/src/deep/nested': {
      items: [...],
      cachedAt: '...'
    }
  }
}
```

### 3. 实现架构

```
create agent (index.yaml)
  │
  ├─> init-workspace-cache.mjs (新增)
  │   ├─ 扫描 workspace 目录结构（带限制）
  │   └─ 设置 userContext.workspaceCache
  │
  └─> orchestrator
      ├─> planner.md (修改)
      │   └─ 通过 {{ $context.userContext.workspaceCache }} 引用缓存
      ├─> worker.md (修改)
      │   └─ 通过 {{ $context.userContext.workspaceCache }} 引用缓存
      └─> worker skills
          ├─> structure agent (通过 userContext 访问缓存)
          └─> detail agent (通过 userContext 访问缓存)
```

### 4. 具体实现步骤

#### Step 1: 创建缓存初始化模块

**文件**: `agentic-agents/utils/init-workspace-cache.mjs`

```javascript
const MAX_DEPTH = 3;
const MAX_CHARS = 10000;
const EXCLUDE_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.next',
  '.nuxt',
  'out',
  '__pycache__',
  'venv',
  '.venv',
]);
const INCLUDE_HIDDEN = new Set(['.github', '.aigne']);

export default async function initWorkspaceCache(input, options) {
  try {
    const directoryTree = await buildDirectoryTree(options);

    // 存储到 userContext
    options.context.userContext.workspaceCache = {
      directoryTree,
      metadata: {
        cachedAt: new Date().toISOString(),
        size: directoryTree.length,
        maxDepth: MAX_DEPTH,
      }
    };

    console.log(`Workspace directory tree cached: ${directoryTree.length} chars, max depth ${MAX_DEPTH}`);

    return { message: 'Workspace cache initialized' };
  } catch (error) {
    console.warn('Failed to initialize workspace cache:', error);
    // 失败时设置空缓存，不阻塞执行
    options.context.userContext.workspaceCache = {
      directoryTree: '',
      metadata: { error: error.message }
    };
    return { message: 'Workspace cache initialization failed, will use on-demand loading' };
  }
}

async function buildDirectoryTree(options) {
  const entries = [];

  // 递归扫描目录
  async function scanDir(path, depth) {
    if (depth > MAX_DEPTH) return;

    try {
      const items = await options.context.afs.list({
        name: 'workspace',
        path: path || '/',
      });

      for (const item of items) {
        const itemPath = path ? `${path}/${item.name}` : `/${item.name}`;

        // 过滤规则
        if (item.isDirectory) {
          // 排除大目录和隐藏目录（除了白名单）
          if (EXCLUDE_DIRS.has(item.name)) continue;
          if (item.name.startsWith('.') && !INCLUDE_HIDDEN.has(item.name)) continue;
        }

        entries.push({
          path: itemPath,
          isDirectory: item.isDirectory,
          depth,
        });

        // 递归扫描子目录
        if (item.isDirectory) {
          await scanDir(itemPath, depth + 1);
        }
      }
    } catch (error) {
      // 忽略无法访问的目录
    }
  }

  await scanDir('/', 0);

  // 构建树形视图
  let treeView = buildTreeView(entries);

  // 如果超过最大字符数，截断并添加说明
  if (treeView.length > MAX_CHARS) {
    treeView = treeView.substring(0, MAX_CHARS) + `\n... (截断，总共约 ${entries.length} 项)`;
  }

  return treeView;
}

function buildTreeView(entries) {
  // 使用类似 load-base-sources.mjs 中的 buildTreeView 逻辑
  // 构建树形结构的字符串表示
  const tree = {};

  for (const entry of entries) {
    const parts = entry.path.split('/').filter(Boolean);
    let current = tree;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
  }

  function renderTree(node, prefix = '', isLast = true) {
    let result = '';
    const keys = Object.keys(node);

    keys.forEach((key, index) => {
      const isLastItem = index === keys.length - 1;
      const entry = entries.find(e => e.path.endsWith(`/${key}`) || e.path === `/${key}`);
      const suffix = entry?.isDirectory ? '/' : '';

      result += `${prefix}${isLastItem ? '└── ' : '├── '}${key}${suffix}\n`;

      if (Object.keys(node[key]).length > 0) {
        result += renderTree(
          node[key],
          `${prefix}${isLastItem ? '    ' : '│   '}`,
          isLastItem
        );
      }
    });

    return result;
  }

  return renderTree(tree);
}
```

#### Step 2: 修改 planner.md 和 worker.md

**文件**: `agentic-agents/common/planner.md`

在适当位置添加缓存信息引用（建议在 "Environment" 部分之后）：

```markdown
## Workspace 目录结构缓存

为减少重复的 `afs_list` 调用，以下是 workspace 的目录结构概览（最多 3 层深度）：

{{ #if workspaceCache.static.tree }}
```
{{ workspaceCache.static.tree }}
```

**注意**：
- 优先参考以上目录结构，避免重复调用 `afs_list`
- 如需更深层次或被过滤的目录信息，仍可使用 `afs_list` 工具
- 缓存时间：{{ workspaceCache.static.metadata.cachedAt }}

{{ #if workspaceCache.dynamic }}
## 动态缓存的目录（已通过 afs_list 访问）

以下目录已被访问并缓存，可直接查看：

```yaml
{{ workspaceCache.dynamic | yaml.stringify }}
```
{{ /if }}

{{ else }}
目录结构缓存不可用，请使用 `afs_list` 工具按需查询。
{{ /if }}
```

**文件**: `agentic-agents/common/worker.md`

同样在 "Environment" 部分之后添加相同的缓存信息引用。

**注意**：根据你的说明，提示词中可直接使用 `workspaceCache` 变量，不需要 `$context.userContext.` 前缀。

#### Step 3: 更新 agent 配置

**文件**: `agentic-agents/create/index.yaml`

在 skills 中添加缓存初始化（在 load-base-sources 之前）：

```yaml
skills:
  - url: ../../agents/init/index.mjs
    default_input:
      skipIfExists: true
  - ../utils/init-workspace-cache.mjs  # 新增：初始化目录树缓存
  - ../utils/load-base-sources.mjs
  - ./set-custom-prompt.mjs
  - type: "@aigne/agent-library/orchestrator"
    # ... 其余配置
```

**文件**: `agentic-agents/structure/index.yaml` 和 `agentic-agents/detail/index.yaml`

同样添加：

```yaml
skills:
  - ../utils/init-workspace-cache.mjs  # 新增
  - ../utils/load-base-sources.mjs
  - ./set-custom-prompt.mjs
  - type: "@aigne/agent-library/orchestrator"
    # ... 其余配置
```

### 5. 预期效果

#### 执行前（无缓存）
```
create agent 启动
  ├─ planner: afs_list /                    [LLM Call]
  ├─ planner: afs_list /src                 [LLM Call]
  ├─ worker: afs_list /docs                 [LLM Call]
  ├─ 调用 structure agent
  │   ├─ planner: afs_list /                [LLM Call] 重复！
  │   ├─ planner: afs_list /src             [LLM Call] 重复！
  │   └─ worker: afs_list /docs             [LLM Call] 重复！
  └─ 调用 detail agent (x5 并发)
      ├─ instance 1: afs_list /src          [LLM Call] 重复！
      ├─ instance 2: afs_list /src          [LLM Call] 重复！
      ├─ instance 3: afs_list /docs         [LLM Call] 重复！
      └─ ...

总计：~20+ 重复的目录扫描调用
```

#### 执行后（有缓存）
```
create agent 启动
  ├─ init-workspace-cache                   [一次性扫描]
  │   └─ 递归 afs_list（深度 3）
  ├─ 缓存存入 userContext
  ├─ planner/worker: 直接查看缓存的目录树
  ├─ 调用 structure agent
  │   └─ planner/worker: 直接查看缓存的目录树
  └─ 调用 detail agent (x5 并发)
      └─ 所有实例共享同一份缓存的目录树

总计：只在初始化时扫描一次
```

**收益**：
- **减少 afs_list 调用**：从 20+ 次降低到 1 次（初始化）
- **减少 LLM 调用次数**：每次 afs_list 都需要 LLM 决策，减少调用即减少 token 消耗
- **提升执行速度**：消除重复的文件系统操作
- **降低 token 成本**：虽然缓存会增加上下文大小，但避免了多次重复的工具调用上下文

**量化估算**（以中型项目为例）：
- 目录树缓存大小：~5KB（控制在 10KB 以内）
- 节省的 afs_list 调用：15-20 次
- 每次调用的平均 token 消耗：~1000 tokens（包括工具定义、调用、返回）
- 总节省：15,000-20,000 tokens

## 进阶优化（可选）

### 1. 动态深度调整

根据项目规模自动调整扫描深度：

```javascript
// 预扫描根目录
const rootItems = await afs.list({ name: 'workspace', path: '/' });

// 小项目（< 20 个文件/目录）：深度 4
// 中型项目（20-100）：深度 3
// 大型项目（> 100）：深度 2
const depth = rootItems.length < 20 ? 4 : rootItems.length < 100 ? 3 : 2;
```

### 2. 重要目录优先

对某些目录允许更深的扫描：

```javascript
const PRIORITY_DIRS = ['src', 'docs', 'examples', 'packages'];

// 对优先目录允许额外 +1 层深度
if (PRIORITY_DIRS.includes(dirName)) {
  await scanDir(itemPath, depth + 1, maxDepth + 1);
}
```

### 3. 缓存文件内容（未来扩展）

如果需要缓存文件内容，可以采用按需缓存+记录策略：

```javascript
// 在 worker 中拦截 afs_read 调用
const originalRead = options.context.afs.read;
options.context.afs.read = async (params) => {
  const { path } = params;

  // 检查缓存
  if (cache.files[path]) {
    cache.stats.hits++;
    return cache.files[path];
  }

  // 未缓存，调用原始方法
  const content = await originalRead(params);
  cache.stats.misses++;

  // 记录访问频率
  cache.stats.accessLog[path] = (cache.stats.accessLog[path] || 0) + 1;

  return content;
};

// 执行结束后分析高频文件，用于优化缓存策略
```

### 4. 缓存统计和监控

记录缓存使用情况：

```javascript
cache.metadata.stats = {
  totalScans: 0,       // 总扫描次数
  cacheHits: 0,        // 缓存命中次数（未来扩展）
  savedCalls: 0,       // 节省的工具调用次数（估算）
};

// 在 completer 中输出统计
console.log(`
✓ Workspace cache stats:
  - Directory tree: ${cache.metadata.size} chars
  - Max depth: ${cache.metadata.maxDepth}
  - Estimated saved calls: ~${cache.metadata.stats.savedCalls}
`);
```

## 实施建议

### 阶段 1：基础实现（MVP）
1. **实现 `init-workspace-cache.mjs`**
   - 目录树扫描（最大深度 3，最大 10K 字符）
   - 基本的过滤规则（排除 node_modules 等）
   - 存储到 userContext

2. **修改 prompt 模板**
   - 在 `planner.md` 中添加缓存引用
   - 在 `worker.md` 中添加缓存引用
   - 添加使用说明（优先查看缓存）

3. **更新 agent 配置**
   - `create/index.yaml` 添加 init-workspace-cache skill
   - `structure/index.yaml` 添加 init-workspace-cache skill
   - `detail/index.yaml` 添加 init-workspace-cache skill

4. **测试验证**
   - 小型项目（< 100 文件）
   - 中型项目（100-1000 文件）
   - 大型项目（> 1000 文件）
   - 验证缓存大小控制是否生效

### 阶段 2：优化迭代（基于实际使用反馈）
1. **调整限制参数**
   - 根据实际情况调整最大深度（2-4 层）
   - 调整最大字符数（5K-20K）
   - 优化过滤规则

2. **添加统计功能**
   - 记录缓存大小和扫描时间
   - 估算节省的工具调用次数

3. **性能优化**
   - 优化树形视图构建算法
   - 并行扫描多个目录

### 阶段 3：高级特性（可选）
1. **动态深度调整**
   - 根据项目规模自动调整扫描深度
   - 重要目录优先策略

2. **文件内容缓存**
   - 按需缓存机制
   - 访问频率统计
   - 智能预加载高频文件

3. **缓存分析和优化**
   - 缓存命中率分析
   - 优化建议输出

## 注意事项

### 1. 大小控制
- **严格限制**：最大深度 3 层，最大字符数 10K
- **超出处理**：超过限制时截断并添加说明
- **目的**：避免上下文过大影响 LLM 性能

### 2. 隐私和安全
- **目录树缓存**：只包含文件/目录名称和结构，不包含文件内容
- **敏感目录**：已排除 `.git/`, `.env` 等
- **如果未来缓存文件内容**：需要额外过滤敏感文件（.env, credentials.json 等）

### 3. 兼容性和容错
- **失败降级**：如果缓存初始化失败，不阻塞执行，agent 仍可使用原有的 afs_list
- **条件渲染**：使用 `{{ #if }}` 确保缓存不存在时有降级提示
- **向后兼容**：不影响现有 agent 的正常工作

### 4. 性能考虑
- **初始化开销**：增加少量初始化时间（一次递归扫描）
- **上下文增加**：每次 LLM 调用增加约 5-10KB 上下文
- **收益权衡**：用较小的上下文增加换取大量工具调用的减少，整体收益为正

### 5. 测试覆盖
针对不同场景测试：
- **项目规模**：小型、中型、大型项目
- **项目类型**：Node.js、Python、Monorepo、多语言混合
- **深层嵌套**：验证深度限制是否生效
- **大量文件**：验证字符数限制是否生效
- **缓存失败**：验证降级机制是否正常

## 参考实现

可参考现有代码：
- [user-review-document-structure.mjs:43](agents/create/user-review-document-structure.mjs#L43) - userContext 使用示例
- [planner.md:14-23](agentic-agents/common/planner.md#L14-L23) - AFS 环境信息渲染
- [load-base-sources.mjs](agentic-agents/utils/load-base-sources.mjs) - 目录扫描和树形视图构建参考

## 常见问题

### Q1: 为什么不在初始化时缓存文件内容？
**A**: 因为很难预判哪些文件是"核心文件"，如果用 AI 判断会增加额外开销。目录树缓存已经能解决大部分重复 `afs_list` 的问题。文件内容缓存可以作为未来扩展，采用按需缓存+访问统计的方式。

### Q2: 缓存会增加多少上下文？
**A**: 控制在 10KB 以内（约 2500 tokens）。相比节省的 15-20 次工具调用（约 15000-20000 tokens），收益明显。

### Q3: 如果项目特别大，缓存会不会失效？
**A**: 通过深度限制（3 层）和字符数限制（10K）确保缓存大小可控。即使是大型项目，3 层深度的结构信息也足以让 agent 了解项目布局，避免盲目探索。

### Q4: userContext 是否在所有子 agent 中共享？
**A**: 是的。create agent 中设置的 userContext 会被 structure 和 detail agents 继承，实现跨 agent 共享。

### Q5: 如何验证缓存是否生效？
**A**:
1. 查看日志输出中的 "Workspace directory tree cached" 消息
2. 观察 agent 执行过程中 `afs_list` 调用次数是否减少
3. 在 planner/worker 的上下文中检查是否包含缓存的目录树

### Q6: 动态缓存的 AI 约束可靠吗？
**A**:
- **不太可靠**：AI 可能忘记或忽略"调用 afs_list 后必须调用 cache_directory"的约束
- **建议**：
  - MVP 先用静态缓存（选项 3），验证效果
  - 如果效果好但深度不够，可以尝试选项 1（工具约束）
  - 最佳方案是选项 2（拦截器），但需要框架支持
- **替代方案**：增加静态缓存深度（3→4 层）可能比动态缓存更实用

### Q7: 混合方案的实施优先级？
**A**:
1. **第一版（MVP）**：仅静态缓存（选项 3）
   - 简单可靠，立即可用
   - 验证基本效果和 token 节省

2. **第二版（迭代）**：根据实际使用情况决定
   - 如果 3 层深度不够：增加到 4 层
   - 如果深层访问频繁：尝试选项 1（工具约束）
   - 如果框架支持拦截：实施选项 2（拦截器）

3. **理想状态**：
   - 静态缓存（3-4 层）+ 拦截器自动缓存
   - 无需 AI 配合，完全透明
