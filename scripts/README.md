# DocSmith Skill 安装脚本

这个目录包含用于安装和卸载 doc-smith skill 的脚本。

## 脚本说明

### install.sh
将 doc-smith skill 安装到 Claude 的全局 skills 目录（`~/.claude/skills`），使其可以在任何项目中使用。

**功能：**
- 自动创建 `~/.claude/skills` 目录（如果不存在）
- 复制 doc-smith 文件夹到全局 skills 目录
- 检测并提示是否覆盖已存在的安装
- 验证安装是否成功

### uninstall.sh
从 Claude 的全局 skills 目录移除 doc-smith skill。

**功能：**
- 检查 skill 是否已安装
- 确认后删除 doc-smith skill
- 验证卸载是否成功

## 使用方法

### 安装

在项目根目录执行：

```bash
./scripts/install.sh
```

或者从 scripts 目录执行：

```bash
cd scripts
./install.sh
```

**自动确认安装（跳过提示）：**

```bash
./scripts/install.sh -y
# 或
./scripts/install.sh --yes
```

安装成功后，你可以在任何地方的 Claude Code 中使用：

```
/doc-smith
```

### 卸载

```bash
./scripts/uninstall.sh
```

## 安装位置

- **源文件：** `doc-smith-skill/doc-smith/`
- **安装位置：** `~/.claude/skills/doc-smith/`

## 注意事项

1. 脚本会提示是否覆盖已存在的安装
2. 卸载前会要求确认
3. 所有操作都有彩色输出提示，便于识别状态
4. 脚本执行失败时会返回非零退出码

## 故障排查

**权限问题：**
```bash
chmod +x scripts/install.sh
chmod +x scripts/uninstall.sh
```

**手动安装：**
```bash
mkdir -p ~/.claude/skills
cp -r doc-smith ~/.claude/skills/
```

**手动卸载：**
```bash
rm -rf ~/.claude/skills/doc-smith
```
