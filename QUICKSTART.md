# 技术研究档案库 - 快速开始

> 5 分钟上手项目核心功能

---

## 这是什么项目？

这是一个**结构化的技术研究档案库**，帮助你：
- 组织研究笔记和报告
- 自动生成索引和统计
- 通过 Git 进行版本管理

---

## 核心概念

| 概念 | 说明 |
|------|------|
| **研究方向** | 一个大的研究领域（如 Agent、JDK、前端状态管理等） |
| **研究主题** | 研究方向下的具体主题（如 演进史、架构分析等） |
| **报告** | 具体的研究成果文档 |

---

## 5 分钟快速上手

### 1. 初始化项目

运行初始化脚本：
```bash
./.init/install-all.sh
```

### 2. 浏览现有内容

查看 [README.md](./README.md) 了解已有研究内容：
- 研究方向列表
- 所有报告索引
- 统计图表

### 3. 创建你的第一个报告

详细教程：[.docs/create-report-tutorial.md](./.docs/create-report-tutorial.md)

快速步骤：
```bash
# 1. 创建目录
mkdir "方向名\主题名"

# 2. 创建报告
copy "方向名\主题名\template.md" "方向名\主题名\report_v1.0.md"

# 3. 编辑内容
```

### 4. 提交你的工作

```bash
git add .
git commit
```

---

## 更多资源

| 目标 | 文档 |
|------|------|
| 完整文档导航 | [DOCS.md](./DOCS.md) |
| 创建报告详细教程 | [.docs/create-report-tutorial.md](./.docs/create-report-tutorial.md) |
| 报告编写规范 | [.docs/REPORT_GUIDE.md](./.docs/REPORT_GUIDE.md) |
