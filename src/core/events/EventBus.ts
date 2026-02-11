/**
 * 事件总线 - 全局事件系统
 * @description 实现发布订阅模式，支持优先级、拦截器、异步处理
 * @author MC.Yang
 */

/** 事件处理器函数 */
export type EventHandler<T = any> = (data: T) => void | Promise<void>

/** 事件拦截器 */
export type EventInterceptor<T = any> = (data: T) => boolean | Promise<boolean>

/** 事件监听器配置 */
export interface EventListenerConfig {
  /** 优先级（数字越大优先级越高） */
  priority?: number
  /** 是否只执行一次 */
  once?: boolean
  /** 事件拦截器 */
  interceptor?: EventInterceptor
}

/** 内部监听器结构 */
interface InternalListener<T = any> {
  handler: EventHandler<T>
  priority: number
  once: boolean
  interceptor?: EventInterceptor<T>
}

/**
 * 事件总线类
 */
export class EventBus {
  private listeners = new Map<string, InternalListener[]>()

  /**
   * 订阅事件
   * @returns 取消订阅函数
   */
  on<T = any>(event: string, handler: EventHandler<T>, config: EventListenerConfig = {}): () => void {
    const listener: InternalListener<T> = {
      handler,
      priority: config.priority ?? 0,
      once: config.once ?? false,
      interceptor: config.interceptor,
    }

    // 获取或创建监听器列表
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }

    const list = this.listeners.get(event)!
    list.push(listener)

    // 按优先级排序（高优先级在前）
    list.sort((a, b) => b.priority - a.priority)

    // 返回取消订阅函数
    return () => this.off(event, handler)
  }

  /**
   * 订阅一次性事件
   */
  once<T = any>(event: string, handler: EventHandler<T>, config: EventListenerConfig = {}): () => void {
    return this.on(event, handler, { ...config, once: true })
  }

  /**
   * 取消订阅
   */
  off<T = any>(event: string, handler?: EventHandler<T>): void {
    if (!this.listeners.has(event)) {
      return
    }

    // 如果没有指定 handler，移除所有监听器
    if (!handler) {
      this.listeners.delete(event)
      return
    }

    // 移除指定的 handler
    const list = this.listeners.get(event)!
    const index = list.findIndex((l) => l.handler === handler)
    if (index !== -1) {
      list.splice(index, 1)
    }

    // 如果列表为空，删除事件
    if (list.length === 0) {
      this.listeners.delete(event)
    }
  }

  /**
   * 发射事件
   */
  async emit<T = any>(event: string, data?: T): Promise<void> {
    if (!this.listeners.has(event)) {
      return
    }

    const list = this.listeners.get(event)!
    const toRemove: InternalListener[] = []

    for (const listener of list) {
      // 执行拦截器
      if (listener.interceptor) {
        const shouldContinue = await listener.interceptor(data as T)
        if (!shouldContinue) {
          continue
        }
      }

      // 执行处理器
      await listener.handler(data as T)

      // 标记一次性监听器
      if (listener.once) {
        toRemove.push(listener)
      }
    }

    // 移除一次性监听器
    if (toRemove.length > 0) {
      const newList = list.filter((l) => !toRemove.includes(l))
      if (newList.length === 0) {
        this.listeners.delete(event)
      } else {
        this.listeners.set(event, newList)
      }
    }
  }

  /**
   * 同步发射事件
   */
  emitSync<T = any>(event: string, data?: T): void {
    this.emit(event, data).catch((err) => {
      console.error(`[EventBus] Error in event "${event}":`, err)
    })
  }

  /**
   * 清除所有监听器
   */
  clear(): void {
    this.listeners.clear()
  }

  /**
   * 获取事件的监听器数量
   */
  listenerCount(event: string): number {
    return this.listeners.get(event)?.length ?? 0
  }
}
