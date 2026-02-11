/**
 * 日期工具函数
 * @description 提供日期格式化和处理功能
 * @author MC.Yang
 */

/**
 * 日期格式化
 * @param date 日期对象或时间戳
 * @param format 格式字符串，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 * @example
 * ```ts
 * formatDate(new Date()) // '2024-11-19 10:30:45'
 * formatDate(Date.now(), 'YYYY-MM-DD') // '2024-11-19'
 * ```
 */
export function formatDate(date: Date | number, format = 'YYYY-MM-DD HH:mm:ss'): string {
  const d = typeof date === 'number' ? new Date(date) : date

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 获取相对时间描述
 * @param date 日期对象或时间戳
 * @returns 相对时间描述
 * @example
 * ```ts
 * getRelativeTime(Date.now() - 60000) // '1分钟前'
 * ```
 */
export function getRelativeTime(date: Date | number): string {
  const now = Date.now()
  const timestamp = typeof date === 'number' ? date : date.getTime()
  const diff = now - timestamp

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const month = 30 * day
  const year = 365 * day

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < month) {
    return `${Math.floor(diff / day)}天前`
  } else if (diff < year) {
    return `${Math.floor(diff / month)}个月前`
  } else {
    return `${Math.floor(diff / year)}年前`
  }
}
