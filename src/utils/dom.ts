/**
 * DOM 工具函数
 * @description 提供 DOM 操作相关的工具函数
 * @author MC.Yang
 */

/**
 * 下载文件
 * @param data 文件数据
 * @param filename 文件名
 * @param mimeType MIME 类型
 */
export function downloadFile(data: string | Blob, filename: string, mimeType?: string): void {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns Promise<boolean>
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 降级方案
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      const success = document.execCommand('copy')
      document.body.removeChild(textarea)
      return success
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * 全屏显示元素
 * @param element 要全屏的元素
 */
export function requestFullscreen(element: HTMLElement = document.documentElement): void {
  if (element.requestFullscreen) {
    element.requestFullscreen()
  }
}

/**
 * 退出全屏
 */
export function exitFullscreen(): void {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  }
}

/**
 * 检查是否全屏
 */
export function isFullscreen(): boolean {
  return !!document.fullscreenElement
}
