/*
 * @description 2D编辑器头部导航
 * @author MC.Yang
 */
import { Editor2DCanvas } from '../core/editor2d'
import { LoadFile, SaveFile } from '../core/editor2d-app'
import { InputNumber, MenuValue } from 'tdesign-vue-next'
import { h, ref } from 'vue'
import { Editor2DConfig, Editor2DPropsMenu } from '../core/editor2d-global-type'
import { globalEditor2DConfig } from '../core/editor2d-global-data'
import { MenuRegistry } from './menu-registry'

// 显示扩展页面
export const EXTEND_VISIBLE = ref<boolean>(false)
// 激活菜单 key
export const ACTIVATE_MENU_KEY = ref<MenuValue>('')
// 连线宽度
export const LINE_WIDTH_VALUE = ref<number>(1)
// 菜单配置弹窗显示状态
export const MENU_CONFIG_VISIBLE = ref<boolean>(false)

/**
 * 是否需要选中状态
 * @param stateful 是否有状态
 */
function selectedState(stateful: boolean) {
  if (!stateful) {
    ACTIVATE_MENU_KEY.value = ''
  }
}

/**
 * 2D编辑器图元功能菜单调度函数
 * @param activeItem 激活项
 * @param event 事件
 */
export function dispatchFunc(
  activeItem: {
    action: keyof typeof MENU_FUNC
    [key: string]: any
  },
  event: DragEvent | MouseEvent
) {
  // 使用 keyof typeof MENU_FUNC 作为 func 的类型，确保 func 是 MENU_FUNC 的一个有效键
  let func = activeItem.action
  if (func && func in MENU_FUNC) {
    // 检查 func 是否在 MENU_FUNC 中
    MENU_FUNC[func](activeItem, event)
    selectedState(activeItem.activeState === undefined ? true : activeItem.activeState)
  } else if (typeof activeItem.action === 'function') {
    // 支持直接传入函数类型的 action（插件注册菜单使用）
    ;(activeItem.action as Function)(activeItem, event)
    selectedState(activeItem.activeState === undefined ? true : activeItem.activeState)
  } else {
    // 处理未知的函数名
    console.error(`Unknown function: ${func}`)
  }
}

/**
 * 2D编辑器功能菜单功能
 */
const MENU_FUNC: Record<string, (activeItem: Editor2DPropsMenu, event?: DragEvent | MouseEvent) => void> = {
  // 应用功能
  newFile(): void {
    new LoadFile().newFile()
  },
  openFile(): void {
    new LoadFile().openFile()
  },
  loadFile(): void {
    new LoadFile().loadFile()
  },
  saveFile(activeItem: Editor2DPropsMenu): void {
    let saveFile = new SaveFile()
    if (activeItem.value === 'JSON') {
      saveFile.saveJsonFile()
    } else if (activeItem.value === 'SVG') {
      saveFile.saveSvgFile()
    } else {
      saveFile.savePngFile()
    }
  },

  // 编辑器画布功能
  openMagnifier(): void {
    new Editor2DCanvas().magnifier()
  },
  usePen(): void {
    new Editor2DCanvas().usePen()
  },
  usePencil(): void {
    new Editor2DCanvas().usePencil()
  },
  undo(): void {
    new Editor2DCanvas().undo()
  },
  redo(): void {
    new Editor2DCanvas().redo()
  },
  addShape(activeItem: Editor2DPropsMenu, event: DragEvent | MouseEvent): void {
    let value = activeItem.value ? (activeItem.value as string) : 'text'
    new Editor2DCanvas().onAddShape(event!, value)
  },
  onLine(activeItem: Editor2DPropsMenu): void {
    let value = activeItem.value ? (activeItem.value as string) : ''
    new Editor2DCanvas().onLine(value)
  },
  onLineStartPoint(activeItem: Editor2DPropsMenu): void {
    let value = activeItem.value ? (activeItem.value as string) : ''
    new Editor2DCanvas().onLineStartPoint(value)
  },
  onLineEndPoint(activeItem: Editor2DPropsMenu): void {
    let value = activeItem.value ? (activeItem.value as string) : ''
    new Editor2DCanvas().onLineEndPoint(value)
  },
  tracingPoint(): void {
    new Editor2DCanvas().tracingPoint()
  },
  openMap(): void {
    new Editor2DCanvas().thumbnailView()
  },
  setCanvasStatus(activeItem: Editor2DPropsMenu): void {
    let value = activeItem.value ? (activeItem.value as number) : 0
    new Editor2DCanvas().setCanvasStatus(value)
  },

  // 扩展功能
  openExtendVisible() {
    EXTEND_VISIBLE.value = !EXTEND_VISIBLE.value
  },

  // 打开菜单配置面板
  openMenuConfig() {
    MENU_CONFIG_VISIBLE.value = !MENU_CONFIG_VISIBLE.value
  },
}

/**
 * 2D编辑器应用菜单
 */
const APP_MENU: Array<Editor2DPropsMenu> = [
  {
    key: 'file',
    title: '文件',
    icon: 'file',
    activeState: false,
    group: 'app',
    order: 10,
    children: [
      { key: 'file-new', title: '新建文件', activeState: false, action: 'newFile', order: 1 },
      { key: 'file-open', title: '打开文件', activeState: false, action: 'openFile', order: 2 },
      { key: 'file-load', title: '导入文件', activeState: false, show: false, action: 'loadFile', order: 3 },
      { key: 'file-save-json', title: '下载JSON', activeState: false, value: 'JSON', action: 'saveFile', order: 4 },
      { key: 'file-save-png', title: '下载为PNG', activeState: false, value: 'PNG', action: 'saveFile', order: 5 },
      { key: 'file-save-svg', title: '下载为SVG', activeState: false, value: 'SVG', action: 'saveFile', order: 6 },
    ],
  },
  {
    key: 'edit',
    title: '编辑',
    icon: 'edit-1',
    activeState: false,
    group: 'app',
    order: 20,
    children: [
      { key: 'edit-anchor', title: '增加/删除锚点', activeState: false, order: 1 },
      { key: 'edit-handle-add', title: '添加手柄', activeState: false, order: 2 },
      { key: 'edit-handle-del', title: '删除手柄', activeState: false, order: 3 },
    ],
  },
]

/**
 * 2D编辑器画布菜单
 */
const EDITOR_MENU: Array<Editor2DPropsMenu> = [
  {
    key: 'use-pen',
    title: '钢笔',
    icon: 'iconfont icon-pen',
    activeState: false,
    group: 'draw',
    order: 10,
    action: 'usePen',
  },
  {
    key: 'use-pencil',
    title: '铅笔',
    icon: 'iconfont icon-pencil',
    activeState: false,
    group: 'draw',
    order: 20,
    action: 'usePencil',
  },
  {
    key: 'magnifier',
    title: '放大镜',
    icon: 'iconfont icon-magnifier',
    activeState: false,
    disabled: false,
    group: 'view',
    order: 30,
    action: 'openMagnifier',
  },
  {
    key: 'undo',
    title: '撤销',
    icon: 'iconfont icon-undo',
    activeState: false,
    // shortcut: 'Ctrl+Z',
    group: 'history',
    order: 40,
    action: 'undo',
  },
  {
    key: 'redo',
    title: '重做',
    icon: 'iconfont icon-redo',
    activeState: false,
    // shortcut: 'Ctrl+Y',
    group: 'history',
    order: 50,
    action: 'redo',
  },
  {
    key: 'text',
    title: '文字',
    icon: 'iconfont icon-text',
    activeState: false,
    show: false,
    value: 'text',
    group: 'draw',
    order: 60,
    action: 'addShape',
  },
  {
    key: 'line-width',
    title: '线宽',
    group: 'style',
    order: 70,
    children: [
      {
        key: 'line-width-input',
        disabled: true,
        title: () => {
          return h(InputNumber, {
            value: LINE_WIDTH_VALUE.value,
            min: 1,
            max: 10,
            onChange: (val: any) => {
              LINE_WIDTH_VALUE.value = val
              new Editor2DCanvas().setLineWidth(val)
            },
          })
        },
      },
    ],
  },
  {
    key: 'on-line',
    title: '连线',
    icon: 'l-curve2',
    group: 'style',
    order: 80,
    children: [
      { key: 'line-curve', title: '曲线', icon: 'l-curve2', value: 'curve', action: 'onLine' },
      { key: 'line-polyline', title: '线段', icon: 'l-polyline', value: 'polyline', action: 'onLine' },
      { key: 'line-straight', title: '直线', icon: 'l-line', value: 'line', action: 'onLine' },
      { key: 'line-mind', title: '脑图曲线', icon: 'l-mind', value: 'mind', action: 'onLine' },
    ],
  },
  {
    key: 'start',
    title: '起点',
    icon: 'l-line',
    group: 'style',
    order: 90,
    children: [
      { key: 'start-none', icon: 'l-line', value: '', action: 'onLineStartPoint' },
      { key: 'start-triangle', icon: 'l-from-triangle', value: 'triangle', action: 'onLineStartPoint' },
      { key: 'start-diamond', icon: 'l-from-diamond', value: 'diamond', action: 'onLineStartPoint' },
      { key: 'start-circle', icon: 'l-from-circle', value: 'circle', action: 'onLineStartPoint' },
      { key: 'start-lineDown', icon: 'l-from-lineDown', value: 'lineDown', action: 'onLineStartPoint' },
      { key: 'start-lineUp', icon: 'l-from-lineUp', value: 'lineUp', action: 'onLineStartPoint' },
      { key: 'start-triangleSolid', icon: 'l-from-triangleSolid', value: 'triangleSolid', action: 'onLineStartPoint' },
      { key: 'start-diamondSolid', icon: 'l-from-diamondSolid', value: 'diamondSolid', action: 'onLineStartPoint' },
      { key: 'start-circleSolid', icon: 'l-from-circleSolid', value: 'circleSolid', action: 'onLineStartPoint' },
      { key: 'start-line', icon: 'l-from-line', value: 'line', action: 'onLineStartPoint' },
    ],
  },
  {
    key: 'end',
    title: '终点',
    icon: 'l-line',
    group: 'style',
    order: 100,
    children: [
      { key: 'end-none', icon: 'l-line', value: '', action: 'onLineEndPoint' },
      { key: 'end-triangle', icon: 'l-to-triangle', value: 'triangle', action: 'onLineEndPoint' },
      { key: 'end-diamond', icon: 'l-to-diamond', value: 'diamond', action: 'onLineEndPoint' },
      { key: 'end-circle', icon: 'l-to-circle', value: 'circle', action: 'onLineEndPoint' },
      { key: 'end-lineDown', icon: 'l-to-lineDown', value: 'lineDown', action: 'onLineEndPoint' },
      { key: 'end-lineUp', icon: 'l-to-lineUp', value: 'lineUp', action: 'onLineEndPoint' },
      { key: 'end-triangleSolid', icon: 'l-to-triangleSolid', value: 'triangleSolid', action: 'onLineEndPoint' },
      { key: 'end-diamondSolid', icon: 'l-to-diamondSolid', value: 'diamondSolid', action: 'onLineEndPoint' },
      { key: 'end-circleSolid', icon: 'l-to-circleSolid', value: 'circleSolid', action: 'onLineEndPoint' },
      { key: 'end-line', icon: 'l-to-line', value: 'line', action: 'onLineEndPoint' },
    ],
  },
  {
    key: 'anchor-point',
    title: '手动锚点',
    icon: 'iconfont icon-anchorpoint',
    activeState: false,
    group: 'draw',
    order: 110,
    action: 'tracingPoint',
  },
  {
    key: 'openMap',
    title: '视图',
    icon: 'map-outline',
    activeState: false,
    group: 'view',
    order: 120,
    action: 'openMap',
  },
  {
    key: 'editor',
    title: '画布',
    icon: 'iconfont icon-unlock',
    group: 'view',
    order: 130,
    children: [
      { key: 'canvas-edit', title: '编辑', icon: 'iconfont icon-unlock', value: 0, action: 'setCanvasStatus' },
      { key: 'canvas-preview', title: '预览', icon: 'iconfont icon-lock', value: 1, action: 'setCanvasStatus' },
      { key: 'canvas-lock', title: '锁定', icon: 'iconfont icon-lock-on', value: 2, action: 'setCanvasStatus' },
    ],
  },
]

/**
 * 2D编辑器扩展菜单
 */
const EXTEND_MENU: Array<Editor2DPropsMenu> = [
  {
    key: 'settings',
    title: '设置',
    icon: 'setting-1',
    order: 10,
    action: 'openExtendVisible',
  },

]

// ─── 初始化 MenuRegistry ───────────────────────────────────────────────────────

// 注入默认菜单
MenuRegistry.setDefaults('app', APP_MENU)
MenuRegistry.setDefaults('editor', EDITOR_MENU)
MenuRegistry.setDefaults('extend', EXTEND_MENU)

// 注册菜单分组
MenuRegistry.setGroups('editor', [
  { key: 'draw', label: '绘制工具', icon: 'pen-brush', order: 1 },
  { key: 'history', label: '历史操作', icon: 'history', order: 2 },
  { key: 'style', label: '线条样式', icon: 'style1', order: 3 },
  { key: 'view', label: '视图控制', icon: 'map-outline', order: 4 },
])

MenuRegistry.setGroups('app', [{ key: 'app', label: '应用', order: 1 }])

/**
 * 功能菜单（向后兼容导出，内部使用 MenuRegistry 响应式计算属性）
 */
export const FUNC_MENUS: {
  appMenu: Array<Editor2DPropsMenu>
  editorMenu: Array<Editor2DPropsMenu>
  extendMenu: Array<Editor2DPropsMenu>
} = {
  get appMenu() {
    return MenuRegistry.getVisibleMenus('app')
  },
  get editorMenu() {
    return MenuRegistry.getVisibleMenus('editor')
  },
  get extendMenu() {
    return MenuRegistry.getVisibleMenus('extend')
  },
}

/**
 * 2D编辑器功能菜单配置
 */
export const FUNC_MENU_CONFIG: Editor2DConfig = {
  key: 'head-1',
  displayMenuTitle: globalEditor2DConfig.displayMenuTitle,
  displayMenuIcon: globalEditor2DConfig.displayMenuIcon,
}

/**
 * 注册自定义菜单功能处理函数（供插件使用）
 * @param key 函数名
 * @param handler 处理函数
 */
export function registerMenuFunc(key: string, handler: (activeItem: Editor2DPropsMenu, event?: DragEvent | MouseEvent) => void): void {
  MENU_FUNC[key] = handler
}

/**
 * 导出 MenuRegistry 供外部使用
 */
export { MenuRegistry }
