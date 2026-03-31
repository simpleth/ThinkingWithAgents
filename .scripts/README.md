# 脚本工具集

本目录包含核心自动化脚本，通过 Git Hooks 被动触发。

---

## 脚本列表

| 脚本 | 功能 | 触发方式 |
|------|------|----------|
| `generate_index.py` | 生成索引 | Git commit 自动 |
| `git-pre-commit` | Git Hook | Git commit 自动 |

---

## 安装自动触发

```bash
# 复制 Hook（一次即可）
cp .scripts/git-pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

安装后，每次 `git commit` 会自动更新索引。

---

## 手动生成索引

```bash
python .scripts/generate_index.py
```

---

## 注意事项

1. 脚本路径从根目录计算：`python .scripts/xxx.py`
2. Git Hook 仅在 commit 时触发
