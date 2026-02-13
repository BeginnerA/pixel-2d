/**
 * 编辑器事件常量
 * @description 定义所有编辑器相关的事件类型
 * @author MC.Yang
 */

/**
 * 编辑器核心事件类型
 */
export enum EditorEvents {
  // 生命周期事件
  INITIALIZED = 'editor:initialized',
  DESTROYED = 'editor:destroyed',
  ERROR_OCCURRED = 'editor:error',

  // 状态变更事件
  SELECTION_CHANGED = 'editor:selection-changed',
  SCALE_CHANGED = 'editor:scale-changed',
  DATA_CHANGED = 'editor:data-changed',
  OPTIONS_CHANGED = 'editor:options-changed',

  // 命令事件
  COMMAND_EXECUTED = 'editor:command-executed',
  COMMAND_UNDO = 'editor:command-undo',
  COMMAND_REDO = 'editor:command-redo',

  // 插件事件
  PLUGIN_LOADED = 'editor:plugin-loaded',
  PLUGIN_UNLOADED = 'editor:plugin-unloaded',

  // 渲染事件
  RENDER_START = 'editor:render-start',
  RENDER_COMPLETE = 'editor:render-complete',
  RENDER_ERROR = 'editor:render-error',
}

/**
 * Meta2D 原生事件映射
 */
export enum Meta2DEvents {
  // 选择相关
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  UPDATE = 'update',
  
  // 编辑相关
  RESIZE_PENS = 'resizePens',
  ROTATE_PENS = 'rotatePens',
  VALUE_UPDATE = 'valueUpdate',
  EDIT_PEN = 'editPen',
  
  // 画布相关
  SCALE = 'scale',
  TRANSLATE = 'translate',
  FIT_VIEW = 'fitView',
  
  // 数据相关
  OPEN = 'open',
  SAVE = 'save',
  CLEAR = 'clear',
  
  // 历史相关
  UNDO = 'undo',
  REDO = 'redo',
}

/**
 * 事件数据接口
 */
export interface EditorEventData {
  [EditorEvents.INITIALIZED]: { context: any }
  [EditorEvents.DESTROYED]: void
  [EditorEvents.ERROR_OCCURRED]: Error | unknown
  
  [EditorEvents.SELECTION_CHANGED]: any[]
  [EditorEvents.SCALE_CHANGED]: number
  [EditorEvents.DATA_CHANGED]: any
  [EditorEvents.OPTIONS_CHANGED]: any
  
  [EditorEvents.COMMAND_EXECUTED]: { command: any }
  [EditorEvents.COMMAND_UNDO]: { command: any }
  [EditorEvents.COMMAND_REDO]: { command: any }
  
  [EditorEvents.PLUGIN_LOADED]: { pluginName: string }
  [EditorEvents.PLUGIN_UNLOADED]: { pluginName: string }
  
  [EditorEvents.RENDER_START]: void
  [EditorEvents.RENDER_COMPLETE]: void
  [EditorEvents.RENDER_ERROR]: Error
}

/**
 * 事件处理器类型
 */
export type EditorEventHandler<T extends keyof EditorEventData = any> = (
  data: EditorEventData[T]
) => void | Promise<void>

/**
 * 通用事件处理器
 */
export type GenericEventHandler = (data?: any) => void | Promise<void>