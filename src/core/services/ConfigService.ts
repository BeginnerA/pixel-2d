/**
 * 配置管理服务
 * @description 统一管理系统配置，包括网格、标尺、主题等设置
 * @author MC.Yang
 */

import type { Meta2d } from '@meta2d/core'
import type { EventBus } from '@/core'

/**
 * 网格配置
 */
export interface GridConfig {
  /** 是否显示网格 */
  enabled: boolean
  /** 网格颜色 */
  color: string
  /** 网格大小 */
  size: number
  /** 网格旋转角度 */
  rotate: number
}

/**
 * 标尺配置
 */
export interface RulerConfig {
  /** 是否显示标尺 */
  enabled: boolean
  /** 标尺颜色 */
  color: string
  /** 标尺选项 */
  options?: any
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  /** 主题名称 */
  name: string
  /** 背景颜色 */
  background: string
  /** 文字颜色 */
  color: string
  /** 父级背景色 */
  parentBackground: string
  /** 标尺颜色 */
  ruleColor: string
  /** 标尺选项 */
  ruleOptions: any
}

/**
 * 显示配置
 */
export interface DisplayConfig {
  /** 网格配置 */
  grid: GridConfig
  /** 标尺配置 */
  ruler: RulerConfig
  /** 背景图片 */
  backgroundImage?: string
  /** 背景颜色 */
  backgroundColor?: string
}

/**
 * 配置服务接口
 */
export interface IConfigService {
  /** 设置网格配置 */
  setGridConfig(config: Partial<GridConfig>): void
  /** 获取网格配置 */
  getGridConfig(): GridConfig
  /** 设置标尺配置 */
  setRulerConfig(config: Partial<RulerConfig>): void
  /** 获取标尺配置 */
  getRulerConfig(): RulerConfig
  /** 设置显示配置 */
  setDisplayConfig(config: Partial<DisplayConfig>): void
  /** 获取显示配置 */
  getDisplayConfig(): DisplayConfig
  /** 应用配置到Meta2D实例 */
  applyToMeta2d(meta2d: Meta2d): void
  /** 重置配置到默认值 */
  reset(): void
}

/**
 * 配置服务实现
 */
export class ConfigService implements IConfigService {
  private eventBus: EventBus
  private meta2d: Meta2d | null = null
  
  // 默认配置
  private defaultGridConfig: GridConfig = {
    enabled: true,
    color: '#e2e2e2',
    size: 10,
    rotate: 0
  }
  
  private defaultRulerConfig: RulerConfig = {
    enabled: true,
    color: '#888888',
    options: {}
  }
  
  private gridConfig: GridConfig = { ...this.defaultGridConfig }
  private rulerConfig: RulerConfig = { ...this.defaultRulerConfig }

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus
  }

  /**
   * 设置Meta2D实例
   */
  setMeta2d(meta2d: Meta2d): void {
    this.meta2d = meta2d
  }

  /**
   * 设置网格配置
   */
  setGridConfig(config: Partial<GridConfig>): void {
    this.gridConfig = { ...this.gridConfig, ...config }
    this.applyGridConfig()
    this.eventBus.emitSync('config:gridChanged', this.gridConfig)
  }

  /**
   * 获取网格配置
   */
  getGridConfig(): GridConfig {
    return { ...this.gridConfig }
  }

  /**
   * 设置标尺配置
   */
  setRulerConfig(config: Partial<RulerConfig>): void {
    this.rulerConfig = { ...this.rulerConfig, ...config }
    this.applyRulerConfig()
    this.eventBus.emitSync('config:rulerChanged', this.rulerConfig)
  }

  /**
   * 获取标尺配置
   */
  getRulerConfig(): RulerConfig {
    return { ...this.rulerConfig }
  }

  /**
   * 设置显示配置
   */
  setDisplayConfig(config: Partial<DisplayConfig>): void {
    if (config.grid) {
      this.setGridConfig(config.grid)
    }
    if (config.ruler) {
      this.setRulerConfig(config.ruler)
    }
    if (config.backgroundImage !== undefined) {
      this.setBackgroundImage(config.backgroundImage)
    }
    if (config.backgroundColor !== undefined) {
      this.setBackgroundColor(config.backgroundColor)
    }
  }

  /**
   * 获取显示配置
   */
  getDisplayConfig(): DisplayConfig {
    return {
      grid: this.getGridConfig(),
      ruler: this.getRulerConfig(),
      backgroundImage: this.meta2d?.store?.data?.bkImage,
      backgroundColor: this.meta2d?.store?.data?.background
    }
  }

  /**
   * 应用配置到Meta2D实例
   */
  applyToMeta2d(meta2d: Meta2d): void {
    this.meta2d = meta2d
    this.applyGridConfig()
    this.applyRulerConfig()
  }

  /**
   * 重置配置到默认值
   */
  reset(): void {
    this.gridConfig = { ...this.defaultGridConfig }
    this.rulerConfig = { ...this.defaultRulerConfig }
    this.applyGridConfig()
    this.applyRulerConfig()
    this.eventBus.emitSync('config:reset', {})
  }

  /**
   * 应用网格配置
   */
  private applyGridConfig(): void {
    if (!this.meta2d) return

    // 通过store.data直接设置网格属性
    const data = this.meta2d.store.data
    data.grid = this.gridConfig.enabled
    data.gridColor = this.gridConfig.color
    data.gridSize = this.gridConfig.size
    data.gridRotate = this.gridConfig.rotate

    // 触发背景重绘
    if (this.meta2d.canvas) {
      this.meta2d.canvas.canvasTemplate.bgPatchFlags = true
      this.meta2d.render()
    }
  }

  /**
   * 应用标尺配置
   */
  private applyRulerConfig(): void {
    if (!this.meta2d) return

    // 通过store.data直接设置标尺属性
    const data = this.meta2d.store.data
    data.rule = this.rulerConfig.enabled
    data.ruleColor = this.rulerConfig.color

    // 设置标尺选项
    if (this.rulerConfig.options && this.meta2d.store.options) {
      this.meta2d.store.options.ruleOptions = {
        ...this.meta2d.store.options.ruleOptions,
        ...this.rulerConfig.options
      }
    }

    // 触发标尺重绘
    this.meta2d.store.patchFlagsTop = true
    this.meta2d.render()
  }

  /**
   * 设置背景图片
   */
  private setBackgroundImage(imageUrl?: string): void {
    if (!this.meta2d) return
    this.meta2d.store.data.bkImage = imageUrl
    if (this.meta2d.canvas) {
      this.meta2d.canvas.canvasTemplate.bgPatchFlags = true
      this.meta2d.render()
    }
  }

  /**
   * 设置背景颜色
   */
  private setBackgroundColor(color?: string): void {
    if (!this.meta2d) return
    this.meta2d.store.data.background = color
    if (this.meta2d.canvas) {
      this.meta2d.canvas.canvasTemplate.bgPatchFlags = true
      this.meta2d.render()
    }
  }
}

/**
 * 配置服务工厂函数
 */
export function createConfigService(eventBus: EventBus): IConfigService {
  return new ConfigService(eventBus)
}