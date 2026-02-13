/*
 * @description 代码编辑器类型定义
 * @author MC.Yang
 */
import { PropType } from 'vue'

/**
 * 主题
 */
export type Theme = 'vs' | 'hc-black' | 'vs-dark'
/**
 * 折叠策略
 */
export type FoldingStrategy = 'auto' | 'indentation'
/**
 * 渲染线高亮
 */
export type RenderLineHighlight = 'all' | 'line' | 'none' | 'gutter'

/**
 * 组件选项
 */
export interface Options {
  automaticLayout?: boolean // 自适应布局
  foldingStrategy?: FoldingStrategy // 折叠方式  auto | indentation
  renderLineHighlight?: RenderLineHighlight // 行亮
  selectOnLineNumbers?: boolean // 显示行号
  minimap?: {
    // 关闭小地图
    enabled: boolean
  }
  readOnly: boolean // 只读
  contextmenu: boolean
  fontSize?: number // 字体大小
  scrollBeyondLastLine?: boolean // 取消代码后面一大段空白
  overviewRulerBorder?: boolean // 不要滚动条的边框
}

export const EditorProps = {
  modelValue: {
    type: String as PropType<string>,
    default: '',
  },
  width: {
    type: [String, Number] as PropType<string | number>,
    default: '100%',
  },
  height: {
    type: [String, Number] as PropType<string | number>,
    default: '100%',
  },
  language: {
    type: String as PropType<string>,
    default: 'javascript',
  },
  theme: {
    type: String as PropType<Theme>,
    validator(value: string): boolean {
      return ['vs', 'hc-black', 'vs-dark'].includes(value)
    },
    default: 'vs-dark',
  },
  options: {
    type: Object as PropType<Options>,
    default() {
      return {
        automaticLayout: true,
        foldingStrategy: 'indentation',
        renderLineHighlight: 'all',
        selectOnLineNumbers: true,
        minimap: {
          enabled: true,
        },
        readOnly: false,
        contextmenu: true,
        fontSize: 16,
        scrollBeyondLastLine: false,
        overviewRulerBorder: false,
      }
    },
  },
}

export const EditorDiffProps = {
  opts: {
    type: Object as PropType<Options>,
    default() {
      return {}
    },
  },
  oldValue: {
    type: String,
    default: '',
  },
  newValue: {
    type: String,
    default: '',
  },
  width: {
    type: [String, Number] as PropType<string | number>,
    default: '100%',
  },
  height: {
    type: [String, Number] as PropType<string | number>,
    default: '100%',
  },
  language: {
    type: String as PropType<string>,
    default: 'javascript',
  },
  theme: {
    type: String as PropType<Theme>,
    validator(value: string): boolean {
      return ['vs', 'hc-black', 'vs-dark'].includes(value)
    },
    default: 'vs-dark',
  },
}
