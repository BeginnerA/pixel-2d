/**
 * 事件发射器
 * @description 基于发布-订阅模式的事件管理器
 * @author MC.Yang
 */

/**
 * 事件处理函数类型
 */
export type EventHandler<T = any> = (data: T) => void

/**
 * 事件订阅信息
 */
interface EventSubscription {
  handler: EventHandler
  once: boolean
}

/**
 * 事件发射器类
 * @example
 * ```ts
 * const emitter = new EventEmitter()
 *
 * // 订阅事件
 * emitter.on('data', (data) => {
 *   console.log('received:', data)
 * })
 *
 * // 触发事件
 * emitter.emit('data', { message: 'hello' })
 *
 * // 取消订阅
 * emitter.off('data')
 * ```
 */
export class EventEmitter {
  /**
   * 事件映射表
   * @private
   */
  private events: Map<string, Set<EventSubscription>> = new Map()

  /**
   * 订阅事件
   * @param eventName 事件名称
   * @param handler 事件处理函数
   * @returns 取消订阅的函数
   */
  on<T = any>(eventName: string, handler: EventHandler<T>): () => void {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set())
    }

    const subscription: EventSubscription = { handler, once: false }
    this.events.get(eventName)!.add(subscription)

    // 返回取消订阅函数
    return () => this.off(eventName, handler)
  }

  /**
   * 订阅一次性事件
   * @param eventName 事件名称
   * @param handler 事件处理函数
   * @returns 取消订阅的函数
   */
  once<T = any>(eventName: string, handler: EventHandler<T>): () => void {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set())
    }

    const subscription: EventSubscription = { handler, once: true }
    this.events.get(eventName)!.add(subscription)

    return () => this.off(eventName, handler)
  }

  /**
   * 取消订阅事件
   * @param eventName 事件名称
   * @param handler 事件处理函数（可选，不传则取消所有订阅）
   */
  off(eventName: string, handler?: EventHandler): void {
    const subscriptions = this.events.get(eventName)
    if (!subscriptions) return

    if (handler) {
      // 移除指定处理函数
      for (const sub of subscriptions) {
        if (sub.handler === handler) {
          subscriptions.delete(sub)
        }
      }
    } else {
      // 移除所有订阅
      subscriptions.clear()
    }

    // 如果没有订阅者了，删除事件映射
    if (subscriptions.size === 0) {
      this.events.delete(eventName)
    }
  }

  /**
   * 触发事件
   * @param eventName 事件名称
   * @param data 事件数据
   */
  emit<T = any>(eventName: string, data?: T): void {
    const subscriptions = this.events.get(eventName)
    if (!subscriptions || subscriptions.size === 0) return

    // 创建副本以避免在遍历时修改集合
    const subscriptionsCopy = Array.from(subscriptions)

    subscriptionsCopy.forEach((subscription) => {
      try {
        subscription.handler(data)

        // 如果是一次性事件，执行后移除
        if (subscription.once) {
          subscriptions.delete(subscription)
        }
      } catch (error) {
        console.error(`Error in event handler for "${eventName}":`, error)
      }
    })

    // 清理空事件映射
    if (subscriptions.size === 0) {
      this.events.delete(eventName)
    }
  }

  /**
   * 清空所有事件订阅
   */
  clear(): void {
    this.events.clear()
  }

  /**
   * 获取事件订阅数量
   * @param eventName 事件名称（可选，不传则返回所有事件数量）
   * @returns 订阅数量
   */
  listenerCount(eventName?: string): number {
    if (eventName) {
      return this.events.get(eventName)?.size ?? 0
    }
    let count = 0
    this.events.forEach((subscriptions) => {
      count += subscriptions.size
    })
    return count
  }

  /**
   * 获取所有事件名称
   * @returns 事件名称数组
   */
  eventNames(): string[] {
    return Array.from(this.events.keys())
  }
}

/**
 * 创建全局事件总线实例
 */
export const createEventBus = () => new EventEmitter()

/**
 * 导出默认实例
 */
export default EventEmitter
