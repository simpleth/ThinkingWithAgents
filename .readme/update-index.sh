#!/bin/bash
# README 索引更新脚本
# 由 pre-commit hook 调用

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "Update README index..."
python "$PROJECT_ROOT/.readme/generate_index.py"

if ! git diff --quiet --exit-code -- .readme/index.json .readme/stats_history.json .readme/stats_chart.png README.md 2>/dev/null; then
    echo "Add index files..."
    git add .readme/index.json .readme/stats_history.json .readme/stats_chart.png README.md
fi
