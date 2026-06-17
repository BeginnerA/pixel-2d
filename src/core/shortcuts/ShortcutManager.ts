/**
 * 快捷键管理器
 * @description 管理编辑器全局快捷键的注册、匹配、冲突检测和作用域控制
 * @author MC.Yang
 */

import { EventBus } from '@/core/events/EventBus'
import {
  type ShortcutBinding,
  type KeyCombination,
  type ShortcutScope,
  type ShortcutConflict,
  type ShortcutManagerOptions,
  SCOPE_PRIORITY,
} from './shortcut-types'

/**
 * 快捷键管理器
 * @description 单例服务，管理快捷键的注册、匹配、冲突检测和作用域
 */
export class ShortcutManager {
  /** 已注册的快捷键映射 (id -> binding) */
  private shortcuts = new Map<string, ShortcutBinding>()

  /** 按键组合到快捷键ID的映射 (用于快速匹配) */
  private keyMap = new Map<string, string[]>()

  /** 当前激活的作用域栈（后进先出，栈顶为当前作用域） */
  private scopeStack: ShortcutScope[] = ['global']

  /** 全局启用/禁用 */
  private _globalEnabled = true

  /** 是否正在监听键盘事件 */
  private listening = false

  /** 键盘事件处理器引用（用于移除监听） */
  private boundKeydownHandler: (e: KeyboardEvent) => void

  /** 事件总线 */
  private eventBus: EventBus

  /** 默认选项 */
  private static readonly DEFAULT_OPTIONS: Required<ShortcutManagerOptions> = {
    autoListen: true,
    defaultScope: 'global',
    globalEnabled: true,
  }

  constructor(eventBus: EventBus, options?: ShortcutManagerOptions) {
    if (!eventBus) {
      throw new Error('[ShortcutManager] eventBus 是必需的参数')
    }
    this.eventBus = eventBus
    this._globalEnabled = options?.globalEnabled ?? ShortcutManager.DEFAULT_OPTIONS.globalEnabled

    // 绑定事件处理器上下文
    this.boundKeydownHandler = this.handleKeydown.bind(this)

    // 自动开始监听
    if (options?.autoListen ?? ShortcutManager.DEFAULT_OPTIONS.autoListen) {
      this.startListening()
    }
  }

  // ========== 注册与注销 ==========

  /**
   * 注册快捷键
   * @param binding 快捷键绑定
   * @param conflictPolicy 冲突策略: 'warn' 仅警告 | 'overwrite' 覆盖 | 'reject' 拒绝注册
   * @returns 是否注册成功
   */
  register(binding: ShortcutBinding, conflictPolicy: 'warn' | 'overwrite' | 'reject' = 'warn'): boolean {
    const normalizedBinding = this.normalizeBinding(binding)

    // 检查ID重复
    if (this.shortcuts.has(normalizedBinding.id)) {
      console.warn(`[ShortcutManager] 快捷键ID "${normalizedBinding.id}" 已注册，将覆盖`)
      this.unregister(normalizedBinding.id)
    }

    // 冲突检测
    const conflicts = this.detectConflicts(normalizedBinding)
    if (conflicts.length > 0) {
      for (const conflict of conflicts) {
        if (conflictPolicy === 'reject') {
          console.warn(
            `[ShortcutManager] 快捷键冲突，拒绝注册: "${normalizedBinding.id}" 与 "${conflict.existing.id}" 使用相同的按键组合`
          )
          return false
        }

        if (conflictPolicy === 'overwrite') {
          console.warn(
            `[ShortcutManager] 快捷键冲突，覆盖: "${conflict.existing.id}" 被 "${normalizedBinding.id}" 替代`
          )
          this.unregister(conflict.existing.id)
        } else {
          console.warn(
            `[ShortcutManager] 快捷键冲突警告: "${normalizedBinding.id}" 与 "${conflict.existing.id}" 使用相同的按键组合`
          )
        }
      }
    }

    // 注册
    this.shortcuts.set(normalizedBinding.id, normalizedBinding)
    this.addToKeyMap(normalizedBinding)

    // 发射事件
    this.eventBus.emitSync('shortcut:registered', { id: normalizedBinding.id, binding: normalizedBinding })

    return true
  }

  /**
   * 批量注册快捷键
   */
  registerMany(bindings: ShortcutBinding[], conflictPolicy: 'warn' | 'overwrite' | 'reject' = 'warn'): void {
    bindings.forEach((b) => this.register(b, conflictPolicy))
  }

  /**
   * 注销快捷键
   */
  unregister(id: string): boolean {
    const binding = this.shortcuts.get(id)
    if (!binding) {
      return false
    }

    this.removeFromKeyMap(binding)
    this.shortcuts.delete(id)

    // 发射事件
    this.eventBus.emitSync('shortcut:unregistered', { id })

    return true
  }

  // ========== 冲突检测 ==========

  /**
   * 检测按键组合冲突
   */
  detectConflicts(binding: ShortcutBinding): ShortcutConflict[] {
    const conflicts: ShortcutConflict[] = []
    const keyStr = this.keyCombinationToString(binding.keys)
    const idsWithSameKey = this.keyMap.get(keyStr)

    if (idsWithSameKey) {
      for (const existingId of idsWithSameKey) {
        const existing = this.shortcuts.get(existingId)
        if (existing && existing.id !== binding.id) {
          // 同作用域或全局作用域才判定为冲突
          const existingScope = existing.scope || 'global'
          const newScope = binding.scope || 'global'
          if (existingScope === newScope || existingScope === 'global' || newScope === 'global') {
            conflicts.push({ existing, incoming: binding })
          }
        }
      }
    }

    return conflicts
  }

  // ========== 查询API ==========

  /**
   * 获取所有已注册的快捷键
   */
  getAll(): ShortcutBinding[] {
    return Array.from(this.shortcuts.values())
  }

  /**
   * 按作用域获取快捷键
   */
  getByScope(scope: ShortcutScope): ShortcutBinding[] {
    return this.getAll().filter((b) => (b.scope || 'global') === scope)
  }

  /**
   * 判断快捷键是否已注册
   */
  isRegistered(id: string): boolean {
    return this.shortcuts.has(id)
  }

  /**
   * 根据ID获取快捷键
   */
  getById(id: string): ShortcutBinding | undefined {
    return this.shortcuts.get(id)
  }

  // ========== 启用/禁用 ==========

  /**
   * 全局启用/禁用快捷键
   */
  setGlobalEnabled(enabled: boolean): void {
    this._globalEnabled = enabled
    this.eventBus.emitSync('shortcut:global-toggled', { enabled })
  }

  /**
   * 获取全局启用状态
   */
  isGlobalEnabled(): boolean {
    return this._globalEnabled
  }

  /**
   * 启用/禁用单个快捷键
   */
  setEnabled(id: string, enabled: boolean): boolean {
    const binding = this.shortcuts.get(id)
    if (!binding) {
      return false
    }
    binding.enabled = enabled
    this.eventBus.emitSync('shortcut:toggled', { id, enabled })
    return true
  }

  // ========== 作用域管理 ==========

  /**
   * 推入作用域（激活新作用域）
   */
  pushScope(scope: ShortcutScope): void {
    if (this.scopeStack[this.scopeStack.length - 1] !== scope) {
      this.scopeStack.push(scope)
      this.eventBus.emitSync('shortcut:scope-changed', { scope, stack: [...this.scopeStack] })
    }
  }

  /**
   * 弹出作用域
   */
  popScope(): ShortcutScope | undefined {
    if (this.scopeStack.length <= 1) {
      return this.scopeStack[0]
    }
    const popped = this.scopeStack.pop()!
    this.eventBus.emitSync('shortcut:scope-changed', {
      scope: this.scopeStack[this.scopeStack.length - 1],
      stack: [...this.scopeStack],
    })
    return popped
  }

  /**
   * 获取当前作用域
   */
  getCurrentScope(): ShortcutScope {
    return this.scopeStack[this.scopeStack.length - 1]
  }

  /**
   * 设置当前作用域（替换整个栈）
   */
  setScope(scope: ShortcutScope): void {
    this.scopeStack = [scope]
    this.eventBus.emitSync('shortcut:scope-changed', { scope, stack: [...this.scopeStack] })
  }

  /**
   * 重置作用域到全局
   */
  resetScope(): void {
    this.setScope('global')
  }

  // ========== 键盘事件监听 ==========

  /**
   * 开始监听键盘事件
   */
  startListening(): void {
    if (this.listening) return
    document.addEventListener('keydown', this.boundKeydownHandler, true)
    this.listening = true
  }

  /**
   * 停止监听键盘事件
   */
  stopListening(): void {
    if (!this.listening) return
    document.removeEventListener('keydown', this.boundKeydownHandler, true)
    this.listening = false
  }

  /**
   * 键盘事件处理器
   */
  private handleKeydown(event: KeyboardEvent): void {
    // 全局禁用时不处理
    if (!this._globalEnabled) return

    // 忽略输入框中的快捷键（除了包含修饰键的组合）
    if (this.isInputElement(event.target as HTMLElement) && !this.hasModifierKey(event)) {
      return
    }

    // 构建按键组合
    const keyCombo: KeyCombination = {
      ctrl: event.ctrlKey || event.metaKey, // Mac 兼容: Cmd 替代 Ctrl
      shift: event.shiftKey,
      alt: event.altKey,
      meta: event.metaKey,
      key: this.normalizeKey(event.key),
    }

    // 查找匹配的快捷键
    const matched = this.findMatchingShortcuts(keyCombo)
    if (matched.length === 0) return

    // 按作用域优先级排序，取最高优先级的匹配
    const sorted = matched.sort((a, b) => {
      const priorityA = SCOPE_PRIORITY[a.scope || 'global']
      const priorityB = SCOPE_PRIORITY[b.scope || 'global']
      return priorityB - priorityA
    })

    // 检查作用域匹配
    const currentScope = this.getCurrentScope()
    const bestMatch = sorted.find((binding) => this.isScopeMatch(binding.scope || 'global', currentScope))

    if (!bestMatch) return
    if (bestMatch.enabled === false) return

    // 阻止默认行为
    event.preventDefault()
    event.stopPropagation()

    // 执行动作
    try {
      const result = bestMatch.action(event)
      // 处理异步动作
      if (result instanceof Promise) {
        result.catch((err) => {
          console.error(`[ShortcutManager] 快捷键 "${bestMatch.id}" 执行失败:`, err)
          this.eventBus.emitSync('shortcut:error', { id: bestMatch.id, error: err })
        })
      }
      this.eventBus.emitSync('shortcut:triggered', { id: bestMatch.id, binding: bestMatch })
    } catch (err) {
      console.error(`[ShortcutManager] 快捷键 "${bestMatch.id}" 执行失败:`, err)
      this.eventBus.emitSync('shortcut:error', { id: bestMatch.id, error: err })
    }
  }

  // ========== 内部辅助方法 ==========

  /**
   * 查找匹配当前按键组合的快捷键
   */
  private findMatchingShortcuts(keyCombo: KeyCombination): ShortcutBinding[] {
    const keyStr = this.keyCombinationToString(keyCombo)
    const ids = this.keyMap.get(keyStr)
    if (!ids || ids.length === 0) return []

    const result: ShortcutBinding[] = []
    for (const id of ids) {
      const binding = this.shortcuts.get(id)
      if (binding) {
        result.push(binding)
      }
    }
    return result
  }

  /**
   * 判断作用域是否匹配
   * @param bindingScope 快捷键绑定的作用域
   * @param currentScope 当前激活的作用域
   */
  private isScopeMatch(bindingScope: ShortcutScope, currentScope: ShortcutScope): boolean {
    // 全局作用域始终匹配
    if (bindingScope === 'global') return true
    // 完全匹配
    if (bindingScope === currentScope) return true
    // 当前作用域优先级高于绑定时，也匹配（更高优先级的上下文可以触发低优先级快捷键是不合理的，反之可以）
    // 规则：当前作用域的优先级 >= 绑定作用域的优先级时，匹配
    // 这意味着在 code-editor 作用域下，canvas 的快捷键不会触发（因为 code-editor 优先级更高）
    // 但 global 快捷键在任何作用域都能触发
    return false
  }

  /**
   * 将 KeyCombination 转为字符串（用于 Map key）
   */
  private keyCombinationToString(keys: KeyCombination): string {
    const parts: string[] = []
    if (keys.ctrl) parts.push('ctrl')
    if (keys.shift) parts.push('shift')
    if (keys.alt) parts.push('alt')
    if (keys.meta) parts.push('meta')
    parts.push(keys.key.toLowerCase())
    return parts.join('+')
  }

  /**
   * 添加快捷键到 keyMap
   */
  private addToKeyMap(binding: ShortcutBinding): void {
    const keyStr = this.keyCombinationToString(binding.keys)
    if (!this.keyMap.has(keyStr)) {
      this.keyMap.set(keyStr, [])
    }
    this.keyMap.get(keyStr)!.push(binding.id)
  }

  /**
   * 从 keyMap 移除快捷键
   */
  private removeFromKeyMap(binding: ShortcutBinding): void {
    const keyStr = this.keyCombinationToString(binding.keys)
    const ids = this.keyMap.get(keyStr)
    if (ids) {
      const index = ids.indexOf(binding.id)
      if (index !== -1) {
        ids.splice(index, 1)
      }
      if (ids.length === 0) {
        this.keyMap.delete(keyStr)
      }
    }
  }

  /**
   * 标准化快捷键绑定（填充默认值）
   */
  private normalizeBinding(binding: ShortcutBinding): ShortcutBinding {
    return {
      ...binding,
      scope: binding.scope || 'global',
      enabled: binding.enabled !== false,
    }
  }

  /**
   * 标准化按键值
   */
  private normalizeKey(key: string): string {
    const keyMap: Record<string, string> = {
      ' ': 'Space',
      Escape: 'Escape',
      Delete: 'Delete',
      Backspace: 'Backspace',
      Enter: 'Enter',
      Tab: 'Tab',
      ArrowUp: 'ArrowUp',
      ArrowDown: 'ArrowDown',
      ArrowLeft: 'ArrowLeft',
      ArrowRight: 'ArrowRight',
      F1: 'F1', F2: 'F2', F3: 'F3', F4: 'F4', F5: 'F5', F6: 'F6',
      F7: 'F7', F8: 'F8', F9: 'F9', F10: 'F10', F11: 'F11', F12: 'F12',
    }
    return keyMap[key] || key
  }

  /**
   * 判断目标元素是否为输入元素
   */
  private isInputElement(target: HTMLElement | null): boolean {
    if (!target) return false
    const tagName = target.tagName.toLowerCase()
    if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') return true
    if (target.isContentEditable) return true
    // Monaco 编辑器内部元素
    if (target.closest('.monaco-editor')) return true
    return false
  }

  /**
   * 判断事件是否包含修饰键
   */
  private hasModifierKey(event: KeyboardEvent): boolean {
    return event.ctrlKey || event.metaKey || event.altKey
  }

  // ========== 生命周期 ==========

  /**
   * 销毁快捷键管理器
   */
  destroy(): void {
    this.stopListening()
    this.shortcuts.clear()
    this.keyMap.clear()
    this.scopeStack = ['global']
    this._globalEnabled = true
    this.eventBus.emitSync('shortcut-manager:destroyed', {})
  }
}
