/**
 * IoC 容器 - 依赖注入核心
 * @description 实现依赖注入和控制反转，管理所有服务的生命周期
 * @author MC.Yang
 */

/** 服务标识符类型 */
export type ServiceIdentifier<T = any> = string | symbol | { new (...args: any[]): T }

/** 服务生命周期 */
export enum Lifecycle {
  /** 单例模式 - 全局唯一实例 */
  Singleton = 'singleton',
  /** 瞬态模式 - 每次请求创建新实例 */
  Transient = 'transient',
  /** 作用域模式 - 在特定作用域内单例 */
  Scoped = 'scoped',
}

/** 服务描述符 */
interface ServiceDescriptor<T = any> {
  identifier: ServiceIdentifier<T>
  implementation: { new (...args: any[]): T } | (() => T)
  lifecycle: Lifecycle
  dependencies: ServiceIdentifier[]
  instance?: T
}

/**
 * IoC 容器类
 */
export class Container {
  private services = new Map<ServiceIdentifier, ServiceDescriptor>()
  private scopedInstances = new Map<ServiceIdentifier, any>()
  private resolving = new Set<ServiceIdentifier>()

  /**
   * 注册服务
   */
  register<T>(
    identifier: ServiceIdentifier<T>,
    implementation: { new (...args: any[]): T } | (() => T),
    lifecycle: Lifecycle = Lifecycle.Singleton,
    dependencies: ServiceIdentifier[] = []
  ): this {
    this.services.set(identifier, {
      identifier,
      implementation,
      lifecycle,
      dependencies,
    })
    return this
  }

  /**
   * 注册单例服务
   */
  registerSingleton<T>(
    identifier: ServiceIdentifier<T>,
    implementation: { new (...args: any[]): T } | (() => T),
    dependencies: ServiceIdentifier[] = []
  ): this {
    return this.register(identifier, implementation, Lifecycle.Singleton, dependencies)
  }

  /**
   * 注册瞬态服务
   */
  registerTransient<T>(
    identifier: ServiceIdentifier<T>,
    implementation: { new (...args: any[]): T } | (() => T),
    dependencies: ServiceIdentifier[] = []
  ): this {
    return this.register(identifier, implementation, Lifecycle.Transient, dependencies)
  }

  /**
   * 解析服务实例
   */
  resolve<T>(identifier: ServiceIdentifier<T>): T {
    const descriptor = this.services.get(identifier)
    if (!descriptor) {
      throw new Error(`服务未注册: ${String(identifier)}`)
    }

    // 检测循环依赖
    if (this.resolving.has(identifier)) {
      throw new Error(`检测到循环依赖关系: ${String(identifier)}`)
    }

    // 单例模式
    if (descriptor.lifecycle === Lifecycle.Singleton && descriptor.instance) {
      return descriptor.instance as T
    }

    // 作用域模式
    if (descriptor.lifecycle === Lifecycle.Scoped) {
      const scopedInstance = this.scopedInstances.get(identifier)
      if (scopedInstance) {
        return scopedInstance as T
      }
    }

    // 创建实例
    this.resolving.add(identifier)
    try {
      const instance = this.createInstance(descriptor)

      // 保存实例
      if (descriptor.lifecycle === Lifecycle.Singleton) {
        descriptor.instance = instance
      } else if (descriptor.lifecycle === Lifecycle.Scoped) {
        this.scopedInstances.set(identifier, instance)
      }

      return instance as T
    } finally {
      this.resolving.delete(identifier)
    }
  }

  /**
   * 创建服务实例
   */
  private createInstance<T>(descriptor: ServiceDescriptor<T>): T {
    const { implementation, dependencies } = descriptor

    // 解析依赖
    const resolvedDeps = dependencies.map((dep) => this.resolve(dep))

    // 创建实例
    if (typeof implementation === 'function') {
      // 类构造函数
      if (implementation.prototype) {
        return new (implementation as any)(...resolvedDeps)
      }
      // 工厂函数
      return (implementation as () => T)()
    }

    throw new Error('无效的实现类型')
  }

  /**
   * 清除作用域实例
   */
  clearScope(): void {
    this.scopedInstances.clear()
  }

  /**
   * 清除所有服务
   */
  clear(): void {
    this.services.clear()
    this.scopedInstances.clear()
    this.resolving.clear()
  }
}
