#!/bin/bash
# Web 知识库更新脚本
# 由 pre-commit hook 调用

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB_DIR="$PROJECT_ROOT/.web"

echo "========================================="
echo "🔄 更新 Web 知识库..."
echo "========================================="

# 1. 生成数据
echo "📊 生成索引数据..."
python "$WEB_DIR/generate.py"

# 2. 安装依赖 (如果需要)
if [ ! -d "$WEB_DIR/node_modules" ]; then
    echo "📦 安装 npm 依赖..."
    cd "$WEB_DIR" && npm install
fi

# 3. 构建
echo "🏗️  构建前端..."
cd "$WEB_DIR" && npm run build

echo "✅ Web 知识库更新完成！"
echo "ℹ️  如需部署到 GitHub Pages，请运行: cd .web && npm run deploy"
