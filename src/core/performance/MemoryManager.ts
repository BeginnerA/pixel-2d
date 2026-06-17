/**
 * 内存管理服务
 * @description 提供对象池、弱引用缓存、事件监听器追踪、定时清理等内存管理功能
 * @author MC.Yang
 */

// ── 对象池 ───────────────────────────────────────────────────────

/** 对象池工厂接口 */
export interface ObjectFactory<T> {
  create(): T
  reset(obj: T): void
}

/**
 * 泛型对象池
 * @description 复用频繁创建/销毁的对象，减少GC压力
 */
export class ObjectPool<T> {
  private pool: T[] = []
  private activeCount = 0
  private totalAcquired = 0
  private totalReleased = 0

  constructor(
    private readonly factory: ObjectFactory<T>,
    private readonly maxSize: number = 100
  ) {}

  /**
   * 从池中获取对象
   */
  acquire(): T {
    this.totalAcquired++
    this.activeCount++

    if (this.pool.length > 0) {
      return this.pool.pop()!
    }

    return this.factory.create()
  }

  /**
   * 将对象归还到池
   */
  release(obj: T): void {
    this.activeCount--
    this.totalReleased++

    if (this.pool.length < this.maxSize) {
      this.factory.reset(obj)
      this.pool.push(obj)
    }
    // 超出maxSize则直接丢弃，等待GC
  }

  /**
   * 预热池（预先创建指定数量的对象）
   */
  warmup(count: number): void {
    const toCreate = Math.min(count, this.maxSize) - this.pool.length
    for (let i = 0; i < toCreate; i++) {
      this.pool.push(this.factory.create())
    }
  }

  /**
   * 清空池
   */
  clear(): void {
    this.pool = []
  }

  /**
   * 获取池统计信息
   */
  getStats() {
    return {
      poolSize: this.pool.length,
      activeCount: this.activeCount,
      totalAcquired: this.totalAcquired,
      totalReleased: this.totalReleased,
      hitRate: this.totalAcquired > 0 ? (this.totalReleased / this.totalAcquired) * 100 : 0,
    }
  }
}

// ── 弱引用缓存 ───────────────────────────────────────────────────

/**
 * 弱引用缓存
 * @description 使用WeakRef存储缓存，对象不被引用时自动被GC回收
 */
export class WeakRefCache<K, V extends object> {
  private cache = new Map<K, WeakRef<V>>()
  private registry: FinalizationRegistry<K>
  private hitCount = 0
  private missCount = 0

  constructor() {
    // 注册清理回调：对象被GC时，从cache中移除对应的key
    this.registry = new FinalizationRegistry((key: K) => {
      const ref = this.cache.get(key)
      // 只有当引用已失效时才删除（避免删掉重新设置的值）
      if (ref && !ref.deref()) {
        this.cache.delete(key)
      }
    })
  }

  /**
   * 设置缓存
   */
  set(key: K, value: V): void {
    const ref = new WeakRef(value)
    this.cache.set(key, ref)
    // 注册终结器，当value被GC时通知清理key
    this.registry.register(value, key, ref)
  }

  /**
   * 获取缓存
   */
  get(key: K): V | undefined {
    const ref = this.cache.get(key)
    if (!ref) {
      this.missCount++
      return undefined
    }

    const value = ref.deref()
    if (value === undefined) {
      // 对象已被GC，清理Map条目
      this.cache.delete(key)
      this.missCount++
      return undefined
    }

    this.hitCount++
    return value
  }

  /**
   * 检查缓存中是否存在（且对象未被GC）
   */
  has(key: K): boolean {
    return this.get(key) !== undefined
  }

  /**
   * 删除缓存
   */
  delete(key: K): void {
    this.cache.delete(key)
  }

  /**
   * 清理所有已失效的弱引用
   */
  cleanup(): number {
    let removed = 0
    for (const [key, ref] of this.cache) {
      if (!ref.deref()) {
        this.cache.delete(key)
        removed++
      }
    }
    return removed
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      size: this.cache.size,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: this.hitCount + this.missCount > 0 ? (this.hitCount / (this.hitCount + this.missCount)) * 100 : 0,
    }
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
    this.hitCount = 0
    this.missCount = 0
  }
}

// ── 事件监听器追踪 ───────────────────────────────────────────────

/** 监听器注册记录 */
export interface ListenerRecord {
  id: string
  target: string
  event: string
  registeredAt: number
  removedAt?: number
  stackTrace?: string
}

/**
 * 视口分片加载配置
 */
export interface ViewportChunkOptions {
  /** 分片阈值：图元数量超过此值时启用分片 */
  threshold?: number
  /** 每个分片加载的图元数量 */
  chunkSize?: number
  /** 分片加载间隔(ms) */
  loadInterval?: number
}

/** 内存管理配置 */
export interface MemoryManagerOptions {
  /** GC检查间隔(ms) */
  gcInterval?: number
  /** 是否启用监听器泄漏检测 */
  enableLeakDetection?: boolean
  /** 监听器告警阈值（同一事件超过此数量告警） */
  listenerWarnThreshold?: number
  /** 视口分片加载配置 */
  viewportChunk?: ViewportChunkOptions
}

/**
 * 内存管理服务
 */
export class MemoryManager {
  private options: Required<MemoryManagerOptions>
  private gcTimer = 0
  private isRunning = false

  // 监听器追踪
  private listenerMap = new Map<string, ListenerRecord[]>()
  private listenerIdCounter = 0
  private activeListenerCount = 0

  // 对象池注册表
  private pools = new Map<string, ObjectPool<any>>()

  // 弱引用缓存注册表
  private caches = new Map<string, WeakRefCache<any, any>>()

  // 视口分片加载状态
  private viewportLoadTimer = 0
  private pendingChunks: (() => void)[] = []

  constructor(options: MemoryManagerOptions = {}) {
    this.options = {
      gcInterval: options.gcInterval ?? 30000,
      enableLeakDetection: options.enableLeakDetection ?? true,
      listenerWarnThreshold: options.listenerWarnThreshold ?? 20,
      viewportChunk: {
        threshold: options.viewportChunk?.threshold ?? 500,
        chunkSize: options.viewportChunk?.chunkSize ?? 50,
        loadInterval: options.viewportChunk?.loadInterval ?? 16,
      },
    }
  }

  /**
   * 启动内存管理服务
   */
  start(): void {
    if (this.isRunning) return
    this.isRunning = true
    this.startGcCycle()
    console.log('[MemoryManager] 内存管理服务已启动')
  }

  /**
   * 停止内存管理服务
   */
  stop(): void {
    if (!this.isRunning) return
    this.isRunning = false

    if (this.gcTimer) {
      clearInterval(this.gcTimer)
      this.gcTimer = 0
    }

    if (this.viewportLoadTimer) {
      clearTimeout(this.viewportLoadTimer)
      this.viewportLoadTimer = 0
    }

    console.log('[MemoryManager] 内存管理服务已停止')
  }

  // ── 对象池管理 ─────────────────────────────────────────────────

  /**
   * 注册对象池
   */
  registerPool<T>(name: string, factory: ObjectFactory<T>, maxSize?: number): ObjectPool<T> {
    const pool = new ObjectPool<T>(factory, maxSize)
    this.pools.set(name, pool)
    return pool
  }

  /**
   * 获取已注册的对象池
   */
  getPool<T>(name: string): ObjectPool<T> | undefined {
    return this.pools.get(name)
  }

  // ── 弱引用缓存管理 ─────────────────────────────────────────────

  /**
   * 创建弱引用缓存
   */
  createCache<K, V extends object>(name: string): WeakRefCache<K, V> {
    const cache = new WeakRefCache<K, V>()
    this.caches.set(name, cache)
    return cache
  }

  /**
   * 获取已创建的弱引用缓存
   */
  getCache<K, V extends object>(name: string): WeakRefCache<K, V> | undefined {
    return this.caches.get(name)
  }

  // ── 事件监听器追踪 ─────────────────────────────────────────────

  /**
   * 追踪事件监听器注册
   * @returns 监听器ID（用于移除时调用trackRemove）
   */
  trackAdd(target: string, event: string, captureStack = false): string {
    const id = `listener_${++this.listenerIdCounter}`
    const record: ListenerRecord = {
      id,
      target,
      event,
      registeredAt: Date.now(),
      stackTrace: captureStack ? new Error().stack : undefined,
    }

    const key = `${target}::${event}`
    if (!this.listenerMap.has(key)) {
      this.listenerMap.set(key, [])
    }
    this.listenerMap.get(key)!.push(record)
    this.activeListenerCount++

    // 检测泄漏：同一事件监听器数量超阈值
    if (this.options.enableLeakDetection) {
      const count = this.listenerMap.get(key)!.filter((r) => !r.removedAt).length
      if (count > this.options.listenerWarnThreshold) {
        console.warn(
          `[MemoryManager] 疑似监听器泄漏: "${key}" 已有 ${count} 个活跃监听器（阈值: ${this.options.listenerWarnThreshold}）`
        )
      }
    }

    return id
  }

  /**
   * 追踪事件监听器移除
   */
  trackRemove(id: string): void {
    for (const records of this.listenerMap.values()) {
      const record = records.find((r) => r.id === id)
      if (record) {
        record.removedAt = Date.now()
        this.activeListenerCount--
        return
      }
    }
  }

  /**
   * 获取所有未销毁的监听器（潜在泄漏）
   */
  getLeakedListeners(): ListenerRecord[] {
    const leaked: ListenerRecord[] = []
    for (const records of this.listenerMap.values()) {
      for (const record of records) {
        if (!record.removedAt) {
          leaked.push(record)
        }
      }
    }
    return leaked
  }

  /**
   * 获取监听器统计
   */
  getListenerStats() {
    const byEvent: Record<string, number> = {}
    for (const [key, records] of this.listenerMap) {
      byEvent[key] = records.filter((r) => !r.removedAt).length
    }
    return {
      total: this.activeListenerCount,
      byEvent,
      leaked: this.getLeakedListeners().length,
    }
  }

  // ── 视口分片加载 ─────────────────────────────────────────────────

  /**
   * 大图纸分片加载
   * @description 当图元数量超过阈值时，按视口区域分批加载
   * @param items 所有待加载图元
   * @param loadFn 加载每批图元的函数
   * @param onComplete 全部加载完成回调
   */
  loadWithChunks<T>(items: T[], loadFn: (chunk: T[]) => void, onComplete?: () => void): void {
    const { threshold, chunkSize, loadInterval } = this.options.viewportChunk

    if (items.length <= threshold!) {
      // 数量未超阈值，直接全量加载
      loadFn(items)
      onComplete?.()
      return
    }

    console.log(`[MemoryManager] 启用分片加载: ${items.length} 个图元，每批 ${chunkSize}，间隔 ${loadInterval}ms`)

    // 清空之前未完成的任务
    this.pendingChunks = []
    if (this.viewportLoadTimer) {
      clearTimeout(this.viewportLoadTimer)
    }

    // 切分批次
    const chunks: T[][] = []
    for (let i = 0; i < items.length; i += chunkSize!) {
      chunks.push(items.slice(i, i + chunkSize!))
    }

    let index = 0
    const loadNext = () => {
      if (index >= chunks.length) {
        onComplete?.()
        return
      }

      loadFn(chunks[index++])
      this.viewportLoadTimer = window.setTimeout(loadNext, loadInterval!)
    }

    loadNext()
  }

  /**
   * 取消分片加载
   */
  cancelChunkLoad(): void {
    if (this.viewportLoadTimer) {
      clearTimeout(this.viewportLoadTimer)
      this.viewportLoadTimer = 0
    }
    this.pendingChunks = []
  }

  // ── GC定时清理 ──────────────────────────────────────────────────

  /**
   * 启动定时GC清理循环
   */
  private startGcCycle(): void {
    this.gcTimer = window.setInterval(() => {
      this.runGc()
    }, this.options.gcInterval)
  }

  /**
   * 执行GC清理
   */
  runGc(): void {
    let totalCleaned = 0

    // 清理失效的弱引用缓存条目
    for (const cache of this.caches.values()) {
      totalCleaned += cache.cleanup()
    }

    // 清理已销毁的监听器记录（保留最近1小时的记录）
    const cutoff = Date.now() - 60 * 60 * 1000
    for (const [key, records] of this.listenerMap) {
      const filtered = records.filter((r) => !r.removedAt || r.removedAt > cutoff)
      if (filtered.length !== records.length) {
        this.listenerMap.set(key, filtered)
        totalCleaned += records.length - filtered.length
      }
    }

    if (totalCleaned > 0) {
      console.log(`[MemoryManager] GC清理完成，回收 ${totalCleaned} 个条目`)
    }
  }

  // ── 汇总报告 ────────────────────────────────────────────────────

  /**
   * 获取内存管理汇总报告
   */
  getReport() {
    const poolStats: Record<string, ReturnType<ObjectPool<any>['getStats']>> = {}
    for (const [name, pool] of this.pools) {
      poolStats[name] = pool.getStats()
    }

    const cacheStats: Record<string, ReturnType<WeakRefCache<any, any>['getStats']>> = {}
    for (const [name, cache] of this.caches) {
      cacheStats[name] = cache.getStats()
    }

    return {
      pools: poolStats,
      caches: cacheStats,
      listeners: this.getListenerStats(),
    }
  }

  /**
   * 销毁所有资源
   */
  destroy(): void {
    this.stop()

    for (const pool of this.pools.values()) {
      pool.clear()
    }
    this.pools.clear()

    for (const cache of this.caches.values()) {
      cache.clear()
    }
    this.caches.clear()

    this.listenerMap.clear()
    this.activeListenerCount = 0

    console.log('[MemoryManager] 内存管理服务已销毁')
  }
}
