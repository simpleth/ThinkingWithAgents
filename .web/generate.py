#!/usr/bin/env python3
"""
Web 知识库数据生成器
基于项目根目录 .readme/index.json 生成
"""

import os
import json
import shutil
import hashlib
import re
from pathlib import Path
from datetime import datetime

# 路径配置
RESEARCH_ROOT = Path(__file__).parent.parent
INDEX_FILE = RESEARCH_ROOT / ".readme" / "index.json"
WEB_ROOT = RESEARCH_ROOT / ".web"
PUBLIC_DATA = WEB_ROOT / "public" / "data"
PUBLIC_DOCS = WEB_ROOT / "public" / "docs"


def generate_color_from_name(name):
    """基于分类名称动态生成颜色"""
    hash_val = int(hashlib.md5(name.encode("utf-8")).hexdigest(), 16)
    hue = hash_val % 360
    saturation = 40 + (hash_val % 30)
    lightness = 55 + (hash_val % 20)

    h = hue / 360
    s = saturation / 100
    l = lightness / 100

    if s == 0:
        r = g = b = l
    else:
        def hue2rgb(p, q, t):
            if t < 0:
                t += 1
            if t > 1:
                t -= 1
            if t < 1/6:
                return p + (q - p) * 6 * t
            if t < 1/2:
                return q
            if t < 2/3:
                return p + (q - p) * (2/3 - t) * 6
            return p
        q = l * (1 + s) if l < 0.5 else l + s - l * s
        p = 2 * l - q
        r = hue2rgb(p, q, h + 1/3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1/3)

    r = round(r * 255)
    g = round(g * 255)
    b = round(b * 255)
    return f"#{r:02x}{g:02x}{b:02x}"


def generate_icon_from_name(name):
    """基于分类名称动态生成图标字符"""
    icons = "◈◉◐◧◨◩◪◫⌂☂☃☄★☆☎☏☜☝☞☟☠☡☢☣☤☥☦☧☨☩☪☫☬☭☮☯☰☱☲☳☴☵☶☷☸☹☺☻☼☽☾☿♀♂♠♡♢♣♤♥♦♧♨♩♪♫♬♭♮♯♰♱♲♳♴♵♶♷♸♹♺♻♼♽♾♿⚀⚁⚂⚃⚄⚅⚆⚇⚈⚉⚊⚋⛀⛁⛂⛃⛄⛅⛆⛇⛈⛉⛊⛋⛌⛍⛎⛏⛐⛑⛒⛓⛔⛕⛖⛗⛘⛙⛚⛛⛜⛝⛞⛟⛠⛡⛢⛣⛤⛥⛦⛧⛨⛩⛪⛫⛬⛭⛮⛯⛰⛱⛲⛳⛴⛵⛶⛷⛸⛹⛺⛻⛼⛽⛾⛿"
    hash_val = int(hashlib.md5(name.encode("utf-8")).hexdigest(), 16)
    return icons[hash_val % len(icons)]


def _strip_markdown(text):
    """Remove all markdown formatting, returning clean plain text."""
    text = re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)
    text = re.sub(r'!\[([^\]]*)\]\([^)]*\)', r'\1', text)
    text = re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', text)
    text = re.sub(r'\*\*\*([^*]+)\*\*\*', r'\1', text)
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    text = re.sub(r'__([^_]+)__', r'\1', text)
    text = re.sub(r'\*([^*]+)\*', r'\1', text)
    text = re.sub(r'_([^_]+)_', r'\1', text)
    text = re.sub(r'`([^`]+)`', r'\1', text)
    text = text.replace('`', '').replace('*', '').replace('_', '')
    text = re.sub(r'^>\s*', '', text)
    text = re.sub(r'^#+\s*', '', text)
    text = re.sub(r'^\s*[-*+]\s+', '', text)
    text = re.sub(r'^\s*\d+[.)]\s+', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def _score_line(text, line_idx, total_lines):
    """Score a cleaned line for description suitability (higher = better)."""
    score = 0.0

    pos = line_idx / max(total_lines, 1)
    if pos < 0.10:
        score += 6
    elif pos < 0.25:
        score += 4
    elif pos < 0.45:
        score += 2
    elif pos > 0.85:
        score -= 4
    elif pos > 0.65:
        score -= 2

    length = len(text)
    if length >= 80:
        score += 10
    elif length >= 50:
        score += 8
    elif length >= 25:
        score += 5
    elif length < 10:
        score -= 4

    natural_chars = len(re.findall(r'[\u4e00-\u9fff\u3400-\u4dbf\w]', text))
    ratio = natural_chars / max(length, 1)
    if ratio >= 0.85:
        score += 6
    elif ratio >= 0.70:
        score += 4
    elif ratio < 0.40:
        score -= 3

    code_chars = len(re.findall(r'[{}()\[\];=&|<>]', text))
    score -= code_chars * 0.5

    cjk_chars = len(re.findall(r'[\u4e00-\u9fff\u3400-\u4dbf]', text))
    score += min(cjk_chars / 25, 5)

    return score


def extract_description(md_path):
    """从 Markdown 文件提取纯文本描述"""
    try:
        content = md_path.read_text(encoding="utf-8")
        lines = content.split("\n")

        in_code_block = False
        in_html_comment = False
        candidates = []

        meta_keywords = re.compile(
            r'^\s*(>\s*)?(\*{0,2}(版本|更新|来源|作者|日期|类型|状态|数据来源|摘要)\*{0,2}\s*[:：])'
        )

        for i, line in enumerate(lines):
            stripped = line.strip()
            if not stripped:
                continue

            if '<!--' in stripped:
                in_html_comment = True
                if '-->' in stripped:
                    in_html_comment = False
                continue
            if in_html_comment:
                if '-->' in stripped:
                    in_html_comment = False
                continue

            if stripped.startswith('```'):
                in_code_block = not in_code_block
                continue
            if in_code_block:
                continue

            if re.match(r'^(\*{3,}|-{3,}|_{3,})\s*$', stripped):
                continue

            if meta_keywords.match(stripped):
                continue

            if re.match(r'^#{1,6}\s', stripped):
                continue

            clean = _strip_markdown(stripped)
            if not clean:
                continue

            if re.match(r'^\|?[\s\-:|]+\|?$', clean):
                continue

            if clean.count('|') >= 2:
                cells = [c.strip() for c in clean.split('|') if c.strip()]
                if cells and max(len(c) for c in cells) < 12:
                    continue
                clean = '; '.join(cells)

            if len(clean) < 10:
                continue

            score = _score_line(clean, i, len(lines))
            if score > 0:
                candidates.append((i, clean, score))

        if not candidates:
            return ''

        candidates.sort(key=lambda x: -x[2])
        top = candidates[:3]
        top.sort(key=lambda x: x[0])

        result = ' '.join(c[1] for c in top)
        result = re.sub(r'(.{12,}?)\s+\1', r'\1', result)

        if len(result) > 300:
            result = result[:297] + '...'

        return result
    except Exception:
        return ""

def main():
    print("=" * 50)
    print("生成 Web 知识库数据...")
    print("=" * 50)

    # 清理并重建输出目录
    if PUBLIC_DATA.exists():
        shutil.rmtree(PUBLIC_DATA)
    PUBLIC_DATA.mkdir(parents=True, exist_ok=True)
    if PUBLIC_DOCS.exists():
        shutil.rmtree(PUBLIC_DOCS)
    PUBLIC_DOCS.mkdir(parents=True, exist_ok=True)

    # 读取索引
    if not INDEX_FILE.exists():
        print(f"错误: 索引文件 {INDEX_FILE} 不存在！请先运行 generate_index.py")
        return 1

    with open(INDEX_FILE, "r", encoding="utf-8") as f:
        index = json.load(f)

    # 构建分类数据（动态生成颜色和图标）
    categories = []
    for direction in index.get("research_directions", []):
        name = direction.get("name")
        categories.append({
            "id": name,
            "name": name,
            "icon": generate_icon_from_name(name),
            "color": generate_color_from_name(name),
        })

    # 构建文章数据（路径直接指向根目录，不复制文件）
    articles = []
    doc_id = 1

    for direction in index.get("research_directions", []):
        category = direction.get("name")
        for topic in direction.get("topics", []):
            for report in topic.get("reports", []):
                src_path = RESEARCH_ROOT / report["path"]
                if src_path.exists():
                    clean_path = report["path"].lstrip("./")
                    doc_path = PUBLIC_DOCS / clean_path
                    doc_path.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(src_path, doc_path)
                    title = report["name"]
                    if re.match(r'^report_v\d+\.\d+$', report["name"]):
                        try:
                            content = src_path.read_text(encoding="utf-8")
                            for line in content.split("\n"):
                                m = re.match(r'^#\s+(.+)', line.strip())
                                if m:
                                    title = m.group(1).strip()
                                    break
                        except Exception:
                            pass
                        if title == report["name"]:
                            title = f"{topic['name']} - {category}"

                    articles.append({
                        "id": f"{doc_id:03d}_{category}_{topic['name']}_{src_path.stem}",
                        "category": category,
                        "title": title,
                        "version": report["version"],
                        "date": report["date"],
                        "description": extract_description(src_path),
                        "path": f"docs/{clean_path}",
                        "topic": topic["name"],
                    })
                    doc_id += 1

    # 保存数据
    output_data = {
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "categories": categories,
        "articles": articles
    }

    with open(PUBLIC_DATA / "index.json", "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

    print(f"\n✓ 完成!")
    print(f"  - 分类: {len(categories)} 个 (动态颜色/图标)")
    print(f"  - 文章: {len(articles)} 篇")
    print(f"  - 索引文件: {PUBLIC_DATA / 'index.json'}")
    print(f"  - 文档路径: 直接指向根目录 (单一真实来源，无冗余)")
    return 0


if __name__ == "__main__":
    exit(main())
