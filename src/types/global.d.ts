/**
 * 全局类型定义
 * @description Pixel-2D 项目的全局类型声明
 * @author MC.Yang
 */

import { Meta2d } from '@meta2d/core'
import { EventEmitter } from '@/utils/event-emitter'

/**
 * 全局变量声明
 */
declare global {
  /**
   * Meta2D 核心实例
   */
  let meta2d: Meta2d

  /**
   * Canvas2SVG 实例
   */
  let C2S: any

  /**
   * 全局事件总线
   */
  let editor2DEvent: EventEmitter

  /**
   * 窗口对象扩展
   */
  interface Window {
    meta2d: Meta2d
    C2S: any
    editor2DEvent: EventEmitter
  }
}

/**
 * 环境变量类型
 */
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_BASE_API: string
  readonly VITE_APP_PORT: number
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/**
 * 导出空对象以使此文件成为模块
 */
export {}
