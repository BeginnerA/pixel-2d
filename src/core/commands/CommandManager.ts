/**
 * 命令模式 - 撤销/重做系统
 * @description 实现命令模式，支持完整的撤销/重做栈和事务处理
 * @author MC.Yang
 */

import { EventBus } from '@/core'

/** 命令上下文 */
export interface CommandContext {
  [key: string]: any
}

/** 命令接口 */
export interface ICommand {
  /** 命令唯一ID */
  readonly id: string
  /** 命令显示名称 */
  readonly label: string
  /** 是否可撤销 */
  readonly undoable: boolean
  /** 执行命令 */
  execute(context?: CommandContext): void | Promise<void>
  /** 撤销命令 */
  undo?(context?: CommandContext): void | Promise<void>
  /** 重做命令 */
  redo?(context?: CommandContext): void | Promise<void>
}

/** 命令历史记录 */
interface CommandHistory {
  command: ICommand
  context?: CommandContext
  timestamp: number
}

/**
 * 命令管理器
 */
export class CommandManager {
  private commands = new Map<string, ICommand>()
  private undoStack: CommandHistory[] = []
  private redoStack: CommandHistory[] = []
  private maxHistorySize = 50
  private eventBus: EventBus

  constructor(eventBus: EventBus) {
    if (!eventBus) {
      throw new Error('[CommandManager] eventBus 是必需的参数')
    }
    this.eventBus = eventBus
  }

  /**
   * 注册命令
   */
  registerCommand(command: ICommand): void {
    if (this.commands.has(command.id)) {
      console.warn(`[CommandManager] 命令 "${command.id}" 已注册`)
    }
    this.commands.set(command.id, command)
  }

  /**
   * 批量注册命令
   */
  registerCommands(commands: ICommand[]): void {
    commands.forEach((cmd) => this.registerCommand(cmd))
  }

  /**
   * 执行命令
   */
  async execute(commandId: string, context?: CommandContext): Promise<void> {
    const command = this.commands.get(commandId)
    if (!command) {
      throw new Error(`[CommandManager] 命令 "${commandId}" 未找到`)
    }

    try {
      // 执行命令
      await command.execute(context)

      // 如果可撤销，加入撤销栈
      if (command.undoable && command.undo) {
        this.undoStack.push({
          command,
          context,
          timestamp: Date.now(),
        })

        // 限制栈大小
        if (this.undoStack.length > this.maxHistorySize) {
          this.undoStack.shift()
        }

        // 清空重做栈
        this.redoStack = []

        // 发射事件
        this.eventBus.emitSync('command:executed', { commandId, context })
      }
    } catch (error) {
      console.error(`[CommandManager] 执行命令失败 "${commandId}":`, error)
      this.eventBus.emitSync('command:error', { commandId, error })
      throw error
    }
  }

  /**
   * 撤销
   */
  async undo(): Promise<void> {
    if (this.undoStack.length === 0) {
      console.warn('[CommandManager] 没有要撤消的内容')
      return
    }

    const history = this.undoStack.pop()!
    const { command, context } = history

    if (!command.undo) {
      throw new Error(`[CommandManager] 命令 "${command.id}" 不支持撤消`)
    }

    try {
      await command.undo(context)
      this.redoStack.push(history)
      this.eventBus.emitSync('command:undo', { commandId: command.id, context })
    } catch (error) {
      console.error(`[CommandManager] 撤消命令失败 "${command.id}":`, error)
      this.undoStack.push(history) // 恢复到撤销栈
      throw error
    }
  }

  /**
   * 重做
   */
  async redo(): Promise<void> {
    if (this.redoStack.length === 0) {
      console.warn('[CommandManager] 没什么要重做的')
      return
    }

    const history = this.redoStack.pop()!
    const { command, context } = history

    try {
      // 优先使用 redo 方法，否则使用 execute
      if (command.redo) {
        await command.redo(context)
      } else {
        await command.execute(context)
      }

      this.undoStack.push(history)
      this.eventBus.emitSync('command:redo', { commandId: command.id, context })
    } catch (error) {
      console.error(`[CommandManager] 无法重做命令 "${command.id}":`, error)
      this.redoStack.push(history) // 恢复到重做栈
      throw error
    }
  }

  /**
   * 清空历史记录
   */
  clearHistory(): void {
    this.undoStack = []
    this.redoStack = []
    this.eventBus.emitSync('command:history-cleared', {})
  }

  /**
   * 是否可撤销
   */
  canUndo(): boolean {
    return this.undoStack.length > 0
  }

  /**
   * 是否可重做
   */
  canRedo(): boolean {
    return this.redoStack.length > 0
  }

  /**
   * 获取撤销栈大小
   */
  getUndoStackSize(): number {
    return this.undoStack.length
  }

  /**
   * 获取重做栈大小
   */
  getRedoStackSize(): number {
    return this.redoStack.length
  }

  /**
   * 销毁命令管理器
   */
  destroy(): void {
    this.clearHistory()
    this.commands.clear()
    this.eventBus.emitSync('command-manager:destroyed', {})
  }

  /**
   * 设置最大历史记录数
   */
  setMaxHistorySize(size: number): void {
    this.maxHistorySize = size
  }
}

/**
 * 抽象命令基类
 */
export abstract class Command implements ICommand {
  abstract readonly id: string
  abstract readonly label: string
  readonly undoable: boolean = true

  abstract execute(context?: CommandContext): void | Promise<void>
  abstract undo?(context?: CommandContext): void | Promise<void>

  redo?(context?: CommandContext): void | Promise<void> {
    return this.execute(context)
  }
}
