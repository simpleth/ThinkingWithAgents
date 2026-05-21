#!/usr/bin/env python3
"""
索引生成器 - 扫描目录结构，生成 INDEX.json 和 README.md

占位符：
  {{last_updated}}     - 最后更新时间
  {{directions_table}} - 研究方向表格
  {{report_links}}     - 报告链接列表

用法：
  python .readme/generate_index.py
"""

import os
import json
from pathlib import Path
from datetime import datetime
from urllib.parse import quote
import re

# matplotlib 为可选依赖，避免 CI 环境构建失败
HAS_MATPLOTLIB = False
try:
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    from matplotlib.ticker import FuncFormatter
    HAS_MATPLOTLIB = True
except ImportError:
    pass

RESEARCH_ROOT = Path(__file__).parent.parent
INDEX_FILE = RESEARCH_ROOT / ".readme" / "index.json"
README_FILE = RESEARCH_ROOT / "README.md"
TEMPLATE_FILE = RESEARCH_ROOT / ".readme" / "template.md"
STATS_HISTORY_FILE = RESEARCH_ROOT / ".readme" / "stats_history.json"
CHART_FILE = RESEARCH_ROOT / ".readme" / "stats_chart.png"
TAGS_FILE = RESEARCH_ROOT / ".docs" / "tags.json"

SKIP_DIRS = {"__pycache__", ".git", ".vscode", "node_modules", ".agent", ".scripts", ".readme", ".docs"}
SKIP_FILES = {"template.md"}

def get_file_char_count(filepath):
    try:
        return len(filepath.read_text(encoding="utf-8"))
    except:
        return 0

def get_file_version(filepath):
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
    try:
        content = filepath.read_text(encoding="utf-8")[:500]
        for line in content.split("\n"):
            if "**更新**" in line and "20" in line:
                return line.split("20")[-1].strip().rstrip("*")
    except:
        pass
    return datetime.fromtimestamp(os.path.getmtime(filepath)).strftime("%Y-%m")

def parse_frontmatter(filepath):
    """Parse YAML frontmatter from a markdown file (between --- delimiters)."""
    try:
        content = filepath.read_text(encoding="utf-8")
        lines = content.split("\n")
        if not lines or lines[0].strip() != "---":
            return None

        end_idx = None
        for i in range(1, len(lines)):
            if lines[i].strip() == "---":
                end_idx = i
                break

        if end_idx is None:
            return None

        fm = {}
        for line in lines[1:end_idx]:
            stripped = line.strip()
            if not stripped or ":" not in stripped:
                continue
            key, _, value = stripped.partition(":")
            key = key.strip()
            value = value.strip()

            if value.startswith("[") and value.endswith("]"):
                inner = value[1:-1]
                items = [item.strip().strip('"').strip("'") for item in inner.split(",") if item.strip()]
                fm[key] = items
            else:
                if (value.startswith('"') and value.endswith('"')) or \
                   (value.startswith("'") and value.endswith("'")):
                    value = value[1:-1]
                fm[key] = value

        return fm
    except:
        return None

def get_current_stats():
    """获取当前目录下的统计数据"""
    total_docs = 0
    total_chars = 0
    for direction in sorted(RESEARCH_ROOT.iterdir()):
        if not direction.is_dir() or direction.name.startswith(".") or direction.name in SKIP_DIRS:
            continue
        for topic in direction.iterdir():
            if not topic.is_dir():
                continue
            for file in topic.glob("*.md"):
                if file.name in SKIP_FILES:
                    continue
                total_docs += 1
                total_chars += get_file_char_count(file)
    return total_docs, total_chars

def load_history():
    if STATS_HISTORY_FILE.exists():
        with open(STATS_HISTORY_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("commits", [])
    return []

def save_history(commits):
    data = {
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "commits": commits
    }
    with open(STATS_HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def update_history():
    """更新历史统计数据 - 幂等操作"""
    today = datetime.now().strftime("%Y-%m-%d")
    docs, chars = get_current_stats()
    history = load_history()

    if not history:
        history.append({
            "date": today,
            "doc_count": docs,
            "char_count": chars
        })
    else:
        last = history[-1]
        if last["date"] == today:
            last["doc_count"] = docs
            last["char_count"] = chars
        else:
            history.append({
                "date": today,
                "doc_count": docs,
                "char_count": chars
            })

    save_history(history)
    return history

def normalize_tag(tag: str) -> str:
    tag = tag.strip().lower()
    tag = re.sub(r'[\s/]+', '-', tag)
    tag = re.sub(r'[^\w\-]', '', tag, flags=re.UNICODE)
    tag = re.sub(r'-{2,}', '-', tag)
    tag = tag.strip('-')
    return tag

def load_tags_config() -> dict:
    if TAGS_FILE.exists():
        try:
            with open(TAGS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, ValueError):
            return {}
    return {}

def save_tags_config(config: dict):
    TAGS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(TAGS_FILE, "w", encoding="utf-8") as f:
        json.dump(config, f, ensure_ascii=False, indent=2)

def resolve_tag(tag: str, config: dict) -> str:
    normalized = normalize_tag(tag)
    if normalized in config and "synonymOf" in config[normalized]:
        return config[normalized]["synonymOf"]
    return normalized

def update_tags_config(all_reports: list, config: dict) -> dict:
    tag_counts = {}
    for report in all_reports:
        seen = set()
        for tag in report.get("tags", []):
            resolved = resolve_tag(tag, config)
            if resolved and resolved not in seen:
                seen.add(resolved)
                tag_counts[resolved] = tag_counts.get(resolved, 0) + 1

    for tag_name, entry in config.items():
        if tag_name in tag_counts:
            entry["count"] = tag_counts[tag_name]
            entry.pop("deprecated", None)
        else:
            entry["count"] = 0
            entry["deprecated"] = True

    for tag_name, count in tag_counts.items():
        if tag_name not in config:
            config[tag_name] = {"count": count, "description": ""}

    return config

def compute_auto_related(all_reports: list) -> dict:
    related_map = {}
    n = len(all_reports)

    for i in range(n):
        report_a = all_reports[i]
        tags_a = set(report_a.get("tags", []))
        path_a = report_a.get("path", "")
        related_paths = []

        for j in range(n):
            if i == j:
                continue
            report_b = all_reports[j]
            tags_b = set(report_b.get("tags", []))
            path_b = report_b.get("path", "")

            shared = len(tags_a & tags_b)

            if shared >= 2:
                related_paths.append(path_b)
            elif shared == 1:
                parts_a = path_a.split("/")
                parts_b = path_b.split("/")
                if len(parts_a) > 1 and len(parts_b) > 1 and parts_a[1] == parts_b[1]:
                    related_paths.append(path_b)

        if related_paths:
            related_map[path_a] = related_paths

    return related_map

def scan_research_dirs():
    """扫描目录结构：研究方向/研究主题/报告.md"""
    research_dirs = []
    all_reports = []

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

                fm = parse_frontmatter(report_path)

                if fm:
                    name = fm.get("title", report_path.stem)
                    version = fm.get("version", get_file_version(report_path))
                    date = fm.get("date", get_file_date(report_path))
                    report_entry = {
                        "name": name,
                        "filename": report_path.name,
                        "path": "./" + report_path.relative_to(RESEARCH_ROOT).as_posix(),
                        "version": version,
                        "date": date,
                        "tags": [normalize_tag(t) for t in fm.get("tags", [])],
                        "status": fm.get("status", "unknown"),
                    }
                    if "expiry" in fm:
                        report_entry["expiry"] = fm["expiry"]
                else:
                    report_entry = {
                        "name": report_path.stem,
                        "filename": report_path.name,
                        "path": "./" + report_path.relative_to(RESEARCH_ROOT).as_posix(),
                        "version": get_file_version(report_path),
                        "date": get_file_date(report_path)
                    }

                all_reports.append(report_entry)
                topic["reports"].append(report_entry)

            direction["topics"].append(topic)

        research_dirs.append(direction)

    config = load_tags_config()
    config = update_tags_config(all_reports, config)
    save_tags_config(config)

    for report in all_reports:
        if "tags" in report:
            report["tags"] = [resolve_tag(t, config) for t in report["tags"]]

    auto_related = compute_auto_related(all_reports)

    for direction in research_dirs:
        for topic in direction["topics"]:
            for report in topic["reports"]:
                path = report.get("path", "")
                if path in auto_related:
                    report["related"] = auto_related[path]

    return research_dirs

def generate_index_json(research_dirs):
    index_data = {
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "research_directions": research_dirs
    }
    with open(INDEX_FILE, "w", encoding="utf-8") as f:
        json.dump(index_data, f, ensure_ascii=False, indent=2)
    return index_data

def render_directions_table(research_dirs):
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
    content = ""
    for direction in research_dirs:
        content += f"**{direction['name']}**\n\n"
        for topic in direction["topics"]:
            if topic["reports"]:
                content += f"- **{topic['name']}**:\n"
                for r in topic["reports"]:
                    encoded_path = quote(r['path'].replace('\\', '/'), safe='/')
                    content += f"  - [{r['name']}]({encoded_path}) `{r['version']}`\n"
        content += "\n"
    return content

D3_COLORS = {
    "steelblue": "#4682B4",
    "coral": "#FF7F50",
    "bg": "#ffffff",
    "grid": "#e5e5e5",
    "text": "#333333"
}

def format_chars(count, pos):
    """将字符数转换为易读的格式"""
    if count >= 10000:
        return f"{count / 10000:.1f}w"
    elif count >= 1000:
        return f"{count / 1000:.1f}k"
    else:
        return str(count)

def generate_stats_chart_png(stats_history):
    """生成 PNG 统计曲线图 - D3 Style with Dual Y-axis"""
    if not stats_history or not HAS_MATPLOTLIB:
        return ""

    dates = [datetime.strptime(c["date"], "%Y-%m-%d") for c in stats_history]
    docs = [c["doc_count"] for c in stats_history]
    chars = [c["char_count"] for c in stats_history]

    fig, ax1 = plt.subplots(figsize=(10, 5))
    fig.patch.set_facecolor(D3_COLORS["bg"])
    ax1.set_facecolor(D3_COLORS["bg"])

    x_positions = list(range(len(dates)))

    ax1.plot(x_positions, docs, color=D3_COLORS["steelblue"], linewidth=2.5,
            marker="o", markersize=8, label="Documents", zorder=3)

    for i, (x, y) in enumerate(zip(x_positions, docs)):
        ax1.annotate(f"{y}", (x, y), textcoords="offset points",
                   xytext=(0, 10), ha="center", fontsize=8, color=D3_COLORS["steelblue"])

    ax1.set_xlabel("Date", fontsize=11, color=D3_COLORS["text"])
    ax1.set_ylabel("Documents", fontsize=11, color=D3_COLORS["steelblue"])
    ax1.tick_params(axis="y", colors=D3_COLORS["steelblue"])
    ax1.tick_params(axis="x", colors=D3_COLORS["text"])
    ax1.set_ylim(bottom=0)

    ax2 = ax1.twinx()
    ax2.plot(x_positions, chars, color=D3_COLORS["coral"], linewidth=2.5,
            marker="s", markersize=8, linestyle="--", label="Characters", zorder=3)

    ax2.set_ylabel("Characters", fontsize=11, color=D3_COLORS["coral"])
    ax2.tick_params(axis="y", colors=D3_COLORS["coral"])
    ax2.set_ylim(bottom=0)
    ax2.yaxis.set_major_formatter(FuncFormatter(format_chars))

    step = max(1, len(dates) // 10)
    tick_positions = list(range(0, len(dates), step))
    tick_labels = [dates[i].strftime("%Y-%m-%d") for i in tick_positions]
    ax1.set_xticks(tick_positions)
    ax1.set_xticklabels(tick_labels, rotation=45, ha="right", fontsize=9)

    ax1.grid(True, alpha=0.3, color=D3_COLORS["grid"], zorder=1)
    ax1.spines["top"].set_visible(False)
    ax1.spines["right"].set_visible(False)
    ax2.spines["top"].set_visible(False)

    lines1, labels1 = ax1.get_legend_handles_labels()
    lines2, labels2 = ax2.get_legend_handles_labels()
    ax1.legend(lines1 + lines2, labels1 + labels2, loc="upper left",
              frameon=True, facecolor="white", edgecolor="#cccccc", fontsize=10)

    ax1.set_title("Documentation Growth Over Time", fontsize=14, fontweight="bold",
                 color=D3_COLORS["text"], pad=15)

    plt.tight_layout()
    plt.savefig(CHART_FILE, dpi=150, bbox_inches="tight",
                facecolor=D3_COLORS["bg"], edgecolor="none")
    plt.close()

    return f"![统计图表](./.readme/stats_chart.png)\n"

def main():
    research_dirs = scan_research_dirs()
    index_data = generate_index_json(research_dirs)

    history = update_history()
    chart_image_md = generate_stats_chart_png(history)

    if TEMPLATE_FILE.exists():
        template = TEMPLATE_FILE.read_text(encoding="utf-8")
        template = template.replace("{{last_updated}}", index_data["last_updated"])
        template = template.replace("{{directions_table}}", render_directions_table(research_dirs))
        template = template.replace("{{report_links}}", render_report_links(research_dirs))
        template = template.replace("{{stats_chart}}", chart_image_md)
        README_FILE.write_text(template, encoding="utf-8")

if __name__ == "__main__":
    main()