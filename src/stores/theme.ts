/**
 * 主题 Pinia Store
 * @description 提供响应式的主题状态管理，持久化到 localStorage
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ThemeMode, ResolvedTheme } from '@/core/theme'
import { ThemeManager, createThemeManager } from '@/core/theme'
import { ServiceRegistry } from '@/core/services/ServiceRegistry'
import { EventBus } from '@/core/events/EventBus'

const STORAGE_KEY = 'pixel-2d-theme-mode'

/**
 * 从 localStorage 读取主题模式
 */
function loadStoredMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored
    }
  } catch {
    // localStorage 不可用时忽略
  }
  return 'light'
}

/**
 * 保存主题模式到 localStorage
 */
function saveStoredMode(mode: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // localStorage 不可用时忽略
  }
}

export const useThemeStore = defineStore('theme', () => {
  // ==================== 状态 ====================

  /** 当前主题模式（用户设置） */
  const mode = ref<ThemeMode>(loadStoredMode())

  /** 实际解析后的主题 */
  const resolved = ref<ResolvedTheme>('light')

  /** 主题管理器实例 */
  let manager: ThemeManager | null = null

  // ==================== 计算属性 ====================

  /** 是否为暗色主题 */
  const isDark = computed(() => resolved.value === 'dark')

  // ==================== 方法 ====================

  /**
   * 初始化主题系统
   * @description 从 ServiceRegistry 获取 EventBus 并创建 ThemeManager
   */
  function init(): void {
    let eventBus: EventBus
    try {
      const coreServices = ServiceRegistry.getCoreServices()
      eventBus = coreServices.eventBus
    } catch {
      // ServiceRegistry 未初始化时，创建独立实例
      eventBus = new EventBus()
    }

    manager = createThemeManager(eventBus)
    manager.init(mode.value)

    // 同步状态
    mode.value = manager.getMode()
    resolved.value = manager.getResolvedTheme()

    // 监听主题变更事件，同步 store 状态
    eventBus.on<{ mode: ThemeMode; resolved: ResolvedTheme }>('theme:changed', (payload) => {
      mode.value = payload.mode
      resolved.value = payload.resolved
      saveStoredMode(payload.mode)
    })
  }

  /**
   * 设置主题模式
   */
  function setTheme(newMode: ThemeMode): void {
    if (!manager) {
      init()
    }
    manager!.setMode(newMode)
    // 状态由事件监听器同步更新，这里额外确保 localStorage 持久化
    saveStoredMode(newMode)
  }

  /**
   * 切换亮暗主题（light <-> dark）
   */
  function toggleTheme(): void {
    if (!manager) {
      init()
    }
    manager!.toggleTheme()
  }

  /**
   * 获取画布背景色
   */
  function getCanvasBgColor(): string {
    return manager?.getCanvasBgColor() ?? '#ffffff'
  }

  /**
   * 获取画布网格色
   */
  function getCanvasGridColor(): string {
    return manager?.getCanvasGridColor() ?? '#f0f0f0'
  }

  /**
   * 销毁主题系统
   */
  function destroy(): void {
    manager?.destroy()
    manager = null
  }

  return {
    // 状态
    mode,
    resolved,
    isDark,
    // 方法
    init,
    setTheme,
    toggleTheme,
    getCanvasBgColor,
    getCanvasGridColor,
    destroy,
  }
})
