/*
 * @description 2D编辑器
 * @author MC.Yang
 */

/**
 * 判断菜单是否显示标题
 *
 * @param isDisplay 是否显示
 * @param displayContent 显示内容
 * @param displayIcon 显示图标
 * @return boolean
 */
export function isDisplayTitle(isDisplay: boolean, displayContent: any, displayIcon: any): boolean {
  if (isDisplay) {
    return !!displayContent
  } else {
    return !displayIcon
  }
}

/**
 * 判断菜单是否显示图标
 *
 * @param isDisplay 是否显示
 * @param displayContent 显示内容
 * @param displayIcon 显示图标
 * @return boolean
 */
export function isDisplayIcon(isDisplay: boolean, displayContent: any, displayIcon: any): boolean {
  if (isDisplay) {
    return !!displayIcon
  } else {
    return !displayContent
  }
}

/**
 * 是函数
 */
export function isFunction(val: any): boolean {
  return typeof val === 'function'
}

// 常量定义 - 避免循环中重复创建数组
const RECT_KEYS = ['width', 'height', 'x', 'y']

/**
 * 合并属性
 * @param target 目标对象
 * @param resource 源对象
 */
export function mergeProps(target: any, resource: any): void {
  // 只调用一次 getPenRect
  let rect: { [key: string]: number } | null = null

  for (let i in target) {
    if (RECT_KEYS.includes(i)) {
      // 懒加载 rect
      if (!rect) {
        rect = meta2d.getPenRect(resource)
      }
      target[i] = rect[i]
      continue
    }

    if (resource[i] !== undefined) {
      target[i] = resource[i]
    } else if (resource.calculative?.[i] !== undefined) {
      target[i] = resource.calculative[i]
    } else {
      // 设置默认值
      switch (typeof target[i]) {
        case 'string':
          target[i] = ''
          break
        case 'number':
          target[i] = 0
          break
        case 'boolean':
          target[i] = false
          break
      }
    }
  }
}

/**
 * 判断字符串是否是数组
 * @param str 字符串
 */
export function isJsonArray(str: string) {
  try {
    const parsed = JSON.parse(str)
    return Array.isArray(parsed)
  } catch (e) {
    return false
  }
}

/**
 * 是否是有效的 WebSocket 地址
 * @param url 地址
 */
export function isValidWebSocketUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false
  }

  try {
    const urlObj = new URL(url)

    // 检查协议
    if (urlObj.protocol !== 'ws:' && urlObj.protocol !== 'wss:') {
      return false
    }

    // 检查主机名
    if (!urlObj.hostname) {
      return false
    }

    // 检查端口号(如果有)
    if (urlObj.port) {
      const port = parseInt(urlObj.port, 10)
      if (isNaN(port) || port < 1 || port > 65535) {
        return false
      }
    }

    return true
  } catch (e) {
    // URL 构造失败
    return false
  }
}
