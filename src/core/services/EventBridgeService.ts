/**
 * 事件桥接服务
 * @description 连接 Meta2D 原生事件和编辑器事件系统
 * @author MC.Yang
 */

import { Meta2d } from '@meta2d/core'
import { EventBus } from '@/core/events/EventBus'
import { EditorEvents, Meta2DEvents } from '@/core/constants/EditorEvents'

/**
 * 事件桥接服务
 */
export class EventBridgeService {
  private eventBus: EventBus
  private meta2d: Meta2d | null = null
  private isBridged = false
  /** 保存事件监听器引用，用于正确解绑 */
  private boundHandlers: Map<string, ((...args: any[]) => void)[]> = new Map()

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus
  }

  /**
   * 设置 Meta2D 实例并建立事件桥接
   */
  setMeta2D(meta2d: Meta2d): void {
    if (this.meta2d === meta2d) {
      return
    }

    // 断开之前的桥接
    if (this.isBridged && this.meta2d) {
      this.disconnectEvents()
    }

    this.meta2d = meta2d
    this.connectEvents()
  }

  /**
   * 连接事件
   */
  private connectEvents(): void {
    if (!this.meta2d) return

    // 保存所有绑定的处理函数
    this.boundHandlers.clear()

    // 选择相关事件
    const activeHandler = (pens: any) => {
      this.eventBus.emitSync(EditorEvents.SELECTION_CHANGED, pens)
    }
    this.meta2d.on(Meta2DEvents.ACTIVE, activeHandler)
    this.boundHandlers.set(Meta2DEvents.ACTIVE, [activeHandler])

    const inactiveHandler = () => {
      this.eventBus.emitSync(EditorEvents.SELECTION_CHANGED, [])
    }
    this.meta2d.on(Meta2DEvents.INACTIVE, inactiveHandler)
    this.boundHandlers.set(Meta2DEvents.INACTIVE, [inactiveHandler])

    // 编辑相关事件
    const updateHandler = () => {
      this.eventBus.emitSync(EditorEvents.DATA_CHANGED, this.meta2d?.store?.data)
    }
    this.meta2d.on(Meta2DEvents.UPDATE, updateHandler)
    this.boundHandlers.set(Meta2DEvents.UPDATE, [updateHandler])

    const resizePensHandler = () => {
      this.eventBus.emitSync(EditorEvents.DATA_CHANGED, this.meta2d?.store?.data)
    }
    this.meta2d.on(Meta2DEvents.RESIZE_PENS, resizePensHandler)
    this.boundHandlers.set(Meta2DEvents.RESIZE_PENS, [resizePensHandler])

    const rotatePensHandler = () => {
      this.eventBus.emitSync(EditorEvents.DATA_CHANGED, this.meta2d?.store?.data)
    }
    this.meta2d.on(Meta2DEvents.ROTATE_PENS, rotatePensHandler)
    this.boundHandlers.set(Meta2DEvents.ROTATE_PENS, [rotatePensHandler])

    const valueUpdateHandler = () => {
      this.eventBus.emitSync(EditorEvents.DATA_CHANGED, this.meta2d?.store?.data)
    }
    this.meta2d.on(Meta2DEvents.VALUE_UPDATE, valueUpdateHandler)
    this.boundHandlers.set(Meta2DEvents.VALUE_UPDATE, [valueUpdateHandler])

    // 缩放事件
    const scaleHandler = (scale: number | undefined) => {
      this.eventBus.emitSync(EditorEvents.SCALE_CHANGED, scale ?? 1)
    }
    this.meta2d.on(Meta2DEvents.SCALE, scaleHandler as any)
    this.boundHandlers.set(Meta2DEvents.SCALE, [scaleHandler as any])

    // 历史事件
    const undoHandler = () => {
      this.eventBus.emitSync(EditorEvents.COMMAND_UNDO, { command: 'undo' })
    }
    this.meta2d.on(Meta2DEvents.UNDO, undoHandler)
    this.boundHandlers.set(Meta2DEvents.UNDO, [undoHandler])

    const redoHandler = () => {
      this.eventBus.emitSync(EditorEvents.COMMAND_REDO, { command: 'redo' })
    }
    this.meta2d.on(Meta2DEvents.REDO, redoHandler)
    this.boundHandlers.set(Meta2DEvents.REDO, [redoHandler])

    this.isBridged = true
    console.log('[EventBridge] 事件桥接已建立')
  }

  /**
   * 断开事件连接
   */
  private disconnectEvents(): void {
    if (!this.meta2d) return

    // 遍历保存的处理器，逐个解绑
    this.boundHandlers.forEach((handlers, eventName) => {
      handlers.forEach((handler) => {
        this.meta2d?.off(eventName as any, handler)
      })
    })

    this.boundHandlers.clear()
    this.isBridged = false
    console.log('[EventBridge] 事件桥接已断开')
  }

  /**
   * 手动触发编辑器事件
   */
  emitEditorEvent<T extends keyof typeof EditorEvents>(
    eventType: T,
    data?: any
  ): void {
    this.eventBus.emitSync(eventType as string, data)
  }

  /**
   * 销毁服务
   */
  destroy(): void {
    if (this.isBridged && this.meta2d) {
      this.disconnectEvents()
    }
    this.meta2d = null
    this.boundHandlers.clear()
    console.log('[EventBridge] 服务已销毁')
  }
}

/**
 * 创建事件桥接服务
 */
export function createEventBridge(eventBus: EventBus): EventBridgeService {
  return new EventBridgeService(eventBus)
}