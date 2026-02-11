/**
 * Meta2D 渲染器实现
 * @description 基于 Meta2D 引擎的渲染器实现
 * @author MC.Yang
 */

import { Meta2d } from '@meta2d/core'
import type { IRenderer, RendererOptions } from './IRenderer'

/**
 * Meta2D 渲染器
 */
export class Meta2DRenderer implements IRenderer {
  private meta2d: Meta2d | null = null

  /**
   * 初始化渲染器
   */
  initialize(options: RendererOptions): void {
    const { container, grid = true, gridSize = 10, ruler = true, ...rest } = options

    this.meta2d = new Meta2d(container, {
      grid,
      gridSize,
      rule: ruler,
      ...rest,
    })
  }

  /**
   * 渲染场景
   */
  render(): void {
    this.meta2d?.render()
  }

  /**
   * 清空画布
   */
  clear(): void {
    this.meta2d?.clear()
  }

  /**
   * 调整大小
   */
  resize(width: number, height: number): void {
    this.meta2d?.resize(width, height)
  }

  /**
   * 销毁渲染器
   */
  destroy(): void {
    this.meta2d?.destroy()
    this.meta2d = null
  }

  /**
   * 获取 Meta2D 实例
   */
  getNativeInstance(): Meta2d | null {
    return this.meta2d
  }
}
