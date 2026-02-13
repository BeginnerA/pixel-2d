/**
 * 基础渲染器
 * @description 提供渲染器的通用实现
 * @author MC.Yang
 */

import type { Meta2d, Pen, Point } from '@meta2d/core'
import type { IRenderer, RendererOptions, RendererState, RendererType, ToImageOptions } from './IRenderer'

/**
 * 基础渲染器抽象类
 */
export abstract class BaseRenderer implements IRenderer {
  /** Meta2D 实例 */
  protected meta2d: Meta2d | null = null

  /** 渲染器选项 */
  protected options: RendererOptions = {}

  /** 渲染器状态 */
  protected state: RendererState = {
    width: 0,
    height: 0,
    scale: 1,
    center: { x: 0, y: 0 },
    isRendering: false,
    initialized: false,
  }

  /**
   * 获取渲染器类型
   */
  abstract getType(): RendererType

  /**
   * 初始化渲染器
   */
  initialize(options: RendererOptions): void | Promise<void> {
    this.options = { ...this.getDefaultOptions(), ...options }

    if (options.container) {
      const container = typeof options.container === 'string'
        ? document.querySelector(options.container) as HTMLElement
        : options.container

      if (container) {
        this.state.width = options.width || container.clientWidth || 800
        this.state.height = options.height || container.clientHeight || 600
      }
    }
  }

  /**
   * 渲染场景
   */
  render(): void {
    if (this.meta2d) {
      (this.meta2d as any).render()
    }
    this.state.isRendering = false
  }

  /**
   * 清空画布
   */
  clear(): void {
    if (this.meta2d) {
      (this.meta2d as any).clear()
    }
  }

  /**
   * 调整大小
   */
  resize(width: number, height: number): void {
    this.state.width = width
    this.state.height = height

    if (this.meta2d) {
      (this.meta2d as any).resize(width, height)
    }
  }

  /**
   * 销毁渲染器
   */
  destroy(): void {
    if (this.meta2d) {
      (this.meta2d as any).destroy()
    }
    this.meta2d = null
    this.options = {}
    this.state = {
      width: 0,
      height: 0,
      scale: 1,
      center: { x: 0, y: 0 },
      isRendering: false,
      initialized: false,
    }
  }

  /**
   * 获取渲染器状态
   */
  getState(): RendererState {
    return { ...this.state }
  }

  /**
   * 获取 Meta2D 实例
   */
  getMeta2d(): Meta2d | null {
    return this.meta2d
  }

  /**
   * 更新选项
   */
  updateOptions(options: Partial<RendererOptions>): void {
    this.options = { ...this.options, ...options }

    if (this.meta2d) {
      (this.meta2d as any).setOptions(options)
    }
  }

  /**
   * 缩放画布
   */
  zoom(scale: number, center?: Point): void {
    if (this.meta2d) {
      (this.meta2d as any).zoom(scale, center)
      this.state.scale = scale
    }
  }

  /**
   * 平移画布
   */
  pan(x: number, y: number): void {
    if (this.meta2d) {
      (this.meta2d as any).pan(x, y)
      this.state.center = { x, y }
    }
  }

  /**
   * 导出为图片
   */
  toImage(options?: ToImageOptions): string | Promise<string> {
    if (!this.meta2d) {
      return ''
    }

    const defaultOptions = {
      format: 'png' as const,
      quality: 1,
      scale: 1,
    }

    const opts = { ...defaultOptions, ...options }

    return (this.meta2d as any).toImage(opts.format, opts.quality, opts.scale)
  }

  /**
   * 获取光标位置对应的画布坐标
   */
  getCanvasPoint(screenPoint: Point): Point {
    if (this.meta2d) {
      return (this.meta2d as any).getCanvasPoint(screenPoint)
    }
    return screenPoint
  }

  /**
   * 适应视图
   */
  fitView(): void {
    if (this.meta2d) {
      (this.meta2d as any).fitView()
      this.state.scale = (this.meta2d as any).store?.data?.scale || 1
    }
  }

  /**
   * 获取数据
   */
  getData(): any {
    return this.meta2d ? (this.meta2d as any).store?.data : {}
  }

  /**
   * 设置数据
   */
  setData(data: any): void {
    if (this.meta2d) {
      (this.meta2d as any).open(data)
    }
  }

  /**
   * 获取选中项
   */
  getSelected(): Pen[] {
    return this.meta2d ? (this.meta2d as any).store?.active || [] : []
  }

  /**
   * 设置选中项
   */
  setSelected(pens: Pen[]): void {
    if (this.meta2d) {
      (this.meta2d as any).active(pens)
    }
  }

  /**
   * 添加图元
   */
  async addPens(pens: Pen[]): Promise<void> {
    if (this.meta2d) {
      await (this.meta2d as any).addPens(pens)
    }
  }

  /**
   * 删除图元
   */
  deletePens(pens: Pen[]): void {
    if (this.meta2d) {
      (this.meta2d as any).delete(pens)
    }
  }

  /**
   * 更新图元属性
   */
  updatePen(id: string, props: Partial<Pen>): void {
    if (this.meta2d) {
      (this.meta2d as any).setValue({ id, ...props })
    }
  }

  /**
   * 获取默认选项
   */
  protected getDefaultOptions(): RendererOptions {
    return {
      grid: true,
      gridSize: 20,
      gridColor: '#e0e0e0',
      rule: true,
      ruleColor: '#888',
      backgroundColor: '#ffffff',
      readonly: false,
    }
  }
}
