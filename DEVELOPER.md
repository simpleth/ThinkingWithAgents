# 开发者文档

> 项目架构、内部机制和维护指南

---

## 项目架构

### 目录结构

```
research/
├── .agent/              # Agent 工具库
├── .docs/               # 文档规范
├── .init/               # 初始化脚本
├── .mygit/              # Git 相关
├── .readme/             # README 生成器
├── [研究方向]/          # 研究内容（如 Agent/、JDK/ 等）
│   └── [研究主题]/      # 研究主题
│       └── [报告].md   # 研究报告
└── [核心文档].md       # QUICKSTART.md、AGENTS.md 等
```

---

## 内部机制

### 1. Git Hooks

**位置**：`.mygit/hooks/`

**Hooks 列表**：
- `pre-commit`：提交前自动更新 README 索引
- `commit-msg`：提交信息格式校验

**安装**：
```bash
./.init/install-all.sh
```

### 2. 自动索引

**位置**：`.readme/`

**核心组件**：
- `generate_index.py`：扫描目录结构，生成 index.json 和 README.md
- `update-index.sh`：Git hook 调用的包装脚本
- `index.json`：结构化索引数据
- `template.md`：README 模板

**流程**：
1. Git 提交时触发 pre-commit hook
2. 调用 update-index.sh
3. 运行 generate_index.py
4. 扫描所有研究报告
5. 自动更新 README.md 和 index.json

### 3. Agent 工具

**位置**：`.agent/`

**工具列表**：
- `tools.py`：封装常用操作（创建目录、Git 操作等）

---

## 维护指南

### 添加新的功能模块

1. 创建新的 `.xxx/` 目录
2. 添加 README.md
3. 更新 DOCS.md 索引

### 修改提交规范

编辑 `.mygit/commit-rules.json`

### 更新 README 生成逻辑

修改 `.readme/generate_index.py`

---

## 相关文档

- [AGENTS.md](./AGENTS.md)：项目理念和原则
- [.mygit/README.md](./.mygit/README.md)：Git 提交规范
- [.readme/README.md](./.readme/README.md)：README 生成器说明
- [.agent/README.md](./.agent/README.md)：Agent 工具库说明
