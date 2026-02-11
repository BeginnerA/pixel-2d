/*
 * @description: 2D编辑器头部导航
 * @author: MC.Yang
 */
import {Editor2DCanvas} from "../core/editor2d";
import {LoadFile, SaveFile} from "../core/editor2d-app";
import {MenuValue} from "tdesign-vue-next/es/menu/type";
import {h, ref} from "vue";
import {InputNumber} from "tdesign-vue-next";
import {Editor2DConfig, Editor2DPropsMenu} from "../core/editor2d-global-type";
import {globalEditor2DConfig} from "../core/editor2d-global-data";

// 显示扩展页面
export const EXTEND_VISIBLE = ref<boolean>(false);
// 激活菜单 key
export const ACTIVATE_MENU_KEY = ref<MenuValue>('');
// 连线宽度
export const LINE_WIDTH_VALUE = ref<number>(1);

/**
 * 是否需要选中状态
 * @param stateful 是否有状态
 */
function selectedState(stateful: boolean) {
    if (!stateful) {
        ACTIVATE_MENU_KEY.value = '';
    }
}

/**
 * 2D编辑器图元功能菜单调度函数
 * @param activeItem 激活项
 * @param event 事件
 */
export function dispatchFunc(activeItem: {
    action: keyof typeof MENU_FUNC;
    [key: string]: any
}, event: DragEvent | MouseEvent) {
    // 使用 keyof typeof MENU_FUNC 作为 func 的类型，确保 func 是 MENU_FUNC 的一个有效键
    let func = activeItem.action;
    if (func && func in MENU_FUNC) {
        // 检查 func 是否在 MENU_FUNC 中
        MENU_FUNC[func](activeItem, event);
        selectedState(activeItem.activeState === undefined ? true : activeItem.activeState);
    } else {
        // 处理未知的函数名
        console.error(`Unknown function: ${func}`);
    }
}

/**
 * 2D编辑器功能菜单功能
 */
const MENU_FUNC = {
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
        let saveFile = new SaveFile();
        if (activeItem.value === 'JSON') {
            saveFile.saveJsonFile();
        } else if (activeItem.value === 'SVG') {
            saveFile.saveSvgFile();
        } else {
            saveFile.savePngFile();
        }
    },

    // 编辑器画布功能
    openMagnifier(): void {
        new Editor2DCanvas().magnifier();
    },
    usePen(): void {
        new Editor2DCanvas().usePen();
    },
    usePencil(): void {
        new Editor2DCanvas().usePencil();
    },
    undo(): void {
        new Editor2DCanvas().undo();
    },
    redo(): void {
        new Editor2DCanvas().redo();
    },
    addShape(activeItem: Editor2DPropsMenu, event: DragEvent | MouseEvent): void {
        let value = activeItem.value ? activeItem.value as string : 'text';
        new Editor2DCanvas().onAddShape(event, value)
    },
    onLine(activeItem: Editor2DPropsMenu): void {
        let value = activeItem.value ? activeItem.value as string : '';
        new Editor2DCanvas().onLine(value);
    },
    onLineStartPoint(activeItem: Editor2DPropsMenu): void {
        let value = activeItem.value ? activeItem.value as string : '';
        new Editor2DCanvas().onLineStartPoint(value);
    },
    onLineEndPoint(activeItem: Editor2DPropsMenu): void {
        let value = activeItem.value ? activeItem.value as string : '';
        new Editor2DCanvas().onLineEndPoint(value);
    },
    tracingPoint(): void {
        new Editor2DCanvas().tracingPoint();
    },
    openMap(): void {
        new Editor2DCanvas().thumbnailView();
    },
    setCanvasStatus(activeItem: Editor2DPropsMenu): void {
        let value = activeItem.value ? activeItem.value as number : 0;
        new Editor2DCanvas().setCanvasStatus(value);
    },

    // 扩展功能
    openExtendVisible() {
        EXTEND_VISIBLE.value = !EXTEND_VISIBLE.value;
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
        children: [
            {key: 1, title: '新建文件', activeState: false, action: 'newFile'},
            {key: 2, title: '打开文件', activeState: false, action: 'openFile'},
            {key: 3, title: '导入文件', activeState: false, show: false, action: 'loadFile'},
            {key: 4, title: '下载JSON', activeState: false, value: 'JSON', action: 'saveFile'},
            {key: 5, title: '下载为PNG', activeState: false, value: 'PNG', action: 'saveFile'},
            {key: 6, title: '下载为SVG', activeState: false, value: 'SVG', action: 'saveFile'},
        ]
    },
    {
        key: 'edit',
        title: '编辑',
        icon: 'edit-1',
        activeState: false,
        children: [
            {key: 1, title: '增加/删除锚点', activeState: false},
            {key: 2, title: '添加手柄', activeState: false},
            {key: 3, title: '删除手柄', activeState: false},
        ]
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
        action: 'usePen',
    },
    {
        key: 'use-pencil',
        title: '铅笔',
        icon: 'iconfont icon-pencil',
        activeState: false,
        action: 'usePencil',
    },
    {
        key: 'magnifier',
        title: '放大镜',
        icon: 'iconfont icon-magnifier',
        activeState: false,
        disabled: false,
        action: 'openMagnifier',
    },
    {
        key: 'undo',
        title: '撤销',
        icon: 'iconfont icon-undo',
        activeState: false,
        action: 'undo',
    },
    {
        key: 'redo',
        title: '重做',
        icon: 'iconfont icon-redo',
        activeState: false,
        action: 'redo',
    },
    {
        key: 'text',
        title: '文字',
        icon: 'iconfont icon-text',
        activeState: false,
        show: false,
        value: 'text',
        action: 'addShape',
    },
    {
        key: 'line-width',
        title: '线宽',
        children: [
            {
                key: 1, disabled: true, title: () => {
                    return h(InputNumber, {
                        value: LINE_WIDTH_VALUE.value, min: 1, max: 10,
                        onChange: (val: any) => {
                            LINE_WIDTH_VALUE.value = val;
                            new Editor2DCanvas().setLineWidth(val);
                        }
                    });
                }
            }
        ],
    },
    {
        key: 'on-line',
        title: '连线',
        icon: 'l-curve2',
        children: [
            {key: 1, title: '曲线', icon: 'l-curve2', value: 'curve', action: 'onLine'},
            {key: 2, title: '线段', icon: 'l-polyline', value: 'polyline', action: 'onLine'},
            {key: 3, title: '直线', icon: 'l-line', value: 'line', action: 'onLine'},
            {key: 4, title: '脑图曲线', icon: 'l-mind', value: 'mind', action: 'onLine'},
        ],
    },
    {
        key: 'start',
        title: '起点',
        icon: 'l-line',
        children: [
            {key: 1, icon: 'l-line', value: "", action: 'onLineStartPoint'},
            {key: 2, icon: 'l-from-triangle', value: 'triangle', action: 'onLineStartPoint'},
            {key: 3, icon: 'l-from-diamond', value: 'diamond', action: 'onLineStartPoint'},
            {key: 4, icon: 'l-from-circle', value: 'circle', action: 'onLineStartPoint'},
            {key: 5, icon: 'l-from-lineDown', value: 'lineDown', action: 'onLineStartPoint'},
            {key: 6, icon: 'l-from-lineUp', value: 'lineUp', action: 'onLineStartPoint'},
            {key: 7, icon: 'l-from-triangleSolid', value: 'triangleSolid', action: 'onLineStartPoint'},
            {key: 8, icon: 'l-from-diamondSolid', value: 'diamondSolid', action: 'onLineStartPoint'},
            {key: 9, icon: 'l-from-circleSolid', value: 'circleSolid', action: 'onLineStartPoint'},
            {key: 10, icon: 'l-from-line', value: 'line', action: 'onLineStartPoint'},
        ],
    },
    {
        key: 'end',
        title: '终点',
        icon: 'l-line',
        children: [
            {key: 1, icon: 'l-line', value: "", action: 'onLineEndPoint'},
            {key: 2, icon: 'l-to-triangle', value: 'triangle', action: 'onLineEndPoint'},
            {key: 3, icon: 'l-to-diamond', value: 'diamond', action: 'onLineEndPoint'},
            {key: 4, icon: 'l-to-circle', value: 'circle', action: 'onLineEndPoint'},
            {key: 5, icon: 'l-to-lineDown', value: 'lineDown', action: 'onLineEndPoint'},
            {key: 6, icon: 'l-to-lineUp', value: 'lineUp', action: 'onLineEndPoint'},
            {key: 7, icon: 'l-to-triangleSolid', value: 'triangleSolid', action: 'onLineEndPoint'},
            {key: 8, icon: 'l-to-diamondSolid', value: 'diamondSolid', action: 'onLineEndPoint'},
            {key: 9, icon: 'l-to-circleSolid', value: 'circleSolid', action: 'onLineEndPoint'},
            {key: 10, icon: 'l-to-line', value: 'line', action: 'onLineEndPoint'},
        ]
    },
    {
        key: 'anchor-point',
        title: '手动锚点',
        icon: 'iconfont icon-anchorpoint',
        activeState: false,
        action: 'tracingPoint',
    },
    {
        key: 'openMap',
        title: '视图',
        icon: 'map-outline',
        activeState: false,
        action: 'openMap',
    },
    {
        key: 'editor',
        title: '画布',
        icon: 'iconfont icon-unlock',
        children: [
            {key: 1, title: '编辑', icon: 'iconfont icon-unlock', value: 0, action: 'setCanvasStatus'},
            {key: 2, title: '预览', icon: 'iconfont icon-lock', value: 1, action: 'setCanvasStatus'},
            {key: 3, title: '锁定', icon: 'iconfont icon-lock-on', value: 2, action: 'setCanvasStatus'},
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
        action: 'openExtendVisible',
    },
]

/**
 * 功能菜单
 */
export const FUNC_MENUS: {
    appMenu: Array<Editor2DPropsMenu>,
    editorMenu: Array<Editor2DPropsMenu>,
    extendMenu: Array<Editor2DPropsMenu>
} = {
    appMenu: APP_MENU,
    editorMenu: EDITOR_MENU,
    extendMenu: EXTEND_MENU,
}

/**
 * 2D编辑器功能菜单配置
 */
export const FUNC_MENU_CONFIG: Editor2DConfig = {
    key: 'head-1',
    displayMenuTitle: globalEditor2DConfig.displayMenuTitle,
    displayMenuIcon: globalEditor2DConfig.displayMenuIcon,
}
