/*
 * @description 2D编辑器输入验证工具
 * @author MC.Yang
 */

/**
 * 数据验证器
 */
export class Editor2DValidator {
  /**
   * 验证字符串非空
   */
  static isNonEmptyString(value: any): boolean {
    return typeof value === 'string' && value.trim().length > 0
  }

  /**
   * 验证数字范围
   */
  static isNumberInRange(value: any, min: number, max: number): boolean {
    return typeof value === 'number' && !isNaN(value) && value >= min && value <= max
  }

  /**
   * 验证URL格式
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * 验证JSON字符串
   */
  static isValidJson(str: string): boolean {
    try {
      JSON.parse(str)
      return true
    } catch {
      return false
    }
  }

  /**
   * 验证对象是否包含必需属性
   */
  static hasRequiredProps(obj: any, props: string[]): boolean {
    if (typeof obj !== 'object' || obj === null) {
      return false
    }
    return props.every((prop) => prop in obj)
  }

  /**
   * 验证文件类型
   */
  static isValidFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.some((type) => file.type === type || file.name.endsWith(type))
  }

  /**
   * 验证文件大小
   */
  static isValidFileSize(file: File, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024
    return file.size <= maxSizeInBytes
  }

  /**
   * 清理HTML标签(防止XSS)
   */
  static sanitizeHtml(str: string): string {
    const div = document.createElement('div')
    div.textContent = str
    return div.innerHTML
  }

  /**
   * 验证端口号
   */
  static isValidPort(port: number | string): boolean {
    const portNum = typeof port === 'string' ? parseInt(port, 10) : port
    return !isNaN(portNum) && portNum >= 1 && portNum <= 65535
  }

  /**
   * 验证颜色值
   */
  static isValidColor(color: string): boolean {
    // 支持 hex, rgb, rgba, 颜色名称
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{8})$/
    const rgbRegex = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/
    const rgbaRegex = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(0|1|0?\.\d+)\s*\)$/

    return hexRegex.test(color) || rgbRegex.test(color) || rgbaRegex.test(color)
  }
}
