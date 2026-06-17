/**
 * 亮色主题变量定义
 * @description 基于 variables.less 中的默认值，导出为 CSS Custom Properties 对象格式
 */

export const lightTheme: Record<string, string> = {
  // 主题色彩
  '--color-primary': '#0052d9',
  '--color-success': '#00a870',
  '--color-warning': '#ed7b2f',
  '--color-error': '#e34d59',
  '--color-info': '#0052d9',

  // 中性色
  '--color-gray-1': '#f3f3f3',
  '--color-gray-2': '#eeeeee',
  '--color-gray-3': '#e7e7e7',
  '--color-gray-4': '#dcdcdc',
  '--color-gray-5': '#c5c5c5',
  '--color-gray-6': '#a6a6a6',
  '--color-gray-7': '#8b8b8b',
  '--color-gray-8': '#777777',
  '--color-gray-9': '#5e5e5e',
  '--color-gray-10': '#4b4b4b',

  // 文字颜色
  '--text-color-primary': 'rgba(0, 0, 0, 0.9)',
  '--text-color-secondary': 'rgba(0, 0, 0, 0.6)',
  '--text-color-placeholder': 'rgba(0, 0, 0, 0.4)',
  '--text-color-disabled': 'rgba(0, 0, 0, 0.26)',
  '--text-color-anti': '#ffffff',

  // 背景色
  '--bg-color-page': '#f5f5f5',
  '--bg-color-container': '#ffffff',
  '--bg-color-component': '#f3f3f3',
  '--bg-color-secondary-container': '#f9f9f9',

  // 边框
  '--border-color': '#dcdcdc',
  '--border-color-separator': '#e7e7e7',

  // 阴影
  '--shadow-1': '0 1px 10px rgba(0, 0, 0, 0.05), 0 4px 5px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.12)',
  '--shadow-2': '0 3px 14px 2px rgba(0, 0, 0, 0.05), 0 8px 10px 1px rgba(0, 0, 0, 0.06), 0 5px 5px -3px rgba(0, 0, 0, 0.1)',
  '--shadow-3': '0 6px 30px 5px rgba(0, 0, 0, 0.05), 0 16px 24px 2px rgba(0, 0, 0, 0.04), 0 8px 10px -5px rgba(0, 0, 0, 0.08)',

  // 字体
  '--font-family': "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
  '--font-size-base': '14px',
  '--font-size-s': '12px',
  '--font-size-m': '14px',
  '--font-size-l': '16px',
  '--font-size-xl': '18px',

  // 间距
  '--spacer': '16px',
  '--spacer-1': '8px',
  '--spacer-2': '16px',
  '--spacer-3': '24px',
  '--spacer-4': '32px',
  '--spacer-5': '40px',

  // 圆角
  '--border-radius-small': '3px',
  '--border-radius-default': '6px',
  '--border-radius-medium': '9px',
  '--border-radius-large': '12px',

  // 动画
  '--anim-duration-base': '0.2s',
  '--anim-duration-slow': '0.3s',
  '--anim-time-fn-ease-in': 'cubic-bezier(0.55, 0, 1, 0.45)',
  '--anim-time-fn-ease-out': 'cubic-bezier(0, 0.55, 0.45, 1)',
  '--anim-time-fn-ease-in-out': 'cubic-bezier(0.45, 0, 0.55, 1)',

  // 层级
  '--z-index-base': '1',
  '--z-index-dropdown': '1050',
  '--z-index-fixed': '1030',
  '--z-index-modal-backdrop': '1040',
  '--z-index-modal': '1050',
  '--z-index-popover': '1060',
  '--z-index-tooltip': '1070',

  // 画布（Meta2D）
  '--canvas-bg-color': '#ffffff',
  '--canvas-grid-color': '#f0f0f0',
}
