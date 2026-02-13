/**
 * 统一错误处理工具
 * @description 提供标准化的错误捕获、记录和处理机制
 * @author MC.Yang
 */

import type { EventBus } from '@/core'

/**
 * 错误级别枚举
 */
export enum ErrorLevel {
  /** 信息级别 */
  INFO = 'info',
  /** 警告级别 */
  WARN = 'warn',
  /** 错误级别 */
  ERROR = 'error',
  /** 致命错误级别 */
  FATAL = 'fatal'
}

/**
 * 错误上下文信息
 */
export interface ErrorContext {
  /** 错误发生的时间戳 */
  timestamp: number
  /** 错误发生的组件/模块 */
  component?: string
  /** 错误发生的方法 */
  method?: string
  /** 相关数据 */
  data?: any
  /** 用户信息 */
  user?: string
  /** 浏览器信息 */
  userAgent?: string
}

/**
 * 错误详情
 */
export interface ErrorDetail {
  /** 错误级别 */
  level: ErrorLevel
  /** 错误消息 */
  message: string
  /** 错误堆栈 */
  stack?: string
  /** 错误上下文 */
  context: ErrorContext
  /** 错误ID */
  id: string
}

/**
 * 错误处理器接口
 */
export interface IErrorHandler {
  /** 处理错误 */
  handleError(error: Error | string, context?: Partial<ErrorContext>): void
  /** 处理Promise拒绝 */
  handlePromiseRejection(reason: any, context?: Partial<ErrorContext>): void
  /** 记录错误日志 */
  logError(detail: ErrorDetail): void
  /** 获取最近的错误 */
  getRecentErrors(limit?: number): ErrorDetail[]
  /** 清除错误历史 */
  clearErrorHistory(): void
}

/**
 * 错误处理器实现
 */
export class ErrorHandler implements IErrorHandler {
  private eventBus: EventBus
  private errorHistory: ErrorDetail[] = []
  private maxHistorySize = 100
  private enableConsoleLogging = true

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus
    this.setupGlobalErrorHandlers()
  }

  /**
   * 设置全局错误处理器
   */
  private setupGlobalErrorHandlers(): void {
    // 全局JavaScript错误
    window.addEventListener('error', (event) => {
      this.handleError(event.error, {
        component: 'Global',
        method: 'window.onerror'
      })
    })

    // 全局Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.handlePromiseRejection(event.reason, {
        component: 'Global',
        method: 'window.onunhandledrejection'
      })
    })
  }

  /**
   * 处理错误
   */
  handleError(error: Error | string, context: Partial<ErrorContext> = {}): void {
    const errorObj = typeof error === 'string' ? new Error(error) : error
    
    const errorDetail: ErrorDetail = {
      level: ErrorLevel.ERROR,
      message: errorObj.message,
      stack: errorObj.stack,
      context: {
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        ...context
      },
      id: this.generateErrorId()
    }

    this.processError(errorDetail)
  }

  /**
   * 处理Promise拒绝
   */
  handlePromiseRejection(reason: any, context: Partial<ErrorContext> = {}): void {
    let message: string
    let stack: string | undefined

    if (reason instanceof Error) {
      message = reason.message
      stack = reason.stack
    } else if (typeof reason === 'string') {
      message = reason
    } else {
      message = String(reason)
    }

    const errorDetail: ErrorDetail = {
      level: ErrorLevel.ERROR,
      message,
      stack,
      context: {
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        ...context
      },
      id: this.generateErrorId()
    }

    this.processError(errorDetail)
  }

  /**
   * 记录错误日志
   */
  logError(detail: ErrorDetail): void {
    // 添加到历史记录
    this.errorHistory.unshift(detail)
    
    // 限制历史记录大小
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize)
    }

    // 控制台输出
    if (this.enableConsoleLogging) {
      this.outputToConsole(detail)
    }

    // 触发错误事件
    this.eventBus.emitSync('error:occurred', detail)
  }

  /**
   * 获取最近的错误
   */
  getRecentErrors(limit = 10): ErrorDetail[] {
    return this.errorHistory.slice(0, limit)
  }

  /**
   * 清除错误历史
   */
  clearErrorHistory(): void {
    this.errorHistory = []
  }

  /**
   * 处理错误详情
   */
  private processError(detail: ErrorDetail): void {
    // 记录错误
    this.logError(detail)

    // 根据错误级别采取不同行动
    switch (detail.level) {
      case ErrorLevel.INFO:
        // 仅记录，不采取特殊行动
        break
      case ErrorLevel.WARN:
        // 可能需要用户通知
        this.notifyWarning(detail)
        break
      case ErrorLevel.ERROR:
        // 记录并可能回滚操作
        this.notifyError(detail)
        break
      case ErrorLevel.FATAL:
        // 致命错误，可能需要重启应用
        this.handleFatalError(detail)
        break
    }
  }

  /**
   * 输出到控制台
   */
  private outputToConsole(detail: ErrorDetail): void {
    const consoleMethod = detail.level === ErrorLevel.INFO ? 'log' :
                         detail.level === ErrorLevel.WARN ? 'warn' : 'error'
    
    console[consoleMethod](`[${detail.level.toUpperCase()}] ${detail.message}`, {
      id: detail.id,
      timestamp: new Date(detail.context.timestamp).toISOString(),
      component: detail.context.component,
      method: detail.context.method,
      stack: detail.stack
    })
  }

  /**
   * 通知警告
   */
  private notifyWarning(detail: ErrorDetail): void {
    // 可以在这里添加UI通知逻辑
    console.warn('[ErrorHandler] Warning notification:', detail.message)
  }

  /**
   * 通知错误
   */
  private notifyError(detail: ErrorDetail): void {
    // 可以在这里添加UI错误提示逻辑
    console.error('[ErrorHandler] Error notification:', detail.message)
  }

  /**
   * 处理致命错误
   */
  private handleFatalError(detail: ErrorDetail): void {
    console.error('[ErrorHandler] FATAL ERROR:', detail.message)
    
    // 可以在这里添加应用重启或恢复逻辑
    // 例如：显示错误页面、自动保存、提供恢复选项等
  }

  /**
   * 生成错误ID
   */
  private generateErrorId(): string {
    return 'err_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  /**
   * 设置最大历史记录大小
   */
  setMaxHistorySize(size: number): void {
    this.maxHistorySize = size
  }

  /**
   * 启用/禁用控制台日志
   */
  setConsoleLogging(enabled: boolean): void {
    this.enableConsoleLogging = enabled
  }
}

/**
 * 错误处理装饰器
 */
export function HandleError(componentName?: string) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function(...args: any[]) {
      try {
        const result = originalMethod.apply(this, args)
        
        // 如果返回Promise，添加错误处理
        if (result && typeof result.catch === 'function') {
          return result.catch((error: any) => {
            if (typeof window !== 'undefined' && (window as any).errorHandler) {
              (window as any).errorHandler.handleError(error, {
                component: componentName || target.constructor.name,
                method: propertyKey
              })
            }
            throw error
          })
        }
        
        return result
      } catch (error) {
        if (typeof window !== 'undefined' && (window as any).errorHandler) {
          (window as any).errorHandler.handleError(error, {
            component: componentName || target.constructor.name,
            method: propertyKey
          })
        }
        throw error
      }
    }

    return descriptor
  }
}

/**
 * 错误处理器工厂函数
 */
export function createErrorHandler(eventBus: EventBus): IErrorHandler {
  return new ErrorHandler(eventBus)
}