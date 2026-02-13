/**
 * 命令上下文服务
 * @description 为命令提供必要的上下文信息，包括 Meta2D 实例
 * @author MC.Yang
 */

import { Meta2d } from '@meta2d/core'
import type { CommandContext } from '@/core'

/**
 * 命令上下文服务接口
 */
export interface ICommandContextService {
  /** 设置 Meta2D 实例 */
  setMeta2D(meta2d: Meta2d): void
  /** 获取 Meta2D 实例 */
  getMeta2D(): Meta2d | null
  /** 创建命令上下文 */
  createContext(): CommandContext
  /** 销毁服务 */
  destroy(): void
}

/**
 * 命令上下文服务实现
 */
export class CommandContextService implements ICommandContextService {
  private meta2d: Meta2d | null = null

  /**
   * 设置 Meta2D 实例
   */
  setMeta2D(meta2d: Meta2d): void {
    this.meta2d = meta2d
  }

  /**
   * 获取 Meta2D 实例
   */
  getMeta2D(): Meta2d | null {
    return this.meta2d
  }

  /**
   * 创建命令上下文
   */
  createContext(): CommandContext {
    return {
      meta2d: this.meta2d,
      timestamp: Date.now(),
    }
  }

  /**
   * 销毁服务
   */
  destroy(): void {
    this.meta2d = null
  }
}

/**
 * 命令上下文键枚举
 */
export enum CommandContextKeys {
  META2D = 'meta2d',
  TIMESTAMP = 'timestamp',
  EVENT_BUS = 'eventBus',
}

/**
 * 扩展的命令上下文接口
 */
export interface ExtendedCommandContext extends CommandContext {
  /** Meta2D 实例 */
  meta2d?: Meta2d
  /** 时间戳 */
  timestamp?: number
  /** 事件总线 */
  eventBus?: any
}

/**
 * 工具函数：安全获取 Meta2D 实例
 */
export function getMeta2DFromContext(context?: ExtendedCommandContext): Meta2d | null {
  if (context?.meta2d) {
    return context.meta2d
  }
  
  // 如果上下文中没有，尝试从全局获取（向后兼容）
  if (typeof window !== 'undefined' && (window as any).meta2d) {
    console.warn('[CommandContext] 使用了全局 meta2d，请通过上下文传递')
    return (window as any).meta2d
  }
  
  return null
}

/**
 * 创建命令上下文服务
 */
export function createCommandContextService(): ICommandContextService {
  return new CommandContextService()
}