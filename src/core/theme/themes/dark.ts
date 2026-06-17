/**
 * 暗色主题变量定义
 * @description 深色背景、浅色文字、适当降低饱和度的主色调
 */

export const darkTheme: Record<string, string> = {
  // 主题色彩（降低饱和度）
  '--color-primary': '#4582e6',
  '--color-success': '#2ba471',
  '--color-warning': '#e37318',
  '--color-error': '#d54941',
  '--color-info': '#4582e6',

  // 中性色（深色梯度反转）
  '--color-gray-1': '#1f1f1f',
  '--color-gray-2': '#292929',
  '--color-gray-3': '#333333',
  '--color-gray-4': '#3d3d3d',
  '--color-gray-5': '#4b4b4b',
  '--color-gray-6': '#5e5e5e',
  '--color-gray-7': '#777777',
  '--color-gray-8': '#8b8b8b',
  '--color-gray-9': '#a6a6a6',
  '--color-gray-10': '#c5c5c5',

  // 文字颜色（浅色文字）
  '--text-color-primary': 'rgba(255, 255, 255, 0.9)',
  '--text-color-secondary': 'rgba(255, 255, 255, 0.6)',
  '--text-color-placeholder': 'rgba(255, 255, 255, 0.4)',
  '--text-color-disabled': 'rgba(255, 255, 255, 0.26)',
  '--text-color-anti': '#ffffff',

  // 背景色（深色背景）
  '--bg-color-page': '#1a1a1a',
  '--bg-color-container': '#242424',
  '--bg-color-component': '#2c2c2c',
  '--bg-color-secondary-container': '#1f1f1f',

  // 边框
  '--border-color': '#3d3d3d',
  '--border-color-separator': '#333333',

  // 阴影（暗色模式降低对比）
  '--shadow-1': '0 1px 10px rgba(0, 0, 0, 0.35), 0 4px 5px rgba(0, 0, 0, 0.32), 0 2px 4px -1px rgba(0, 0, 0, 0.22)',
  '--shadow-2': '0 3px 14px 2px rgba(0, 0, 0, 0.35), 0 8px 10px 1px rgba(0, 0, 0, 0.36), 0 5px 5px -3px rgba(0, 0, 0, 0.28)',
  '--shadow-3': '0 6px 30px 5px rgba(0, 0, 0, 0.35), 0 16px 24px 2px rgba(0, 0, 0, 0.34), 0 8px 10px -5px rgba(0, 0, 0, 0.22)',

  // 字体（与亮色保持一致）
  '--font-family': "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
  '--font-size-base': '14px',
  '--font-size-s': '12px',
  '--font-size-m': '14px',
  '--font-size-l': '16px',
  '--font-size-xl': '18px',

  // 间距（与亮色保持一致）
  '--spacer': '16px',
  '--spacer-1': '8px',
  '--spacer-2': '16px',
  '--spacer-3': '24px',
  '--spacer-4': '32px',
  '--spacer-5': '40px',

  // 圆角（与亮色保持一致）
  '--border-radius-small': '3px',
  '--border-radius-default': '6px',
  '--border-radius-medium': '9px',
  '--border-radius-large': '12px',

  // 动画（与亮色保持一致）
  '--anim-duration-base': '0.2s',
  '--anim-duration-slow': '0.3s',
  '--anim-time-fn-ease-in': 'cubic-bezier(0.55, 0, 1, 0.45)',
  '--anim-time-fn-ease-out': 'cubic-bezier(0, 0.55, 0.45, 1)',
  '--anim-time-fn-ease-in-out': 'cubic-bezier(0.45, 0, 0.55, 1)',

  // 层级（与亮色保持一致）
  '--z-index-base': '1',
  '--z-index-dropdown': '1050',
  '--z-index-fixed': '1030',
  '--z-index-modal-backdrop': '1040',
  '--z-index-modal': '1050',
  '--z-index-popover': '1060',
  '--z-index-tooltip': '1070',

  // 画布（Meta2D）
  '--canvas-bg-color': '#1e1e1e',
  '--canvas-grid-color': '#333333',
}
