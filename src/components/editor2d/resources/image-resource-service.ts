/*
 * @description 图片资源管理服务
 * @description 提供图片上传、压缩、裁剪、分类管理、缓存和持久化能力
 */

/** 图片元数据 */
export interface ImageMeta {
  /** 唯一标识 */
  id: string
  /** 图片名称 */
  name: string
  /** 图片宽度 */
  width: number
  /** 图片高度 */
  height: number
  /** 文件大小（字节） */
  size: number
  /** MIME 类型 */
  type: string
  /** 分类标签 */
  category: string
  /** 上传时间戳 */
  uploadedAt: number
  /** 缩略图 Base64（小图预览用） */
  thumbnail?: string
}

/** 图片压缩选项 */
export interface CompressOptions {
  /** 图片质量 0-1，默认 0.8 */
  quality?: number
  /** 最大宽度/高度，默认 1920 */
  maxSize?: number
  /** 输出 MIME 类型，默认 image/jpeg */
  mimeType?: string
}

/** 图片裁剪选项 */
export interface CropOptions {
  /** 裁剪起始 X */
  x: number
  /** 裁剪起始 Y */
  y: number
  /** 裁剪宽度 */
  width: number
  /** 裁剪高度 */
  height: number
}

/** 分类信息 */
export interface ImageCategory {
  /** 分类ID */
  id: string
  /** 分类名称 */
  name: string
}

// ==================== IndexedDB 简单封装 ====================

const DB_NAME = 'pixel2d_image_resources'
const DB_VERSION = 1
const STORE_BLOBS = 'image_blobs'
const STORE_META = 'image_meta'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_BLOBS)) {
        db.createObjectStore(STORE_BLOBS)
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function idbPut(storeName: string, key: string, value: any): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    tx.objectStore(storeName).put(value, key)
    tx.oncomplete = () => {
      db.close()
      resolve()
    }
    tx.onerror = () => {
      db.close()
      reject(tx.error)
    }
  })
}

async function idbGet(storeName: string, key: string): Promise<any> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const req = tx.objectStore(storeName).get(key)
    req.onsuccess = () => {
      db.close()
      resolve(req.result)
    }
    req.onerror = () => {
      db.close()
      reject(req.error)
    }
  })
}

async function idbDelete(storeName: string, key: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    tx.objectStore(storeName).delete(key)
    tx.oncomplete = () => {
      db.close()
      resolve()
    }
    tx.onerror = () => {
      db.close()
      reject(tx.error)
    }
  })
}

async function idbGetAllKeys(storeName: string): Promise<string[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const req = tx.objectStore(storeName).getAllKeys()
    req.onsuccess = () => {
      db.close()
      resolve(req.result as string[])
    }
    req.onerror = () => {
      db.close()
      reject(req.error)
    }
  })
}

// ==================== localStorage 辅助 ====================

const LS_KEY_META_LIST = 'pixel2d_image_meta_list'
const LS_KEY_CATEGORIES = 'pixel2d_image_categories'

function loadMetaList(): ImageMeta[] {
  try {
    const raw = localStorage.getItem(LS_KEY_META_LIST)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveMetaList(list: ImageMeta[]): void {
  localStorage.setItem(LS_KEY_META_LIST, JSON.stringify(list))
}

function loadCategories(): ImageCategory[] {
  try {
    const raw = localStorage.getItem(LS_KEY_CATEGORIES)
    return raw ? JSON.parse(raw) : [{ id: 'default', name: '默认' }]
  } catch {
    return [{ id: 'default', name: '默认' }]
  }
}

function saveCategories(list: ImageCategory[]): void {
  localStorage.setItem(LS_KEY_CATEGORIES, JSON.stringify(list))
}

// ==================== 工具函数 ====================

/** 生成唯一ID */
function generateId(): string {
  return `img_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

/** 读取文件为 ArrayBuffer */
function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(file)
  })
}

/** 读取文件为 Base64 DataURL */
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

/** 从 DataURL 获取图片尺寸 */
function getImageSize(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => reject(new Error('图片加载失败'))
    img.src = dataUrl
  })
}

/** 生成缩略图 */
function generateThumbnail(dataUrl: string, thumbSize = 120): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let w = img.naturalWidth
      let h = img.naturalHeight
      // 等比缩放
      if (w > h) {
        if (w > thumbSize) {
          h = Math.round((h * thumbSize) / w)
          w = thumbSize
        }
      } else {
        if (h > thumbSize) {
          w = Math.round((w * thumbSize) / h)
          h = thumbSize
        }
      }
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.6))
    }
    img.onerror = () => reject(new Error('缩略图生成失败'))
    img.src = dataUrl
  })
}

// ==================== ImageResourceService ====================

/**
 * 图片资源管理服务
 * @description 单例模式，提供图片的上传、删除、查询、压缩、裁剪等能力
 */
export class ImageResourceService {
  private static instance: ImageResourceService

  /** 内存缓存：id -> DataURL */
  private cache = new Map<string, string>()

  /** 图片元数据列表 */
  private metaList: ImageMeta[] = []

  /** 分类列表 */
  private categories: ImageCategory[] = []

  private constructor() {
    this.metaList = loadMetaList()
    this.categories = loadCategories()
  }

  /** 获取单例 */
  static getInstance(): ImageResourceService {
    if (!ImageResourceService.instance) {
      ImageResourceService.instance = new ImageResourceService()
    }
    return ImageResourceService.instance
  }

  // ==================== 上传 ====================

  /**
   * 上传图片文件
   * @param file 图片文件
   * @param category 分类标签
   * @returns 图片元数据
   */
  async upload(file: File, category = '默认'): Promise<ImageMeta> {
    // 异步读取文件
    const arrayBuffer = await readFileAsArrayBuffer(file)
    const dataUrl = await readFileAsDataURL(file)
    const { width, height } = await getImageSize(dataUrl)
    const thumbnail = await generateThumbnail(dataUrl)

    const id = generateId()
    const meta: ImageMeta = {
      id,
      name: file.name,
      width,
      height,
      size: file.size,
      type: file.type || 'image/png',
      category,
      uploadedAt: Date.now(),
      thumbnail,
    }

    // 持久化：Blob存IndexedDB，元数据存localStorage
    await idbPut(STORE_BLOBS, id, arrayBuffer)
    this.metaList.push(meta)
    saveMetaList(this.metaList)

    // 写入内存缓存
    this.cache.set(id, dataUrl)

    return meta
  }

  /**
   * 批量上传
   * @param files 文件数组
   * @param category 分类
   * @returns 元数据数组
   */
  async uploadBatch(files: File[], category = '默认'): Promise<ImageMeta[]> {
    const results: ImageMeta[] = []
    for (const file of files) {
      const meta = await this.upload(file, category)
      results.push(meta)
    }
    return results
  }

  // ==================== 删除 ====================

  /**
   * 删除图片
   * @param id 图片ID
   */
  async delete(id: string): Promise<void> {
    await idbDelete(STORE_BLOBS, id)
    this.metaList = this.metaList.filter((m) => m.id !== id)
    saveMetaList(this.metaList)
    this.cache.delete(id)
  }

  /**
   * 批量删除
   * @param ids 图片ID数组
   */
  async deleteBatch(ids: string[]): Promise<void> {
    for (const id of ids) {
      await this.delete(id)
    }
  }

  // ==================== 查询 ====================

  /**
   * 获取所有图片元数据
   */
  getAll(): ImageMeta[] {
    return [...this.metaList]
  }

  /**
   * 按分类获取图片
   * @param category 分类名称
   */
  getByCategory(category: string): ImageMeta[] {
    return this.metaList.filter((m) => m.category === category)
  }

  /**
   * 根据ID获取元数据
   * @param id 图片ID
   */
  getById(id: string): ImageMeta | undefined {
    return this.metaList.find((m) => m.id === id)
  }

  /**
   * 获取图片的DataURL（优先从缓存读取，否则从IndexedDB加载）
   * @param id 图片ID
   */
  async getImageUrl(id: string): Promise<string | null> {
    // 1. 内存缓存
    if (this.cache.has(id)) {
      return this.cache.get(id)!
    }

    // 2. IndexedDB
    const arrayBuffer = await idbGet(STORE_BLOBS, id)
    if (!arrayBuffer) return null

    const meta = this.getById(id)
    if (!meta) return null

    // 将 ArrayBuffer 转为 Blob URL
    const blob = new Blob([arrayBuffer], { type: meta.type })
    const url = URL.createObjectURL(blob)

    // 写入缓存（这里缓存Blob URL）
    this.cache.set(id, url)
    return url
  }

  // ==================== 分类管理 ====================

  /**
   * 获取所有分类
   */
  getCategories(): ImageCategory[] {
    return [...this.categories]
  }

  /**
   * 添加分类
   * @param name 分类名称
   */
  addCategory(name: string): ImageCategory {
    const cat: ImageCategory = {
      id: `cat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name,
    }
    this.categories.push(cat)
    saveCategories(this.categories)
    return cat
  }

  /**
   * 删除分类
   * @param id 分类ID
   */
  deleteCategory(id: string): void {
    this.categories = this.categories.filter((c) => c.id !== id)
    saveCategories(this.categories)
  }

  /**
   * 重命名分类
   * @param id 分类ID
   * @param newName 新名称
   */
  renameCategory(id: string, newName: string): void {
    const cat = this.categories.find((c) => c.id === id)
    if (cat) {
      cat.name = newName
      saveCategories(this.categories)
    }
  }

  /**
   * 修改图片分类
   * @param imageId 图片ID
   * @param category 目标分类名称
   */
  changeCategory(imageId: string, category: string): void {
    const meta = this.metaList.find((m) => m.id === imageId)
    if (meta) {
      meta.category = category
      saveMetaList(this.metaList)
    }
  }

  /**
   * 重命名图片
   * @param imageId 图片ID
   * @param newName 新名称
   */
  renameImage(imageId: string, newName: string): void {
    const meta = this.metaList.find((m) => m.id === imageId)
    if (meta) {
      meta.name = newName
      saveMetaList(this.metaList)
    }
  }

  // ==================== 压缩 ====================

  /**
   * 压缩图片
   * @param id 图片ID
   * @param options 压缩选项
   * @returns 压缩后的 DataURL
   */
  async compress(id: string, options: CompressOptions = {}): Promise<string> {
    const { quality = 0.8, maxSize = 1920, mimeType = 'image/jpeg' } = options

    const dataUrl = await this.getImageUrl(id)
    if (!dataUrl) throw new Error('图片不存在')

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        let w = img.naturalWidth
        let h = img.naturalHeight

        // 尺寸压缩：等比缩放到最大边不超过 maxSize
        if (w > maxSize || h > maxSize) {
          if (w > h) {
            h = Math.round((h * maxSize) / w)
            w = maxSize
          } else {
            w = Math.round((w * maxSize) / h)
            h = maxSize
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, w, h)
        const result = canvas.toDataURL(mimeType, quality)
        resolve(result)
      }
      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = dataUrl
    })
  }

  // ==================== 裁剪 ====================

  /**
   * 裁剪图片
   * @param id 图片ID
   * @param options 裁剪选项
   * @returns 裁剪后的 DataURL
   */
  async crop(id: string, options: CropOptions): Promise<string> {
    const dataUrl = await this.getImageUrl(id)
    if (!dataUrl) throw new Error('图片不存在')

    const { x, y, width, height } = options

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, x, y, width, height, 0, 0, width, height)
        const result = canvas.toDataURL('image/png')
        resolve(result)
      }
      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = dataUrl
    })
  }

  // ==================== 导出为图元数据 ====================

  /**
   * 生成可用于 Meta2D 图片图元的数据
   * @param id 图片ID
   * @param width 图元宽度（默认图片原始宽度）
   * @param height 图元高度（默认图片原始高度）
   */
  async toPenData(id: string, width?: number, height?: number): Promise<Record<string, any> | null> {
    const dataUrl = await this.getImageUrl(id)
    const meta = this.getById(id)
    if (!dataUrl || !meta) return null

    return {
      name: 'image',
      image: dataUrl,
      width: width ?? meta.width,
      height: height ?? meta.height,
      text: meta.name.replace(/\.[^.]+$/, ''),
    }
  }

  // ==================== 缓存管理 ====================

  /**
   * 清除内存缓存
   */
  clearCache(): void {
    // 释放 Blob URL
    this.cache.forEach((url) => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url)
      }
    })
    this.cache.clear()
  }

  /**
   * 预加载所有图片到缓存
   */
  async preloadAll(): Promise<void> {
    const ids = this.metaList.map((m) => m.id)
    await Promise.all(ids.map((id) => this.getImageUrl(id)))
  }

  // ==================== 统计 ====================

  /**
   * 获取图片数量
   */
  get count(): number {
    return this.metaList.length
  }

  /**
   * 获取各分类图片数量统计
   */
  getCategoryStats(): Record<string, number> {
    const stats: Record<string, number> = {}
    for (const meta of this.metaList) {
      stats[meta.category] = (stats[meta.category] || 0) + 1
    }
    return stats
  }
}
