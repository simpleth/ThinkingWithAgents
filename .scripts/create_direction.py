#!/usr/bin/env python3
"""
创建新技术研究方向

用法:
    python .scripts/create_direction.py <技术方向名>
    python .scripts/create_direction.py React 性能优化
"""

import sys
import os
from pathlib import Path

RESEARCH_ROOT = Path(__file__).parent.parent

DEFAULT_TOPICS = ["演进史", "源码分析", "对比评测", "最佳实践"]

def create_direction(name):
    direction_path = RESEARCH_ROOT / name
    
    if direction_path.exists():
        print(f"错误：目录已存在 {direction_path}")
        return False
    
    direction_path.mkdir(parents=True)
    print(f"✓ 创建目录：{direction_path}")
    
    for topic in DEFAULT_TOPICS:
        topic_path = direction_path / topic
        topic_path.mkdir()
        print(f"  ✓ 创建主题：{topic}")
        
        template_content = f"""# <报告标题>

> **版本**：v1.0  
> **更新**：YYYY-MM

---

## 概述

---

## 正文

---

## 总结
"""
        with open(topic_path / "template.md", "w", encoding="utf-8") as f:
            f.write(template_content)
        print(f"    ✓ 创建模板：template.md")
    
    # 自动更新索引
    os.system(f'python "{Path(__file__).parent / "generate_index.py"}"')
    print(f"\n完成！新方向：{name}")
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法：python .scripts/create_direction.py <技术方向名>")
        sys.exit(1)
    name = " ".join(sys.argv[1:])
    create_direction(name)
