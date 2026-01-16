# Workspace 初始化流程

**用途**: 本文档定义 DocSmith workspace 的验证和数据源管理流程

---

## 一、执行层目录结构

执行层始终看到统一的目录结构：

```
modules/
  /workspace                    # doc-smith 工作空间
    ├── config.yaml            # 配置文件
    ├── intent/                # 意图文件
    ├── planning/              # 规划文件
    └── docs/                  # 生成的文档
  /sources                     # 数据源目录
```

**目录说明**：
- `/workspace`：DocSmith 的工作空间，存放配置和生成的文档
- `/sources`：数据源目录，存放源代码仓库

---

## 二、Config.yaml Schema

config.yaml 位于 `/workspace/config.yaml`，包含以下字段：

```yaml
# Workspace metadata
workspaceVersion: "1.0"
createdAt: "2025-01-13T10:00:00Z"

# Project information
projectName: "my-project"
projectDesc: "项目描述"
locale: "zh"

# Documentation settings (for publish)
projectLogo: ""
translateLanguages: []

# 数据源配置（数组）
sources:
  # local-path 类型
  - name: "main"
    type: local-path
    path: "../../"              # 相对于 workspace 的路径

  # git-clone 类型
  - name: "aigne-framework"
    type: git-clone
    url: "https://github.com/ArcBlock/aigne-framework.git"
    branch: "main"                    # 分支名（用于恢复）
    commit: "a1b2c3d4e5f6789..."      # 完整的 commit hash
    clonedAt: "2025-01-13T10:00:00Z"  # 克隆/更新时间
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `workspaceVersion` | string | 固定为 "1.0" |
| `createdAt` | string | 创建时间，ISO 8601 格式 |
| `projectName` | string | 项目名称 |
| `projectDesc` | string | 项目描述 |
| `locale` | string | 输出语言代码 |
| `projectLogo` | string | 项目 Logo 路径 |
| `translateLanguages` | array | 翻译目标语言列表 |
| `sources` | array | 数据源配置数组 |

### Sources 配置

**local-path 类型**：
| 字段 | 说明 |
|------|------|
| `name` | 数据源名称 |
| `type` | 固定为 `local-path` |
| `path` | 相对于 workspace 的路径 |

**git-clone 类型**：
| 字段 | 说明 |
|------|------|
| `name` | 数据源名称 |
| `type` | 固定为 `git-clone` |
| `url` | 仓库 URL |
| `branch` | 分支名，用于在新环境中恢复 |
| `commit` | 完整 commit hash，记录精确版本 |
| `clonedAt` | 克隆/更新时间 |

---

## 三、收集必要信息

在对话开始时，如果用户未明确提供，需要询问：

### 3.1 输出语言

**检查条件**：config.yaml 中 `locale` 为空

**处理逻辑**：
- 如果用户在请求中已指定语言（如"生成中文文档"）→ 直接使用，并保存到 config.yaml 中的 locale 字段
- 否则询问用户选择

**询问用户**：
```
请选择文档输出语言:
1. English (en)
2. 简体中文 (zh)
3. 繁體中文 (zh-TW)
4. 日本語 (ja)
5. 한국어 (ko)
6. Español (es)
7. Français (fr)
8. Deutsch (de)
9. Português (pt)
10. Русский (ru)
11. Italiano (it)
12. العربية (ar)
13. 其他 (请输入语言代码)
```

**后续操作**：更新 config.yaml 中的 `locale` 字段

---

## 四、验证 Workspace

### 4.1 配置完整性检查

使用 Read 工具读取 `/workspace/config.yaml`，验证必要字段：

**必须存在的字段**：
- `workspaceVersion`
- `projectName`(为空需要分析项目信息，生成并保存)
- `projectDesc` (为空需要分析项目信息，生成并保存)
- `locale` (为空需要向用户询问并保存)
- `sources`（可为空数组，后续添加）

**如果字段缺失**：
- 提示用户：`config.yaml 缺少必要字段: <字段名>`
- 询问是否重新初始化

### 4.2 数据源有效性检查

对 sources 数组中的每个数据源进行检查：

**local-path 类型**：
- 只要 sources 下不为空，即认为数据源存在
- 不存在则报错

**git-clone 类型**：
- 检查 `/sources/<name>/` 目录是否存在
- 不存在则执行恢复流程（见第五节）
- 可选：验证当前 commit 是否与配置一致，不一致则警告

---

## 五、数据源管理

### 5.1 数据源检查流程

```
读取 config.yaml 中的 sources 配置
  ↓
├─ sources 为空或不存在 → 询问用户提供仓库 URL（5.2）
└─ sources 存在 → 检查 /sources/ 目录
    ├─ 目录存在 → 跳过，继续后续流程
    └─ 目录不存在 → 执行恢复流程（5.3）
```

### 5.2 添加数据源

**触发条件**：sources 配置为空或不存在

**步骤**：
1. 询问用户提供仓库 URL
2. 验证 URL 格式
3. 询问分支名（默认 main）
4. 从 URL 提取项目名
5. 克隆到 `sources/<项目名>/`
6. 获取当前 HEAD 的 commit hash
7. 更新 config.yaml 的 sources 数组

**询问用户**：
```
请提供源代码仓库的 Git URL
示例: https://github.com/user/repo.git
```

**验证 URL 格式**：
- 检查是否包含 `.git` 或符合 git URL 格式
- 如果格式不对，重新询问

**执行命令**：
```bash
git clone -b <branch> <url> sources/<project-name>
cd /sources/<project-name>
git rev-parse HEAD  # 获取 commit hash
```

**更新 config.yaml**：
```yaml
sources:
  - name: "<project-name>"
    type: git-clone
    url: "<url>"
    branch: "<branch>"
    commit: "<commit-hash>"
    clonedAt: "<current-timestamp>"
```

### 5.3 恢复数据源

**触发条件**：sources 配置存在，但 `/sources/<name>/` 目录不存在

**步骤**：
1. 读取 sources 配置中的 url、branch、commit
2. 克隆仓库到 `sources/<name>/`
3. 切换到记录的 commit
4. 提示用户恢复完成

**执行命令**：
```bash
git clone -b <branch> <url> sources/<name>
cd /sources/<name>
git checkout <commit>  # 切换到精确版本
```

**输出提示**：
```
✓ 数据源已恢复: <name>
  分支: <branch>
  版本: <commit>
```

### 5.4 更新数据源

**触发条件**：用户请求更新，或询问用户确认

**询问用户**：
```
是否更新数据源到最新版本? (Y/n)
```

**步骤**：
1. 读取 config.yaml 获取 sources 配置
2. 对每个 git-clone 类型的数据源：
   - 进入 `/sources/<name>/` 目录
   - 执行 git fetch 和 pull
   - 获取新的 commit hash
   - 更新 config.yaml 中的 commit 和 clonedAt（branch 保持不变）

**执行命令**：
```bash
cd sources/<name>
git fetch origin
git pull origin <branch>
git rev-parse HEAD  # 获取新的 commit hash
```

**输出提示**：
```
✓ 数据源已更新: <name>
  分支: <branch>
  新版本: <new-commit>
  旧版本: <old-commit>
```

---

## 六、错误处理

### 错误 1: Git 未安装

**症状**: `git` 命令不存在

**提示**:
```
错误: 未检测到 Git

DocSmith 需要 Git 来管理数据源。
请先安装 Git: https://git-scm.com/downloads
```

### 错误 2: 数据源克隆失败

**症状**: `git clone` 失败

**提示**:
```
错误: 无法克隆数据源

可能原因:
1. URL 不正确或无法访问
2. 没有 git 访问权限
3. 网络连接问题

建议:
1. 检查 URL 是否正确
2. 检查是否有访问权限 (SSH key 或 token)
```

### 错误 3: 数据源恢复失败

**症状**: 恢复时 `git checkout <commit>` 失败

**提示**:
```
错误: 无法恢复到指定版本

可能原因:
1. commit hash 不存在（仓库历史被重写）
2. 网络问题导致未能获取完整历史

建议:
1. 尝试更新数据源到最新版本
2. 检查 config.yaml 中的 commit 是否正确
```

### 错误 4: config.yaml 格式错误

**症状**: YAML 解析失败

**提示**:
```
错误: config.yaml 格式不正确

请检查 YAML 语法，或删除 config.yaml 重新初始化。
```

### 错误 5: 目录权限问题

**症状**: 无法创建目录或文件

**提示**:
```
错误: 没有目录写入权限

请检查当前目录的权限设置，确保有读写权限。
```

---

## 七、关键约束

1. **版本精确记录**：git-clone 类型必须记录 branch 和 commit，确保可恢复
2. **配置优先**：sources 配置存在时不重复询问 URL，仅在目录缺失时恢复

---

## 八、完整流程示意图

```
对话开始
  ↓
读取 config.yaml
  ↓
检查 locale
  ├─ 为空 → 询问语言 → 更新 config.yaml
  └─ 已设置 → 继续
  ↓
检查 sources 配置
  ├─ 为空 → 询问 URL → 克隆仓库 → 更新 config.yaml
  └─ 存在 → 检查 /sources/ 目录
      ├─ 存在 → 继续
      └─ 不存在 → 恢复数据源
  ↓
询问是否更新数据源 (可选)
  ├─ 是 → 执行更新
  └─ 否 → 跳过
  ↓
进入文档生成流程
```
