/**
 * 主题模块统一导出
 * @description 提供主题管理、亮暗色主题变量的一站式导入
 */

// 主题管理器
export { ThemeManager, createThemeManager } from './ThemeManager'
export type { ThemeMode, ResolvedTheme, ThemeChangedPayload } from './ThemeManager'

// 主题变量
export { lightTheme } from './themes/light'
export { darkTheme } from './themes/dark'
