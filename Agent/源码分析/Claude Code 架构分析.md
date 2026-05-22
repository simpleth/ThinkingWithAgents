---
title: "Claude Code 架构分析"
version: "v1.0"
date: 2026-04
tags: [claude-code, architecture-analysis, source-code-leak, agent-design, memory-system]
status: published
---

# Claude Code 架构分析

---

## 概述

2026 年 3 月 31 日，Anthropic 因 `.npmignore` 配置缺失，意外通过 npm 源映射文件泄露了 Claude Code 的完整源代码。本文档基于泄露源码进行逆向工程分析，揭示其架构设计、核心模块和内部机制。

**核心结论**：
- 单主循环架构，而非复杂的多 Agent 协作
- 三层记忆系统解决上下文熵问题
- 41 个工具 + 101 个命令的插件化设计
- 超过 50% 的 LLM 调用使用低成本模型（Haiku）

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 语言 | TypeScript (1,906 文件) |
| 运行时 | Bun (Anthropic 2025 年底收购) |
| UI | React + Ink (终端渲染) |
| API | @anthropic-ai/sdk |
| MCP | @modelcontextprotocol/sdk |
| 验证 | Zod v4 |

---

## 核心架构

### 三层设计

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│              (React + Ink 终端 UI 组件)                        │
├─────────────────────────────────────────────────────────────┤
│                    Core Services Layer                       │
│         (QueryEngine, Context, Permissions, Tools)           │
├─────────────────────────────────────────────────────────────┤
│                    Integration Layer                         │
│         (API Client, Executors, MCP, External Services)      │
└─────────────────────────────────────────────────────────────┘
```

### 设计哲学

| 原则 | 说明 |
|------|------|
| **文件系统即状态** | 将复杂性卸载到文件结构和现有 CLI 工具 |
| **四大原语** | read, write, edit, bash |
| **单主循环** | 一个主线程，消息历史扁平化，最多一个分支 |
| **渐进式披露** | 按需动态发现接口，不预加载所有 schema |

---

## 核心模块

### QueryEngine.ts

对话循环核心：消息管理、流式传输、自动压缩、提示词缓存、重试逻辑、工具编排、权限管理。

### 上下文构建器

- 发现并合并 CLAUDE.md 文件
- 构建系统上下文（OS、shell、平台、git 状态）
- 集成用户上下文（权限、工作目录）

### 成本追踪

按模型统计 token（输入/输出/缓存读/写）和 USD 成本。

---

## 工具系统（41 个工具）

### 工具分类

| 类别 | 工具示例 |
|------|----------|
| 文件操作 | FileReadTool, FileWriteTool, FileEditTool, GlobTool, GrepTool |
| 代码执行 | BashTool, PowerShellTool, REPLTool, NotebookEditTool |
| 网络搜索 | WebFetchTool, WebSearchTool |
| 代理任务 | AgentTool, TaskCreate/Get/Update/List/Stop/OutputTool |
| MCP 集成 | MCPTool, McpAuthTool, List/ReadMcpResourceTool |
| 配置系统 | ConfigTool, SkillTool, TodoWriteTool |

### BashTool 安全机制

2,500 行安全检查代码：
- 路径遍历防护
- 风险分级（低/中/高）
- YOLO 分类器（ML 自动审批）
- 受保护文件列表

---

## 记忆架构（三层设计）

解决"上下文熵"问题，防止长会话导致幻觉。

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: MEMORY.md (轻量级索引)                         │
│  - 每条约 150 字符，始终加载，仅存储位置                   │
├─────────────────────────────────────────────────────────┤
│  Layer 2: Topic Files (项目知识)                         │
│  - 按需获取，不同时全部加载                               │
├─────────────────────────────────────────────────────────┤
│  Layer 3: Raw Transcripts (原始记录)                     │
│  - 永不全量重读，仅 grep 特定标识符                        │
└─────────────────────────────────────────────────────────┘
```

**严格写入纪律**：仅在确认文件写入成功后更新记忆索引，防止失败尝试污染上下文。

---

## 特殊模式

| 模式 | 功能 |
|------|------|
| **KAIROS** | 自主守护进程，后台代理，接收周期性 tick 提示 |
| **autoDream** | 记忆巩固，用户空闲时运行，四阶段流程（定向/收集/巩固/修剪） |
| **ULTRAPLAN** | 远程规划，卸载到云容器运行时（Opus 模型），最长 30 分钟 |
| **Coordinator** | 多代理编排，四阶段（研究/合成/实现/验证） |
| **BUDDY** | 终端宠物（Tamagotchi 风格），18 物种，2026 年 4 月 1-7 日发布窗口 |
| **UNDERCOVER** | 隐蔽模式，针对 Anthropic 员工，隐藏 AI 身份和内部代号 |

---

## 安全机制

### 权限系统

```
Tool Request → Risk Level?
    ├── Low ──▶ Auto Allow (YOLO 模式)
    ├── Mid ──▶ YOLO Classifier → Approve/Ask User
    └── High ──▶ Ask User
```

### 反蒸馏机制 (ANTI_DISTILLATION_CC)

- 假工具注入：向 API 请求注入 decoy 工具定义
- 加密摘要：缓冲完整推理，仅返回加密签名摘要

### 已知漏洞

| 漏洞 | CVSS |
|------|------|
| 不受信任目录代码注入 | 8.7 |
| 恶意仓库 API 密钥窃取 | 5.3 |

---

## 性能优化

### 模型路由策略

| 用途 | 模型 | 占比 |
|------|------|------|
| 读取大文件、解析网页、git 历史、总结对话 | Claude-3.5-Haiku | >50% |
| 关键任务（代码生成、复杂重构） | Claude-4.6 / Opus-4.6 | <50% |

### 缓存策略

- 系统提示词缓存（TTL: 24 小时）
- 工具定义缓存（TTL: 24 小时）
- 用户偏好缓存（TTL: 1 小时）

---

## 内部模型代号

| 代号 | 对应模型 | 特性 |
|------|----------|------|
| Capybara | Claude 4.6 | 支持 1M 上下文 |
| Fennec | Opus 4.6 | 用于 ULTRAPLAN |
| Tengu | Claude Code | 项目代号 |
| Penguin | 快速模式 | 快速响应 |

---

## 总结

**架构亮点**：
1. 单主循环设计，避免过度复杂的多 Agent 协作
2. 三层记忆系统，优雅解决上下文熵问题
3. 插件化工具架构，41 个工具 + 101 个命令
4. 成本优化，超过 50% 调用使用低成本模型

**安全启示**：
- 权限系统和沙盒方法完全暴露
- 反蒸馏机制可被审计
- 供应链风险（泄露期间恶意 axios 版本发布）

**后续研究方向**：
- 清洁室重写项目进展（claw-code）
- MCP 协议在 Agent 间的应用
- 记忆系统的通用化设计
