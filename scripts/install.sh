#!/bin/bash

# DocSmith Skill 安装脚本
# 将 doc-smith skill 复制到 Claude 全局 skills 目录
# 使用 -y 参数可以跳过确认提示

set -e

# 检查是否有 -y 参数
AUTO_YES=false
if [[ "$1" == "-y" ]] || [[ "$1" == "--yes" ]]; then
    AUTO_YES=true
fi

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 获取脚本所在目录的父目录（项目根目录）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SOURCE_DIR="$PROJECT_ROOT/skills/doc-smith"
TARGET_DIR="$HOME/.claude/skills"
TARGET_PATH="$TARGET_DIR/doc-smith"

echo "================================================"
echo "  DocSmith Skill 安装工具"
echo "================================================"
echo ""

# 检查源目录是否存在
if [ ! -d "$SOURCE_DIR" ]; then
    echo -e "${RED}错误：源目录不存在: $SOURCE_DIR${NC}"
    exit 1
fi

echo -e "源目录: ${GREEN}$SOURCE_DIR${NC}"
echo -e "目标目录: ${GREEN}$TARGET_PATH${NC}"
echo ""

# 创建 .claude/skills 目录（如果不存在）
if [ ! -d "$TARGET_DIR" ]; then
    echo -e "${YELLOW}创建目录: $TARGET_DIR${NC}"
    mkdir -p "$TARGET_DIR"
fi

# 检查目标路径是否已存在
if [ -d "$TARGET_PATH" ]; then
    echo -e "${YELLOW}警告：目标路径已存在${NC}"
    if [ "$AUTO_YES" = false ]; then
        read -p "是否覆盖现有的 doc-smith skill? (y/N) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${RED}安装已取消${NC}"
            exit 0
        fi
    else
        echo "使用自动确认模式，将覆盖现有安装"
    fi
    echo -e "${YELLOW}删除现有目录...${NC}"
    rm -rf "$TARGET_PATH"
fi

# 复制文件
echo -e "${GREEN}复制 doc-smith skill...${NC}"
cp -r "$SOURCE_DIR" "$TARGET_PATH"

# 验证安装
if [ -d "$TARGET_PATH" ] && [ -f "$TARGET_PATH/SKILL.md" ]; then
    echo ""
    echo -e "${GREEN}✓ 安装成功！${NC}"
    echo ""
    echo "doc-smith skill 已安装到："
    echo -e "  ${GREEN}$TARGET_PATH${NC}"
    echo ""
    echo "你现在可以在任何地方使用 doc-smith skill 了！"
    echo ""
    echo "使用方法："
    echo "  在 Claude Code 中输入: /doc-smith"
    echo ""
else
    echo -e "${RED}✗ 安装失败${NC}"
    exit 1
fi
