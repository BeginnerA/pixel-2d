/**
 * 快捷键模块导出
 * @description 统一导出快捷键系统所有模块
 * @author MC.Yang
 */

// 快捷键管理器
export { ShortcutManager } from './ShortcutManager'

// 类型定义
export type {
  ShortcutBinding,
  KeyCombination,
  ShortcutScope,
  ShortcutConflict,
  ShortcutManagerOptions,
} from './shortcut-types'

export { SCOPE_LABELS, SCOPE_PRIORITY } from './shortcut-types'

// 默认快捷键配置
export { defaultShortcuts } from './default-shortcuts'
