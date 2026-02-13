/**
 * Canvas 渲染器
 * @description 基于 Canvas 2D 的渲染器实现
 * @author MC.Yang
 */

import { BaseRenderer } from './BaseRenderer'
import type { RendererOptions, RendererType } from './IRenderer'
import { Meta2d } from '@meta2d/core'
import type { Options } from '@meta2d/core'

/**
 * Canvas 渲染器
 */
export class CanvasRenderer extends BaseRenderer {
  /**
   * 获取渲染器类型
   */
  getType(): RendererType {
    return 'canvas'
  }

  /**
   * 初始化渲染器
   * @description 创建 Meta2D 实例或复用现有实例
   */
  initialize(options: RendererOptions): void {
    super.initialize(options)
    if (this.meta2d) {
      return
    }

    // 没有容器则无法创建实例
    const container = this.getContainerElement()
    if (!container) {
      console.warn('[CanvasRenderer] 容器元素不存在，且 window.meta2d 不存在')
      return
    }

    // 创建新的 Meta2D 实例
    const meta2dOptions = this.buildMeta2dOptions()

    try {
      this.meta2d = new Meta2d(container, meta2dOptions)
      this.updateStateFromMeta2d()
      this.state.initialized = true
      console.log('[CanvasRenderer] Meta2D 实例创建完成')
    } catch (error) {
      console.error('[CanvasRenderer] 初始化 Meta2D 失败:', error)
      throw error
    }
  }

  /**
   * 获取容器元素
   */
  private getContainerElement(): HTMLElement | null {
    const { container } = this.options
    if (!container) return null

    if (typeof container === 'string') {
      return document.getElementById(container)
    }
    return container
  }

  /**
   * 构建 Meta2D 选项
   */
  private buildMeta2dOptions(): Options {
    const { container, width, height, grid, gridSize, gridColor, rule, ruleColor, backgroundColor, readonly, ...rest } = this.options

    return {
      width,
      height,
      grid,
      gridSize,
      gridColor,
      rule,
      ruleColor,
      background: backgroundColor,
      readonly,
      ...rest,
    } as Options
  }

  /**
   * 从 Meta2D 实例更新状态
   */
  private updateStateFromMeta2d(): void {
    if (!this.meta2d) return

    const canvas = (this.meta2d as any).canvas
    if (canvas) {
      this.state.width = canvas.width || 0
      this.state.height = canvas.height || 0
    }

    // 监听 Meta2D 内部状态变化
    const store = (this.meta2d as any).store
    if (store?.data) {
      this.state.scale = store.data.scale || 1
    }
  }

  /**
   * 获取 Canvas 元素
   */
  getCanvas(): HTMLCanvasElement | null {
    if ((this.meta2d as any)?.canvas) {
      return (this.meta2d as any).canvas as HTMLCanvasElement
    }
    return null
  }

  /**
   * 获取 Canvas 上下文
   */
  getContext(): CanvasRenderingContext2D | null {
    const canvas = this.getCanvas()
    return canvas?.getContext('2d') || null
  }
}
