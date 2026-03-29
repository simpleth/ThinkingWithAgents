#!/usr/bin/env python3
"""
更新报告版本号

用法:
    python .scripts/bump_version.py <报告路径> [新版本]
    python .scripts/bump_version.py 前端状态管理/演进史/report_v1.2.md v1.3
"""

import sys
import re
from pathlib import Path
from datetime import datetime

RESEARCH_ROOT = Path(__file__).parent.parent

def bump_version(report_path, new_version=None):
    filepath = RESEARCH_ROOT / report_path
    
    if not filepath.exists():
        print(f"错误：文件不存在 {filepath}")
        return False
    
    content = filepath.read_text(encoding="utf-8")
    
    # 提取当前版本
    match = re.search(r"report_v(\d+\.\d+)", filepath.stem)
    if match:
        current_version = f"v{match.group(1)}"
    else:
        match = re.search(r"\*\*版本\*\*：v(\d+\.\d+)", content)
        current_version = f"v{match.group(1)}" if match else "v1.0"
    
    # 计算新版本
    if new_version is None:
        parts = current_version.lstrip("v").split(".")
        parts[-1] = str(int(parts[-1]) + 1)
        new_version = f"v{'.'.join(parts)}"
    
    # 更新内容和日期
    content = re.sub(r"\*\*版本\*\*：v\d+\.\d+", f"**版本**：{new_version}", content)
    content = re.sub(r"> \*\*版本\*\*：v\d+\.\d+", f"> **版本**：{new_version}", content)
    today = datetime.now().strftime("%Y-%m")
    content = re.sub(r"\*\*更新\*\*：\d{4}-\d{2}", f"**更新**：{today}", content)
    
    # 更新文件名
    new_filename = re.sub(r"report_v\d+\.\d+", f"report_v{new_version.lstrip('v')}", filepath.name)
    new_filepath = filepath.parent / new_filename
    
    with open(new_filepath, "w", encoding="utf-8") as f:
        f.write(content)
    
    print(f"✓ 更新版本：{current_version} → {new_version}")
    
    if new_filepath != filepath:
        filepath.unlink()
        print(f"  重命名：{filepath.name} → {new_filename}")
    
    # 自动更新索引
    import os
    os.system(f'python "{Path(__file__).parent / "generate_index.py"}"')
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法：python .scripts/bump_version.py <报告路径> [新版本]")
        sys.exit(1)
    
    report_path = sys.argv[1]
    new_version = sys.argv[2] if len(sys.argv) > 2 else None
    bump_version(report_path, new_version)
