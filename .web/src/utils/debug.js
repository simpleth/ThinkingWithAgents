// 调试级别
const DEBUG_LEVELS = {
  NONE: 0,
  RUN: 1,    // 只打印关键信息
  DEV: 2     // 打印详细信息
}

// 当前调试级别 - 可以通过环境变量或配置修改
let currentLevel = DEBUG_LEVELS.DEV

// 模块颜色映射
const MODULE_COLORS = {
  APP: '#6366f1',
  ROUTER: '#8b5cf6',
  HEADER: '#ec4899',
  HOME: '#14b8a6',
  CATEGORY: '#f59e0b',
  ARTICLE: '#84cc16',
  SEARCH: '#06b6d4'
}

// 设置调试级别
export function setDebugLevel(level) {
  if (Object.values(DEBUG_LEVELS).includes(level)) {
    currentLevel = level
    console.log(`[Debug] Level set to: ${Object.keys(DEBUG_LEVELS).find(k => DEBUG_LEVELS[k] === level)}`)
  }
}

// 获取当前调试级别
export function getDebugLevel() {
  return currentLevel
}

// 基础日志函数
function createLogger(module, level) {
  const color = MODULE_COLORS[module] || '#94a3b8'
  
  return function(...args) {
    if (currentLevel < level) return
    
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
    const levelLabel = level === DEBUG_LEVELS.RUN ? 'RUN' : 'DEV'
    
    console.log(
      `%c[${timestamp}] [${levelLabel}] [${module}]`,
      `color: ${color}; font-weight: bold;`,
      ...args
    )
  }
}

// 创建模块日志器
export function createDebugLogger(module) {
  return {
    // RUN 级别 - 关键信息
    log: createLogger(module, DEBUG_LEVELS.RUN),
    // DEV 级别 - 详细信息
    debug: createLogger(module, DEBUG_LEVELS.DEV),
    // 错误日志
    error: function(...args) {
      console.error(
        `%c[${new Date().toISOString().split('T')[1].split('.')[0]}] [ERROR] [${module}]`,
        `color: #ef4444; font-weight: bold;`,
        ...args
      )
    },
    // 警告日志
    warn: function(...args) {
      console.warn(
        `%c[${new Date().toISOString().split('T')[1].split('.')[0]}] [WARN] [${module}]`,
        `color: #f59e0b; font-weight: bold;`,
        ...args
      )
    }
  }
}

// 导出快捷方式
export const debugApp = createDebugLogger('APP')
export const debugRouter = createDebugLogger('ROUTER')
export const debugHeader = createDebugLogger('HEADER')
export const debugHome = createDebugLogger('HOME')
export const debugCategory = createDebugLogger('CATEGORY')
export const debugArticle = createDebugLogger('ARTICLE')
export const debugSearch = createDebugLogger('SEARCH')

// 便捷导出级别常量
export { DEBUG_LEVELS }
