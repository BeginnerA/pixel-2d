/*
 * @description 2D编辑器核心类
 * @author MC.Yang
 */
import { Meta2dData } from '@meta2d/core/src/store/store'
import { Editor2DOptions } from './editor2d-global-type'

/**
 * 抽象的2D编辑器基础类
 */
export abstract class Editor2dBase {
  /** meta2d实例 */
  protected meta2dInstance?: any

  /**
   * 设置meta2d实例
   * @param instance meta2d实例
   */
  setMeta2dInstance(instance: any): void {
    this.meta2dInstance = instance
  }

  /**
   * 获取meta2d实例
   */
  protected getMeta2d(): any {
    return this.meta2dInstance || meta2d
  }

  /**
   * 刷新画布
   */
  render(): void {
    this.getMeta2d().render()
  }
}

export abstract class Editor2dCore extends Editor2dBase {
  /**
   * 设置选项
   * @param opts 设置选项
   */
  setOptions(opts: Editor2DOptions): void {
    const m2d = this.getMeta2d()
    m2d.setOptions(opts)
    this.render()
  }

  /**
   * 设置选项(单个属性)
   * @param key 属性
   * @param value 值(支持多种类型)
   */
  setOptionsKey(key: string, value: string | number | boolean): void {
    this.setOptions({ [key]: value })
    this.render()
  }

  /**
   * 得到选项设置
   */
  getOptions(): Editor2DOptions {
    return this.getMeta2d().getOptions()
  }

  /**
   * 设置数据
   * @param key 属性
   * @param dataValue 值(支持多种类型)
   */
  setData(key: string, dataValue: any): void {
    const m2d = this.getMeta2d()
    switch (key) {
      case 'background':
        m2d.setBackgroundColor(dataValue)
        break
      case 'bkImage':
        m2d.setBackgroundImage(dataValue).then((r: any) => {
          console.log(r)
        })
        break
      case 'grid':
      case 'gridColor':
      case 'gridSize':
      case 'gridRotate':
        // 通过meta2dService统一管理网格设置，避免重复配置
        ;(m2d.store.data as Record<string, any>)[key] = dataValue
        m2d.canvas && (m2d.canvas.canvasTemplate.bgPatchFlags = true)
        break
      case 'rule':
      case 'ruleColor':
        // 通过meta2dService统一管理标尺设置，避免重复配置
        ;(m2d.store.data as Record<string, any>)[key] = dataValue
        m2d.store.patchFlagsTop = true
        break
      default:
        // 其他属性直接设置到store.data
        ;(m2d.store.data as Record<string, any>)[key] = dataValue
        break
    }
    this.render()
  }

  /**
   * 2d编辑器获取图纸数据
   */
  getData(): Meta2dData {
    return this.getMeta2d().store.data
  }
}
