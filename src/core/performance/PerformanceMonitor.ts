/**
 * 性能监控服务
 * @description 提供FPS监控、渲染性能追踪、内存使用监控等功能
 * @author MC.Yang
 */

/** 性能指标数据点 */
export interface PerformanceMetric {
  timestamp: number
  value: number
  label?: string
}

/** FPS数据 */
export interface FpsMetrics {
  current: number
  min: number
  max: number
  avg: number
  samples: PerformanceMetric[]
}

/** 渲染性能数据 */
export interface RenderMetrics {
  frameCount: number
  totalTime: number
  avgFrameTime: number
  maxFrameTime: number
  samples: PerformanceMetric[]
}

/** 内存使用数据（Chrome扩展接口） */
export interface MemoryMetrics {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
  samples: PerformanceMetric[]
}

/** 操作响应时间 */
export interface OperationMetrics {
  name: string
  count: number
  totalTime: number
  avgTime: number
  maxTime: number
  samples: PerformanceMetric[]
}

/** 完整性能报告 */
export interface PerformanceReport {
  timestamp: number
  duration: number
  fps: FpsMetrics
  render: RenderMetrics
  memory: MemoryMetrics | null
  operations: Record<string, OperationMetrics>
  alerts: PerformanceAlert[]
}

/** 性能告警 */
export interface PerformanceAlert {
  type: 'fps' | 'memory' | 'render' | 'operation'
  level: 'warn' | 'error'
  message: string
  timestamp: number
  value?: number
}

/** 性能监控配置 */
export interface PerformanceMonitorOptions {
  /** 是否启用FPS监控 */
  enableFps?: boolean
  /** 是否启用内存监控 */
  enableMemory?: boolean
  /** 内存采样间隔(ms) */
  memorySampleInterval?: number
  /** FPS告警阈值（低于此值触发告警） */
  fpsWarnThreshold?: number
  /** 最大样本保留数量 */
  maxSamples?: number
  /** 是否在控制台输出告警 */
  logAlerts?: boolean
}

/** Chrome performance.memory 扩展接口 */
interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  }
}

/**
 * 性能监控服务类
 */
export class PerformanceMonitor {
  private options: Required<PerformanceMonitorOptions>
  private isRunning = false
  private startTime = 0

  // FPS相关
  private rafHandle = 0
  private lastFrameTime = 0
  private frameCount = 0
  private fpsFrameCount = 0
  private fpsLastTime = 0
  private fpsSamples: PerformanceMetric[] = []
  private currentFps = 0
  private minFps = Infinity
  private maxFps = 0

  // 渲染性能相关
  private renderFrameCount = 0
  private renderTotalTime = 0
  private renderMaxTime = 0
  private renderSamples: PerformanceMetric[] = []

  // 内存监控相关
  private memoryTimer = 0
  private memorySamples: PerformanceMetric[] = []

  // 操作追踪
  private operations = new Map<string, OperationMetrics>()

  // 告警历史
  private alerts: PerformanceAlert[] = []

  // 是否处于帧渲染计时中
  private frameStartTime = 0

  constructor(options: PerformanceMonitorOptions = {}) {
    this.options = {
      enableFps: options.enableFps ?? true,
      enableMemory: options.enableMemory ?? true,
      memorySampleInterval: options.memorySampleInterval ?? 5000,
      fpsWarnThreshold: options.fpsWarnThreshold ?? 30,
      maxSamples: options.maxSamples ?? 300,
      logAlerts: options.logAlerts ?? true,
    }
  }

  /**
   * 启动性能监控
   */
  start(): void {
    if (this.isRunning) return

    this.isRunning = true
    this.startTime = performance.now()
    this.lastFrameTime = this.startTime
    this.fpsLastTime = this.startTime

    if (this.options.enableFps) {
      this.startFpsMonitor()
    }

    if (this.options.enableMemory && this.hasMemoryAPI()) {
      this.startMemoryMonitor()
    }

    console.log('[PerformanceMonitor] 性能监控已启动')
  }

  /**
   * 停止性能监控
   */
  stop(): void {
    if (!this.isRunning) return

    this.isRunning = false

    if (this.rafHandle) {
      cancelAnimationFrame(this.rafHandle)
      this.rafHandle = 0
    }

    if (this.memoryTimer) {
      clearInterval(this.memoryTimer)
      this.memoryTimer = 0
    }

    console.log('[PerformanceMonitor] 性能监控已停止')
  }

  /**
   * 启动FPS监控（使用requestAnimationFrame）
   */
  private startFpsMonitor(): void {
    const tick = (now: number) => {
      if (!this.isRunning) return

      this.frameCount++
      this.fpsFrameCount++
      this.frameStartTime = now

      const elapsed = now - this.fpsLastTime

      // 每秒计算一次FPS
      if (elapsed >= 1000) {
        this.currentFps = Math.round((this.fpsFrameCount * 1000) / elapsed)
        this.fpsFrameCount = 0
        this.fpsLastTime = now

        // 更新最值
        if (this.currentFps < this.minFps) this.minFps = this.currentFps
        if (this.currentFps > this.maxFps) this.maxFps = this.currentFps

        // 记录样本
        this.addSample(this.fpsSamples, this.currentFps)

        // 检查FPS告警
        if (this.currentFps < this.options.fpsWarnThreshold) {
          this.addAlert({
            type: 'fps',
            level: this.currentFps < 15 ? 'error' : 'warn',
            message: `FPS过低: ${this.currentFps} fps (阈值: ${this.options.fpsWarnThreshold} fps)`,
            timestamp: now,
            value: this.currentFps,
          })
        }
      }

      // 记录帧渲染耗时（上一帧的耗时）
      const frameTime = now - this.lastFrameTime
      if (frameTime > 0 && this.lastFrameTime > 0) {
        this.renderFrameCount++
        this.renderTotalTime += frameTime
        if (frameTime > this.renderMaxTime) this.renderMaxTime = frameTime
        this.addSample(this.renderSamples, frameTime)

        // 帧耗时告警（超过50ms即低于20fps的帧）
        if (frameTime > 50) {
          this.addAlert({
            type: 'render',
            level: frameTime > 100 ? 'error' : 'warn',
            message: `帧渲染耗时过长: ${frameTime.toFixed(1)}ms`,
            timestamp: now,
            value: frameTime,
          })
        }
      }

      this.lastFrameTime = now
      this.rafHandle = requestAnimationFrame(tick)
    }

    this.rafHandle = requestAnimationFrame(tick)
  }

  /**
   * 启动内存监控
   */
  private startMemoryMonitor(): void {
    const sample = () => {
      if (!this.isRunning) return
      const perf = performance as PerformanceWithMemory
      if (!perf.memory) return

      const usedMB = perf.memory.usedJSHeapSize / 1024 / 1024
      this.addSample(this.memorySamples, usedMB)

      // 内存告警（使用超过堆限制的80%）
      const ratio = perf.memory.usedJSHeapSize / perf.memory.jsHeapSizeLimit
      if (ratio > 0.8) {
        this.addAlert({
          type: 'memory',
          level: ratio > 0.9 ? 'error' : 'warn',
          message: `内存使用过高: ${usedMB.toFixed(1)}MB (${(ratio * 100).toFixed(0)}% of limit)`,
          timestamp: performance.now(),
          value: usedMB,
        })
      }
    }

    sample() // 立即采样一次
    this.memoryTimer = window.setInterval(sample, this.options.memorySampleInterval)
  }

  /**
   * 开始追踪操作耗时
   * @param name 操作名称
   * @returns 结束追踪的函数
   */
  startOperation(name: string): () => void {
    const startTime = performance.now()
    return () => {
      const duration = performance.now() - startTime
      this.recordOperation(name, duration)
    }
  }

  /**
   * 记录操作耗时
   */
  recordOperation(name: string, duration: number): void {
    if (!this.operations.has(name)) {
      this.operations.set(name, {
        name,
        count: 0,
        totalTime: 0,
        avgTime: 0,
        maxTime: 0,
        samples: [],
      })
    }

    const op = this.operations.get(name)!
    op.count++
    op.totalTime += duration
    op.avgTime = op.totalTime / op.count
    if (duration > op.maxTime) op.maxTime = duration
    this.addSample(op.samples, duration)
  }

  /**
   * 获取当前性能指标（快照）
   */
  getMetrics(): {
    fps: FpsMetrics
    render: RenderMetrics
    memory: MemoryMetrics | null
    operations: Record<string, OperationMetrics>
  } {
    return {
      fps: this.getFpsMetrics(),
      render: this.getRenderMetrics(),
      memory: this.getMemoryMetrics(),
      operations: Object.fromEntries(this.operations),
    }
  }

  /**
   * 生成完整性能报告
   */
  getReport(): PerformanceReport {
    const now = performance.now()
    return {
      timestamp: Date.now(),
      duration: now - this.startTime,
      fps: this.getFpsMetrics(),
      render: this.getRenderMetrics(),
      memory: this.getMemoryMetrics(),
      operations: Object.fromEntries(this.operations),
      alerts: [...this.alerts],
    }
  }

  /**
   * 导出性能数据（JSON格式，用于分析）
   */
  exportData(): string {
    const report = this.getReport()
    return JSON.stringify(report, null, 2)
  }

  /**
   * 重置所有指标
   */
  reset(): void {
    this.frameCount = 0
    this.fpsFrameCount = 0
    this.currentFps = 0
    this.minFps = Infinity
    this.maxFps = 0
    this.fpsSamples = []

    this.renderFrameCount = 0
    this.renderTotalTime = 0
    this.renderMaxTime = 0
    this.renderSamples = []

    this.memorySamples = []
    this.operations.clear()
    this.alerts = []

    this.startTime = performance.now()
    this.fpsLastTime = this.startTime
  }

  /**
   * 获取当前FPS
   */
  getCurrentFps(): number {
    return this.currentFps
  }

  /**
   * 检查是否正在运行
   */
  isActive(): boolean {
    return this.isRunning
  }

  // ── 私有辅助方法 ──────────────────────────────────────────────

  private getFpsMetrics(): FpsMetrics {
    const avgFps =
      this.fpsSamples.length > 0
        ? this.fpsSamples.reduce((s, m) => s + m.value, 0) / this.fpsSamples.length
        : 0

    return {
      current: this.currentFps,
      min: this.minFps === Infinity ? 0 : this.minFps,
      max: this.maxFps,
      avg: Math.round(avgFps),
      samples: [...this.fpsSamples],
    }
  }

  private getRenderMetrics(): RenderMetrics {
    return {
      frameCount: this.renderFrameCount,
      totalTime: this.renderTotalTime,
      avgFrameTime: this.renderFrameCount > 0 ? this.renderTotalTime / this.renderFrameCount : 0,
      maxFrameTime: this.renderMaxTime,
      samples: [...this.renderSamples],
    }
  }

  private getMemoryMetrics(): MemoryMetrics | null {
    const perf = performance as PerformanceWithMemory
    if (!perf.memory) return null

    return {
      usedJSHeapSize: perf.memory.usedJSHeapSize,
      totalJSHeapSize: perf.memory.totalJSHeapSize,
      jsHeapSizeLimit: perf.memory.jsHeapSizeLimit,
      samples: [...this.memorySamples],
    }
  }

  private addSample(samples: PerformanceMetric[], value: number): void {
    samples.push({ timestamp: performance.now(), value })
    // 控制样本数量，超出则移除最旧的
    if (samples.length > this.options.maxSamples) {
      samples.splice(0, samples.length - this.options.maxSamples)
    }
  }

  private addAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert)
    // 保留最近100条告警
    if (this.alerts.length > 100) {
      this.alerts.splice(0, this.alerts.length - 100)
    }

    if (this.options.logAlerts) {
      const method = alert.level === 'error' ? 'error' : 'warn'
      console[method](`[PerformanceMonitor] ${alert.message}`)
    }
  }

  private hasMemoryAPI(): boolean {
    return typeof (performance as PerformanceWithMemory).memory !== 'undefined'
  }
}
