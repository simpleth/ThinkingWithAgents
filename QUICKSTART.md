# 技术研究档案库 - 快速开始

## 30 秒上手

```bash
cd D:\Project\prototype\research

# 创建报告（自动更新索引）
python .scripts/create_report.py 前端状态管理 演进史 report_v1.3

# 安装自动更新（一次即可）
cp .scripts/git-pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

---

## 文档导航

| 文档 | 说明 |
|------|------|
| 本文档 | 人类快速上手 |
| [.agent/SKILL.md](./.agent/) | AI Agent 技能文档 |
| [.scripts/README.md](./.scripts/) | 脚本工具说明 |

---

## 常用场景

### 场景 1：创建新技术方向

```bash
python .scripts/create_direction.py React 性能优化
```

自动创建 4 个标准主题：演进史、源码分析、对比评测、最佳实践。

### 场景 2：创建报告

```bash
# 演进史报告
python .scripts/create_report.py 前端状态管理 演进史 report_v1.3

# 源码分析
python .scripts/create_report.py 前端状态管理 源码分析 redux 源码解析

# 对比评测
python .scripts/create_report.py 前端状态管理 对比评测 zustand-vs-jotai
```

### 场景 3：更新报告

```bash
# 编辑报告后，更新版本号（自动递增）
python .scripts/bump_version.py 前端状态管理/演进史/report_v1.2.md

# 或指定新版本
python .scripts/bump_version.py 前端状态管理/演进史/report_v1.2.md v2.0
```

### 场景 4：Git 提交（自动更新索引）

```bash
# 安装 Hook（仅一次）
cp .scripts/git-pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# 日常提交（索引自动更新）
git add .
git commit -m "add: 前端状态管理/演进史 report_v1.3"
```

---

## 工具速查

| 命令 | 功能 |
|------|------|
| `python .scripts/create_direction.py <名>` | 创建技术方向 |
| `python .scripts/create_report.py <方向> <主题> <名>` | 创建报告 |
| `python .scripts/bump_version.py <路径>` | 更新版本 |
| `python .scripts/generate_index.py` | 生成索引 |

---

## 目录结构

```
research/
├── .agent/                  # Agent 文档
├── .scripts/                # 工具脚本
│   ├── README.md            # 脚本说明
│   ├── generate_index.py
│   ├── create_direction.py
│   ├── create_report.py
│   ├── bump_version.py
│   └── git-pre-commit
│
├── 前端状态管理/            # 技术方向
│   ├── 演进史/report_v1.2.md
│   └── ...
│
├── template.md              # 索引模板
├── INDEX.json               # 结构化数据
└── README.md                # 最终索引
```

---

## 下一步

1. 查看现有报告学习格式
2. 开始创建你的第一个报告
3. 阅读 [.scripts/README.md](./.scripts/) 了解脚本
