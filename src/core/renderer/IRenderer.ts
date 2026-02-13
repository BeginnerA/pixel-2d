/**
 * 渲染器接口
 * @description 定义渲染层抽象接口，支持多种渲染引擎
 * @author MC.Yang
 */

import type { Meta2d, Pen, Point } from '@meta2d/core'

/** 渲染器类型 */
export type RendererType = 'canvas' | 'webgl' | 'svg'

/** 渲染器选项 */
export interface RendererOptions {
  /** 容器元素 */
  container?: HTMLElement | string
  /** 宽度 */
  width?: number
  /** 高度 */
  height?: number
  /** 是否显示网格 */
  grid?: boolean
  /** 网格大小 */
  gridSize?: number
  /** 网格颜色 */
  gridColor?: string
  /** 是否显示标尺 */
  rule?: boolean
  /** 标尺颜色 */
  ruleColor?: string
  /** 背景色 */
  backgroundColor?: string
  /** 是否只读 */
  readonly?: boolean
  /** 其他选项 */
  [key: string]: any
}

/** 渲染器状态 */
export interface RendererState {
  width: number
  height: number
  scale: number
  center: Point
  isRendering: boolean
  initialized: boolean
}

/** 渲染器接口 */
export interface IRenderer {
  /** 初始化渲染器 */
  initialize(options: RendererOptions): void | Promise<void>
  /** 渲染场景 */
  render(): void
  /** 清空画布 */
  clear(): void
  /** 调整大小 */
  resize(width: number, height: number): void
  /** 销毁渲染器 */
  destroy(): void
  /** 获取渲染器类型 */
  getType(): RendererType
  /** 获取渲染器状态 */
  getState(): RendererState
  /** 获取 Meta2D 实例 */
  getMeta2d(): Meta2d | null
  /** 更新选项 */
  updateOptions(options: Partial<RendererOptions>): void
  /** 缩放画布 */
  zoom(scale: number, center?: Point): void
  /** 平移画布 */
  pan(x: number, y: number): void
  /** 导出为图片 */
  toImage(options?: ToImageOptions): string | Promise<string>
  /** 获取光标位置对应的画布坐标 */
  getCanvasPoint(screenPoint: Point): Point
  /** 适应视图 */
  fitView(): void
  /** 获取数据 */
  getData(): any
  /** 设置数据 */
  setData(data: any): void
  /** 获取选中项 */
  getSelected(): Pen[]
  /** 设置选中项 */
  setSelected(pens: Pen[]): void
  /** 添加图元 */
  addPens(pens: Pen[]): Promise<void>
  /** 删除图元 */
  deletePens(pens: Pen[]): void
  /** 更新图元属性 */
  updatePen(id: string, props: Partial<Pen>): void
}

/** 导出图片选项 */
export interface ToImageOptions {
  /** 背景色 */
  background?: string
  /** 缩放比例 */
  scale?: number
  /** 格式 */
  format?: 'png' | 'jpeg' | 'svg'
  /** 质量 (0-1) */
  quality?: number
}
