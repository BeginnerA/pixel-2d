/**
 * 状态管理模块导出
 */
export { StateMachine } from './StateMachine'
export type { IState, StateTransition } from './StateMachine'

export { EditorStateManager, createEditorStateManager } from './EditorStateManager'
export type { IEditorStateManager, StateChangeEvent } from './EditorStateManager'
