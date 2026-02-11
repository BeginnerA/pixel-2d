/**
 * 核心模块导出
 * @description 统一导出所有核心模块
 */

// IoC 容器
export { Container, Lifecycle } from './ioc/Container'
export type { ServiceIdentifier } from './ioc/Container'

// 事件总线
export { EventBus } from './events/EventBus'
export type { EventHandler, EventInterceptor, EventListenerConfig } from './events/EventBus'

// 命令系统
export { CommandManager, Command } from './commands/CommandManager'
export type { ICommand, CommandContext } from './commands/CommandManager'

// 插件系统
export { PluginManager, PluginState } from './plugins/PluginManager'
export type { IPlugin, PluginMetadata, PluginContext } from './plugins/PluginManager'

// 渲染层
export { Meta2DRenderer } from './canvas/Meta2DRenderer'
export type { IRenderer, RendererOptions } from './canvas/IRenderer'

// 状态机
export { StateMachine } from './state/StateMachine'
export type { IState, StateTransition } from './state/StateMachine'

// 编辑器核心
export { EditorCore, createEditor, type EditorOptions } from './Editor'
