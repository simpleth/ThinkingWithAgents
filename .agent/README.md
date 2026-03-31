# Agent 工具库

> 封装易错操作，提高 Agent 执行准确率

---

## 工具列表

| 工具 | 说明 | 使用场景 |
|------|------|----------|
| [tools.py](./tools.py) | 文件操作、Git 操作 | 创建目录、文件，Git add |

---

## 使用示例

### 创建研究报告

```python
from tools import create_research_report

create_research_report(
    direction="JDK",
    topic="演进史",
    name="report_v1.0",
    content="# JDK 演进史\n\n..."
)
```

### 查找现有目录

```python
from tools import find_dir

dir_path = find_dir("Agent 协作")
if dir_path:
    print(f"找到目录：{dir_path}")
else:
    print("目录不存在")
```

---

## 为什么需要工具库？

**问题**：AI 直接调用 shell 命令处理中文路径时容易出错。

**示例**：
```bash
# ❌ 错误（Windows 命令行）
mkdir "Agent 协作"  # 可能创建编码错误的目录

# ✅ 正确（Python）
import os
os.makedirs('Agent 协作')  # 正确处理中文
```

**工具库的作用**：
- 封装易错操作
- 提供统一的 API
- 减少 AI 犯错

---

## 已知问题

### Git 无法区分中文路径的空格差异

**问题**：Git 在 Windows 上无法区分 `Agent 协作/` 和 `Agent 协作/`（有空格）。

**原因**：Git 的 UTF-8 编码处理与 Windows 文件系统不一致。

**解决方案**：
1. 使用 Python 的 `pathlib` 模块创建目录（不是 shell 命令）
2. 如果发现重复目录，手动删除错误的那个
3. 使用 `git rm --cached` 清除错误路径的缓存，然后重新添加
