/**
 * 核心模块导出
 * @description 统一导出所有核心模块
 * @author MC.Yang
 */

// 服务注册
export { ServiceRegistry } from './services/ServiceRegistry'
export { EventBridgeService, createEventBridge } from './services/EventBridgeService'
export { CommandContextService, createCommandContextService, getMeta2DFromContext } from './services/CommandContextService'
export { registerCoreServices, resolveCoreServices, type CoreServices, type CoreServiceConfig } from './services/CoreServices'

// IoC 容器
export { Container, Lifecycle } from './ioc/Container'
export type { ServiceIdentifier } from './ioc/Container'

// 事件总线
export { EventBus } from './events/EventBus'
export type { EventHandler, EventInterceptor, EventListenerConfig } from './events/EventBus'

// 事件常量
export { EditorEvents, Meta2DEvents, type EditorEventData, type EditorEventHandler } from './constants/EditorEvents'

// 命令系统
export { CommandManager, Command } from './commands/CommandManager'
export type { ICommand, CommandContext } from './commands/CommandManager'

// 插件系统
export { PluginManager, PluginState } from './plugins/PluginManager'
export type { IPlugin, PluginMetadata, PluginContext } from './plugins/PluginManager'

// 状态管理
export { StateMachine, EditorStateManager, createEditorStateManager } from './state'
export type { IState, StateTransition, IEditorStateManager, StateChangeEvent } from './state'

// 渲染层
export { RendererFactory, CanvasRenderer, BaseRenderer } from './renderer'
export type { IRenderer, RendererOptions, RendererState, RendererType, ToImageOptions } from './renderer'

// 编辑器核心
export { EditorCore, createEditor, type EditorOptions } from './Editor'

// 生命周期管理
export { EditorLifecycle, createEditorLifecycle, type IEditorLifecycle } from './lifecycle'

// 常用命令
export {
  AddPenCommand,
  DeletePensCommand,
  UpdatePenCommand,
  ClearCanvasCommand,
  ZoomCommand,
} from './commands/CommonCommands'

