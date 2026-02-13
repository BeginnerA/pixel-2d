/**
 * 服务注册中心
 * @description 提供服务注册和获取功能
 * @author MC.Yang
 */

import { Container } from '@/core/ioc/Container'
import { registerCoreServices, resolveCoreServices, CoreServices } from '@/core/services/CoreServices'

export class ServiceRegistry {
  private static container: Container
  private static coreServices: CoreServices | null = null

  static getContainer(): Container {
    if (!this.container) {
      this.container = new Container()
      this.registerServices()
    }
    return this.container
  }

  static getCoreServices(): CoreServices {
    if (!this.coreServices) {
      const container = this.getContainer()
      this.coreServices = resolveCoreServices(container)
    }
    return this.coreServices
  }

  private static registerServices(): void {
    const container = this.container

    // 注册核心服务
    registerCoreServices(container)
  }
}
