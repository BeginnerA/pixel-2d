/**
 * 快捷键类型定义
 * @description 定义快捷键系统相关的类型和接口
 * @author MC.Yang
 */

/**
 * 快捷键作用域
 */
export type ShortcutScope = 'global' | 'canvas' | 'panel' | 'code-editor'

/**
 * 按键组合
 */
export interface KeyCombination {
  /** Ctrl 键 (Mac 上为 Cmd 键) */
  ctrl?: boolean
  /** Shift 键 */
  shift?: boolean
  /** Alt 键 (Mac 上为 Option 键) */
  alt?: boolean
  /** Meta 键 (Mac 上为 Cmd 键，Windows 上为 Win 键) */
  meta?: boolean
  /** 主键值 (如 'c', 'z', 'Delete' 等) */
  key: string
}

/**
 * 快捷键绑定
 */
export interface ShortcutBinding {
  /** 快捷键唯一标识 */
  id: string
  /** 按键组合 */
  keys: KeyCombination
  /** 执行动作 */
  action: (event: KeyboardEvent) => void | Promise<void>
  /** 作用域，默认 'global' */
  scope?: ShortcutScope
  /** 功能描述 */
  description?: string
  /** 是否启用，默认 true */
  enabled?: boolean
}

/**
 * 快捷键冲突信息
 */
export interface ShortcutConflict {
  /** 已存在的快捷键绑定 */
  existing: ShortcutBinding
  /** 尝试注册的新绑定 */
  incoming: ShortcutBinding
}

/**
 * 快捷键管理器配置
 */
export interface ShortcutManagerOptions {
  /** 是否自动监听键盘事件，默认 true */
  autoListen?: boolean
  /** 默认作用域，默认 'global' */
  defaultScope?: ShortcutScope
  /** 是否启用全局快捷键，默认 true */
  globalEnabled?: boolean
}

/**
 * 作用域标签映射
 */
export const SCOPE_LABELS: Record<ShortcutScope, string> = {
  global: '全局',
  canvas: '画布',
  panel: '属性面板',
  'code-editor': '代码编辑器',
}

/**
 * 作用域优先级（数字越大优先级越高）
 * code-editor > panel > canvas > global
 */
export const SCOPE_PRIORITY: Record<ShortcutScope, number> = {
  global: 0,
  canvas: 1,
  panel: 2,
  'code-editor': 3,
}
