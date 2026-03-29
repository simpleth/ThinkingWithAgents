# 脚本工具集

本目录包含所有自动化脚本，通过 Git Hooks 被动触发，无需手动运行。

---

## 脚本列表

| 脚本 | 功能 | 触发方式 |
|------|------|----------|
| `generate_index.py` | 生成索引 | Git commit 自动 |
| `create_direction.py` | 创建技术方向 | 手动 |
| `create_report.py` | 创建报告 | 手动 |
| `bump_version.py` | 更新版本 | 手动 |
| `git-pre-commit` | Git Hook | Git commit 自动 |

---

## 安装自动触发

### Git Hook 安装（推荐）

```bash
# 复制 Hook
cp .scripts/git-pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

安装后，每次 `git commit` 会自动更新索引。

---

## 手动使用

### 创建技术方向

```bash
python .scripts/create_direction.py <方向名>
# 示例
python .scripts/create_direction.py React 性能优化
```

### 创建报告

```bash
python .scripts/create_report.py <方向> <主题> <报告名>
# 示例
python .scripts/create_report.py 前端状态管理 演进史 report_v1.3
```

### 更新版本

```bash
python .scripts/bump_version.py <报告路径> [新版本]
# 示例
python .scripts/bump_version.py 前端状态管理/演进史/report_v1.2.md
```

### 生成索引

```bash
python .scripts/generate_index.py
```

---

## 被动触发机制

```
┌─────────────────────────────────────┐
│  git commit                         │
│  ↓                                  │
│  pre-commit hook                    │
│  ↓                                  │
│  generate_index.py (自动执行)       │
│  ↓                                  │
│  更新 INDEX.json + README.md        │
│  ↓                                  │
│  自动添加到暂存区                   │
└─────────────────────────────────────┘
```

---

## 注意事项

1. 脚本路径从根目录计算：`python .scripts/xxx.py`
2. 所有脚本自动更新索引，无需手动运行
3. Git Hook 仅在 commit 时触发
