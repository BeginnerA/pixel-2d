/**
 * 主题管理服务
 * @description 支持亮色/暗色/系统三种模式，管理CSS变量、TDesign主题切换和事件通知
 */

import { lightTheme } from './themes/light'
import { darkTheme } from './themes/dark'
import { EventBus } from '@/core/events/EventBus'
import { EditorEvents } from '@/core/constants/EditorEvents'

/** 主题模式类型 */
export type ThemeMode = 'light' | 'dark' | 'system'

/** 实际解析后的主题 */
export type ResolvedTheme = 'light' | 'dark'

/** 主题变更事件数据 */
export interface ThemeChangedPayload {
  /** 用户设置的模式 */
  mode: ThemeMode
  /** 实际解析后的主题 */
  resolved: ResolvedTheme
}

/**
 * 主题管理器
 * @description 管理亮暗主题切换、CSS变量更新、TDesign暗色模式集成
 */
export class ThemeManager {
  private eventBus: EventBus
  private _mode: ThemeMode = 'light'
  private _resolved: ResolvedTheme = 'light'
  private mediaQuery: MediaQueryList | null = null
  private mediaHandler: ((e: MediaQueryListEvent) => void) | null = null

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus
  }

  /**
   * 初始化主题管理器
   * @param mode 初始主题模式
   */
  init(mode: ThemeMode = 'light'): void {
    // 监听系统主题偏好变化
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      this.mediaHandler = (e: MediaQueryListEvent) => {
        if (this._mode === 'system') {
          this.applyResolvedTheme(e.matches ? 'dark' : 'light')
          this.emitThemeChanged()
        }
      }
      this.mediaQuery.addEventListener('change', this.mediaHandler)
    }

    this.setMode(mode, false)
    console.log(`[ThemeManager] 初始化完成, 模式: ${mode}, 解析主题: ${this._resolved}`)
  }

  /**
   * 获取当前主题模式
   */
  getMode(): ThemeMode {
    return this._mode
  }

  /**
   * 获取实际解析后的主题
   */
  getResolvedTheme(): ResolvedTheme {
    return this._resolved
  }

  /**
   * 是否为暗色主题
   */
  isDark(): boolean {
    return this._resolved === 'dark'
  }

  /**
   * 设置主题模式
   * @param mode 主题模式
   * @param emit 是否发出事件（初始化时可设为 false）
   */
  setMode(mode: ThemeMode, emit = true): void {
    this._mode = mode

    // 解析实际主题
    const resolved = this.resolveMode(mode)
    this.applyResolvedTheme(resolved)

    if (emit) {
      this.emitThemeChanged()
    }
  }

  /**
   * 快捷方法：设置亮色主题
   */
  setLight(): void {
    this.setMode('light')
  }

  /**
   * 快捷方法：设置暗色主题
   */
  setDark(): void {
    this.setMode('dark')
  }

  /**
   * 快捷方法：设置跟随系统
   */
  setSystem(): void {
    this.setMode('system')
  }

  /**
   * 切换亮暗主题（在 light/dark 之间切换，不影响 system 模式）
   */
  toggleTheme(): void {
    if (this._mode === 'system') {
      // system模式下，根据当前解析结果切换到对应的固定模式
      this.setMode(this._resolved === 'dark' ? 'light' : 'dark')
    } else {
      this.setMode(this._resolved === 'dark' ? 'light' : 'dark')
    }
  }

  /**
   * 获取当前主题的变量集合
   */
  getThemeVariables(): Record<string, string> {
    return this._resolved === 'dark' ? { ...darkTheme } : { ...lightTheme }
  }

  /**
   * 获取画布背景色
   */
  getCanvasBgColor(): string {
    return this._resolved === 'dark' ? darkTheme['--canvas-bg-color'] : lightTheme['--canvas-bg-color']
  }

  /**
   * 获取画布网格色
   */
  getCanvasGridColor(): string {
    return this._resolved === 'dark' ? darkTheme['--canvas-grid-color'] : lightTheme['--canvas-grid-color']
  }

  /**
   * 销毁主题管理器，清除监听
   */
  destroy(): void {
    if (this.mediaQuery && this.mediaHandler) {
      this.mediaQuery.removeEventListener('change', this.mediaHandler)
      this.mediaQuery = null
      this.mediaHandler = null
    }
    console.log('[ThemeManager] 已销毁')
  }

  // ==================== 私有方法 ====================

  /**
   * 解析主题模式为实际主题
   */
  private resolveMode(mode: ThemeMode): ResolvedTheme {
    if (mode === 'system') {
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return 'light'
    }
    return mode
  }

  /**
   * 应用解析后的主题到DOM
   */
  private applyResolvedTheme(resolved: ResolvedTheme): void {
    this._resolved = resolved
    const root = document.documentElement

    // 1. 更新 data-theme 属性
    root.setAttribute('data-theme', resolved)

    // 2. 更新CSS变量
    const variables = resolved === 'dark' ? darkTheme : lightTheme
    this.applyCSSVariables(variables)

    // 3. 更新TDesign暗色模式
    this.applyTDesignTheme(resolved)
  }

  /**
   * 将主题变量应用到 document.documentElement 的 style
   */
  private applyCSSVariables(variables: Record<string, string>): void {
    const root = document.documentElement
    for (const [key, value] of Object.entries(variables)) {
      root.style.setProperty(key, value)
    }
  }

  /**
   * 切换 TDesign 的暗色模式
   * TDesign 通过 document.documentElement 的 theme-mode 属性切换主题
   */
  private applyTDesignTheme(resolved: ResolvedTheme): void {
    const root = document.documentElement
    if (resolved === 'dark') {
      root.setAttribute('theme-mode', 'dark')
    } else {
      root.removeAttribute('theme-mode')
    }
  }

  /**
   * 发出主题变更事件
   */
  private emitThemeChanged(): void {
    const payload: ThemeChangedPayload = {
      mode: this._mode,
      resolved: this._resolved,
    }
    this.eventBus.emitSync(EditorEvents.OPTIONS_CHANGED, {
      type: 'theme',
      ...payload,
    })

    // 同时发出专用的主题变更事件
    this.eventBus.emitSync('theme:changed', payload)
  }
}

/**
 * 创建主题管理器实例
 */
export function createThemeManager(eventBus: EventBus): ThemeManager {
  return new ThemeManager(eventBus)
}
