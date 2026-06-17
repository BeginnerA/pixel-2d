/*
 * @description 图元收藏管理 - 记录使用次数、收藏状态，支持 localStorage 持久化
 * @author MC.Yang
 */
import { Editor2DPropsMenu } from '../core/editor2d-global-type.ts'

/** localStorage 存储 key */
const STORAGE_KEY_FAVORITES = 'pixel2d_graphic_favorites'
const STORAGE_KEY_RECENT = 'pixel2d_graphic_recent'

/** 最大最近使用记录数 */
const MAX_RECENT_COUNT = 20

/**
 * 图元收藏记录
 */
export interface FavoriteItem {
  /** 图元唯一 key */
  key: string
  /** 图元标题 */
  title: string
  /** 图元 icon */
  icon?: string
  /** 图元数据 */
  data: Record<string, any>
  /** 收藏时间戳 */
  favoritedAt: number
}

/**
 * 最近使用记录
 */
export interface RecentItem {
  /** 图元唯一 key */
  key: string
  /** 图元标题 */
  title: string
  /** 图元 icon */
  icon?: string
  /** 图元数据 */
  data: Record<string, any>
  /** 使用次数 */
  usageCount: number
  /** 最近使用时间戳 */
  lastUsedAt: number
}

/**
 * 从 localStorage 安全读取 JSON
 */
function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/**
 * 向 localStorage 安全写入 JSON
 */
function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    console.warn('[graphic-favorites] localStorage 写入失败')
  }
}

/**
 * 图元收藏管理器（单例）
 */
export class GraphicFavoritesManager {
  private static instance: GraphicFavoritesManager

  private favorites: Map<string, FavoriteItem> = new Map()
  private recentList: RecentItem[] = []

  private constructor() {
    this.load()
  }

  static getInstance(): GraphicFavoritesManager {
    if (!GraphicFavoritesManager.instance) {
      GraphicFavoritesManager.instance = new GraphicFavoritesManager()
    }
    return GraphicFavoritesManager.instance
  }

  // ─────────────────────────────────────────────
  //  持久化
  // ─────────────────────────────────────────────

  /** 从 localStorage 加载数据 */
  private load(): void {
    const favArr = readStorage<FavoriteItem[]>(STORAGE_KEY_FAVORITES, [])
    this.favorites = new Map(favArr.map((item) => [item.key, item]))
    this.recentList = readStorage<RecentItem[]>(STORAGE_KEY_RECENT, [])
  }

  /** 持久化收藏到 localStorage */
  private saveFavorites(): void {
    writeStorage(STORAGE_KEY_FAVORITES, Array.from(this.favorites.values()))
  }

  /** 持久化最近使用到 localStorage */
  private saveRecent(): void {
    writeStorage(STORAGE_KEY_RECENT, this.recentList)
  }

  // ─────────────────────────────────────────────
  //  收藏 CRUD
  // ─────────────────────────────────────────────

  /**
   * 添加收藏
   * @param item 图元菜单项
   */
  addFavorite(item: Editor2DPropsMenu): void {
    if (!item.key) return
    if (this.favorites.has(item.key)) return // 已收藏

    this.favorites.set(item.key, {
      key: item.key,
      title: item.title as string,
      icon: item.icon,
      data: (item.data as Record<string, any>) ?? {},
      favoritedAt: Date.now(),
    })
    this.saveFavorites()
  }

  /**
   * 取消收藏
   * @param key 图元 key
   */
  removeFavorite(key: string): void {
    if (this.favorites.delete(key)) {
      this.saveFavorites()
    }
  }

  /**
   * 切换收藏状态
   * @param item 图元菜单项
   */
  toggleFavorite(item: Editor2DPropsMenu): boolean {
    if (!item.key) return false
    if (this.isFavorite(item.key)) {
      this.removeFavorite(item.key)
      return false
    } else {
      this.addFavorite(item)
      return true
    }
  }

  /**
   * 是否已收藏
   * @param key 图元 key
   */
  isFavorite(key: string): boolean {
    return this.favorites.has(key)
  }

  /**
   * 获取所有收藏（按收藏时间降序）
   */
  getFavorites(): FavoriteItem[] {
    return Array.from(this.favorites.values()).sort((a, b) => b.favoritedAt - a.favoritedAt)
  }

  /**
   * 清空所有收藏
   */
  clearFavorites(): void {
    this.favorites.clear()
    this.saveFavorites()
  }

  // ─────────────────────────────────────────────
  //  最近使用
  // ─────────────────────────────────────────────

  /**
   * 记录图元使用
   * @param item 图元菜单项
   */
  recordUsage(item: Editor2DPropsMenu): void {
    if (!item.key) return

    const existing = this.recentList.find((r) => r.key === item.key)
    if (existing) {
      existing.usageCount += 1
      existing.lastUsedAt = Date.now()
    } else {
      this.recentList.unshift({
        key: item.key,
        title: item.title as string,
        icon: item.icon,
        data: (item.data as Record<string, any>) ?? {},
        usageCount: 1,
        lastUsedAt: Date.now(),
      })
    }

    // 按最近使用时间保持最大条目数
    this.recentList.sort((a, b) => b.lastUsedAt - a.lastUsedAt)
    if (this.recentList.length > MAX_RECENT_COUNT) {
      this.recentList = this.recentList.slice(0, MAX_RECENT_COUNT)
    }

    this.saveRecent()
  }

  /**
   * 获取最近使用列表（按使用时间降序）
   * @param limit 最多返回条数，默认 10
   */
  getRecentItems(limit: number = 10): RecentItem[] {
    return this.recentList.slice(0, limit)
  }

  /**
   * 获取高频使用列表（按使用次数降序）
   * @param limit 最多返回条数，默认 10
   */
  getFrequentItems(limit: number = 10): RecentItem[] {
    return [...this.recentList].sort((a, b) => b.usageCount - a.usageCount).slice(0, limit)
  }

  /**
   * 清空最近使用
   */
  clearRecent(): void {
    this.recentList = []
    this.saveRecent()
  }

  /**
   * 从最近使用中移除某条
   * @param key 图元 key
   */
  removeRecent(key: string): void {
    const idx = this.recentList.findIndex((r) => r.key === key)
    if (idx !== -1) {
      this.recentList.splice(idx, 1)
      this.saveRecent()
    }
  }
}

/** 默认导出单例实例 */
export const graphicFavorites = GraphicFavoritesManager.getInstance()
