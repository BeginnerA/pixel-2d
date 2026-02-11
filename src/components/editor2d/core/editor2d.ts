/*
 * @description: 2D编辑器
 * @author: MC.Yang
 */
import {deepClone, PenType} from "@meta2d/core";
import {IValue} from "@meta2d/core/src/pen";
import {LockState} from "@meta2d/core/src/pen/model";
import {Meta2dData} from "@meta2d/core/src/store/store";
import {Editor2dBase, Editor2dCore} from "./editor2d-core";
import {globalEditor2DData} from "./editor2d-global-data";
import {Editor2DCache} from "./editor2d-local-storage";

/**
 * 2D编辑器
 */
export class Editor2D extends Editor2dCore {

    /**
     * 初始化
     */
    init(data?: Meta2dData) {
        if (!data) {
            data = meta2d.store.data;
        }
        Object.assign(globalEditor2DData, data);

        if (data.websocket) {
            globalEditor2DData.socketConfig = {
                url: data.websocket
            }
        }

        if (data.mqtt) {
            globalEditor2DData.mqttConfig = {
                mqtt: data.mqtt,
                mqttTopics: data.mqttTopics,
                mqttOptions: data.mqttOptions,
            };
        }

        if (data.https) {
            globalEditor2DData.httpConfig = data.https;
        }
    }

    /**
     * 初始化全局画布数据
     */
    initGlobalData() {
        this.init();
    }
}

/**
 * 抽象的画布
 */
export class Editor2DCanvas extends Editor2dBase {

    /**
     * 钢笔
     */
    usePen(): void {
        if (meta2d.canvas.drawingLineName) {
            meta2d.drawLine();
            meta2d.finishPencil().then(r => console.log(r));
        } else {
            meta2d.drawLine('curve');
        }
    }

    /**
     * 铅笔
     */
    usePencil(): void {
        if (meta2d.canvas.pencil) {
            meta2d.stopPencil();
            meta2d.finishPencil().then(r => {
                console.log(r)
            });
        } else {
            meta2d.drawingPencil();
        }
    }

    /**
     * 撤销
     */
    undo(): void {
        meta2d.undo();
    }

    /**
     * 重做
     */
    redo(): void {
        meta2d.redo();
    }

    /**
     * 添加图元
     * @param event 鼠标事件
     * @param name 图元
     */
    onAddShape(event: DragEvent | MouseEvent, name: string) {
        event.stopPropagation();
        let data: any;
        switch (name) {
            case "text":
                // 构建一个文本图元
                data = {
                    text: "text",
                    width: 100,
                    height: 20,
                    name: "text",
                };
                break;
            case "line":
                // 构建一个直线图元
                data = {
                    anchors: [
                        {id: "0", x: 1, y: 0},
                        {id: "1", x: 0, y: 1},
                    ],
                    width: 100,
                    height: 100,
                    name: "line",
                    lineName: "line",
                    type: 1,
                };
                break;
        }
        if (!(event as DragEvent).dataTransfer) {
            // 支持点击画布添加
            meta2d.canvas.addCaches = deepClone([data]);
        } else {
            // 支持拖拽添加
            (event as DragEvent).dataTransfer?.setData("Meta2d", JSON.stringify(data));
        }
    }

    /**
     * 设置连线宽度
     * @param width 线宽
     */
    setLineWidth(width: number) {
        meta2d.store.data.lineWidth = width;
    }

    /**
     * 连线
     */
    onLine(value: string): void {
        // 修改全局连线样式配置
        meta2d.store.options.drawingLineName = value;
        // 修改当前连线样式
        meta2d.canvas.drawingLineName && (meta2d.canvas.drawingLineName = value);
        // 修改已激活图元的连线样式
        meta2d.store.active?.forEach((pen) => {
            // meta2d 的修改函数
            meta2d.updateLineType(pen, value);
        });
        this.render();
    }

    /**
     * 连线起点
     */
    onLineStartPoint(value: string): void {
        // 修改 meta2d 的 fromArrow 样式值
        meta2d.store.data.fromArrow = value;
        if (meta2d.store.active) {
            // 循环遍历修改激活图元 fromArrow 样式
            meta2d.store.active.forEach((i) => {
                if (i.type === PenType.Line) {
                    i.fromArrow = value;
                }
            })
        }
        // 重新渲染
        this.render();
    }

    /**
     * 连线终点
     */
    onLineEndPoint(value: string): void {
        // 修改 meta2d 的 toArrow 样式值
        meta2d.store.data.toArrow = value;
        if (meta2d.store.active) {
            // 循环遍历修改激活图元 toArrow 样式
            meta2d.store.active.forEach((i) => {
                if (i.type === PenType.Line) {
                    i.toArrow = value;
                }
            })
        }
        // 重新渲染
        this.render();
    }

    /**
     * 描点
     */
    tracingPoint() {
        meta2d.toggleAnchorMode();
    }

    /**
     * 打开/关闭放大镜
     */
    magnifier(): void {
        // 判断放大镜状态
        if (meta2d.canvas.magnifierCanvas.magnifier) {
            // 关闭放大镜
            meta2d.hideMagnifier();
        } else {
            // 打开放大镜
            meta2d.showMagnifier();
        }
    }

    /**
     * 打开/关闭缩略视图
     */
    thumbnailView() {
        // 判断缩略图是否已经挂载到 meta2d 身上，并判断其是否显示
        if (meta2d.map?.isShow) {
            // 隐藏缩略图 API
            meta2d.hideMap();
        } else {
            // 显示缩略图 API
            meta2d.showMap();
        }
    }

    /**
     * 设置画布状态
     * @param status 状态
     */
    setCanvasStatus(status: LockState): void {
        meta2d.store.data.locked = status;
    }

    /**
     * 设置图元
     * @param dataList Pen 列表
     * @param out
     *          render 是否重新渲染(默认:true)
     *          doEvent 是否触发画笔事件
     *          history 是否将变化添加历史
     */
    setValue(dataList: Array<IValue>, out?: {
        render?: boolean;
        doEvent?: boolean;
        history?: boolean;
    }): void {
        // 默认配置
        const options = {
            render: true,
            doEvent: out?.doEvent,
            history: out?.history,
            ...out
        };
    
        // 批量设置图元属性
        dataList.forEach(data => {
            meta2d.setValue(data, {
                render: false, // 循环中不渲染,最后统一渲染
                doEvent: options.doEvent,
                history: options.history
            });
        });
    
        // 最后统一渲染一次
        if (options.render !== false) {
            this.render();
        }
            
        // 保存到缓存
        new Editor2DCache().saveCanvas();
    }
}
