"""
测试 commit-msg hook 和 CI commit-validate 校验逻辑
"""
import sys
import json
from pathlib import Path

import pytest

def load_module(name, path):
    from importlib.machinery import SourceFileLoader
    return SourceFileLoader(name, str(path)).load_module()


commit_msg_path = Path(__file__).parent.parent / '.mygit' / 'hooks' / 'commit-msg'
commit_msg = load_module('commit_msg', commit_msg_path)


@pytest.fixture
def rules():
    return commit_msg.load_rules()


class TestCommitMsgValidation:
    def test_valid_message_passes(self, rules):
        msg = """[feat] 新增测试功能

提交者：agent

## Why（为什么做）

添加自动化测试

## What（做了什么）

- 添加 pytest 测试
"""
        errors = commit_msg.validate_commit_msg(msg, rules)
        assert len(errors) == 0

    def test_missing_type_bracket_fails(self, rules):
        msg = "just a message\n\n提交者：agent\n\n## Why\n\ntest\n\n## What\n\ntest\n"
        errors = commit_msg.validate_commit_msg(msg, rules)
        assert len(errors) > 0

    def test_missing_author_fails(self, rules):
        msg = "[feat] test\n\n## Why\n\ntest\n\n## What\n\ntest\n"
        errors = commit_msg.validate_commit_msg(msg, rules)
        assert any('提交者' in e for e in errors)

    def test_invalid_author_value_fails(self, rules):
        msg = "[feat] test\n\n提交者：robot\n\n## Why\n\ntest\n\n## What\n\ntest\n"
        errors = commit_msg.validate_commit_msg(msg, rules)
        assert any('提交者' in e for e in errors)

    def test_combined_types(self, rules):
        msg = "[feat+docs] test\n\n提交者：agent\n\n## Why\n\ntest\n\n## What\n\ntest\n"
        errors = commit_msg.validate_commit_msg(msg, rules)
        assert len(errors) == 0

    def test_missing_why_fails(self, rules):
        msg = "[feat] test\n\n提交者：agent\n\n## What\n\ntest\n"
        errors = commit_msg.validate_commit_msg(msg, rules)
        assert any('Why' in e for e in errors)

    def test_missing_what_fails(self, rules):
        msg = "[feat] test\n\n提交者：agent\n\n## Why\n\ntest\n"
        errors = commit_msg.validate_commit_msg(msg, rules)
        assert any('What' in e for e in errors)

    def test_human_author_valid(self, rules):
        msg = "[docs] 文档更新\n\n提交者：human\n\n## Why\n\n说明\n\n## What\n\n更新\n"
        errors = commit_msg.validate_commit_msg(msg, rules)
        assert len(errors) == 0

    def test_empty_first_line_fails(self, rules):
        msg = "\n\n提交者：agent\n\n## Why\n\ntest\n\n## What\n\ntest\n"
        errors = commit_msg.validate_commit_msg(msg, rules)
        assert len(errors) > 0
