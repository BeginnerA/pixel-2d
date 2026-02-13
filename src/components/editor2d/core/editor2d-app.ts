/*
 * @description 2D编辑器应用
 * @author MC.Yang
 */
import { parseSvg } from '@meta2d/svg'

/**
 * 抽象打开文件功能
 */
abstract class OpenEditor2DFile {
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
   * 创建新文件
   */
  new(): void {
    const m2d = this.getMeta2d()
    m2d.open()
    m2d.fitView()
  }

  /**
   * 读取文件内容
   * @param file 文件
   */
  readFile(file: Blob): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      // 文件大小限制 (10MB)
      const MAX_FILE_SIZE = 10 * 1024 * 1024
      if (file.size > MAX_FILE_SIZE) {
        reject(
          new Error(`文件大小 ${(file.size / 1024 / 1024).toFixed(2)}MB 超过限制 ${MAX_FILE_SIZE / 1024 / 1024}MB`)
        )
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        resolve(reader.result as string)
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsText(file)
    })
  }

  /**
   * 打开文件
   */
  open(): void {
    const m2d = this.getMeta2d()
    // 显示选择文件对话框
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,.svg,image/svg+xml,application/json' // 限制文件类型
    input.onchange = async (event) => {
      const elem = event.target as HTMLInputElement
      if (elem.files && elem.files[0]) {
        try {
          // 读取文件字符串内容
          const text = await this.readFile(elem.files[0])

          // 打开文件内容
          if (elem.files[0].type === 'image/svg+xml') {
            // 文件是 SVG(MIME 类型为 image/svg+xml)
            m2d.canvas.addCaches = parseSvg(text)
          } else {
            // 文件是 JSON - 严格验证
            if (!text.trim().startsWith('{') && !text.trim().startsWith('[')) {
              throw new Error('无效的 JSON 文件格式')
            }
            const json = JSON.parse(text)
            // 基本的数据验证
            if (typeof json !== 'object') {
              throw new Error('JSON 数据格式不正确')
            }
            m2d.open(json)
          }
          // 可选:缩放到窗口大小展示
          m2d.fitView()
        } catch (e) {
          console.error('打开文件失败:', e)
          alert(`文件打开失败: ${e instanceof Error ? e.message : '未知错误'}`)
        }
      }
    }
    input.click()
  }

  /**
   * 导入文件
   */
  abstract loadFile(): void
}

/**
 * 抽象保存文件功能
 */
abstract class SaveEditor2DFile {
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
   * 保存文件文件
   */
  save(): void {
    try {
      const m2d = this.getMeta2d()
      // 获取数据
      const jsonData = m2d.store.data
      // 序列化JSON 对象
      const json = JSON.stringify(jsonData)
      // 创建文件对象,指定类型为 JSON
      const file = new Blob([json], { type: 'application/json' })
      // 创建 URL 指向内存中的文件对象
      const link = URL.createObjectURL(file)
      // 创建 a 标签用于下载操作
      const a = document.createElement('a')
      // 文件名称
      const fileName = `${jsonData.name || '未命名'}.json`
      // 设置 download 属性 第二个参数为文件名
      a.setAttribute('download', fileName)
      // 设置 a 标签的数据来源
      a.setAttribute('href', link)
      // 点击,开始下载
      a.click()
      // 释放 URL 对象,防止内存泄漏
      setTimeout(() => URL.revokeObjectURL(link), 100)
    } catch (error) {
      console.error('保存文件失败:', error)
      alert('保存文件失败,请重试')
    }
  }
}

/**
 * 导入文件功能
 */
export class LoadFile extends OpenEditor2DFile {
  /**
   * 创建新文件
   */
  newFile(): void {
    this.new()
  }

  /**
   * 打开文件
   */
  openFile(): void {
    this.open()
  }

  loadFile(): void {
    this.open()
  }
}

/**
 * 保存 JSON 文件功能
 */
export class SaveFile extends SaveEditor2DFile {
  /**
   * 保存 JSON 文件
   */
  saveJsonFile(): void {
    this.save()
  }

  /**
   * 保存 PNG 文件
   */
  savePngFile(): void {
    try {
      const m2d = this.getMeta2d()
      const name = m2d.store.data.name || '未命名'
      m2d.downloadPng(name)
    } catch (error) {
      console.error('保存 PNG 文件失败:', error)
      alert('保存 PNG 文件失败,请重试')
    }
  }

  /**
   * 判断该画笔是否是组合为状态中展示的画笔
   * @param pen 笔
   * @param store 状态中笔
   */
  isShowChild(pen: any, store: any) {
    let selfPen = pen
    while (selfPen && selfPen.parentId) {
      const oldPen = selfPen
      selfPen = store.pens[selfPen.parentId]
      const showChildIndex = selfPen?.calculative?.showChild
      if (showChildIndex != undefined) {
        const showChildId = selfPen.children[showChildIndex]
        if (showChildId !== oldPen.id) {
          return false
        }
      }
    }
    return true
  }

  /**
   * 保存 SVG 文件
   */
  saveSvgFile(): void {
    const m2d = this.getMeta2d()
    if (!C2S) {
      console.error('请先加载canvas2svg.js插件')
      alert('缺少 canvas2svg.js 插件,无法导出 SVG')
      return
    }

    try {
      const rect: any = m2d.getRect()
      rect.x -= 10
      rect.y -= 10
      const ctx = new C2S(rect.width + 20, rect.height + 20)
      ctx.textBaseline = 'middle'

      for (const pen of m2d.store.data.pens) {
        if (pen.visible === false || !this.isShowChild(pen, m2d.store)) {
          continue
        }
        m2d.renderPenRaw(ctx, pen, rect)
      }

      let mySerializedSVG = ctx.getSerializedSvg()

      // 处理背景颜色
      if (m2d.store.data.background) {
        mySerializedSVG = mySerializedSVG.replace('{{bk}}', '')
        mySerializedSVG = mySerializedSVG.replace(
          '{{bkRect}}',
          `<rect x="0" y="0" width="100%" height="100%" fill="${m2d.store.data.background}"></rect>`
        )
      } else {
        mySerializedSVG = mySerializedSVG.replace('{{bk}}', '')
        mySerializedSVG = mySerializedSVG.replace('{{bkRect}}', '')
      }

      mySerializedSVG = mySerializedSVG.replace(/--le5le--/g, '&#x')

      const export_blob = new Blob([mySerializedSVG], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(export_blob)

      const a = document.createElement('a')
      a.setAttribute('download', `${m2d.store.data.name || '未命名'}.svg`)
      a.setAttribute('href', url)

      // 创建一个新的 MouseEvent 事件
      const evt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
      })

      document.body.appendChild(a)
      a.dispatchEvent(evt)
      document.body.removeChild(a)

      // 释放 URL 对象,防止内存泄漏
      setTimeout(() => URL.revokeObjectURL(url), 100)
    } catch (error) {
      console.error('保存 SVG 文件失败:', error)
      alert('保存 SVG 文件失败,请重试')
    }
  }
}
