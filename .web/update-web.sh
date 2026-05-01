#!/bin/bash
# Web 知识库更新脚本
# 由 pre-commit hook 调用

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "Update web knowledge base..."
python "$PROJECT_ROOT/.web/generate.py"
