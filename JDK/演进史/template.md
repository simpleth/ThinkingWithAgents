# 技术研究档案库

> 本索引由脚本自动生成，请勿手动编辑
>
> 最后更新：{{last_updated}}
>
> 数据源：[INDEX.json](./INDEX.json)

---

## 快速链接

### 研究方向

{{directions_table}}

### 所有报告

{{report_links}}

---

## 快速开始

### 创建报告

```bash
python .scripts/create_report.py <方向> <主题> <报告名>
```

### 更新版本

```bash
python .scripts/bump_version.py <报告路径>
```

### 安装自动更新

```bash
cp .scripts/git-pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

---

## 研究主题分类

| 主题 | 说明 | 命名建议 |
|------|------|----------|
| `演进史` | 工具/技术发展脉络 | `report_vX.X.md` |
| `源码分析` | 深入某个工具内部实现 | `<工具名> 源码解析.md` |
| `对比评测` | 多工具横向对比 | `<A>-vs-<B>.md` |
| `最佳实践` | 使用指南、模式总结 | `<场景> 实践.md` |

---

## 文档

| 文档 | 说明 |
|------|------|
| [QUICKSTART.md](./QUICKSTART.md) | 人类快速开始 |
| [.scripts/README.md](./.scripts/) | 脚本工具说明 |
| [.agent/SKILL.md](./.agent/) | Agent 技能文档 |

---

## 版本管理

使用 Git 管理历史版本：

```bash
# 提交更新
git commit -am "update: <方向>/<主题> <报告名>"

# 查看历史
git log -- <方向>/<主题>/

# 回退版本
git checkout <commit> -- <方向>/<主题>/<报告名>.md
```
