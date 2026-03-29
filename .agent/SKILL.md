# Agent 技能文档

> 本文档专为 AI Agent 设计，帮助快速理解项目结构和工作流程

---

## 项目概述

**目标**：建立一个可持续维护的技术研究报告档案库

**核心理念**：
- 单一来源（Single Source of Truth）
- 自动化优先
- 目录结构即数据
- Git 版本管理

---

## 文档导航

| 文档 | 目标读者 |
|------|----------|
| 本文档 | AI Agent |
| [QUICKSTART.md](../QUICKSTART.md) | 人类快速开始 |
| [.scripts/README.md](../.scripts/) | 脚本说明 |

```
research/
├── .agent/                  # Agent 专用（本目录）
│   └── SKILL.md
│
├── .scripts/                # 自动化脚本
│   ├── README.md
│   ├── generate_index.py
│   ├── create_direction.py
│   ├── create_report.py
│   ├── bump_version.py
│   └── git-pre-commit
│
├── <技术方向>/              # 一级目录（自动发现）
│   └── <研究主题>/          # 二级目录（自动发现）
│       ├── template.md
│       └── *.md
│
├── template.md              # 根模板
├── INDEX.json               # 结构化数据
└── README.md                # 最终索引
```

---

## 扫描规则

```python
# 跳过目录
SKIP_DIRS = {"__pycache__", ".git", ".vscode", "node_modules", ".agent", ".scripts"}

# 跳过文件
SKIP_FILES = {"template.md"}

# 目录结构
research/
├── <技术方向>/              # 一级：技术方向
│   ├── <研究主题>/          # 二级：研究主题
│   │   └── *.md             # 三级：报告文件
```

---

## 占位符系统

`template.md` 中的占位符由 `generate_index.py` 替换：

| 占位符 | 替换内容 |
|--------|----------|
| `{{last_updated}}` | 当前时间戳 (YYYY-MM-DD HH:MM) |
| `{{directions_table}}` | 研究方向表格（Markdown） |
| `{{report_links}}` | 报告链接列表（Markdown） |

---

## 报告元数据格式

每个报告文件开头应包含：

```markdown
# <报告标题>

> **版本**：v1.0  
> **更新**：2026-03
```

### 提取逻辑

```python
# 版本号提取
1. 优先从文件名：report_v1.2.md → v1.2
2. 其次从内容：**版本**：v1.2

# 日期提取
1. 优先从内容：**更新**：2026-03
2. 其次从文件修改时间
```

---

## 工作流程

### 新增技术方向

```bash
# 1. 创建目录结构
mkdir -p <方向>/{演进史，源码分析，对比评测，最佳实践}

# 2. 为每个主题创建模板
for topic in 演进史 源码分析 对比评测 最佳实践; do
    cat > <方向>/$topic/template.md << 'EOF'
# <报告标题>
> **版本**：v1.0  
> **更新**：YYYY-MM
---
## 概述
---
## 正文
---
## 总结
EOF
done

# 3. 触发索引更新（Git commit 或手动）
python .scripts/generate_index.py
```

### 新增报告

```bash
# 1. 复制模板
cp <方向>/<主题>/template.md <方向>/<主题>/<报告名>.md

# 2. 编辑内容（确保包含版本和更新日期）

# 3. 触发索引更新
python .scripts/generate_index.py
```

### 更新报告

```bash
# 1. 编辑报告内容
# 2. 更新版本号：**版本**：v1.0 → **版本**：v1.1
# 3. 更新日期：**更新**：2026-03 → **更新**：2026-04
# 4. 触发索引更新
```

---

## 脚本 API

### generate_index.py

```python
# 功能：扫描目录，生成 INDEX.json 和 README.md
# 输入：无
# 输出：INDEX.json, README.md
# 调用：python .scripts/generate_index.py
```

### create_direction.py

```python
# 功能：创建新技术方向
# 输入：sys.argv[1] = 方向名
# 输出：目录结构 + 模板
# 调用：python .scripts/create_direction.py <方向名>
```

### create_report.py

```python
# 功能：创建新报告
# 输入：sys.argv[1] = 方向，sys.argv[2] = 主题，sys.argv[3] = 报告名
# 输出：报告文件
# 调用：python .scripts/create_report.py <方向> <主题> <报告名>
```

### bump_version.py

```python
# 功能：更新报告版本号
# 输入：sys.argv[1] = 报告路径，sys.argv[2] = 新版本（可选）
# 输出：更新后的文件
# 调用：python .scripts/bump_version.py <路径> [新版本]
```

---

## Git Hook 机制

### 安装

```bash
cp .scripts/git-pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### 触发流程

```
git commit
  ↓
pre-commit hook
  ↓
generate_index.py
  ↓
git add INDEX.json README.md
  ↓
commit 继续
```

---

## 研究主题分类

| 主题 | 说明 | 命名建议 |
|------|------|----------|
| `演进史` | 技术发展脉络 | `report_vX.X.md` |
| `源码分析` | 内部实现原理 | `<工具名> 源码解析.md` |
| `对比评测` | 多工具横向对比 | `<A>-vs-<B>.md` |
| `最佳实践` | 使用指南 | `<场景> 实践.md` |

---

## 设计原则

1. **DRY** - 信息只在一处维护
2. **自动化优先** - 能自动的绝不手动
3. **目录即数据** - 结构决定内容
4. **Git 原生** - 版本管理是核心

---

## 快速参考

```bash
# 生成索引
python .scripts/generate_index.py

# 创建方向
python .scripts/create_direction.py <名>

# 创建报告
python .scripts/create_report.py <方向> <主题> <名>

# 更新版本
python .scripts/bump_version.py <路径>

# 安装 Hook
cp .scripts/git-pre-commit .git/hooks/pre-commit
```
