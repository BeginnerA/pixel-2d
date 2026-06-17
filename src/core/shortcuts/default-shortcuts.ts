/**
 * 默认快捷键配置
 * @description 预置的编辑器快捷键配置数组
 * @author MC.Yang
 */

import type { ShortcutBinding } from './shortcut-types'

/**
 * 获取 meta2d 实例的安全方法
 * @description 延迟获取全局 meta2d 实例，避免初始化顺序问题
 */
function getMeta2d(): any {
  return (window as any).meta2d
}

/**
 * 默认快捷键配置
 */
export const defaultShortcuts: ShortcutBinding[] = [
  // ===== 编辑操作 =====
  {
    id: 'copy',
    keys: { ctrl: true, key: 'c' },
    action: () => {
      const m = getMeta2d()
      if (m) m.copy()
    },
    scope: 'canvas',
    description: '复制',
  },
  {
    id: 'paste',
    keys: { ctrl: true, key: 'v' },
    action: () => {
      const m = getMeta2d()
      if (m) m.paste()
    },
    scope: 'canvas',
    description: '粘贴',
  },
  {
    id: 'cut',
    keys: { ctrl: true, key: 'x' },
    action: () => {
      const m = getMeta2d()
      if (m) {
        m.copy()
        m.delete()
      }
    },
    scope: 'canvas',
    description: '剪切',
  },
  {
    id: 'undo',
    keys: { ctrl: true, key: 'z' },
    action: () => {
      const m = getMeta2d()
      if (m) m.undo()
    },
    scope: 'global',
    description: '撤销',
  },
  {
    id: 'redo',
    keys: { ctrl: true, key: 'y' },
    action: () => {
      const m = getMeta2d()
      if (m) m.redo()
    },
    scope: 'global',
    description: '重做',
  },
  {
    id: 'redo-alt',
    keys: { ctrl: true, shift: true, key: 'z' },
    action: () => {
      const m = getMeta2d()
      if (m) m.redo()
    },
    scope: 'global',
    description: '重做 (备选)',
  },
  {
    id: 'select-all',
    keys: { ctrl: true, key: 'a' },
    action: () => {
      const m = getMeta2d()
      if (m) {
        const pens = m.store.data.pens
        if (pens) {
          m.setActive(pens.filter((pen: any) => !pen.parentId))
        }
      }
    },
    scope: 'canvas',
    description: '全选',
  },
  {
    id: 'delete',
    keys: { key: 'Delete' },
    action: () => {
      const m = getMeta2d()
      if (m) m.delete()
    },
    scope: 'canvas',
    description: '删除',
  },
  {
    id: 'delete-backspace',
    keys: { key: 'Backspace' },
    action: () => {
      const m = getMeta2d()
      if (m) m.delete()
    },
    scope: 'canvas',
    description: '删除 (退格键)',
  },
  {
    id: 'save',
    keys: { ctrl: true, key: 's' },
    action: (e: KeyboardEvent) => {
      e.preventDefault()
      const m = getMeta2d()
      if (m) {
        // 触发 meta2d 的保存事件
        m.emit('save', m.store.data)
      }
    },
    scope: 'global',
    description: '保存',
  },

  // ===== 组合与排列 =====
  {
    id: 'group',
    keys: { ctrl: true, key: 'g' },
    action: () => {
      const m = getMeta2d()
      if (m) m.combine()
    },
    scope: 'canvas',
    description: '组合',
  },
  {
    id: 'ungroup',
    keys: { ctrl: true, shift: true, key: 'g' },
    action: () => {
      const m = getMeta2d()
      if (m) m.uncombine()
    },
    scope: 'canvas',
    description: '拆散组合',
  },
  {
    id: 'clone',
    keys: { ctrl: true, key: 'd' },
    action: () => {
      const m = getMeta2d()
      if (m) {
        m.copy()
        m.paste()
      }
    },
    scope: 'canvas',
    description: '克隆',
  },

  // ===== 缩放操作 =====
  {
    id: 'zoom-in',
    keys: { ctrl: true, key: '=' },
    action: () => {
      const m = getMeta2d()
      if (m) {
        const scale = m.store.data.scale || 1
        m.scale(scale + 0.1)
      }
    },
    scope: 'canvas',
    description: '放大',
  },
  {
    id: 'zoom-out',
    keys: { ctrl: true, key: '-' },
    action: () => {
      const m = getMeta2d()
      if (m) {
        const scale = m.store.data.scale || 1
        m.scale(Math.max(0.1, scale - 0.1))
      }
    },
    scope: 'canvas',
    description: '缩小',
  },
  {
    id: 'zoom-reset',
    keys: { ctrl: true, key: '0' },
    action: () => {
      const m = getMeta2d()
      if (m) {
        m.scale(1)
        m.centerView()
      }
    },
    scope: 'canvas',
    description: '重置缩放',
  },

  // ===== 其他 =====
  {
    id: 'lock',
    keys: { ctrl: true, shift: true, key: 'l' },
    action: () => {
      const m = getMeta2d()
      if (m) {
        const activePens = m.store.active
        if (activePens && activePens.length > 0) {
          activePens.forEach((pen: any) => {
            pen.locked = pen.locked ? 0 : 1
          })
          m.render()
        }
      }
    },
    scope: 'canvas',
    description: '锁定/解锁选中图元',
  },
  {
    id: 'fullscreen',
    keys: { key: 'F11' },
    action: (e: KeyboardEvent) => {
      e.preventDefault()
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
    },
    scope: 'global',
    description: '全屏切换',
  },
]
