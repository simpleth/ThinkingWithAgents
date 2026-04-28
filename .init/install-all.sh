#!/bin/bash
# 初始化模块：安装所有 Git hooks
# 用法：./.init/install-all.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GIT_HOOKS_DIR="$PROJECT_ROOT/.git/hooks"

echo "========================================"
echo "初始化：安装所有 Git hooks"
echo "========================================"
echo ""

install_hook() {
    local src="$1"
    local dest="$2"
    local hook_name="$3"

    if [ ! -f "$src" ]; then
        echo "[SKIP] $hook_name: 源文件不存在 ($src)"
        return 1
    fi

    cp "$src" "$dest"
    chmod +x "$dest"
    echo "[OK] $hook_name 已安装"
}

echo "1. 安装 .mygit/commit-msg hook (提交信息验证)..."
install_hook "$PROJECT_ROOT/.mygit/hooks/commit-msg" "$GIT_HOOKS_DIR/commit-msg" "commit-msg"

echo ""
echo "2. 安装 .mygit/pre-commit hook (中央统一调用)..."
install_hook "$PROJECT_ROOT/.mygit/hooks/pre-commit" "$GIT_HOOKS_DIR/pre-commit" "pre-commit"

echo ""
echo "========================================"
echo "初始化完成！"
echo "========================================"
echo ""
echo "已安装的 hooks:"
echo "  - commit-msg: 验证提交信息格式"
echo "  - pre-commit: 自动更新 README 索引"
echo ""
echo "查看规范：python .mygit/hooks/commit-msg --help"