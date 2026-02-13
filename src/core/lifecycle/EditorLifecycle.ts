/**
 * 编辑器生命周期管理
 * @description 负责编辑器的初始化和销毁逻辑
 * @author MC.Yang
 */

import { Container, EventBus, CommandManager, PluginManager, StateMachine, RendererFactory } from '@/core'
import type { EditorOptions, EditorInitOptions, EditorState, EditorContext } from '@/types'
import type { Meta2d } from '@meta2d/core'
import type { IRenderer } from '@/core/renderer'

/**
 * 编辑器生命周期接口
 */
export interface IEditorLifecycle {
  init(options?: EditorInitOptions): Promise<void>
  destroy(): void
  getContext(): EditorContext
  getEventBus(): EventBus
  getCommandManager(): CommandManager
  getPluginManager(): PluginManager
  getStateMachine(): StateMachine
  isInitialized(): boolean
}

/**
 * 编辑器生命周期管理实现
 */
export class EditorLifecycle implements IEditorLifecycle {
  private container!: Container
  private eventBus!: EventBus
  private commandManager!: CommandManager
  private pluginManager!: PluginManager
  private stateMachine!: StateMachine
  private context!: EditorContext
  private initialized = false

  private static readonly DEFAULT_OPTIONS: EditorOptions = {
    grid: true,
    gridSize: 20,
    gridColor: '#e0e0e0',
    rule: true,
    ruleColor: '#888',
    backgroundColor: '#ffffff',
    readonly: false,
    scale: 1,
    minScale: 0.1,
    maxScale: 5,
  }

  constructor() {
    this.initializeContainer()
  }

  private initializeContainer(): void {
    this.container = new Container()
    this.registerServices()
    this.resolveServices()
    this.initContext()
  }

  private registerServices(): void {
    this.container.registerSingleton(EventBus, EventBus)
    this.container.registerSingleton(CommandManager, CommandManager, [EventBus])
    this.container.registerSingleton(PluginManager, PluginManager, [EventBus])
    this.container.registerSingleton(StateMachine, StateMachine, [EventBus])
  }

  private resolveServices(): void {
    this.eventBus = this.container.resolve(EventBus)
    this.commandManager = this.container.resolve(CommandManager)
    this.pluginManager = this.container.resolve(PluginManager)
    this.stateMachine = this.container.resolve(StateMachine)
  }

  private initContext(): void {
    this.context = {
      renderer: RendererFactory.create('canvas') as IRenderer,
      meta2d: (window as any).meta2d as Meta2d,
      options: { ...EditorLifecycle.DEFAULT_OPTIONS },
      state: this.getDefaultState(),
      initialized: false,
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

  async init(options?: EditorInitOptions): Promise<void> {
    if (this.initialized) return

    const mergedOptions = { ...EditorLifecycle.DEFAULT_OPTIONS, ...options }
    this.context.options = mergedOptions

    if ((window as any).meta2d) {
      (window as any).meta2d.setOptions({
        grid: mergedOptions.grid,
        gridSize: mergedOptions.gridSize,
        gridColor: mergedOptions.gridColor,
        rule: mergedOptions.rule,
        ruleColor: mergedOptions.ruleColor,
      })
    }

    await this.stateMachine.initialize(this.getDefaultState())
    await this.pluginManager.initialize()

    this.initialized = true
    this.context.initialized = true
  }

  destroy(): void {
    if (!this.initialized) return

    this.pluginManager.destroy()
    this.commandManager.destroy()
    this.stateMachine.destroy()
    this.eventBus.destroy()
    this.container.clear()

    this.initialized = false
    this.context.initialized = false
    this.initContext()
  }

  getContext(): EditorContext {
    return this.context
  }

  getEventBus(): EventBus {
    return this.eventBus
  }

  getCommandManager(): CommandManager {
    return this.commandManager
  }

  getPluginManager(): PluginManager {
    return this.pluginManager
  }

  getStateMachine(): StateMachine {
    return this.stateMachine
  }

  isInitialized(): boolean {
    return this.initialized
  }
}

export function createEditorLifecycle(): EditorLifecycle {
  return new EditorLifecycle()
}
