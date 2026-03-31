# 技术研究档案库 - 快速开始

## 30 秒上手

```bash
cd D:\Project\prototype\research

# 安装自动更新（一次即可）
cp .scripts/git-pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

---

## 文档导航

| 文档 | 说明 |
|------|------|
| 本文档 | 人类快速上手 |
| [QWEN.md](./QWEN.md) | Agent 初始化（项目上下文） |
| [.scripts/README.md](./.scripts/) | 脚本工具说明 |

---

## 常用场景

### 场景 1：创建新技术方向

```bash
# 手动创建目录结构
mkdir -p <方向>/<主题>

# 示例：创建 React 性能优化方向
mkdir -p "React 性能优化/演进史"
mkdir -p "React 性能优化/源码分析"
mkdir -p "React 性能优化/对比评测"
mkdir -p "React 性能优化/最佳实践"
```

### 场景 2：创建报告

```bash
# 复制模板并编辑
cp <方向>/<主题>/template.md <方向>/<主题>/<报告名>.md

# 示例
cp "前端状态管理/演进史/template.md" "前端状态管理/演进史/report_v1.3.md"
```

### 场景 3：Git 提交（自动更新索引）

```bash
# 安装 Hook（仅一次）
cp .scripts/git-pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# 日常提交（索引自动更新）
git add .
git commit
```

---

## 目录结构

```
research/
├── QWEN.md                  # Agent 初始化
├── .scripts/                # 工具脚本
│   ├── README.md            # 脚本说明
│   ├── generate_index.py    # 索引生成器
│   └── git-pre-commit       # Git Hook
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
3. 阅读 [QWEN.md](./QWEN.md) 了解项目规范
