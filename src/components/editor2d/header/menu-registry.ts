/*
 * @description 2D编辑器菜单注册表服务
 * @author MC.Yang
 */
import { reactive, computed, ComputedRef } from 'vue'
import { Editor2DPropsMenu, Editor2DMenuGroup } from '../core/editor2d-global-type'

/** 菜单区域类型 */
export type MenuZone = 'app' | 'editor' | 'extend'

/** 菜单可见性配置（持久化） */
interface MenuVisibilityConfig {
  /** key -> 是否显示 */
  [key: string]: boolean
}

/** 菜单排序配置（持久化） */
interface MenuOrderConfig {
  /** key -> 自定义顺序 */
  [key: string]: number
}

/** 持久化存储结构 */
interface MenuPersistData {
  visibility: MenuVisibilityConfig
  order: MenuOrderConfig
}

const STORAGE_KEY = 'pixel2d_menu_config'

// ─── 内部状态 ────────────────────────────────────────────────────────────────

/** 各区域动态注册的菜单项 */
const _dynamicMenus: Record<MenuZone, Array<Editor2DPropsMenu>> = reactive({
  app: [],
  editor: [],
  extend: [],
})

/** 各区域静态默认菜单项（由 header.ts 注入） */
const _defaultMenus: Record<MenuZone, Array<Editor2DPropsMenu>> = reactive({
  app: [],
  editor: [],
  extend: [],
})

/** 菜单分组定义 */
const _groups: Record<MenuZone, Array<Editor2DMenuGroup>> = reactive({
  app: [],
  editor: [],
  extend: [],
})

/** 持久化配置 */
const _persist = reactive<MenuPersistData>(_loadPersist())

// ─── 持久化辅助 ───────────────────────────────────────────────────────────────

function _loadPersist(): MenuPersistData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw) as MenuPersistData
    }
  } catch {
    // 忽略解析错误
  }
  return { visibility: {}, order: {} }
}

function _savePersist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_persist))
  } catch {
    // 忽略存储错误
  }
}

// ─── 核心工具 ─────────────────────────────────────────────────────────────────

/**
 * 获取菜单项的字符串 key
 */
function _strKey(item: Editor2DPropsMenu): string {
  return String(item.key ?? '')
}

/**
 * 判断菜单项是否可见（综合 show 字段与持久化配置）
 */
function _isVisible(item: Editor2DPropsMenu): boolean {
  const k = _strKey(item)
  if (k && k in _persist.visibility) {
    return _persist.visibility[k]
  }
  // 没有持久化配置时，遵循 show 字段（undefined 视为 true）
  return item.show !== false
}

/**
 * 获取菜单项排序值（持久化优先，其次 order 字段，最后 Infinity）
 */
function _getOrder(item: Editor2DPropsMenu): number {
  const k = _strKey(item)
  if (k && k in _persist.order) {
    return _persist.order[k]
  }
  return item.order ?? Infinity
}

/**
 * 合并默认菜单与动态注册菜单，按 order 排序，同时过滤 show===false 的根项
 */
function _merge(
  zone: MenuZone,
  filterVisible = false
): Array<Editor2DPropsMenu> {
  const all = [..._defaultMenus[zone], ..._dynamicMenus[zone]]
  const sorted = all.sort((a, b) => _getOrder(a) - _getOrder(b))
  if (!filterVisible) return sorted
  return sorted.filter(_isVisible)
}

// ─── 公开 API ─────────────────────────────────────────────────────────────────

export const MenuRegistry = {
  // ── 初始化默认菜单 ───────────────────────────────────────────────────────────

  /**
   * 设置某区域的默认（静态）菜单，由 header.ts 调用
   */
  setDefaults(zone: MenuZone, menus: Array<Editor2DPropsMenu>): void {
    _defaultMenus[zone].length = 0
    _defaultMenus[zone].push(...menus)
  },

  /**
   * 设置某区域的菜单分组
   */
  setGroups(zone: MenuZone, groups: Array<Editor2DMenuGroup>): void {
    _groups[zone].length = 0
    _groups[zone].push(...groups)
  },

  // ── 动态注册 / 注销 ──────────────────────────────────────────────────────────

  /**
   * 注册新菜单项到指定区域
   * @param zone    目标区域
   * @param item    菜单项
   * @param position 插入位置（默认追加末尾）
   */
  register(
    zone: MenuZone,
    item: Editor2DPropsMenu,
    position?: number
  ): void {
    const list = _dynamicMenus[zone]
    // 避免重复注册
    const existIdx = list.findIndex((m) => m.key === item.key)
    if (existIdx !== -1) {
      list.splice(existIdx, 1, item)
      return
    }
    if (position !== undefined && position >= 0 && position <= list.length) {
      list.splice(position, 0, item)
    } else {
      list.push(item)
    }
  },

  /**
   * 注销菜单项（先查动态注册，再查默认菜单）
   * @param zone 目标区域
   * @param key  菜单 key
   */
  unregister(zone: MenuZone, key: string | number): void {
    const dynamic = _dynamicMenus[zone]
    const idx = dynamic.findIndex((m) => m.key === key)
    if (idx !== -1) {
      dynamic.splice(idx, 1)
    }
    // 默认菜单不物理删除，而是标记 show=false
    const def = _defaultMenus[zone]
    const defIdx = def.findIndex((m) => m.key === key)
    if (defIdx !== -1) {
      def[defIdx] = { ...def[defIdx], show: false }
    }
  },

  // ── 分组管理 ─────────────────────────────────────────────────────────────────

  /**
   * 注册分组（若已存在则更新）
   */
  registerGroup(zone: MenuZone, group: Editor2DMenuGroup): void {
    const list = _groups[zone]
    const idx = list.findIndex((g) => g.key === group.key)
    if (idx !== -1) {
      list.splice(idx, 1, group)
    } else {
      list.push(group)
    }
  },

  /**
   * 获取某区域的所有分组（按 order 排序）
   */
  getGroups(zone: MenuZone): Array<Editor2DMenuGroup> {
    return [..._groups[zone]].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  },

  // ── 可见性管理 ────────────────────────────────────────────────────────────────

  /**
   * 获取可见菜单（已过滤隐藏项，已排序）
   */
  getVisibleMenus(zone: MenuZone): Array<Editor2DPropsMenu> {
    return _merge(zone, true)
  },

  /**
   * 获取全部菜单（包含隐藏项，用于配置面板）
   */
  getAllMenus(zone: MenuZone): Array<Editor2DPropsMenu> {
    return _merge(zone, false)
  },

  /**
   * 切换某菜单项的显示/隐藏
   */
  toggleVisibility(key: string | number): void {
    const k = String(key)
    const current = _persist.visibility[k] ?? true
    _persist.visibility[k] = !current
    _savePersist()
  },

  /**
   * 设置某菜单项的显示状态
   */
  setVisibility(key: string | number, visible: boolean): void {
    _persist.visibility[String(key)] = visible
    _savePersist()
  },

  /**
   * 批量设置可见性（配置面板保存用）
   */
  batchSetVisibility(config: MenuVisibilityConfig): void {
    Object.assign(_persist.visibility, config)
    _savePersist()
  },

  /**
   * 查询某菜单项是否可见
   */
  isVisible(item: Editor2DPropsMenu): boolean {
    return _isVisible(item)
  },

  // ── 排序管理 ─────────────────────────────────────────────────────────────────

  /**
   * 设置菜单项的自定义排序
   */
  setOrder(key: string | number, order: number): void {
    _persist.order[String(key)] = order
    _savePersist()
  },

  /**
   * 批量设置排序（拖拽保存用）
   */
  batchSetOrder(orders: MenuOrderConfig): void {
    Object.assign(_persist.order, orders)
    _savePersist()
  },

  // ── 重置 ─────────────────────────────────────────────────────────────────────

  /**
   * 重置为默认配置（清空持久化数据）
   */
  resetToDefault(): void {
    _persist.visibility = {}
    _persist.order = {}
    _savePersist()
    // 恢复被标记为 show=false 的默认菜单项
    for (const zone of Object.keys(_defaultMenus) as MenuZone[]) {
      _defaultMenus[zone] = _defaultMenus[zone].map((item) => {
        if (item.show === false && item.key) {
          const { show: _removed, ...rest } = item
          return rest
        }
        return item
      })
    }
  },

  // ── 响应式计算属性 ────────────────────────────────────────────────────────────

  /**
   * 获取响应式的可见菜单列表
   */
  computed: {
    appMenus(): ComputedRef<Array<Editor2DPropsMenu>> {
      return computed(() => _merge('app', true))
    },
    editorMenus(): ComputedRef<Array<Editor2DPropsMenu>> {
      return computed(() => _merge('editor', true))
    },
    extendMenus(): ComputedRef<Array<Editor2DPropsMenu>> {
      return computed(() => _merge('extend', true))
    },
  },
}

// 导出持久化配置的响应式引用（供 MenuConfig.vue 使用）
export { _persist as menuPersistState, _defaultMenus as menuDefaultState, _dynamicMenus as menuDynamicState }
