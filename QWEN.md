# 技术研究档案库 - Agent 初始化

> Qwen Code 项目初始化文件 - 替代 `.agent/SKILL.md`

---

## 项目概述

**目标**：建立一个可持续维护的技术研究报告档案库

**核心理念**：
- 单一来源（Single Source of Truth）
- 自动化优先
- 目录结构即数据
- Git 版本管理

---

## 目录结构

```
research/
├── .scripts/                # 自动化脚本
│   ├── README.md
│   ├── generate_index.py    # 核心索引生成器
│   └── git-pre-commit       # Git Hook
│
├── .mygit/                  # Git 规范
│   ├── README.md            # 提交规范说明
│   └── commit-template.md   # 提交模板
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
SKIP_DIRS = {"__pycache__", ".git", ".vscode", "node_modules", ".scripts", ".mygit"}

# 跳过文件
SKIP_FILES = {"template.md", "QWEN.md"}

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

## Git 提交规范

### 核心规则

> ⚠️ **Agent 提交前必须询问人类确认**

### 提交类型（可组合）

| 类型 | 含义 | 示例 |
|------|------|------|
| `feat` | 新增：功能、模块、规则 | `feat: 新增研究方向` |
| `fix` | 修复：Bug、纠错、修正 | `fix: 修复脚本错误` |
| `docs` | 文档：README、说明、注释 | `docs: 更新使用说明` |
| `refactor` | 重构：结构优化（不影响功能） | `refactor: 脚本移至 .scripts` |
| `config` | 配置：Git、工具、环境变量 | `config: 初始化提交模板` |

### 组合示例

```
[feat+config] 新增功能并修改配置
[refactor+docs] 重构结构并更新文档
```

### 提交格式

```
[类型] 简短描述

提交者：[human | agent]

## Why（为什么做）

## What（做了什么）
```

### 提交者标识

| 标识 | 说明 |
|------|------|
| `human` | 人类主动编写内容 |
| `agent` | AI Agent 生成/修改内容 |

### 示例

```
[feat] 生成索引文件

提交者：agent

## Why（为什么做）

用户创建了新的报告文件，需要更新索引。

## What（做了什么）

- 运行 generate_index.py
- 更新 INDEX.json 和 README.md
```

---

## 工作流程

### 新增技术方向

```bash
# 1. 手动创建目录结构
mkdir -p <方向>/<主题>

# 2. 创建报告模板（复制现有 template.md 或新建）

# 3. 触发索引更新
python .scripts/generate_index.py

# 4. 询问人类是否提交
```

### 新增报告

```bash
# 1. 新建或复制模板
cp <方向>/<主题>/template.md <方向>/<主题>/<报告名>.md

# 2. 编辑内容（确保包含版本和更新日期）

# 3. 触发索引更新
python .scripts/generate_index.py

# 4. 询问人类是否提交
```

### 更新报告

```bash
# 1. 编辑报告内容
# 2. 更新版本号：**版本**：v1.0 → **版本**：v1.1
# 3. 更新日期：**更新**：2026-03 → **更新**：2026-04
# 4. 询问人类是否提交
```

---

## 脚本 API

### generate_index.py

```python
# 功能：扫描目录，生成 INDEX.json 和 README.md
# 调用：python .scripts/generate_index.py
# 触发：Git Hook 自动 / 手动调用
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
2. **YAGNI** - 不创建"可能有用"的文件
3. **自动化优先** - 能自动的绝不手动
4. **目录即数据** - 结构决定内容
5. **Git 原生** - 版本管理是核心

---

## 快速参考

```bash
# 生成索引
python .scripts/generate_index.py

# 提交（自动打开模板）
git commit

# 查看历史
git log --oneline

# 查看某类型提交
git log --grep="\[feat\]" --oneline
```

---

## 重要提醒

> ⚠️ **Agent 每次提交前必须询问人类**
>
> 即使改动很小，也要确认后再执行 `git commit`
