# 创建研究报告教程

> 详细的报告创建步骤指南

---

## 1. 安装（1 分钟）

安装 Git Hooks，实现提交时自动更新索引：

**Windows（Git Bash）**：
```bash
./.init/install-all.sh
```

**Linux / macOS**：
```bash
./.init/install-all.sh
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

详见 [DOCS.md](../DOCS.md) 获取完整文档导航。

---

## 5. 报告规范

报告编写规范详见 [REPORT_GUIDE.md](./REPORT_GUIDE.md)。

核心格式：

```markdown
# 报告标题

> **版本**：v1.0
> **更新**：2026-04

---

## 概述
## 正文
## 总结
```

---

## 6. 报告命名规范

| 主题类型 | 命名示例 |
|----------|----------|
| 演进史 | `report_v1.0.md` |
| 源码分析 | `redux 源码解析.md` |
| 对比评测 | `zustand-vs-jotai.md` |
| 最佳实践 | `大型应用状态管理实践.md` |
