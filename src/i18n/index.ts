/**
 * @description 国际化配置
 * @author Pixel-2D
 */
import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN'
import enUS from './locales/en-US'

/** 支持的语言列表 */
export const SUPPORTED_LOCALES = ['zh-CN', 'en-US'] as const

/** 语言类型 */
export type LocaleType = (typeof SUPPORTED_LOCALES)[number]

/** localStorage 存储key */
const LOCALE_STORAGE_KEY = 'pixel-2d-locale'

/** 默认语言 */
const DEFAULT_LOCALE: LocaleType = 'zh-CN'

/**
 * 获取存储的语言偏好
 */
function getStoredLocale(): LocaleType {
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (stored && SUPPORTED_LOCALES.includes(stored as LocaleType)) {
    return stored as LocaleType
  }
  return DEFAULT_LOCALE
}

/**
 * 创建 vue-i18n 实例
 */
const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: getStoredLocale(),
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
})

/**
 * 切换语言
 * @param locale 目标语言
 */
export function setLocale(locale: LocaleType): void {
  if (!SUPPORTED_LOCALES.includes(locale)) {
    console.warn(`[i18n] Unsupported locale: ${locale}`)
    return
  }
  i18n.global.locale.value = locale
  localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  // 更新 HTML lang 属性
  document.documentElement.setAttribute('lang', locale)
}

/**
 * 获取当前语言
 * @returns 当前语言标识
 */
export function getCurrentLocale(): LocaleType {
  return i18n.global.locale.value as LocaleType
}

export default i18n
