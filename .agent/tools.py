"""
Agent 工具库 - 封装易错操作

使用示例：
    from tools import create_research_report, find_dir
    
    # 创建研究报告
    create_research_report("JDK", "演进史", "report_v1.0", content)
    
    # 查找目录
    dir_path = find_dir("Agent 协作")
"""

import os
import subprocess
from pathlib import Path
from typing import Optional

# 项目根目录
RESEARCH_ROOT = Path(__file__).parent.parent


def find_dir(name: str) -> Optional[Path]:
    """
    查找已存在的目录（处理中文编码问题）
    
    Args:
        name: 目录名（如 'Agent 协作'）
    
    Returns:
        目录路径，如果不存在则返回 None
    """
    for item in RESEARCH_ROOT.iterdir():
        if item.is_dir() and item.name == name:
            return item
    return None


def create_dir(path: str) -> Path:
    """
    创建目录，处理中文路径问题
    
    Args:
        path: 相对于项目根目录的路径
    
    Returns:
        创建的目录的绝对路径
    """
    full_path = RESEARCH_ROOT / path
    full_path.mkdir(parents=True, exist_ok=True)
    return full_path


def create_file(path: str, content: str) -> Path:
    """
    创建文件，处理中文路径问题
    
    Args:
        path: 相对于项目根目录的路径
        content: 文件内容
    
    Returns:
        创建的文件的绝对路径
    """
    full_path = RESEARCH_ROOT / path
    full_path.parent.mkdir(parents=True, exist_ok=True)
    full_path.write_text(content, encoding='utf-8')
    return full_path


def git_add(path: str) -> bool:
    """
    Git add 文件
    
    Args:
        path: 相对于项目根目录的路径
    
    Returns:
        是否成功
    """
    try:
        full_path = str(RESEARCH_ROOT / path)
        subprocess.run(['git', 'add', full_path], check=True, capture_output=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Git add 失败：{e.stderr.decode('utf-8') if e.stderr else e}")
        return False


def create_research_report(direction: str, topic: str, name: str, content: str) -> dict:
    """
    创建研究报告
    
    Args:
        direction: 研究方向（如 'JDK'）
        topic: 研究主题（如 '演进史'）
        name: 报告名称（如 'report_v1.0'）
        content: 报告内容
    
    Returns:
        {'success': True, 'path': '...'} 或 {'success': False, 'error': '...'}
    """
    try:
        # 构建文件路径
        file_path = f"{direction}/{topic}/{name}.md"
        
        # 创建文件
        create_file(file_path, content)
        
        # Git add
        git_add(file_path)
        
        return {'success': True, 'path': str(RESEARCH_ROOT / file_path)}
    except Exception as e:
        return {'success': False, 'error': str(e)}


def list_research_directions() -> list:
    """
    列出所有研究方向
    
    Returns:
        研究方向名称列表
    """
    directions = []
    for item in RESEARCH_ROOT.iterdir():
        if item.is_dir() and not item.name.startswith('.'):
            directions.append(item.name)
    return sorted(directions)


def list_reports(direction: str, topic: str) -> list:
    """
    列出某个主题下的所有报告
    
    Args:
        direction: 研究方向
        topic: 研究主题
    
    Returns:
        报告文件名列表
    """
    topic_path = RESEARCH_ROOT / direction / topic
    if not topic_path.exists():
        return []
    
    reports = []
    for item in topic_path.glob("*.md"):
        if item.name != "template.md":
            reports.append(item.name)
    return sorted(reports)
