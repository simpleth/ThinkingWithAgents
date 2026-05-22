"""
测试 .web/generate.py 核心功能
"""
import sys
import json
import tempfile
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent / '.web'))

from generate import (
    _strip_markdown,
    _score_line,
    extract_description,
    generate_color_from_name,
    generate_icon_from_name,
)


class TestStripMarkdown:
    def test_strips_bold(self):
        assert _strip_markdown('**bold text** here') == 'bold text here'

    def test_strips_links(self):
        assert _strip_markdown('[link text](http://example.com)') == 'link text'

    def test_strips_inline_code(self):
        assert _strip_markdown('use `code` here') == 'use code here'

    def test_strips_html_comments(self):
        assert 'comment' not in _strip_markdown('<!-- a comment -->text')

    def test_strips_headings(self):
        assert _strip_markdown('## Section Title') == 'Section Title'

    def test_strips_blockquotes(self):
        assert _strip_markdown('> quoted text') == 'quoted text'

    def test_strips_italic(self):
        assert _strip_markdown('*italic* text') == 'italic text'

    def test_strips_list_markers(self):
        result = _strip_markdown('- item one')
        assert result == 'item one'

    def test_normalizes_whitespace(self):
        assert _strip_markdown('multiple    spaces  here') == 'multiple spaces here'


class TestScoreLine:
    def test_long_natural_text_scores_high(self):
        score = _score_line('This is a comprehensive description of the research topic', 2, 20)
        assert score > 10

    def test_short_text_scores_low(self):
        score = _score_line('OK', 5, 20)
        assert score < 5

    def test_code_like_text_scores_low(self):
        score = _score_line('{ foo: bar, baz: qux }', 5, 20)
        assert score < 8

    def test_chinese_text_scores_well(self):
        score = _score_line('这是一个关于前端状态管理的综合研究报告', 3, 20)
        assert score > 8

    def test_early_lines_score_higher(self):
        early = _score_line('Some description text here', 2, 100)
        late = _score_line('Some description text here', 90, 100)
        assert early > late


class TestGenerateColor:
    def test_returns_hex_color(self):
        color = generate_color_from_name('Agent')
        assert color.startswith('#')
        assert len(color) == 7

    def test_deterministic(self):
        c1 = generate_color_from_name('Agent')
        c2 = generate_color_from_name('Agent')
        assert c1 == c2

    def test_different_names_produce_different_colors(self):
        c1 = generate_color_from_name('Agent')
        c2 = generate_color_from_name('JDK')
        assert c1 != c2


class TestGenerateIcon:
    def test_returns_single_char(self):
        icon = generate_icon_from_name('Agent')
        assert len(icon) == 1

    def test_deterministic(self):
        i1 = generate_icon_from_name('Agent')
        i2 = generate_icon_from_name('Agent')
        assert i1 == i2


class TestExtractDescription:
    def test_extracts_from_markdown_file(self, tmp_path):
        f = tmp_path / 'test.md'
        f.write_text("""# Report Title

This is the first meaningful paragraph of the report content.

This is the second paragraph with more details about the research.

And a third paragraph wrapping up.
""", encoding='utf-8')
        desc = extract_description(f)
        assert len(desc) > 10
        assert 'meaningful' in desc

    def test_skips_metadata_lines(self, tmp_path):
        f = tmp_path / 'test.md'
        f.write_text("""# Title

> **版本**：v1.0
> **更新**：2026-04

Actual content that should be extracted here with enough length.
Additional information that makes this line longer for scoring purposes.
""", encoding='utf-8')
        desc = extract_description(f)
        assert 'v1.0' not in desc
        assert '版本' not in desc

    def test_handles_empty_file(self, tmp_path):
        f = tmp_path / 'empty.md'
        f.write_text('', encoding='utf-8')
        desc = extract_description(f)
        assert desc == ''

    def test_truncates_long_description(self, tmp_path):
        f = tmp_path / 'long.md'
        f.write_text('# Title\n\n' + 'A' * 500, encoding='utf-8')
        desc = extract_description(f)
        assert len(desc) <= 303
