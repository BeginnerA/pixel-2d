/**
 * 渲染器接口
 * @description 定义渲染层抽象接口，支持不同的渲染引擎实现
 * @author MC.Yang
 */

/** 渲染器选项 */
export interface RendererOptions {
  /** 容器元素 */
  container: HTMLElement | string
  /** 是否显示网格 */
  grid?: boolean
  /** 网格大小 */
  gridSize?: number
  /** 是否显示标尺 */
  ruler?: boolean
  /** 其他选项 */
  [key: string]: any
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
  /** 获取原生实例 */
  getNativeInstance(): any
}
