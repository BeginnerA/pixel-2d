/**
 * 编辑器核心实现
 * @description 整合所有核心模块，提供统一的编辑器API
 * @author MC.Yang
 */

import { Container } from './ioc/Container'
import { EventBus } from './events/EventBus'
import { CommandManager } from './commands/CommandManager'
import { PluginManager } from './plugins/PluginManager'
import { StateMachine, IState } from '@/core/state'
import { RendererFactory } from './renderer'
import { IRenderer } from './renderer'
import {
  IEditorCore,
  EditorOptions,
  EditorInitOptions,
  EditorState,
  EditorContext,
  EditorEventType,
  EditorMode,
} from '@/types/editor'
import { EventBridgeService, createEventBridge } from './services/EventBridgeService'
import { AddPenCommand, DeletePensCommand, UpdatePenCommand, ClearCanvasCommand, ZoomCommand } from './commands/CommonCommands'
import type { IPlugin } from './plugins/PluginManager'

/**
 * 编辑器核心类
 * @description 整合IoC容器、事件总线、命令系统、插件系统等核心模块
 */
export class EditorCore implements IEditorCore {
  /** IoC容器实例 */
  private container!: Container

  /** 事件总线实例 */
  private eventBus!: EventBus

  /** 命令管理器实例 */
  private commandManager!: CommandManager

  /** 插件管理器实例 */
  private pluginManager!: PluginManager

  /** 事件桥接服务实例 */
  private eventBridgeService!: EventBridgeService

  /** 渲染器实例 */
  private renderer!: IRenderer

  /** 状态机实例 */
  private stateMachine!: StateMachine

  /** 编辑器上下文 */
  private context!: EditorContext

  /** 默认选项 */
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
    this.initializeCore()
  }

  /**
   * 初始化核心模块
   */
  private initializeCore(): void {
    // 初始化IoC容器
    this.container = new Container()

    // 注册核心服务
    this.registerServices()

    // 解析核心服务
    this.eventBus = this.container.resolve(EventBus)
    this.commandManager = this.container.resolve(CommandManager)
    this.pluginManager = this.container.resolve(PluginManager)

    // 创建事件桥接服务
    this.eventBridgeService = createEventBridge(this.eventBus)

    // 初始化上下文
    this.context = {
      meta2d: null,
      renderer: RendererFactory.create('canvas'),
      options: { ...EditorCore.DEFAULT_OPTIONS },
      state: this.getDefaultState(),
      initialized: false,
    }

    // 创建状态机（需要上下文）
    this.stateMachine = new StateMachine(this.context, this.eventBus)

    // 配置状态机
    this.setupStateMachine()
  }

  /**
   * 注册核心服务到IoC容器
   */
  private registerServices(): void {
    // 注册事件总线（单例）
    this.container.registerSingleton(EventBus, EventBus)

    // 注册命令管理器（单例）
    this.container.registerSingleton(
      CommandManager,
      CommandManager,
      [EventBus]
    )

    // 注册插件管理器（单例）
    this.container.registerSingleton(
      PluginManager,
      PluginManager,
      [EventBus]
    )

  }

  /**
   * 获取默认状态
   */
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

  /**
   * 配置状态机状态和转换
   */
  private setupStateMachine(): void {
    // 定义状态
    const idleState: IState<EditorContext> = {
      name: 'idle',
      onEnter: (context) => {
        console.log('[Editor] 进入空闲状态')
        context.state.isDrawing = false
        context.state.isDragging = false
      },
    }

    const drawingState: IState<EditorContext> = {
      name: 'drawing',
      onEnter: (context) => {
        console.log('[Editor] 进入绘图状态')
        context.state.isDrawing = true
      },
      onExit: (context) => {
        context.state.isDrawing = false
      },
    }

    const draggingState: IState<EditorContext> = {
      name: 'dragging',
      onEnter: (context) => {
        console.log('[Editor] 进入拖拽状态')
        context.state.isDragging = true
      },
      onExit: (context) => {
        context.state.isDragging = false
      },
    }

    const selectingState: IState<EditorContext> = {
      name: 'selecting',
      onEnter: () => {
        console.log('[Editor] 进入选择状态')
      },
    }

    // 添加状态到状态机
    this.stateMachine.addStates([idleState, drawingState, draggingState, selectingState])

    // 定义状态转换
    this.stateMachine.addTransitions([
      // 从 null 到 idle（初始化）
      { from: 'null', to: 'idle' },
      // idle 到其他状态
      { from: 'idle', to: 'drawing' },
      { from: 'idle', to: 'dragging' },
      { from: 'idle', to: 'selecting' },
      // 其他状态返回 idle
      { from: 'drawing', to: 'idle' },
      { from: 'dragging', to: 'idle' },
      { from: 'selecting', to: 'idle' },
    ])
  }

  /**
   * 初始化编辑器
   */
  async init(options?: EditorInitOptions): Promise<void> {
    if (this.context.initialized) {
      console.warn('编辑器已初始化')
      return
    }

    try {
      // 合并选项
      const mergedOptions = { ...EditorCore.DEFAULT_OPTIONS, ...options }
      this.context.options = mergedOptions

      // 初始化渲染器
      this.renderer = options?.renderer || RendererFactory.create('canvas')
      this.renderer.initialize({
        container: mergedOptions.container,
        grid: mergedOptions.grid,
        gridSize: mergedOptions.gridSize,
        gridColor: mergedOptions.gridColor,
        rule: mergedOptions.rule,
        ruleColor: mergedOptions.ruleColor,
        backgroundColor: mergedOptions.backgroundColor,
        readonly: mergedOptions.readonly,
      })

      this.context.renderer = this.renderer
      this.context.meta2d = this.renderer.getMeta2d()

      // 设置事件桥接服务与Meta2D的连接
      if (this.context.meta2d) {
        this.eventBridgeService.setMeta2D(this.context.meta2d)
      }

      // 通过渲染器设置Meta2D选项
      this.renderer.updateOptions({
        grid: mergedOptions.grid,
        gridSize: mergedOptions.gridSize,
        gridColor: mergedOptions.gridColor,
        rule: mergedOptions.rule,
        ruleColor: mergedOptions.ruleColor,
        backgroundColor: mergedOptions.backgroundColor,
      })

      // 初始化状态机到 idle 状态
      await this.stateMachine.transitionTo('idle')

      // 初始化插件管理器
      await this.pluginManager.initialize()

      // 标记为已初始化
      this.context.initialized = true

      // 发送初始化完成事件
      this.eventBus.emit(EditorEventType.INITIALIZED, this.context)

      console.log('已成功初始化编辑器')
    } catch (error) {
      console.error('初始化编辑器失败:', error)
      this.eventBus.emit(EditorEventType.ERROR_OCCURRED, error)
      throw error
    }
  }

  /**
   * 销毁编辑器
   */
  destroy(): void {
    if (!this.context.initialized) {
      return
    }

    try {
      // 销毁渲染器
      this.renderer.destroy()

      // 销毁各模块
      this.pluginManager.destroy()
      this.commandManager.destroy()
      this.stateMachine.destroy()
      this.eventBus.destroy()

      // 清理IoC容器
      this.container.clear()

      // 重置上下文
      this.context.initialized = false
      this.context = {
        meta2d: null,
        renderer: RendererFactory.create('canvas'),
        options: { ...EditorCore.DEFAULT_OPTIONS },
        state: this.getDefaultState(),
        initialized: false,
      }

      // 发送销毁事件
      this.eventBus.emit(EditorEventType.DESTROYED)

      console.log('编辑器已成功销毁')
    } catch (error) {
      console.error('销毁编辑器失败:', error)
      this.eventBus.emit(EditorEventType.ERROR_OCCURRED, error)
    }
  }

  /**
   * 获取当前数据
   */
  getData(): any {
    this.ensureInitialized()
    return this.renderer.getData()
  }

  /**
   * 设置数据
   */
  setData(data: any): void {
    this.ensureInitialized()
    this.renderer.setData(data)
    this.eventBus.emit(EditorEventType.DATA_CHANGED, data)
  }

  /**
   * 获取选项
   */
  getOptions(): EditorOptions {
    return { ...this.context.options }
  }

  /**
   * 设置选项
   */
  setOptions(options: Partial<EditorOptions>): void {
    this.ensureInitialized()

    const newOptions = { ...this.context.options, ...options }
    this.context.options = newOptions

    // 通过渲染器更新选项
    this.renderer.updateOptions(newOptions)
  }

  /**
   * 获取当前选中项
   */
  getSelected(): any[] {
    this.ensureInitialized()
    return this.renderer.getSelected()
  }

  /**
   * 设置选中项
   */
  setSelected(pens: any[]): void {
    this.ensureInitialized()
    this.renderer.setSelected(pens)
    this.context.state.selectedPens = pens
    this.eventBus.emit(EditorEventType.SELECTION_CHANGED, pens)
  }

  /**
   * 执行命令
   */
  async executeCommand(command: AddPenCommand | DeletePensCommand | UpdatePenCommand | ClearCanvasCommand | ZoomCommand): Promise<void> {
    this.ensureInitialized()

    try {
      // CommandManager.execute 接受 commandId (string)
      await this.commandManager.execute(command.id)
      this.eventBus.emit(EditorEventType.COMMAND_EXECUTED, command)
    } catch (error) {
      console.error('无法执行命令:', error)
      this.eventBus.emit(EditorEventType.ERROR_OCCURRED, error)
    }
  }

  /**
   * 撤销操作
   */
  async undo(): Promise<void> {
    this.ensureInitialized()
    await this.commandManager.undo()
  }

  /**
   * 重做操作
   */
  async redo(): Promise<void> {
    this.ensureInitialized()
    await this.commandManager.redo()
  }

  /**
   * 缩放到适应
   */
  fitView(): void {
    this.ensureInitialized()
    this.renderer.fitView()
    const scale = this.renderer.getState().scale
    this.context.state.scale = scale
    this.eventBus.emit(EditorEventType.SCALE_CHANGED, scale)
  }

  /**
   * 缩放到指定比例
   */
  zoomTo(scale: number, center?: { x: number; y: number }): void {
    this.ensureInitialized()
    this.renderer.zoom(scale, center)
    this.context.state.scale = scale
    this.eventBus.emit(EditorEventType.SCALE_CHANGED, scale)
  }

  /**
   * 获取当前缩放比例
   */
  getScale(): number {
    this.ensureInitialized()
    return this.renderer.getState().scale
  }

  /**
   * 加载插件
   */
  async loadPlugin(plugin: IPlugin): Promise<void> {
    this.ensureInitialized()
    // 使用 activate 方法加载插件
    await this.pluginManager.activate(plugin.metadata.id)
    this.eventBus.emit(EditorEventType.PLUGIN_LOADED, plugin.metadata.name)
  }

  /**
   * 卸载插件
   */
  async unloadPlugin(pluginName: string): Promise<void> {
    this.ensureInitialized()
    await this.pluginManager.deactivate(pluginName)
  }

  /**
   * 确保编辑器已初始化
   */
  private ensureInitialized(): void {
    if (!this.context.initialized) {
      throw new Error('编辑器未初始化。请先调用init()。')
    }
  }

  /**
   * 获取事件总线
   */
  getEventBus(): EventBus {
    return this.eventBus
  }

  /**
   * 获取事件桥接服务
   */
  getEventBridgeService(): EventBridgeService {
    return this.eventBridgeService
  }

  /**
   * 获取命令管理器
   */
  getCommandManager(): CommandManager {
    return this.commandManager
  }

  /**
   * 获取插件管理器
   */
  getPluginManager(): PluginManager {
    return this.pluginManager
  }

  /**
   * 获取状态机
   */
  getStateMachine(): StateMachine {
    return this.stateMachine
  }

  /**
   * 获取上下文
   */
  getContext(): EditorContext {
    return this.context
  }
}

/**
 * 创建编辑器实例的工厂函数
 */
export function createEditor(): EditorCore {
  return new EditorCore()
}

/**
 * 编辑器选项类型导出
 */
export type { EditorOptions, EditorInitOptions, EditorState, EditorContext, EditorEventType, EditorMode }
