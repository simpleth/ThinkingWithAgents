#!/usr/bin/env python3
"""
GitHub Actions 用的 commit message 验证脚本
读取 .mygit/commit-rules.json 作为单一来源
验证所有 commit 是否符合项目规范
"""

import sys
import re
import json
import os
from pathlib import Path

def load_rules():
    project_root = Path(__file__).resolve().parent.parent
    rules_file = project_root / '.mygit' / 'commit-rules.json'
    if not rules_file.exists():
        return None
    with open(rules_file, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_commits():
    commits = os.environ.get("COMMIT_MESSAGES", "")
    return [c.strip() for c in commits.split("||COMMIT||") if c.strip()]

def validate_commit(msg, rules):
    errors = []
    lines = msg.strip().split("\n")
    first_line = lines[0] if lines else ""

    pattern_rule = rules['fields'].get('first_line', {})
    if pattern_rule:
        pattern = pattern_rule['pattern']
        if not re.match(pattern, first_line):
            errors.append(f"Header 格式错误: {first_line}")

    for field_name, field_rule in rules['fields'].items():
        if field_name == 'first_line':
            continue
        field = field_rule.get('field', '')
        if not field:
            continue
        if field not in msg:
            errors.append(f"缺少 '{field}' 字段")
        elif 'values' in field_rule:
            match = re.search(rf'{re.escape(field)}\s*([a-z]+)', msg)
            if not match or match.group(1) not in field_rule['values']:
                errors.append(f"字段值错误：{field} 必须是 {', '.join(field_rule['values'])}")

    return errors

def main():
    rules = load_rules()
    if not rules:
        print("[SKIP] 未找到 .mygit/commit-rules.json")
        sys.exit(0)

    commits = get_commits()
    if not commits:
        print("[SKIP] 无 commit message 可验证")
        sys.exit(0)

    all_errors = []
    for i, commit in enumerate(commits, 1):
        errors = validate_commit(commit, rules)
        if errors:
            all_errors.append(f"\n--- Commit {i} ---\n" + "\n".join(errors))

    if all_errors:
        types = ', '.join(rules.get('types', {}).keys())
        print("[FAIL] Commit message 验证失败：")
        print(f"  规则见 .mygit/commit-rules.json")
        print(f"  类型: {types}")
        print("".join(all_errors))
        sys.exit(1)

    print(f"[OK] 验证通过 ({len(commits)} commits)")
    sys.exit(0)

if __name__ == "__main__":
    main()
