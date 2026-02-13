/**
 * 渲染器工厂
 * @description 创建和管理不同类型的渲染器
 * @author MC.Yang
 */

import type { IRenderer, RendererOptions, RendererType } from './IRenderer'
import { CanvasRenderer } from './CanvasRenderer'

/**
 * 渲染器工厂类
 */
export class RendererFactory {
  /** 渲染器类型映射 */
  private static rendererMap: Map<RendererType, new () => IRenderer> = new Map([
    ['canvas', CanvasRenderer],
    // 未来可以注册更多渲染器
    // ['webgl', WebGLRenderer],
    // ['svg', SVGRenderer],
  ])

  /**
   * 创建渲染器
   * @param type 渲染器类型
   * @param options 渲染器选项（可选）
   * @returns 渲染器实例（未初始化）
   */
  static create(type: RendererType = 'canvas', options?: RendererOptions): IRenderer {
    const RendererClass = this.rendererMap.get(type)

    if (!RendererClass) {
      throw new Error(`不支持的渲染器类型: ${type}`)
    }

    const renderer = new RendererClass()
    
    // 如果提供了选项，则同步初始化（保持向后兼容）
    // 但不等待异步完成，调用者应显式 await renderer.initialize()
    if (options) {
      renderer.initialize(options)
    }

    return renderer
  }

  /**
   * 注册渲染器
   */
  static register(type: RendererType, rendererClass: new () => IRenderer): void {
    this.rendererMap.set(type, rendererClass)
  }

  /**
   * 获取支持的渲染器类型
   */
  static getSupportedTypes(): RendererType[] {
    return Array.from(this.rendererMap.keys())
  }
}
