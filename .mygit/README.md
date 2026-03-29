# Git 提交规范

---

## 快速开始

```bash
# 提交（自动打开模板）
git commit

# 或指定模板
git commit -t .mygit/commit-template.md
```

---

## 提交格式

```
[类型] 简短描述

提交者：[human | agent]

## Why（为什么做）

## What（做了什么）
```

---

## 提交类型（可组合）

| 类型 | 含义 | 示例 |
|------|------|------|
| `feat` | 新增：功能、模块、规则 | `feat: 新增研究方向` |
| `fix` | 修复：Bug、纠错、修正 | `fix: 修复脚本路径错误` |
| `docs` | 文档：README、说明、注释 | `docs: 更新 QUICKSTART` |
| `refactor` | 重构：结构优化（不影响功能） | `refactor: 脚本移至 .scripts` |
| `config` | 配置：Git、工具、环境变量 | `config: 初始化提交模板` |

---

## 类型组合

**单一改动**：
```
[feat] 新增报告
[docs] 更新说明
```

**组合改动**（最多 2 种）：
```
[feat+config] 新增功能并修改配置
[refactor+docs] 重构结构并更新文档
```

**不推荐**（应拆分）：
```
❌ [feat+fix+docs] ← 拆分成多次提交
```

---

## 提交者标识

| 标识 | 说明 |
|------|------|
| `human` | 人类主动编写内容 |
| `agent` | AI Agent 生成/修改内容 |

**重要规则**：Agent 提交前必须询问人类确认。

---

## 示例

### 新增研究方向

```
[feat] 新增 Agent 协作实践研究方向

提交者：human

## Why（为什么做）

记录使用 AI Agent 协作的实战经验，
尤其是避免过度设计的教训。

## What（做了什么）

- 创建 Agent 协作实践 目录
- 添加最佳实践/设计实践.md 报告
```

### 新增功能并配置

```
[feat+config] 新增 Git 提交规范

提交者：human

## Why（为什么做）

统一提交格式，区分人类/Agen 提交。

## What（做了什么）

- 创建 .mygit/commit-template.md
- 创建 .mygit/README.md
- 配置 git config commit.template
```

### 重构并更新文档

```
[refactor+docs] 脚本移至 .scripts 目录

提交者：human

## Why（为什么做）

整理目录结构，隐藏工具脚本。

## What（做了什么）

- 移动所有脚本到 .scripts/
- 删除根目录冗余脚本
- 更新 QUICKSTART.md 和 README.md 说明
```

### Agent 更新索引

```
[feat] 生成索引文件

提交者：agent

## Why（为什么做）

用户创建了新的报告文件，需要更新索引。

## What（做了什么）

- 运行 generate_index.py
- 更新 INDEX.json（新增 1 份报告）
- 更新 README.md（自动渲染）
```

---

## 查看历史

```bash
# 查看所有提交
git log --oneline

# 只看新增功能
git log --grep="\[feat\]" --oneline

# 只看修复记录
git log --grep="\[fix\]" --oneline

# 只看文档变更
git log --grep="\[docs\]" --oneline

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
