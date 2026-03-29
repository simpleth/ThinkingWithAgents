#!/usr/bin/env python3
"""
创建新研究报告

用法:
    python .scripts/create_report.py <技术方向> <研究主题> <报告名>
    python .scripts/create_report.py 前端状态管理 演进史 report_v1.3
"""

import sys
import os
import re
from pathlib import Path
from datetime import datetime

RESEARCH_ROOT = Path(__file__).parent.parent

def create_report(direction, topic, name):
    direction_path = RESEARCH_ROOT / direction
    if not direction_path.exists():
        print(f"错误：技术方向不存在 {direction}")
        return False
    
    topic_path = direction_path / topic
    if not topic_path.exists():
        print(f"错误：研究主题不存在 {topic}")
        return False
    
    filename = name if name.endswith(".md") else f"{name}.md"
    report_path = topic_path / filename
    
    if report_path.exists():
        print(f"错误：报告已存在 {report_path}")
        return False
    
    # 获取模板
    template_path = topic_path / "template.md"
    if template_path.exists():
        template = template_path.read_text(encoding="utf-8")
    else:
        template = f"""# <报告标题>

> **版本**：v1.0  
> **更新**：{datetime.now().strftime("%Y-%m")}

---

## 概述

---

## 正文

---

## 总结
"""
    
    # 更新版本号
    if topic == "演进史" and re.match(r"report_v\d+\.\d+", name):
        version = name.replace("report_v", "v")
        template = template.replace("v1.0", version)
    
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(template)
    
    print(f"✓ 创建报告：{report_path}")
    
    # 自动更新索引
    os.system(f'python "{Path(__file__).parent / "generate_index.py"}"')
    print(f"\n完成！")
    return True

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("用法：python .scripts/create_report.py <方向> <主题> <报告名>")
        sys.exit(1)
    
    direction = sys.argv[1]
    topic = sys.argv[2]
    name = " ".join(sys.argv[3:])
    create_report(direction, topic, name)
