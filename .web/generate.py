#!/usr/bin/env python3
"""
Web 知识库数据生成器
基于项目根目录 .readme/index.json 生成
"""

import os
import json
import shutil
import hashlib
from pathlib import Path
from datetime import datetime

# 路径配置
RESEARCH_ROOT = Path(__file__).parent.parent
INDEX_FILE = RESEARCH_ROOT / ".readme" / "index.json"
WEB_ROOT = RESEARCH_ROOT / ".web"
PUBLIC_DATA = WEB_ROOT / "public" / "data"


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
    icons = "◈◉◐◧◨◩◪◫⌂☂☃☄★☆☎☏☜☝☞☟☠☡☢☣☤☥☦☧☨☩☪☫☬☭☮☯☰☱☲☳☴☵☶☷☸☹☺☻☼☽☾☿♀♂♠♡♢♣♤♥♦♧♨♩♪♫♬♭♮♯♰♱♲♳♴♵♶♷♸♹♺♻♼♽♾♿⚀⚁⚂⚃⚄⚅⚆⚇⚈⚉⚊⚋⚌⚍⚎⚏⚐⚑⚒⚓⚔⚕⚖⚗⚘⚙⚚⚛⚜⚝⚞⚟⚠⚡⚢⚣⚤⚥⚦⚧⚨⚩⚪⚫⚬⚭⚮⚯⚰⚱⚲⚳⚴⚵⚶⚷⚸⚹⚺⚻⚼⚽⚾⚿⛀⛁⛂⛃⛄⛅⛆⛇⛈⛉⛊⛋⛌⛍⛎⛏⛐⛑⛒⛓⛔⛕⛖⛗⛘⛙⛚⛛⛜⛝⛞⛟⛠⛡⛢⛣⛤⛥⛦⛧⛨⛩⛪⛫⛬⛭⛮⛯⛰⛱⛲⛳⛴⛵⛶⛷⛸⛹⛺⛻⛼⛽⛾⛿"
    hash_val = int(hashlib.md5(name.encode("utf-8")).hexdigest(), 16)
    return icons[hash_val % len(icons)]


def extract_description(md_path):
    """从 Markdown 文件提取描述"""
    try:
        content = md_path.read_text(encoding="utf-8")
        lines = content.split("\n")
        desc = []
        in_code = False
        for line in lines:
            if line.strip() == "":
                continue
            if line.startswith("#") or line.startswith("---"):
                continue
            if line.startswith("```"):
                in_code = not in_code
                continue
            if not in_code:
                desc.append(line.strip())
            if len(desc) >= 3:
                break
        return " ".join(desc)
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
                    # 路径直接指向根目录（单一真实来源）
                    # report["path"] 格式为 "./Agent/实践经验总结/xxx.md"，去掉 "./" 前缀
                    clean_path = report["path"].lstrip("./")
                    articles.append({
                        "id": f"{doc_id:03d}_{category}_{topic['name']}_{src_path.stem}",
                        "category": category,
                        "title": report["name"],
                        "version": report["version"],
                        "date": report["date"],
                        "description": extract_description(src_path),
                        "path": f"./{clean_path}",
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
