/**
 * 编辑器状态管理器
 * @description 集中管理编辑器的所有状态
 * @author MC.Yang
 */

import { EventBus } from '@/core'
import type { EditorState } from '@/types'

/**
 * 状态变更事件
 */
export interface StateChangeEvent<T = unknown> {
  key: keyof EditorState
  oldValue: T
  newValue: T
}

/**
 * 状态管理器接口
 */
export interface IEditorStateManager {
  /** 获取状态 */
  getState(): EditorState
  /** 更新状态 */
  setState(partial: Partial<EditorState>): void
  /** 获取单个状态 */
  get<K extends keyof EditorState>(key: K): EditorState[K]
  /** 设置单个状态 */
  set<K extends keyof EditorState>(key: K, value: EditorState[K]): void
  /** 订阅状态变更 */
  subscribe(callback: (event: StateChangeEvent) => void): () => void
  /** 重置状态 */
  reset(): void
}

/**
 * 编辑器状态管理器实现
 */
export class EditorStateManager implements IEditorStateManager {
  private state: EditorState
  private eventBus: EventBus
  private subscribers: Set<(event: StateChangeEvent) => void> = new Set()

  constructor(eventBus: EventBus, initialState?: Partial<EditorState>) {
    this.eventBus = eventBus
    this.state = this.getDefaultState()
    if (initialState) {
      this.state = { ...this.state, ...initialState }
    }
  }

  private getDefaultState(): EditorState {
    return {
      name: 'idle',
      selectedPens: [],
      mousePosition: { x: 0, y: 0 },
      scale: 1,
      center: { x: 0, y: 0 },
      isDrawing: false,
      isDragging: false,
      readonly: false,
    }
  }

  getState(): EditorState {
    return { ...this.state }
  }

  setState(partial: Partial<EditorState>): void {
    const oldState = { ...this.state }
    this.state = { ...this.state, ...partial }

    // 触发变更事件
    Object.keys(partial).forEach((key) => {
      const k = key as keyof EditorState
      if (oldState[k] !== this.state[k]) {
        this.notifyChange(k, oldState[k], this.state[k])
      }
    })
  }

  get<K extends keyof EditorState>(key: K): EditorState[K] {
    return this.state[key]
  }

  set<K extends keyof EditorState>(key: K, value: EditorState[K]): void {
    const oldValue = this.state[key]
    if (oldValue === value) return

    this.state[key] = value
    this.notifyChange(key, oldValue, value)
  }

  subscribe(callback: (event: StateChangeEvent) => void): () => void {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  private notifyChange<K extends keyof EditorState>(key: K, oldValue: EditorState[K], newValue: EditorState[K]): void {
    const event: StateChangeEvent = { key, oldValue, newValue }
    this.subscribers.forEach((cb) => cb(event))
    this.eventBus.emit('state:change', event)
  }

  reset(): void {
    const oldState = { ...this.state }
    this.state = this.getDefaultState()
    this.eventBus.emit('state:reset', { oldState, newState: this.state })
  }
}

/**
 * 创建状态管理器
 */
export function createEditorStateManager(eventBus: EventBus, initialState?: Partial<EditorState>): EditorStateManager {
  return new EditorStateManager(eventBus, initialState)
}
