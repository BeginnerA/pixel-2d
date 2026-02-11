/**
 * 状态机 - 编辑器状态管理
 * @description 实现有限状态机，管理编辑器的状态转换
 * @author MC.Yang
 */

import { EventBus } from '../events/EventBus'

/** 状态接口 */
export interface IState<T = any> {
  /** 状态名称 */
  readonly name: string
  /** 进入状态 */
  onEnter?(context: T): void | Promise<void>
  /** 离开状态 */
  onExit?(context: T): void | Promise<void>
  /** 状态更新 */
  onUpdate?(context: T, deltaTime: number): void
}

/** 状态转换 */
export interface StateTransition<T = any> {
  /** 源状态 */
  from: string
  /** 目标状态 */
  to: string
  /** 转换条件 */
  condition?: (context: T) => boolean | Promise<boolean>
  /** 转换前回调 */
  onBeforeTransition?(context: T): void | Promise<void>
  /** 转换后回调 */
  onAfterTransition?(context: T): void | Promise<void>
}

/**
 * 状态机类
 */
export class StateMachine<T = any> {
  private states = new Map<string, IState<T>>()
  private transitions: StateTransition<T>[] = []
  private currentState: IState<T> | null = null
  private context: T
  private eventBus: EventBus

  constructor(context: T, eventBus?: EventBus) {
    this.context = context
    this.eventBus = eventBus || new EventBus()
  }

  /**
   * 添加状态
   */
  addState(state: IState<T>): this {
    if (this.states.has(state.name)) {
      throw new Error(`[StateMachine] State "${state.name}" already exists`)
    }
    this.states.set(state.name, state)
    return this
  }

  /**
   * 批量添加状态
   */
  addStates(states: IState<T>[]): this {
    states.forEach((state) => this.addState(state))
    return this
  }

  /**
   * 添加转换
   */
  addTransition(transition: StateTransition<T>): this {
    this.transitions.push(transition)
    return this
  }

  /**
   * 批量添加转换
   */
  addTransitions(transitions: StateTransition<T>[]): this {
    transitions.forEach((t) => this.addTransition(t))
    return this
  }

  /**
   * 转换到指定状态
   */
  async transitionTo(stateName: string): Promise<void> {
    const targetState = this.states.get(stateName)
    if (!targetState) {
      throw new Error(`[StateMachine] State "${stateName}" not found`)
    }

    const fromName = this.currentState?.name || 'null'

    // 查找匹配的转换
    const transition = this.transitions.find((t) => t.from === fromName && t.to === stateName)

    // 检查转换条件
    if (transition?.condition) {
      const canTransition = await transition.condition(this.context)
      if (!canTransition) {
        console.warn(`[StateMachine] Transition from "${fromName}" to "${stateName}" blocked by condition`)
        return
      }
    }

    // 转换前回调
    if (transition?.onBeforeTransition) {
      await transition.onBeforeTransition(this.context)
    }

    // 离开当前状态
    if (this.currentState?.onExit) {
      await this.currentState.onExit(this.context)
    }

    const previousState = this.currentState
    this.currentState = targetState

    // 进入新状态
    if (targetState.onEnter) {
      await targetState.onEnter(this.context)
    }

    // 转换后回调
    if (transition?.onAfterTransition) {
      await transition.onAfterTransition(this.context)
    }

    // 发射事件
    this.eventBus.emitSync('state:changed', {
      from: previousState?.name || null,
      to: targetState.name,
    })
  }

  /**
   * 更新状态机
   */
  update(deltaTime: number): void {
    if (this.currentState?.onUpdate) {
      this.currentState.onUpdate(this.context, deltaTime)
    }
  }

  /**
   * 获取当前状态
   */
  getCurrentState(): IState<T> | null {
    return this.currentState
  }

  /**
   * 获取当前状态名称
   */
  getCurrentStateName(): string | null {
    return this.currentState?.name || null
  }

  /**
   * 检查是否在指定状态
   */
  isInState(stateName: string): boolean {
    return this.currentState?.name === stateName
  }

  /**
   * 更新上下文
   */
  updateContext(context: T): void {
    this.context = context
  }

  /**
   * 获取上下文
   */
  getContext(): T {
    return this.context
  }
}
