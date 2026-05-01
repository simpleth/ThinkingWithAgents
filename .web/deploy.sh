#!/bin/bash
# Web 知识库一键部署脚本
# 执行完整流程：生成数据 -> 构建 -> 部署到 GitHub Pages

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB_DIR="$PROJECT_ROOT/.web"

echo "========================================="
echo "🚀 部署 Web 知识库到 GitHub Pages..."
echo "========================================="

# 1. 更新数据和构建
echo "📦 更新数据和构建..."
bash "$WEB_DIR/update-web.sh"

# 2. 部署到 GitHub Pages
echo "🌐 部署到 GitHub Pages..."
cd "$WEB_DIR" && npm run deploy

echo ""
echo "========================================="
echo "✅ 部署完成！"
echo "🌐 访问地址：https://simpleth.github.io/ThinkingWithAgents/"
echo "ℹ️  GitHub Pages 可能需要 1-5 分钟才能完全生效"
echo "========================================="
