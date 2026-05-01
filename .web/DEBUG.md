# Web 前端调试系统

## 概述

本系统为 Web 前端模块提供了结构化的调试日志功能，支持两种调试级别：

- **RUN 级别**：记录关键流程和重要事件，适合生产环境调试
- **DEV 级别**：记录详细的执行信息，适合开发调试

## 调试系统结构

```
.web/src/utils/debug.js
├── DEBUG_LEVELS
│   ├── NONE (0)
│   ├── RUN (1)
│   └── DEV (2)
├── 模块日志器
│   ├── debugApp
│   ├── debugRouter
│   ├── debugHeader
│   ├── debugHome
│   ├── debugCategory
│   ├── debugArticle
│   └── debugSearch
└── API
    ├── createDebugLogger(module)
    ├── setDebugLevel(level)
    └── getDebugLevel()
```

## 使用方法

### 基本使用

每个模块都有预创建的日志器：

```javascript
import { debugApp, debugArticle, setDebugLevel, DEBUG_LEVELS } from './utils/debug'

// 记录 RUN 级别日志（关键信息）
debugApp.log('App initialized', { userCount: 5 })

// 记录 DEV 级别日志（详细信息）
debugArticle.debug('Loading article', { id: 'test' })

// 记录警告
debugHeader.warn('Slow response detected', { time: 500ms })

// 记录错误
debugHome.error('Failed to load', { error: e.message })
```

### 设置调试级别

```javascript
// 设置为 RUN 级别（只显示关键信息）
setDebugLevel(DEBUG_LEVELS.RUN)

// 设置为 DEV 级别（显示详细信息）
setDebugLevel(DEBUG_LEVELS.DEV)
```

### 自定义模块日志器

```javascript
import { createDebugLogger } from './utils/debug'

const debugMyModule = createDebugLogger('MY_MODULE')

debugMyModule.log('Key event occurred')
debugMyModule.debug('Detailed step-by-step information')
```

## 日志输出格式

```
[时间戳] [级别] [模块] 消息内容
```

示例：

```
[14:30:45] [RUN] [APP] App initialized
[14:30:46] [DEV] [HEADER] Building navigation tree...
[14:30:47] [RUN] [HEADER] Navigation tree built: { categories: 7, topics: 25, totalArticles: 100 }
```

每个模块有自己的颜色编码：

- APP: 蓝色
- ROUTER: 紫色
- HEADER: 粉色
- HOME: 青色
- CATEGORY: 橙色
- ARTICLE: 绿色
- SEARCH: 蓝绿色
```
