/*
 * @description 右键菜单配置
 * @author MC.Yang
 */

/**
 * 右键菜单项接口
 */
export interface ContextMenuItem {
  /** 唯一标识 */
  key: string
  /** 菜单项文字 */
  label: string
  /** 图标名称 (TDesign图标名或自定义iconfont类名) */
  icon?: string
  /** 快捷键提示文本 */
  shortcut?: string
  /** 点击回调 */
  action?: () => void
  /** 是否禁用 */
  disabled?: boolean
  /** 是否可见 */
  visible?: boolean
  /** 子菜单 */
  children?: ContextMenuItem[]
}

/**
 * 右键目标类型
 */
export type ContextMenuTarget = 'canvas' | 'single' | 'multi'

/**
 * 分隔线项
 */
export const CONTEXT_MENU_SEPARATOR: ContextMenuItem = {
  key: 'separator',
  label: '---',
}

/**
 * 判断是否为分隔线
 */
export function isSeparator(item: ContextMenuItem): boolean {
  return item.key === 'separator'
}

/**
 * 获取画布空白处右键菜单
 * @param meta2d Meta2D实例
 */
export function getCanvasMenuItems(meta2d: any): ContextMenuItem[] {
  return [
    {
      key: 'paste',
      label: '粘贴',
      icon: 'paste',
      shortcut: 'Ctrl+V',
      action: () => {
        meta2d.paste()
      },
    },
    CONTEXT_MENU_SEPARATOR,
    {
      key: 'selectAll',
      label: '全选',
      icon: 'check-circle',
      shortcut: 'Ctrl+A',
      action: () => {
        meta2d.selectAll()
      },
    },
    CONTEXT_MENU_SEPARATOR,
    {
      key: 'undo',
      label: '撤销',
      icon: 'rollback',
      shortcut: 'Ctrl+Z',
      action: () => {
        meta2d.undo()
      },
    },
    {
      key: 'redo',
      label: '重做',
      icon: 'rollup',
      shortcut: 'Ctrl+Y',
      action: () => {
        meta2d.redo()
      },
    },
    CONTEXT_MENU_SEPARATOR,
    {
      key: 'fitView',
      label: '适应画布',
      icon: 'fullscreen',
      action: () => {
        meta2d.fitView()
      },
    },
  ]
}

/**
 * 获取单个图元右键菜单
 * @param meta2d Meta2D实例
 * @param pen 当前右键的图元
 */
export function getSinglePenMenuItems(meta2d: any, pen: any): ContextMenuItem[] {
  const isLocked = pen?.locked === 1 || pen?.locked === 2
  return [
    {
      key: 'copy',
      label: '复制',
      icon: 'copy',
      shortcut: 'Ctrl+C',
      action: () => {
        meta2d.copy()
      },
    },
    {
      key: 'cut',
      label: '剪切',
      icon: 'scissor',
      shortcut: 'Ctrl+X',
      action: () => {
        meta2d.cut()
      },
    },
    {
      key: 'delete',
      label: '删除',
      icon: 'delete',
      shortcut: 'Delete',
      action: () => {
        meta2d.delete()
      },
    },
    CONTEXT_MENU_SEPARATOR,
    {
      key: 'lock',
      label: isLocked ? '解锁' : '锁定',
      icon: isLocked ? 'lock-off' : 'lock-on',
      action: () => {
        const active = meta2d.store.active
        if (active && active.length > 0) {
          const locked = isLocked ? 0 : 1
          active.forEach((p: any) => {
            meta2d.setValue({ id: p.id, locked }, { render: true, doEvent: true, history: true })
          })
        }
      },
    },
    CONTEXT_MENU_SEPARATOR,
    {
      key: 'bringToTop',
      label: '置顶',
      icon: 'arrow-up',
      action: () => {
        meta2d.top()
      },
    },
    {
      key: 'sendToBottom',
      label: '置底',
      icon: 'arrow-down',
      action: () => {
        meta2d.bottom()
      },
    },
    {
      key: 'moveUp',
      label: '上移一层',
      action: () => {
        meta2d.up()
      },
    },
    {
      key: 'moveDown',
      label: '下移一层',
      action: () => {
        meta2d.down()
      },
    },
  ]
}

/**
 * 获取多选图元右键菜单
 * @param meta2d Meta2D实例
 */
export function getMultiPenMenuItems(meta2d: any): ContextMenuItem[] {
  return [
    {
      key: 'copy',
      label: '复制',
      icon: 'copy',
      shortcut: 'Ctrl+C',
      action: () => {
        meta2d.copy()
      },
    },
    {
      key: 'cut',
      label: '剪切',
      icon: 'scissor',
      shortcut: 'Ctrl+X',
      action: () => {
        meta2d.cut()
      },
    },
    {
      key: 'delete',
      label: '删除',
      icon: 'delete',
      shortcut: 'Delete',
      action: () => {
        meta2d.delete()
      },
    },
    CONTEXT_MENU_SEPARATOR,
    {
      key: 'group',
      label: '组合',
      icon: 'group',
      shortcut: 'Ctrl+G',
      action: () => {
        meta2d.combine()
      },
    },
    CONTEXT_MENU_SEPARATOR,
    {
      key: 'align',
      label: '对齐',
      icon: 'align-left',
      children: [
        {
          key: 'alignLeft',
          label: '左对齐',
          action: () => {
            meta2d.alignNodes('left', meta2d.store?.active)
          },
        },
        {
          key: 'alignRight',
          label: '右对齐',
          action: () => {
            meta2d.alignNodes('right', meta2d.store?.active)
          },
        },
        {
          key: 'alignTop',
          label: '顶对齐',
          action: () => {
            meta2d.alignNodes('top', meta2d.store?.active)
          },
        },
        {
          key: 'alignBottom',
          label: '底对齐',
          action: () => {
            meta2d.alignNodes('bottom', meta2d.store?.active)
          },
        },
        {
          key: 'alignCenterH',
          label: '水平居中',
          action: () => {
            meta2d.alignNodes('center', meta2d.store?.active)
          },
        },
        {
          key: 'alignCenterV',
          label: '垂直居中',
          action: () => {
            meta2d.alignNodes('middle', meta2d.store?.active)
          },
        },
      ],
    },
  ]
}

/**
 * 根据右键目标类型获取菜单项
 * @param target 目标类型
 * @param meta2d Meta2D实例
 * @param pen 右键的图元（单选时使用）
 */
export function getContextMenuItem(
  target: ContextMenuTarget,
  meta2d: any,
  pen?: any
): ContextMenuItem[] {
  switch (target) {
    case 'single':
      return getSinglePenMenuItems(meta2d, pen)
    case 'multi':
      return getMultiPenMenuItems(meta2d)
    case 'canvas':
    default:
      return getCanvasMenuItems(meta2d)
  }
}
