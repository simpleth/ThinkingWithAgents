[类型] 简短描述

提交者：[human | agent]

## Why（为什么做）

## What（做了什么）

# ---
# 类型选择（可组合）：
# feat    - 新增：功能、模块、规则、研究方向
# fix     - 修复：Bug 修复、内容纠错、配置修正
# docs    - 文档：README、使用说明、注释更新
# refactor - 重构：结构优化（不影响功能）
# config  - 配置：Git、工具、环境变量设置
#
# 组合示例：
# [feat+config] 新增功能并修改配置
# [feat+docs] 新增功能并更新文档
# [refactor+docs] 重构结构并更新说明
# [fix+config] 修复问题并调整配置
#
# 提交者：
# human - 人类主动编写
# agent - Agent 被动执行
#
# 示例：
# [feat] 新增 Agent 协作实践研究方向
# 提交者：human
# ## Why
# 记录协作经验
# ## What
# - 创建 Agent 协作实践 目录
# - 添加设计实践.md 报告
#
# [feat+config] 新增 Git 提交规范
# 提交者：human
# ## Why
# 统一提交格式
# ## What
# - 创建 .mygit/commit-template.md
# - 配置 git config commit.template
#
# [refactor+docs] 脚本移至 .scripts 目录
# 提交者：human
# ## Why
# 整理目录结构
# ## What
# - 移动所有脚本到 .scripts/
# - 更新 QUICKSTART.md 说明
#
# [feat] 生成索引文件
# 提交者：agent
# ## Why
# 用户创建了新报告
# ## What
# - 运行 generate_index.py
# - 更新 INDEX.json 和 README.md
