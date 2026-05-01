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
git status
```

---

## 2. 创建你的第一个报告

### 步骤 1：确认子主题目录名

目录名即任务定位。子主题目录名必须能够清晰表达其研究方向，如：

- `技术调研`、`架构分析`、`对比评测`、`演进史`、`实践经验总结`

如果目录名不能明确表达任务，先调整目录名再创建报告。

### 步骤 2：创建报告

```bash
# Windows
echo. > "方向名\子主题名\report_v1.0.md"

# Linux / macOS
touch "方向名/子主题名/report_v1.0.md"
```

### 步骤 3：编辑内容

报告格式：

```markdown
# 报告标题

> v1.0 | 2026-04

---

## 概述
## 正文
## 总结
```

### 步骤 4：提交

```bash
git add .
git commit
```

索引会自动更新。

---

## 3. 常用命令

| 操作 | 命令 |
|------|------|
| 创建报告 | `echo. > "<方向>/<子主题>/report_v1.0.md"` |
| 提交 | `git commit` |

---

## 4. 相关规范

详见 [REPORT_GUIDE.md](./REPORT_GUIDE.md)。
