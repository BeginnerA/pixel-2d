/**
 * 常用命令实现
 * @description 提供编辑器常用的基础命令实现
 * @author MC.Yang
 */

import { Command, type CommandContext } from '@/core'
import type { Pen } from '@meta2d/core'
import { getMeta2DFromContext, type ExtendedCommandContext } from '@/core/services/CommandContextService'

/**
 * 添加图元命令
 */
export class AddPenCommand extends Command {
  readonly id = 'add-pens'
  readonly label = '添加图元'

  private pens: Pen[]
  private removedPens: Pen[] = []

  constructor(pens: Pen | Pen[]) {
    super()
    this.pens = Array.isArray(pens) ? pens : [pens]
  }

  async execute(context?: CommandContext): Promise<void> {
    const meta2d = getMeta2DFromContext(context as ExtendedCommandContext)
    if (meta2d) {
      // addPens 返回 Promise<Pen[]>，需要 await
      this.removedPens = await meta2d.addPens(this.pens, true)
    }
  }

  async undo(context?: CommandContext): Promise<void> {
    const meta2d = getMeta2DFromContext(context as ExtendedCommandContext)
    if (meta2d && this.removedPens.length > 0) {
      // 删除图元的方法是 delete
      meta2d.delete(this.removedPens)
    }
  }
}

/**
 * 删除图元命令
 */
export class DeletePensCommand extends Command {
  readonly id = 'delete-pens'
  readonly label = '删除图元'

  private pens: Pen[]
  /** 保存已删除的图元，用于撤销 */
  private deletedPens: Pen[] = []

  constructor(pens: Pen | Pen[]) {
    super()
    this.pens = Array.isArray(pens) ? pens : [pens]
  }

  async execute(context?: CommandContext): Promise<void> {
    const meta2d = getMeta2DFromContext(context as ExtendedCommandContext)
    if (meta2d) {
      // 保存被删除的图元，用于撤销（需要深拷贝）
      this.deletedPens = this.pens.map(pen => ({ ...pen }))
      // 删除图元的方法是 delete
      meta2d.delete(this.pens)
    }
  }

  async undo(context?: CommandContext): Promise<void> {
    const meta2d = getMeta2DFromContext(context as ExtendedCommandContext)
    if (meta2d && this.deletedPens.length > 0) {
      // 恢复被删除的图元
      await meta2d.addPens(this.deletedPens, true)
    }
  }
}

/**
 * 更新图元属性命令
 */
export class UpdatePenCommand extends Command {
  readonly id = 'update-pen'
  readonly label = '更新图元属性'

  private penId: string
  private newProps: Partial<Pen>
  private oldProps: Partial<Pen> = {}

  constructor(penId: string, newProps: Partial<Pen>) {
    super()
    this.penId = penId
    this.newProps = newProps
  }

  async execute(context?: CommandContext): Promise<void> {
    const meta2d = getMeta2DFromContext(context as ExtendedCommandContext)
    if (meta2d) {
      const pen = meta2d.store.pens[this.penId]
      if (pen) {
        // 保存旧属性
        Object.keys(this.newProps).forEach((key: string) => {
          (this.oldProps as any)[key] = (pen as any)[key]
        })

        // 更新属性使用 setValue 方法
        meta2d.setValue({ id: this.penId, ...this.newProps })
      }
    }
  }

  async undo(context?: CommandContext): Promise<void> {
    const meta2d = getMeta2DFromContext(context as ExtendedCommandContext)
    if (meta2d) {
      // 使用 setValue 方法恢复旧属性
      meta2d.setValue({ id: this.penId, ...this.oldProps })
    }
  }
}

/**
 * 清空画布命令
 */
export class ClearCanvasCommand extends Command {
  readonly id = 'clear-canvas'
  readonly label = '清空画布'

  private oldData: any

  async execute(context?: CommandContext): Promise<void> {
    const meta2d = getMeta2DFromContext(context as ExtendedCommandContext)
    if (meta2d) {
      this.oldData = meta2d.store.data
      meta2d.clear()
    }
  }

  async undo(context?: CommandContext): Promise<void> {
    const meta2d = getMeta2DFromContext(context as ExtendedCommandContext)
    if (meta2d && this.oldData) {
      // 使用 open 方法恢复数据
      meta2d.open(this.oldData)
    }
  }
}

/**
 * 缩放命令
 */
export class ZoomCommand extends Command {
  readonly id = 'zoom'
  readonly label = '缩放画布'

  private scale: number
  private center?: { x: number; y: number }
  private oldScale: number = 1

  constructor(scale: number, center?: { x: number; y: number }) {
    super()
    this.scale = scale
    this.center = center
  }

  async execute(context?: CommandContext): Promise<void> {
    const meta2d = getMeta2DFromContext(context as ExtendedCommandContext)
    if (meta2d) {
      this.oldScale = meta2d.store.data.scale
      meta2d.store.data.scale = this.scale
      meta2d.render()
    }
  }

  async undo(context?: CommandContext): Promise<void> {
    const meta2d = getMeta2DFromContext(context as ExtendedCommandContext)
    if (meta2d) {
      meta2d.store.data.scale = this.oldScale
      meta2d.render()
    }
  }
}
