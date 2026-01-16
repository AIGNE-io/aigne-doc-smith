#!/bin/bash

# DocSmith Skill 卸载脚本
# 从 Claude 全局 skills 目录移除 doc-smith skill

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

TARGET_PATH="$HOME/.claude/skills/doc-smith"

echo "================================================"
echo "  DocSmith Skill 卸载工具"
echo "================================================"
echo ""

# 检查是否已安装
if [ ! -d "$TARGET_PATH" ]; then
    echo -e "${YELLOW}doc-smith skill 未安装${NC}"
    echo "路径不存在: $TARGET_PATH"
    exit 0
fi

echo -e "将要删除: ${RED}$TARGET_PATH${NC}"
echo ""
read -p "确认要卸载 doc-smith skill 吗? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}卸载已取消${NC}"
    exit 0
fi

# 删除目录
echo -e "${YELLOW}正在删除...${NC}"
rm -rf "$TARGET_PATH"

# 验证卸载
if [ ! -d "$TARGET_PATH" ]; then
    echo ""
    echo -e "${GREEN}✓ 卸载成功！${NC}"
    echo ""
    echo "doc-smith skill 已从系统中移除"
    echo ""
else
    echo -e "${RED}✗ 卸载失败${NC}"
    exit 1
fi
