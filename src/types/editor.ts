/**
 * 编辑器类型定义
 * @description 定义编辑器核心相关的类型和接口
 * @author MC.Yang
 */

import type { Meta2d, Pen, Point, Options } from '@meta2d/core'
import type { ICommand, IPlugin, IState, IRenderer } from '@/core'

/**
 * 编辑器基础选项配置
 */
export interface EditorOptions extends Options {
  /** 容器元素或选择器 */
  container?: string | HTMLElement
  /** 是否启用网格 */
  grid?: boolean
  /** 网格大小 */
  gridSize?: number
  /** 网格颜色 */
  gridColor?: string
  /** 是否启用标尺 */
  rule?: boolean
  /** 标尺颜色 */
  ruleColor?: string
  /** 背景颜色 */
  backgroundColor?: string
  /** 背景图片 */
  backgroundImage?: string
  /** 是否只读模式 */
  readonly?: boolean
  /** 缩放比例 */
  scale?: number
  /** 最小缩放比例 */
  minScale?: number
  /** 最大缩放比例 */
  maxScale?: number
}

/**
 * 编辑器初始化配置
 */
export interface EditorInitOptions extends EditorOptions {
  /** 渲染器实例 */
  renderer?: IRenderer
  /** 是否自动初始化 */
  autoInit?: boolean
}

/**
 * 编辑器状态接口
 */
export interface EditorState extends IState {
  /** 当前选中的图元 */
  selectedPens: Pen[]
  /** 当前鼠标位置 */
  mousePosition: Point
  /** 当前缩放级别 */
  scale: number
  /** 当前视图中心点 */
  center: Point
  /** 是否正在绘制 */
  isDrawing: boolean
  /** 是否正在拖拽 */
  isDragging: boolean
  /** 是否只读模式 */
  readonly: boolean
}

/**
 * 编辑器事件类型
 */
export enum EditorEventType {
  /** 初始化完成 */
  INITIALIZED = 'initialized',
  /** 销毁 */
  DESTROYED = 'destroyed',
  /** 数据变更 */
  DATA_CHANGED = 'dataChanged',
  /** 选中变更 */
  SELECTION_CHANGED = 'selectionChanged',
  /** 缩放变更 */
  SCALE_CHANGED = 'scaleChanged',
  /** 视图变更 */
  VIEW_CHANGED = 'viewChanged',
  /** 模式变更 */
  MODE_CHANGED = 'modeChanged',
  /** 命令执行 */
  COMMAND_EXECUTED = 'commandExecuted',
  /** 插件加载 */
  PLUGIN_LOADED = 'pluginLoaded',
  /** 错误发生 */
  ERROR_OCCURRED = 'errorOccurred',
}

/**
 * 编辑器模式枚举
 */
export enum EditorMode {
  /** 默认模式 */
  DEFAULT = 'default',
  /** 选择模式 */
  SELECT = 'select',
  /** 绘制模式 */
  DRAW = 'draw',
  /** 连线模式 */
  CONNECT = 'connect',
  /** 手型模式 */
  HAND = 'hand',
}

/**
 * 编辑器核心接口
 */
export interface IEditorCore {
  /** 初始化编辑器 */
  init(options?: EditorInitOptions): Promise<void>
  /** 销毁编辑器 */
  destroy(): void
  /** 获取当前数据 */
  getData(): any
  /** 设置数据 */
  setData(data: any): void
  /** 获取选项 */
  getOptions(): EditorOptions
  /** 设置选项 */
  setOptions(options: Partial<EditorOptions>): void
  /** 获取当前选中项 */
  getSelected(): Pen[]
  /** 设置选中项 */
  setSelected(pens: Pen[]): void
  /** 执行命令 */
  executeCommand(command: ICommand): Promise<void>
  /** 撤销操作 */
  undo(): Promise<void>
  /** 重做操作 */
  redo(): Promise<void>
  /** 缩放到适应 */
  fitView(): void
  /** 缩放到指定比例 */
  zoomTo(scale: number, center?: Point): void
  /** 获取当前缩放比例 */
  getScale(): number
  /** 加载插件 */
  loadPlugin(plugin: IPlugin): Promise<void>
  /** 卸载插件 */
  unloadPlugin(pluginName: string): Promise<void>
}

/**
 * 编辑器上下文接口
 */
export interface EditorContext {
  /** Meta2D 实例 */
  meta2d: Meta2d | null
  /** 渲染器实例 */
  renderer: IRenderer
  /** 当前编辑器选项 */
  options: EditorOptions
  /** 当前状态 */
  state: EditorState
  /** 是否已初始化 */
  initialized: boolean
}
