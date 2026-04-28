# 技术研究档案库 - 快速开始

> 5 分钟上手项目核心功能

---

## 这是什么项目？

这是一个**结构化的技术研究档案库**，帮助你：
- 组织研究笔记和报告
- 自动生成索引和统计
- 通过 Git 进行版本管理

---

## 核心功能亮点

| 功能 | 说明 |
|------|------|
| 📚 **目录即数据** | 研究方向/研究主题/报告.md 的结构化组织 |
| 🔄 **自动索引** | Git 提交时自动更新 README 索引和统计 |
| 📋 **文档导航** | DOCS.md 统一管理项目文档和功能模块 |
| 🛠️ **Agent 工具** | .agent/ 提供封装好的操作工具 |

---

## 5 分钟快速上手

### 1. 初始化项目（1 分钟）

安装 Git Hooks，启用自动索引功能：

```bash
./.init/install-all.sh
```

### 2. 浏览项目结构（1 分钟）

查看 [README.md](./README.md) 了解已有研究内容：
- 研究方向列表
- 所有报告索引
- 统计图表

查看 [DOCS.md](./DOCS.md) 了解文档导航：
- 核心文档
- 功能模块说明

### 3. 创建你的第一个报告（2 分钟）

详细教程：[.docs/create-report-tutorial.md](./.docs/create-report-tutorial.md)

快速步骤：
```bash
# 1. 创建目录
mkdir "方向名\主题名"

# 2. 创建报告
copy "方向名\主题名\template.md" "方向名\主题名\report_v1.0.md"

# 3. 编辑内容
# 4. 提交
git add .
git commit
```

### 4. 查看项目理念（1 分钟）

阅读 [AGENTS.md](./AGENTS.md) 了解：
- 项目价值观和原则
- 协作经验
- 强制约束

---

## 下一步去哪里？

| 目标 | 文档 |
|------|------|
| 完整文档导航 | [DOCS.md](./DOCS.md) |
| 创建报告详细教程 | [.docs/create-report-tutorial.md](./.docs/create-report-tutorial.md) |
| 报告编写规范 | [.docs/REPORT_GUIDE.md](./.docs/REPORT_GUIDE.md) |
| 项目理念和原则 | [AGENTS.md](./AGENTS.md) |
