# README 生成器

本目录存放 README.md 自动生成的相关配置。

## 文件说明

| 文件 | 说明 |
|------|------|
| `template.md` | README 模板，包含占位符 |
| `stats_history.json` | 统计数据历史记录 |
| `stats_chart.png` | 统计图表 |

## 占位符

- `{{last_updated}}` - 最后更新时间
- `{{directions_table}}` - 研究方向表格
- `{{report_links}}` - 报告链接列表
- `{{stats_chart}}` - 统计图表

## 使用方式

```bash
python .scripts/generate_index.py
```

运行后会自动更新：
- `INDEX.json`
- `README.md`
- `.readme/stats_history.json`
- `.readme/stats_chart.png`