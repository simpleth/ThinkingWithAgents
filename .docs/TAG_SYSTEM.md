# 标签与自动关联系统设计

> 版本：v1.0 | 日期：2026-05

---

## 一、设计目标

1. **作者零配置**：frontmatter 里写自然语言标签即可，无需查表
2. **全自动关联**：报告间的 `related` 由算法计算，不再手写
3. **受控词汇表**：`tags.json` 自动生成+自维护，人类仅供可选美化

---

## 二、Frontmatter 写法（唯一输入）

作者在报告开头写：

```yaml
---
tags: [AI Agent, 协作经验, DRY原则, 大模型]
---
```

规则：
- 支持中文/英文混写
- 逗号分隔
- 大小写不敏感（`agent` / `Agent` / `AGENT` 视为同一标签）
- 4-6 个为宜

---

## 三、自动化管线

```
作者写 frontmatter tags
        ↓
generate_index.py 扫描全部报告
        ↓
   ┌─ 1. 收集所有标签 → 规范化清洗
   ├─ 2. 同义词映射合并（如有配置）
   ├─ 3. 生成/更新 tags.json
   ├─ 4. 标注已废弃标签
   ├─ 5. 计算报告间自动关联
   └─ 6. 写入 index.json（含 tags + related + auto_related）
```

---

## 四、规范化规则（内置脚本，不可配置）

| 输入 | 输出 | 规则 |
|------|------|------|
| `AI Agent` | `ai-agent` | 小写，空格→连字符 |
| `DRY原则` | `dry原则` | 英文部分小写，中文保留 |
| `React/Vue` | `react-vue` | 斜杠→连字符 |
| `A.I.` | `ai` | 去标点 |
| `大模型` | `大模型` | 纯中文原样保留 |

---

## 五、`tags.json` 结构（全自动产出）

```json
{
  "ai-agent": {
    "count": 3,
    "description": ""
  },
  "dry原则": {
    "count": 2,
    "description": "DRY 设计原则"
  },
  "大模型": {
    "count": 5,
    "description": ""
  },
  "前端": {
    "count": 0,
    "deprecated": true,
    "description": ""
  }
}
```

- `count`：当前使用该标签的报告数（自动维护）
- `description`：可选，人类手动补充的中文说明，一旦设置后自动更新不会覆盖
- `deprecated`：count=0 时自动标记，不删除（保留历史）

---

## 六、同义词映射（可选，不强制）

人类可编辑 `tags.json` 中某个条目的 `synonymOf` 字段：

```json
{
  "大模型": {
    "count": 5,
    "description": "大语言模型"
  },
  "llm": {
    "synonymOf": "大模型"
  }
}
```

规则：
- `synonymOf` 指向一个 canonical 标签（必须已存在且有非零 count）
- 设置了 `synonymOf` 的标签不计入 count，不独立展示
- 未设置不报错，仅影响关联精度

---

## 七、自动关联算法

报告 A 和 B 的关联度 = 共享标签数：

| 共享数 | 结果 |
|--------|------|
| ≥ 2 | 强关联 |
| = 1 | 仅当同研究方向时弱关联 |
| = 0 | 无关联 |

关联结果写入 `index.json` 的 `related` 字段（覆盖旧的手写值）。

---

## 八、需要改动的文件

| 文件 | 改动 |
|------|------|
| 9 篇 `.md` 报告 | 调整 frontmatter tags 为自然语言格式，移除 `related` 字段 |
| `.docs/tags.json` | **新建**，初版标签词汇表（由首次全量扫描自动生成） |
| `.readme/generate_index.py` | 新增：规范化清洗、tags.json 读写、同义词映射、自动关联计算 |
| `.web/generate.py` | 透传 `auto_related` 字段到 Web 数据 |
| `.web/src/pages/Article.jsx` | `related` 渲染逻辑不变，数据源改为 `auto_related` |

---

## 九、边界情况

| 场景 | 处理 |
|------|------|
| 报告删除，某标签 count 归零 | 自动标记 `deprecated`，前端不展示 |
| 报告恢复，deprecated 标签重新被使用 | 自动清除 `deprecated`，count 恢复 |
| 同义词链（A→B, B→C） | 只允许一层映射，检测到链式映射报 warning |
| 同义词指向不存在的标签 | 忽略该映射，报 warning |
| 空标签 `tags: []` | 允许，该报告无关联 |
