/**
 * 插件系统 - 可扩展架构
 * @description 实现插件架构，支持生命周期管理和依赖解析
 * @author MC.Yang
 */

import { EventBus } from '@/core'

/** 插件元数据 */
export interface PluginMetadata {
  /** 插件ID */
  id: string
  /** 插件名称 */
  name: string
  /** 插件版本 */
  version: string
  /** 插件描述 */
  description?: string
  /** 依赖的插件ID列表 */
  dependencies?: string[]
}

/** 插件上下文 */
export interface PluginContext {
  /** 事件总线 */
  eventBus: EventBus
  /** 其他扩展数据 */
  [key: string]: any
}

/** 插件接口 */
export interface IPlugin {
  /** 插件元数据 */
  readonly metadata: PluginMetadata
  /** 激活插件 */
  activate(context: PluginContext): void | Promise<void>
  /** 停用插件 */
  deactivate?(context: PluginContext): void | Promise<void>
}

/** 插件状态 */
export enum PluginState {
  /** 未安装 */
  Uninstalled = 'uninstalled',
  /** 已安装 */
  Installed = 'installed',
  /** 激活中 */
  Activating = 'activating',
  /** 已激活 */
  Activated = 'activated',
  /** 停用中 */
  Deactivating = 'deactivating',
  /** 错误 */
  Error = 'error',
}

/** 插件描述符 */
interface PluginDescriptor {
  plugin: IPlugin
  state: PluginState
  error?: Error
}

/**
 * 插件管理器
 */
export class PluginManager {
  private plugins = new Map<string, PluginDescriptor>()
  private eventBus: EventBus
  private context: PluginContext

  constructor(eventBus?: EventBus) {
    this.eventBus = eventBus || new EventBus()
    this.context = {
      eventBus: this.eventBus,
    }
  }

  /**
   * 注册插件
   */
  register(plugin: IPlugin): void {
    const { id } = plugin.metadata

    if (this.plugins.has(id)) {
      throw new Error(`[PluginManager] 插件 "${id}" 已注册`)
    }

    this.plugins.set(id, {
      plugin,
      state: PluginState.Installed,
    })

    this.eventBus.emitSync('plugin:registered', { pluginId: id })
  }

  /**
   * 批量注册插件
   */
  registerPlugins(plugins: IPlugin[]): void {
    plugins.forEach((plugin) => this.register(plugin))
  }

  /**
   * 激活插件
   */
  async activate(pluginId: string): Promise<void> {
    const descriptor = this.plugins.get(pluginId)
    if (!descriptor) {
      throw new Error(`[PluginManager] 插件 "${pluginId}" 未找到`)
    }

    if (descriptor.state === PluginState.Activated) {
      console.warn(`[PluginManager] 插件 "${pluginId}" 已激活`)
      return
    }

    // 检查依赖
    const dependencies = descriptor.plugin.metadata.dependencies || []
    for (const depId of dependencies) {
      const depDescriptor = this.plugins.get(depId)
      if (!depDescriptor) {
        throw new Error(`[PluginManager] 依赖关系 "${depId}" 找不到插件 "${pluginId}"`)
      }
      if (depDescriptor.state !== PluginState.Activated) {
        // 自动激活依赖
        await this.activate(depId)
      }
    }

    try {
      descriptor.state = PluginState.Activating
      await descriptor.plugin.activate(this.context)
      descriptor.state = PluginState.Activated
      this.eventBus.emitSync('plugin:activated', { pluginId })
    } catch (error) {
      descriptor.state = PluginState.Error
      descriptor.error = error as Error
      this.eventBus.emitSync('plugin:error', { pluginId, error })
      throw error
    }
  }

  /**
   * 停用插件
   */
  async deactivate(pluginId: string): Promise<void> {
    const descriptor = this.plugins.get(pluginId)
    if (!descriptor) {
      throw new Error(`[PluginManager] 插件 "${pluginId}" 未找到`)
    }

    if (descriptor.state !== PluginState.Activated) {
      console.warn(`[PluginManager] 插件 "${pluginId}" 未激活`)
      return
    }

    // 检查是否有其他插件依赖此插件
    for (const [id, desc] of this.plugins.entries()) {
      if (desc.state === PluginState.Activated) {
        const deps = desc.plugin.metadata.dependencies || []
        if (deps.includes(pluginId)) {
          throw new Error(`[PluginManager] 无法停用 "${pluginId}", 插件 "${id}" 取决于它`)
        }
      }
    }

    try {
      descriptor.state = PluginState.Deactivating
      if (descriptor.plugin.deactivate) {
        await descriptor.plugin.deactivate(this.context)
      }
      descriptor.state = PluginState.Installed
      this.eventBus.emitSync('plugin:deactivated', { pluginId })
    } catch (error) {
      descriptor.state = PluginState.Error
      descriptor.error = error as Error
      throw error
    }
  }

  /**
   * 激活所有插件
   */
  async activateAll(): Promise<void> {
    const sorted = this.sortByDependencies()
    for (const pluginId of sorted) {
      await this.activate(pluginId)
    }
  }

  /**
   * 停用所有插件
   */
  async deactivateAll(): Promise<void> {
    const sorted = this.sortByDependencies().reverse()
    for (const pluginId of sorted) {
      const descriptor = this.plugins.get(pluginId)
      if (descriptor?.state === PluginState.Activated) {
        await this.deactivate(pluginId)
      }
    }
  }

  /**
   * 按依赖关系排序插件
   */
  private sortByDependencies(): string[] {
    const sorted: string[] = []
    const visited = new Set<string>()

    const visit = (pluginId: string) => {
      if (visited.has(pluginId)) return

      const descriptor = this.plugins.get(pluginId)
      if (!descriptor) return

      const dependencies = descriptor.plugin.metadata.dependencies || []
      for (const depId of dependencies) {
        visit(depId)
      }

      visited.add(pluginId)
      sorted.push(pluginId)
    }

    for (const pluginId of this.plugins.keys()) {
      visit(pluginId)
    }

    return sorted
  }

  /**
   * 获取插件状态
   */
  getPluginState(pluginId: string): PluginState | undefined {
    return this.plugins.get(pluginId)?.state
  }

  /**
   * 获取所有插件
   */
  getAllPlugins(): PluginMetadata[] {
    return Array.from(this.plugins.values()).map((d) => d.plugin.metadata)
  }

  /**
   * 初始化插件管理器
   */
  async initialize(): Promise<void> {
    // 可以在这里进行初始化工作
    this.eventBus.emitSync('plugin-manager:initialized', {})
  }

  /**
   * 销毁插件管理器
   */
  destroy(): void {
    this.deactivateAll().catch((error) => {
      console.error('[PluginManager] 销毁过程中出错:', error)
    })
    this.plugins.clear()
    this.eventBus.emitSync('plugin-manager:destroyed', {})
  }

  /**
   * 设置上下文数据
   */
  setContextData(key: string, value: any): void {
    this.context[key] = value
  }
}
