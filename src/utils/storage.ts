/**
 * 本地存储工具
 * @description 封装 localStorage 和 sessionStorage 操作
 * @author MC.Yang
 */

/**
 * 存储类型
 */
type StorageType = 'local' | 'session'

/**
 * 获取存储实例
 */
function getStorageInstance(type: StorageType): Storage {
  return type === 'local' ? localStorage : sessionStorage
}

/**
 * 设置存储项
 * @param key 键
 * @param value 值
 * @param type 存储类型，默认 'local'
 */
export function setStorage(key: string, value: any, type: StorageType = 'local'): void {
  try {
    const storage = getStorageInstance(type)
    const serializedValue = JSON.stringify(value)
    storage.setItem(key, serializedValue)
  } catch (error) {
    console.error(`Failed to set storage item "${key}":`, error)
  }
}

/**
 * 获取存储项
 * @param key 键
 * @param defaultValue 默认值
 * @param type 存储类型，默认 'local'
 * @returns 值
 */
export function getStorage<T = any>(key: string, defaultValue?: T, type: StorageType = 'local'): T | undefined {
  try {
    const storage = getStorage(type)
    const item = storage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Failed to get storage item "${key}":`, error)
    return defaultValue
  }
}

/**
 * 移除存储项
 * @param key 键
 * @param type 存储类型，默认 'local'
 */
export function removeStorage(key: string, type: StorageType = 'local'): void {
  try {
    const storage = getStorageInstance(type)
    storage.removeItem(key)
  } catch (error) {
    console.error(`Failed to remove storage item "${key}":`, error)
  }
}

/**
 * 清空存储
 * @param type 存储类型，默认 'local'
 */
export function clearStorage(type: StorageType = 'local'): void {
  try {
    const storage = getStorageInstance(type)
    storage.clear()
  } catch (error) {
    console.error('Failed to clear storage:', error)
  }
}
