# 技术研究档案库 - 快速开始

> 5 分钟上手指南

---

## 1. 安装（1 分钟）

安装 Git Hooks，实现提交时自动更新索引：

**Windows（PowerShell）**：
```powershell
Copy-Item .scripts\git-pre-commit .git\hooks\pre-commit
Copy-Item .scripts\git-commit-msg .git\hooks\commit-msg
```

**Linux / macOS**：
```bash
cp .scripts/git-pre-commit .git/hooks/pre-commit
cp .scripts/git-commit-msg .git/hooks/commit-msg
chmod +x .git/hooks/*
```

**验证安装**：
```bash
git status  # 确认无错误
```

---

## 2. 创建你的第一个报告（3 分钟）

### 步骤 1：创建目录

```bash
# Windows
mkdir "方向名\主题名"

# Linux / macOS
mkdir -p "方向名/主题名"
```

**示例**：
```bash
mkdir "JDK\演进史"
```

### 步骤 2：创建报告

复制现有报告的格式，或新建文件：

```bash
# Windows
copy "JDK\演进史\template.md" "JDK\演进史\report_v1.0.md"

# Linux / macOS
cp "JDK/演进史/template.md" "JDK/演进史/report_v1.0.md"
```

### 步骤 3：编辑内容

报告头部格式：

```markdown
# 报告标题

> **版本**：v1.0
> **更新**：2026-04

---

## 概述

...
```

### 步骤 4：提交

```bash
git add .
git commit
```

索引会自动更新，无需手动运行脚本。

---

## 3. 常用命令速查

| 操作 | 命令 |
|------|------|
| 创建技术方向 | `mkdir "<方向>\<主题>"` |
| 创建报告 | `copy "<方向>\<主题>\template.md" "<报告名>.md"` |
| 查看变更 | `git status` |
| 提交 | `git commit` |
| 查看历史 | `git log --oneline` |
| 查看某目录历史 | `git log -- <方向>/` |

---

## 4. 深入阅读

| 文档 | 说明 |
|------|------|
| [README.md](./README.md) | 项目索引（最终渲染结果） |
| [QWEN.md](./QWEN.md) | Agent 项目规范 |
| [.scripts/README.md](./.scripts/) | 脚本工具说明 |
| [.mygit/README.md](./.mygit/) | Git 提交规范 |

---

## 5. 报告命名规范

| 主题类型 | 命名示例 |
|----------|----------|
| 演进史 | `report_v1.0.md` |
| 源码分析 | `redux 源码解析.md` |
| 对比评测 | `zustand-vs-jotai.md` |
| 最佳实践 | `大型应用状态管理实践.md` |
