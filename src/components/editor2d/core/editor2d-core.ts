/*
 * @description: 2D编辑器核心类
 * @author: MC.Yang
 */
import {Meta2dData} from "@meta2d/core/src/store/store";
import {Editor2DOptions} from "./editor2d-global-type";

/**
 * 抽象的2D编辑器基础类
 */
export abstract class Editor2dBase {
    /**
     * 刷新画布
     */
    render(): void {
        meta2d.render();
    }
}

export abstract class Editor2dCore extends Editor2dBase {

    /**
     * 设置选项
     * @param opts 设置选项
     */
    setOptions(opts: Editor2DOptions): void {
        meta2d.setOptions(opts);
        this.render();
    }

    /**
     * 设置选项(单个属性)
     * @param key 属性
     * @param value 值(支持多种类型)
     */
    setOptionsKey(key: string, value: string | number | boolean): void {
        this.setOptions({[key]: value});
        this.render();
    }

    /**
     * 得到选项设置
     */
    getOptions(): Editor2DOptions {
        return meta2d.getOptions();
    }

    /**
     * 设置数据
     * @param key 属性
     * @param dataValue 值(支持多种类型)
     */
    setData(key: string, dataValue: any): void {
        switch (key) {
            case 'background':
                meta2d.setBackgroundColor(dataValue);
                break;
            case 'bkImage':
                meta2d.setBackgroundImage(dataValue).then(r => {
                    console.log(r);
                });
                break;
            case 'grid':
            case 'gridColor':
            case 'gridSize':
            case 'gridRotate':
                meta2d.setGrid({[key]: dataValue});
                break;
            case 'rule':
            case 'ruleColor':
                meta2d.setRule({[key]: dataValue});
                break;
            default:
                break;
        }
        // 使用类型断言替代 any
        (meta2d.store.data as Record<string, any>)[key] = dataValue;
        this.render();
    }

    /**
     * 2d编辑器获取图纸数据
     */
    getData(): Meta2dData {
        return meta2d.store.data;
    }

}

