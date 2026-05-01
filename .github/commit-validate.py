#!/usr/bin/env python3
"""
GitHub Actions 用的 commit message 验证脚本
验证所有 commit 是否符合项目规范
"""

import sys
import re
import subprocess
import os

COMMIT_TYPES = ["feat", "fix", "docs", "refactor", "config"]

def get_commits():
    """获取待验证的 commits"""
    commits = os.environ.get("COMMIT_MESSAGES", "")
    return [c.strip() for c in commits.split("||COMMIT||") if c.strip()]

def validate_commit(msg):
    """验证单条 commit message"""
    errors = []
    lines = msg.strip().split("\n")
    first_line = lines[0] if lines else ""

    # 1. Header 格式
    header_pattern = r"^\[(%s)(\+\w+)?\] .+" % "|".join(COMMIT_TYPES)
    if not re.match(header_pattern, first_line):
        errors.append(f"Header 格式错误: {first_line}")

    # 2. 提交者字段
    if "提交者：" not in msg:
        errors.append("缺少 '提交者：' 字段")

    # 3. ## Why
    if "## Why" not in msg:
        errors.append("缺少 '## Why' 部分")

    # 4. ## What
    if "## What" not in msg:
        errors.append("缺少 '## What' 部分")

    return errors

def main():
    commits = get_commits()

    if not commits:
        print("[SKIP] 无 commit message 可验证")
        sys.exit(0)

    all_errors = []
    for i, commit in enumerate(commits, 1):
        errors = validate_commit(commit)
        if errors:
            all_errors.append(f"\n--- Commit {i} ---\n" + "\n".join(errors))

    if all_errors:
        print("[FAIL] Commit message 验证失败：")
        print("规则：")
        print("  1. Header: [type] 简短描述")
        print("  2. 必须包含 '提交者：' 字段")
        print("  3. 必须包含 '## Why' 部分")
        print("  4. 必须包含 '## What' 部分")
        print("  type 可选: feat, fix, docs, refactor, config")
        print("".join(all_errors))
        sys.exit(1)

    print(f"[OK] 验证通过 ({len(commits)} commits)")
    sys.exit(0)

if __name__ == "__main__":
    main()
