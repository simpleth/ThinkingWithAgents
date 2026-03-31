# Git 提交规范

> 规范说明和模板定义在 `.mygit/commit-rules.json`

---

## 快速开始

```bash
# 安装自动校验（一次即可）
cp .scripts/git-commit-msg .git/hooks/commit-msg
chmod +x .git/hooks/commit-msg

# 提交（自动打开模板 + 自动校验）
git commit
```

---

## 查看规范说明

```bash
# 查看完整规范、模板和字段说明
python .scripts/git-commit-msg --help
```

---

## 自动校验

提交时会自动验证格式，规则定义在 `.mygit/commit-rules.json`。

**核心设计**：
- 规则文件是唯一来源（Single Source of Truth）
- 模板、校验逻辑、字段说明都从规则文件生成
- 修改规范只需编辑 `commit-rules.json`

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
5. **提交前运行索引生成** - 确保 INDEX.json 和 README.md 最新
