#!/usr/bin/env python3
"""
索引生成器 - 扫描目录结构，生成 INDEX.json 和 README.md

占位符：
  {{last_updated}}     - 最后更新时间
  {{directions_table}} - 研究方向表格
  {{report_links}}     - 报告链接列表

用法：
  python .scripts/generate_index.py
"""

import os
import json
from pathlib import Path
from datetime import datetime
from urllib.parse import quote

RESEARCH_ROOT = Path(__file__).parent.parent
INDEX_FILE = RESEARCH_ROOT / "INDEX.json"
README_FILE = RESEARCH_ROOT / "README.md"
TEMPLATE_FILE = RESEARCH_ROOT / "template.md"

SKIP_DIRS = {"__pycache__", ".git", ".vscode", "node_modules", ".agent", ".scripts"}
SKIP_FILES = {"template.md"}

def get_file_version(filepath):
    """从文件名或内容提取版本号"""
    if filepath.stem.startswith("report_v"):
        return filepath.stem.replace("report_v", "v")
    try:
        content = filepath.read_text(encoding="utf-8")[:500]
        for line in content.split("\n"):
            if "**版本**" in line and "v" in line:
                return line.split("v")[-1].split()[0].rstrip("*")
    except:
        pass
    return "-"

def get_file_date(filepath):
    """从内容或修改时间提取日期"""
    try:
        content = filepath.read_text(encoding="utf-8")[:500]
        for line in content.split("\n"):
            if "**更新**" in line and "20" in line:
                return line.split("20")[-1].strip().rstrip("*")
    except:
        pass
    return datetime.fromtimestamp(os.path.getmtime(filepath)).strftime("%Y-%m")

def scan_research_dirs():
    """扫描目录结构：研究方向/研究主题/报告.md"""
    research_dirs = []
    
    for direction_path in sorted(RESEARCH_ROOT.iterdir()):
        if not direction_path.is_dir() or direction_path.name.startswith(".") or direction_path.name in SKIP_DIRS:
            continue
            
        direction = {
            "name": direction_path.name,
            "path": "./" + direction_path.relative_to(RESEARCH_ROOT).as_posix(),
            "topics": []
        }
        
        for topic_path in sorted(direction_path.iterdir()):
            if not topic_path.is_dir() or topic_path.name.startswith(".") or topic_path.name in SKIP_DIRS:
                continue
                
            topic = {
                "name": topic_path.name,
                "path": "./" + topic_path.relative_to(RESEARCH_ROOT).as_posix(),
                "reports": []
            }
            
            for report_path in sorted(topic_path.glob("*.md")):
                if report_path.name in SKIP_FILES:
                    continue
                topic["reports"].append({
                    "name": report_path.stem,
                    "filename": report_path.name,
                    "path": "./" + report_path.relative_to(RESEARCH_ROOT).as_posix(),
                    "version": get_file_version(report_path),
                    "date": get_file_date(report_path)
                })
            
            direction["topics"].append(topic)
        
        research_dirs.append(direction)
    
    return research_dirs

def generate_index_json(research_dirs):
    """生成 INDEX.json"""
    index_data = {
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "research_directions": research_dirs
    }
    with open(INDEX_FILE, "w", encoding="utf-8") as f:
        json.dump(index_data, f, ensure_ascii=False, indent=2)
    return index_data

def render_directions_table(research_dirs):
    """渲染研究方向表格"""
    content = ""
    for direction in research_dirs:
        content += f"### {direction['name']}\n\n"
        content += "| 研究主题 | 报告数量 | 最新报告 |\n"
        content += "|----------|----------|----------|\n"
        for topic in direction["topics"]:
            report_count = len(topic["reports"])
            latest = topic["reports"][-1]["version"] if topic["reports"] else "-"
            content += f"| [{topic['name']}]({topic['path']}/) | {report_count} | {latest} |\n"
        content += "\n"
    return content

def render_report_links(research_dirs):
    """渲染报告链接"""
    content = ""
    for direction in research_dirs:
        content += f"**{direction['name']}**\n\n"
        for topic in direction["topics"]:
            if topic["reports"]:
                content += f"- **{topic['name']}**:\n"
                for r in topic["reports"]:
                    # URL 编码路径，处理空格和特殊字符
                    encoded_path = quote(r['path'].replace('\\', '/'), safe='/')
                    content += f"  - [{r['name']}]({encoded_path}) `{r['version']}`\n"
        content += "\n"
    return content

def main():
    research_dirs = scan_research_dirs()
    index_data = generate_index_json(research_dirs)
    
    if TEMPLATE_FILE.exists():
        template = TEMPLATE_FILE.read_text(encoding="utf-8")
        template = template.replace("{{last_updated}}", index_data["last_updated"])
        template = template.replace("{{directions_table}}", render_directions_table(research_dirs))
        template = template.replace("{{report_links}}", render_report_links(research_dirs))
        README_FILE.write_text(template, encoding="utf-8")

if __name__ == "__main__":
    main()
