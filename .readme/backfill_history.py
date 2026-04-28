#!/usr/bin/env python3
"""
一次性脚本：回填历史统计数据
用于初始化 stats_history.json，不是自动化脚本
"""

import subprocess
import json
from pathlib import Path
from datetime import datetime

RESEARCH_ROOT = Path(__file__).parent.parent
STATS_HISTORY_FILE = RESEARCH_ROOT / ".readme" / "stats_history.json"
SKIP_DIRS = {"__pycache__", ".git", ".vscode", "node_modules", ".agent", ".scripts", ".readme", ".docs"}
SKIP_FILES = {"template.md"}

def get_file_char_count(filepath):
    try:
        return len(filepath.read_text(encoding="utf-8"))
    except:
        return 0

def get_all_docs_at_commit(commit_hash):
    """获取某个提交时存在的所有文档"""
    docs = {}
    try:
        result = subprocess.run(
            ["git", "ls-tree", "-r", "--name-only", commit_hash],
            cwd=RESEARCH_ROOT,
            capture_output=True,
            text=True,
            encoding="utf-8"
        )
        for line in result.stdout.split("\n"):
            line = line.strip()
            if line.endswith(".md") and not any(skip in line for skip in SKIP_FILES):
                try:
                    content_result = subprocess.run(
                        ["git", "show", f"{commit_hash}:{line}"],
                        cwd=RESEARCH_ROOT,
                        capture_output=True,
                        text=True,
                        encoding="utf-8"
                    )
                    if content_result.returncode == 0:
                        docs[line] = len(content_result.stdout)
                except:
                    pass
    except:
        pass
    return docs

def get_commit_dates():
    """获取所有提交及其日期"""
    commits = []
    try:
        result = subprocess.run(
            ["git", "log", "--pretty=format:%H %ad", "--date=short"],
            cwd=RESEARCH_ROOT,
            capture_output=True,
            text=True,
            encoding="utf-8"
        )
        for line in result.stdout.split("\n"):
            line = line.strip()
            if not line:
                continue
            parts = line.split()
            if len(parts) >= 2 and len(parts[0]) == 40:
                commits.append({
                    "hash": parts[0],
                    "date": parts[1]
                })
    except:
        pass
    return commits

def main():
    print("正在获取提交历史...")
    commits = get_commit_dates()
    print(f"共找到 {len(commits)} 个提交")

    history = []
    cumulative_docs = 0
    cumulative_chars = 0
    seen_dates = {}

    print("正在分析每个提交的数据...")
    for i, commit in enumerate(commits):
        print(f"  处理 {i+1}/{len(commits)}: {commit['date']} ({commit['hash'][:7]})")

        docs = get_all_docs_at_commit(commit["hash"])
        cumulative_chars = sum(docs.values())

        if commit["date"] in seen_dates:
            continue
        seen_dates[commit["date"]] = True

        cumulative_docs = len(docs)
        history.append({
            "date": commit["date"],
            "doc_count": cumulative_docs,
            "char_count": cumulative_chars
        })

    history.reverse()

    data = {
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "commits": history
    }

    with open(STATS_HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\n完成！已保存 {len(history)} 条历史记录")
    for h in history:
        print(f"  {h['date']}: {h['doc_count']} docs, {h['char_count']} chars")

if __name__ == "__main__":
    main()