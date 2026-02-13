/**
 * 核心服务配置
 * @description 定义核心服务的注册配置和依赖关系
 * @author MC.Yang
 */

import { Container, Lifecycle } from '@/core/ioc/Container'
import { EventBus } from '@/core/events/EventBus'
import { CommandManager } from '@/core/commands/CommandManager'
import { PluginManager } from '@/core/plugins/PluginManager'
import { StateMachine } from '@/core/state/StateMachine'
import { EventBridgeService } from '@/core/services/EventBridgeService'
import { CommandContextService } from '@/core/services/CommandContextService'
import { ConfigService } from '@/core/services/ConfigService'
import { ErrorHandler } from '@/core/utils/ErrorHandler'

/**
 * 核心服务配置项
 */
export interface CoreServiceConfig {
  /** 事件总线配置 */
  eventBus?: {
    lifecycle?: Lifecycle
  }
  /** 命令管理器配置 */
  commandManager?: {
    lifecycle?: Lifecycle
  }
  /** 插件管理器配置 */
  pluginManager?: {
    lifecycle?: Lifecycle
  }
  /** 状态机配置 */
  stateMachine?: {
    lifecycle?: Lifecycle
  }
  /** 事件桥接服务配置 */
  eventBridgeService?: {
    lifecycle?: Lifecycle
  }
  /** 命令上下文服务配置 */
  commandContextService?: {
    lifecycle?: Lifecycle
  }
  /** 配置服务配置 */
  configService?: {
    lifecycle?: Lifecycle
  }
  /** 错误处理服务配置 */
  errorHandler?: {
    lifecycle?: Lifecycle
  }
}

/**
 * 默认服务配置
 */
export const DEFAULT_SERVICE_CONFIG: Required<CoreServiceConfig> = {
  eventBus: {
    lifecycle: Lifecycle.Singleton,
  },
  commandManager: {
    lifecycle: Lifecycle.Singleton,
  },
  pluginManager: {
    lifecycle: Lifecycle.Singleton,
  },
  stateMachine: {
    lifecycle: Lifecycle.Singleton,
  },
  eventBridgeService: {
    lifecycle: Lifecycle.Singleton,
  },
  commandContextService: {
    lifecycle: Lifecycle.Singleton,
  },
  configService: {
    lifecycle: Lifecycle.Singleton,
  },
  errorHandler: {
    lifecycle: Lifecycle.Singleton,
  },
}

/**
 * 注册核心服务到容器
 */
export function registerCoreServices(container: Container, config: CoreServiceConfig = {}): void {
  const mergedConfig = { ...DEFAULT_SERVICE_CONFIG, ...config }

  // 注册事件总线
  container.register(
    EventBus,
    EventBus,
    mergedConfig.eventBus.lifecycle
  )

  // 注册命令管理器（依赖事件总线）
  container.register(
    CommandManager,
    CommandManager,
    mergedConfig.commandManager.lifecycle,
    [EventBus]
  )

  // 注册插件管理器（依赖事件总线）
  container.register(
    PluginManager,
    PluginManager,
    mergedConfig.pluginManager.lifecycle,
    [EventBus]
  )

  // 注册状态机（依赖事件总线）
  container.register(
    StateMachine,
    StateMachine,
    mergedConfig.stateMachine.lifecycle,
    [EventBus]
  )

  // 注册事件桥接服务（依赖事件总线）
  container.register(
    EventBridgeService,
    EventBridgeService,
    mergedConfig.eventBridgeService.lifecycle,
    [EventBus]
  )

  // 注册命令上下文服务
  container.register(
    CommandContextService,
    CommandContextService,
    mergedConfig.commandContextService.lifecycle
  )

  // 注册配置服务（依赖事件总线）
  container.register(
    ConfigService,
    ConfigService,
    mergedConfig.configService.lifecycle,
    [EventBus]
  )

  // 注册错误处理服务（依赖事件总线）
  container.register(
    ErrorHandler,
    ErrorHandler,
    mergedConfig.errorHandler.lifecycle,
    [EventBus]
  )

  console.log('[CoreServices] 核心服务注册完成')
}

/**
 * 获取核心服务实例
 */
export interface CoreServices {
  eventBus: EventBus
  commandManager: CommandManager
  pluginManager: PluginManager
  stateMachine: StateMachine
  eventBridgeService: EventBridgeService
  commandContextService: CommandContextService
  configService: ConfigService
  errorHandler: ErrorHandler
}

/**
 * 解析所有核心服务
 */
export function resolveCoreServices(container: Container): CoreServices {
  return {
    eventBus: container.resolve(EventBus),
    commandManager: container.resolve(CommandManager),
    pluginManager: container.resolve(PluginManager),
    stateMachine: container.resolve(StateMachine),
    eventBridgeService: container.resolve(EventBridgeService),
    commandContextService: container.resolve(CommandContextService),
    configService: container.resolve(ConfigService),
    errorHandler: container.resolve(ErrorHandler),
  }
}