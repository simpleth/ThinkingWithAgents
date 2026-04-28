# Git 提交规范

> 规范说明和模板定义在 `.mygit/commit-rules.json`

---

## 快速开始

```bash
# 安装 hooks（运行一次即可）
./.init/install-all.sh

# 提交（自动打开模板 + 自动校验 + 自动更新索引）
git commit
```

---

## 查看规范说明

```bash
# 查看完整规范、模板和字段说明
python .mygit/hooks/commit-msg --help
```

---

## 自动校验

提交时会自动验证格式，规则定义在 `.mygit/commit-rules.json`。

**核心设计**：
- 规则文件是唯一来源（Single Source of Truth）
- 模板、校验逻辑、字段说明都从规则文件生成
- 修改规范只需编辑 `commit-rules.json`

---

## Hooks 源码位置

| Hook | 源码位置 | 说明 |
|------|---------|------|
| commit-msg | `.mygit/hooks/commit-msg` | 提交信息验证 |
| pre-commit | `.mygit/hooks/pre-commit` | 中央统一调用各模块脚本 |

**架构说明**：
- Git hooks 由 `.mygit` 模块统一管理
- 各功能模块提供自己的功能脚本（如 `.readme/update-index.sh`）
- 中央 pre-commit hook 调用各模块功能脚本
- 初始化模块 `.init/` 统一安装所有 hooks

---

## 重要规则

> ⚠️ **Agent 提交前必须询问人类确认**

---

## 查看历史

```bash
# 查看所有提交
git log --oneline

# 只看某类型提交
git log --grep="\[feat\]" --oneline

# 查看某目录的提交
git log -- 前端状态管理/
```

---

## 最佳实践

1. **Why 比 What 更重要** - 说明动机，不只是改动
2. **一次提交一个主题** - 不要混入无关改动
3. **组合类型不超过 2 种** - 复杂改动拆分提交
4. **Agent 修改要标注** - 方便后续追溯
5. **提交前运行索引生成** - 确保 .readme/index.json 和 README.md 最新