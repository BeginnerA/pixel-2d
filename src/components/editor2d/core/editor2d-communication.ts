/*
 * @description 2D编辑器通信管理器 - 支持WebSocket/MQTT/HTTP动态绑定
 * @author MC.Yang
 */
import { IValue } from '@meta2d/core/src/pen'
import { Editor2DCache } from './editor2d-local-storage'
import {
  CommunicationBinding,
  CommunicationEvent,
  CommunicationProtocol,
  CommunicationStatus,
  DataTransform,
  DataTransformFn,
  Editor2DHttp,
  Editor2DHttpAdvanced,
  Editor2DMqtt,
  Editor2DMqttAdvanced,
  Editor2DWebSocket,
  Editor2DWebSocketAdvanced,
} from './editor2d-global-type'

/**
 * 通信事件回调类型
 */
export type CommunicationEventCallback = (event: CommunicationEvent) => void

/**
 * 通信管理器 - 统一管理WebSocket/MQTT/HTTP三种协议的动态绑定
 */
export class CommunicationManager {
  /** 所有绑定映射 bindingId -> binding */
  private bindings: Map<string, CommunicationBinding> = new Map()
  /** 各绑定的连接状态 */
  private statuses: Map<string, CommunicationStatus> = new Map()
  /** WebSocket连接实例 bindingId -> WebSocket */
  private wsInstances: Map<string, WebSocket> = new Map()
  /** WebSocket重连定时器 */
  private wsReconnectTimers: Map<string, ReturnType<typeof setTimeout>> = new Map()
  /** WebSocket心跳定时器 */
  private wsHeartbeatTimers: Map<string, ReturnType<typeof setInterval>> = new Map()
  /** WebSocket重连计数 */
  private wsReconnectCounts: Map<string, number> = new Map()
  /** WebSocket pong超时检测 */
  private wsPongTimers: Map<string, ReturnType<typeof setTimeout>> = new Map()
  /** HTTP轮询定时器 */
  private httpTimers: Map<string, ReturnType<typeof setInterval>> = new Map()
  /** HTTP请求去重映射 */
  private httpPendingRequests: Map<string, Promise<any>> = new Map()
  /** HTTP缓存映射 */
  private httpCaches: Map<string, { data: any; expiry: number }> = new Map()
  /** MQTT额外订阅 topic -> bindingId[] */
  private mqttSubscriptions: Map<string, string[]> = new Map()
  /** 事件监听器 */
  private eventListeners: CommunicationEventCallback[] = []
  /** 最近事件列表 */
  private recentEvents: CommunicationEvent[] = []
  /** 最大事件保留数 */
  private readonly MAX_EVENTS = 100
  /** 是否已销毁 */
  private destroyed = false

  // ==================== 公共API ====================

  /**
   * 添加通信绑定
   * @param binding 绑定配置
   */
  addBinding(binding: CommunicationBinding): void {
    if (this.destroyed) {
      console.warn('[CommunicationManager] 管理器已销毁，无法添加绑定')
      return
    }

    const now = Date.now()
    binding.createdAt = binding.createdAt || now
    binding.updatedAt = now
    binding.enabled = binding.enabled !== false

    this.bindings.set(binding.bindingId, binding)
    this.statuses.set(binding.bindingId, CommunicationStatus.Disconnected)

    this.emitEvent({
      type: 'bindingUpdated',
      bindingId: binding.bindingId,
      protocol: binding.protocol,
      timestamp: now,
    })

    // 如果启用则自动连接
    if (binding.enabled) {
      this.connect(binding.bindingId)
    }
  }

  /**
   * 移除通信绑定
   * @param bindingId 绑定ID
   */
  removeBinding(bindingId: string): void {
    this.disconnect(bindingId)
    this.bindings.delete(bindingId)
    this.statuses.delete(bindingId)
  }

  /**
   * 更新绑定配置
   * @param bindingId 绑定ID
   * @param updates 更新内容
   */
  updateBinding(bindingId: string, updates: Partial<CommunicationBinding>): void {
    const binding = this.bindings.get(bindingId)
    if (!binding) {
      console.warn(`[CommunicationManager] 绑定 ${bindingId} 不存在`)
      return
    }

    const protocolChanged = updates.protocol && updates.protocol !== binding.protocol
    const configChanged = updates.config && JSON.stringify(updates.config) !== JSON.stringify(binding.config)

    Object.assign(binding, updates, { updatedAt: Date.now() })

    this.emitEvent({
      type: 'bindingUpdated',
      bindingId,
      protocol: binding.protocol,
      timestamp: Date.now(),
    })

    // 如果协议或配置变更，重连
    if ((protocolChanged || configChanged) && binding.enabled) {
      this.disconnect(bindingId)
      this.connect(bindingId)
    }
  }

  /**
   * 启用绑定
   */
  enableBinding(bindingId: string): void {
    const binding = this.bindings.get(bindingId)
    if (binding) {
      binding.enabled = true
      binding.updatedAt = Date.now()
      this.connect(bindingId)
    }
  }

  /**
   * 禁用绑定
   */
  disableBinding(bindingId: string): void {
    const binding = this.bindings.get(bindingId)
    if (binding) {
      binding.enabled = false
      binding.updatedAt = Date.now()
      this.disconnect(bindingId)
    }
  }

  /**
   * 连接指定绑定
   */
  connect(bindingId: string): void {
    const binding = this.bindings.get(bindingId)
    if (!binding || !binding.enabled) return

    switch (binding.protocol) {
      case 'websocket':
        this.connectWebSocket(bindingId)
        break
      case 'mqtt':
        this.connectMqtt(bindingId)
        break
      case 'http':
        this.startHttpPolling(bindingId)
        break
    }
  }

  /**
   * 断开指定绑定
   */
  disconnect(bindingId: string): void {
    const binding = this.bindings.get(bindingId)
    if (!binding) return

    switch (binding.protocol) {
      case 'websocket':
        this.disconnectWebSocket(bindingId)
        break
      case 'mqtt':
        this.disconnectMqtt(bindingId)
        break
      case 'http':
        this.stopHttpPolling(bindingId)
        break
    }
  }

  /**
   * 连接所有启用的绑定
   */
  connectAll(): void {
    this.bindings.forEach((binding, bindingId) => {
      if (binding.enabled) {
        this.connect(bindingId)
      }
    })
  }

  /**
   * 断开所有连接
   */
  disconnectAll(): void {
    this.bindings.forEach((_, bindingId) => {
      this.disconnect(bindingId)
    })
  }

  /**
   * 获取绑定状态
   */
  getStatus(bindingId: string): CommunicationStatus | undefined {
    return this.statuses.get(bindingId)
  }

  /**
   * 获取所有绑定
   */
  getBindings(): CommunicationBinding[] {
    return Array.from(this.bindings.values())
  }

  /**
   * 获取所有状态
   */
  getStatuses(): Map<string, CommunicationStatus> {
    return new Map(this.statuses)
  }

  /**
   * 获取指定图元的绑定
   */
  getBindingsByPenId(penId: string): CommunicationBinding[] {
    return Array.from(this.bindings.values()).filter((b) => b.penId === penId)
  }

  /**
   * 获取最近的事件
   */
  getRecentEvents(count: number = 20): CommunicationEvent[] {
    return this.recentEvents.slice(-count)
  }

  /**
   * 注册事件监听
   */
  onEvent(callback: CommunicationEventCallback): () => void {
    this.eventListeners.push(callback)
    return () => {
      const index = this.eventListeners.indexOf(callback)
      if (index > -1) {
        this.eventListeners.splice(index, 1)
      }
    }
  }

  /**
   * 测试连接
   * @param protocol 协议类型
   * @param config 配置
   * @returns 是否连接成功
   */
  async testConnection(protocol: CommunicationProtocol, config: any): Promise<boolean> {
    switch (protocol) {
      case 'websocket':
        return this.testWebSocket(config as Editor2DWebSocket)
      case 'mqtt':
        return this.testMqtt(config as Editor2DMqtt)
      case 'http':
        return this.testHttp(config as Editor2DHttp)
      default:
        return false
    }
  }

  /**
   * 销毁管理器 - 清理所有连接
   */
  destroy(): void {
    if (this.destroyed) return
    this.destroyed = true

    this.disconnectAll()
    this.bindings.clear()
    this.statuses.clear()
    this.eventListeners = []
    this.recentEvents = []
    this.httpCaches.clear()
    this.httpPendingRequests.clear()
    this.mqttSubscriptions.clear()
    this.wsReconnectCounts.clear()

    console.log('[CommunicationManager] 已销毁')
  }

  /**
   * 序列化绑定数据（用于持久化）
   */
  serialize(): CommunicationBinding[] {
    return Array.from(this.bindings.values())
  }

  /**
   * 从序列化数据恢复绑定
   */
  deserialize(bindings: CommunicationBinding[]): void {
    bindings.forEach((binding) => {
      this.addBinding(binding)
    })
  }

  // ==================== WebSocket 实现 ====================

  private connectWebSocket(bindingId: string): void {
    const binding = this.bindings.get(bindingId)
    if (!binding) return

    const config = binding.config as Editor2DWebSocket
    const advanced = config as Editor2DWebSocketAdvanced
    const url = config.url

    if (!url) {
      this.updateStatus(bindingId, CommunicationStatus.Error)
      this.emitEvent({
        type: 'error',
        bindingId,
        protocol: 'websocket',
        error: new Error('WebSocket URL 未配置'),
        timestamp: Date.now(),
      })
      return
    }

    // 关闭已有连接
    this.disconnectWebSocket(bindingId)

    this.updateStatus(bindingId, CommunicationStatus.Connecting)

    try {
      const ws = new WebSocket(url)
      this.wsInstances.set(bindingId, ws)

      ws.onopen = () => {
        this.updateStatus(bindingId, CommunicationStatus.Connected)
        this.wsReconnectCounts.set(bindingId, 0)

        // 启动心跳
        if (advanced.heartbeatInterval && advanced.heartbeatInterval > 0) {
          this.startHeartbeat(bindingId, advanced)
        }

        // 同步到meta2d
        if (typeof meta2d !== 'undefined') {
          meta2d.store.data.websocket = url
        }
      }

      ws.onmessage = (event) => {
        this.handleIncomingData(bindingId, event.data)
      }

      ws.onclose = (event) => {
        this.updateStatus(bindingId, CommunicationStatus.Closed)
        this.clearHeartbeat(bindingId)

        // 自动重连
        if (advanced.autoReconnect !== false && !this.destroyed) {
          this.scheduleReconnect(bindingId, advanced)
        }
      }

      ws.onerror = (event) => {
        this.updateStatus(bindingId, CommunicationStatus.Error)
        this.emitEvent({
          type: 'error',
          bindingId,
          protocol: 'websocket',
          error: new Error('WebSocket 连接错误'),
          timestamp: Date.now(),
        })
      }
    } catch (e) {
      this.updateStatus(bindingId, CommunicationStatus.Error)
      this.emitEvent({
        type: 'error',
        bindingId,
        protocol: 'websocket',
        error: e instanceof Error ? e : new Error(String(e)),
        timestamp: Date.now(),
      })
    }
  }

  private disconnectWebSocket(bindingId: string): void {
    // 清理重连定时器
    const reconnectTimer = this.wsReconnectTimers.get(bindingId)
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      this.wsReconnectTimers.delete(bindingId)
    }

    this.clearHeartbeat(bindingId)
    this.clearPongTimer(bindingId)

    const ws = this.wsInstances.get(bindingId)
    if (ws) {
      ws.onopen = null
      ws.onmessage = null
      ws.onclose = null
      ws.onerror = null
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close()
      }
      this.wsInstances.delete(bindingId)
    }

    if (this.statuses.get(bindingId) !== CommunicationStatus.Error) {
      this.updateStatus(bindingId, CommunicationStatus.Disconnected)
    }
  }

  /**
   * 指数退避重连
   */
  private scheduleReconnect(bindingId: string, advanced: Editor2DWebSocketAdvanced): void {
    const baseDelay = advanced.reconnectBaseDelay || 1000
    const maxDelay = advanced.reconnectMaxDelay || 30000
    const maxAttempts = advanced.maxReconnectAttempts || 10

    const currentCount = this.wsReconnectCounts.get(bindingId) || 0
    if (currentCount >= maxAttempts) {
      this.emitEvent({
        type: 'error',
        bindingId,
        protocol: 'websocket',
        error: new Error(`超过最大重连次数 ${maxAttempts}`),
        timestamp: Date.now(),
      })
      return
    }

    // 指数退避：delay = baseDelay * 2^attempt，最大不超过maxDelay
    const delay = Math.min(baseDelay * Math.pow(2, currentCount), maxDelay)
    // 加入随机抖动避免雷群效应
    const jitter = delay * 0.2 * Math.random()
    const totalDelay = delay + jitter

    this.wsReconnectCounts.set(bindingId, currentCount + 1)
    this.updateStatus(bindingId, CommunicationStatus.Reconnecting)

    const timer = setTimeout(() => {
      this.wsReconnectTimers.delete(bindingId)
      const binding = this.bindings.get(bindingId)
      if (binding && binding.enabled && !this.destroyed) {
        this.connectWebSocket(bindingId)
      }
    }, totalDelay)

    this.wsReconnectTimers.set(bindingId, timer)
  }

  /**
   * 心跳检测
   */
  private startHeartbeat(bindingId: string, advanced: Editor2DWebSocketAdvanced): void {
    this.clearHeartbeat(bindingId)

    const interval = advanced.heartbeatInterval || 30000
    const message = advanced.heartbeatMessage || 'ping'
    const expectedPong = advanced.expectedPongMessage || 'pong'

    const timer = setInterval(() => {
      const ws = this.wsInstances.get(bindingId)
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        this.clearHeartbeat(bindingId)
        return
      }

      try {
        ws.send(message)

        // 设置pong超时检测
        this.clearPongTimer(bindingId)
        const pongTimer = setTimeout(() => {
          // pong超时，认为连接断开
          console.warn(`[CommunicationManager] 绑定 ${bindingId} 心跳超时，关闭连接`)
          ws.close()
        }, interval / 2)
        this.wsPongTimers.set(bindingId, pongTimer)

        // 监听pong响应
        const originalOnMessage = ws.onmessage
        ws.onmessage = (event) => {
          if (event.data === expectedPong) {
            // 收到pong，清除超时定时器
            this.clearPongTimer(bindingId)
          }
          // 继续正常消息处理
          if (originalOnMessage) {
            originalOnMessage.call(ws, event)
          }
        }
      } catch (e) {
        console.warn(`[CommunicationManager] 绑定 ${bindingId} 心跳发送失败`, e)
      }
    }, interval)

    this.wsHeartbeatTimers.set(bindingId, timer)
  }

  private clearHeartbeat(bindingId: string): void {
    const timer = this.wsHeartbeatTimers.get(bindingId)
    if (timer) {
      clearInterval(timer)
      this.wsHeartbeatTimers.delete(bindingId)
    }
  }

  private clearPongTimer(bindingId: string): void {
    const timer = this.wsPongTimers.get(bindingId)
    if (timer) {
      clearTimeout(timer)
      this.wsPongTimers.delete(bindingId)
    }
  }

  // ==================== MQTT 实现 ====================

  private connectMqtt(bindingId: string): void {
    const binding = this.bindings.get(bindingId)
    if (!binding) return

    const config = binding.config as Editor2DMqtt
    const advanced = config as Editor2DMqttAdvanced

    if (!config.mqtt) {
      this.updateStatus(bindingId, CommunicationStatus.Error)
      this.emitEvent({
        type: 'error',
        bindingId,
        protocol: 'mqtt',
        error: new Error('MQTT 地址未配置'),
        timestamp: Date.now(),
      })
      return
    }

    this.updateStatus(bindingId, CommunicationStatus.Connecting)

    try {
      // 通过meta2d内置MQTT连接
      if (typeof meta2d !== 'undefined' && meta2d.connectMqtt) {
        const mqttConfig: any = { ...config }

        // 处理遗嘱消息
        if (advanced.willMessage) {
          mqttConfig.will = {
            topic: advanced.willMessage.topic,
            payload: advanced.willMessage.payload,
            qos: advanced.willMessage.qos || 0,
            retain: advanced.willMessage.retain || false,
          }
        }

        // 处理清除会话
        if (advanced.cleanSession !== undefined) {
          if (!mqttConfig.mqttOptions) mqttConfig.mqttOptions = {}
          mqttConfig.mqttOptions.clean = advanced.cleanSession
        }

        // 处理连接超时
        if (advanced.connectTimeout) {
          if (!mqttConfig.mqttOptions) mqttConfig.mqttOptions = {}
          mqttConfig.mqttOptions.connectTimeout = advanced.connectTimeout
        }

        meta2d.connectMqtt(mqttConfig)
        this.updateStatus(bindingId, CommunicationStatus.Connected)

        // 订阅额外主题
        if (advanced.additionalTopics) {
          advanced.additionalTopics.forEach((topicConfig) => {
            this.mqttSubscribe(bindingId, topicConfig.topic, topicConfig.qos)
          })
        }
      } else {
        // meta2d不可用，标记为错误
        this.updateStatus(bindingId, CommunicationStatus.Error)
        this.emitEvent({
          type: 'error',
          bindingId,
          protocol: 'mqtt',
          error: new Error('meta2d 实例不可用，无法连接MQTT'),
          timestamp: Date.now(),
        })
      }
    } catch (e) {
      this.updateStatus(bindingId, CommunicationStatus.Error)
      this.emitEvent({
        type: 'error',
        bindingId,
        protocol: 'mqtt',
        error: e instanceof Error ? e : new Error(String(e)),
        timestamp: Date.now(),
      })
    }
  }

  private disconnectMqtt(bindingId: string): void {
    // meta2d的MQTT是全局的，只更新状态
    this.updateStatus(bindingId, CommunicationStatus.Disconnected)

    // 清理额外订阅
    const topicsToRemove: string[] = []
    this.mqttSubscriptions.forEach((bindingIds, topic) => {
      const filtered = bindingIds.filter((id) => id !== bindingId)
      if (filtered.length === 0) {
        topicsToRemove.push(topic)
      } else {
        this.mqttSubscriptions.set(topic, filtered)
      }
    })
    topicsToRemove.forEach((topic) => this.mqttSubscriptions.delete(topic))
  }

  /**
   * MQTT订阅主题
   */
  mqttSubscribe(bindingId: string, topic: string, qos: 0 | 1 | 2 = 0): void {
    const existing = this.mqttSubscriptions.get(topic) || []
    if (!existing.includes(bindingId)) {
      existing.push(bindingId)
    }
    this.mqttSubscriptions.set(topic, existing)

    // TODO: 当meta2d支持单独subscribe时，在此处调用
    console.log(`[CommunicationManager] 订阅主题: ${topic}, QoS: ${qos}`)
  }

  /**
   * MQTT取消订阅主题
   */
  mqttUnsubscribe(bindingId: string, topic: string): void {
    const existing = this.mqttSubscriptions.get(topic)
    if (existing) {
      const filtered = existing.filter((id) => id !== bindingId)
      if (filtered.length === 0) {
        this.mqttSubscriptions.delete(topic)
      } else {
        this.mqttSubscriptions.set(topic, filtered)
      }
    }

    // TODO: 当meta2d支持单独unsubscribe时，在此处调用
    console.log(`[CommunicationManager] 取消订阅主题: ${topic}`)
  }

  // ==================== HTTP 实现 ====================

  private startHttpPolling(bindingId: string): void {
    const binding = this.bindings.get(bindingId)
    if (!binding) return

    const config = binding.config as Editor2DHttp
    const advanced = config as Editor2DHttpAdvanced
    const url = config.http

    if (!url) {
      this.updateStatus(bindingId, CommunicationStatus.Error)
      this.emitEvent({
        type: 'error',
        bindingId,
        protocol: 'http',
        error: new Error('HTTP URL 未配置'),
        timestamp: Date.now(),
      })
      return
    }

    this.updateStatus(bindingId, CommunicationStatus.Connected)

    // 立即执行一次
    this.executeHttpRequest(bindingId)

    // 设置轮询
    const interval = config.httpTimeInterval || 3000
    if (interval > 0) {
      const timer = setInterval(() => {
        this.executeHttpRequest(bindingId)
      }, interval)
      this.httpTimers.set(bindingId, timer)
    }
  }

  private stopHttpPolling(bindingId: string): void {
    const timer = this.httpTimers.get(bindingId)
    if (timer) {
      clearInterval(timer)
      this.httpTimers.delete(bindingId)
    }
    this.httpPendingRequests.delete(bindingId)
    this.updateStatus(bindingId, CommunicationStatus.Disconnected)
  }

  private async executeHttpRequest(bindingId: string): Promise<void> {
    const binding = this.bindings.get(bindingId)
    if (!binding || !binding.enabled) return

    const config = binding.config as Editor2DHttp
    const advanced = config as Editor2DHttpAdvanced
    const url = config.http
    if (!url) return

    // 请求去重
    if (advanced.deduplication && this.httpPendingRequests.has(bindingId)) {
      return
    }

    // 缓存检查
    if (advanced.cacheStrategy && advanced.cacheStrategy !== 'none') {
      const cacheKey = `${bindingId}:${url}`
      const cached = this.httpCaches.get(cacheKey)
      if (cached && cached.expiry > Date.now()) {
        this.handleIncomingData(bindingId, cached.data)
        return
      }
    }

    const retryCount = advanced.retryCount || 0
    const retryDelay = advanced.retryDelay || 1000

    const doRequest = async (attempt: number): Promise<void> => {
      try {
        const controller = new AbortController()
        const timeout = advanced.timeout || 10000
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const fetchOptions: RequestInit = {
          method: config.method || 'GET',
          headers: config.httpHeaders as Record<string, string> | undefined,
          signal: controller.signal,
        }

        if (config.method?.toUpperCase() === 'POST' && advanced.httpBody) {
          fetchOptions.body = typeof advanced.httpBody === 'string' ? advanced.httpBody : JSON.stringify(advanced.httpBody)
          if (!fetchOptions.headers) {
            fetchOptions.headers = {}
          }
          ;(fetchOptions.headers as Record<string, string>)['Content-Type'] =
            (fetchOptions.headers as Record<string, string>)['Content-Type'] || 'application/json'
        }

        const requestPromise = fetch(url, fetchOptions)
        this.httpPendingRequests.set(bindingId, requestPromise)

        const response = await requestPromise
        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        let data: any
        const contentType = response.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          data = await response.json()
        } else {
          data = await response.text()
          // 尝试解析为JSON
          try {
            data = JSON.parse(data)
          } catch {
            // 非JSON，保持文本
          }
        }

        // 缓存处理
        if (advanced.cacheStrategy && advanced.cacheStrategy !== 'none') {
          const cacheKey = `${bindingId}:${url}`
          const ttl = advanced.cacheTtl || 60000
          this.httpCaches.set(cacheKey, { data, expiry: Date.now() + ttl })

          if (advanced.cacheStrategy === 'sessionStorage') {
            try {
              sessionStorage.setItem(`comm_cache_${cacheKey}`, JSON.stringify({ data, expiry: Date.now() + ttl }))
            } catch {
              // sessionStorage不可用时静默失败
            }
          }
        }

        this.handleIncomingData(bindingId, data)
      } catch (e) {
        if (attempt < retryCount) {
          // 重试
          await new Promise((resolve) => setTimeout(resolve, retryDelay))
          return doRequest(attempt + 1)
        }
        this.emitEvent({
          type: 'error',
          bindingId,
          protocol: 'http',
          error: e instanceof Error ? e : new Error(String(e)),
          timestamp: Date.now(),
        })
      } finally {
        this.httpPendingRequests.delete(bindingId)
      }
    }

    await doRequest(0)
  }

  // ==================== 数据处理 ====================

  /**
   * 处理接收到的数据
   */
  private handleIncomingData(bindingId: string, rawData: any): void {
    const binding = this.bindings.get(bindingId)
    if (!binding || !binding.enabled) return

    // 尝试解析字符串
    if (typeof rawData === 'string') {
      try {
        rawData = JSON.parse(rawData)
      } catch {
        // 非JSON，保持字符串
      }
    }

    // 提取指定数据点的值
    let extractedValue = rawData
    if (binding.dataPath) {
      extractedValue = this.getValueByPath(rawData, binding.dataPath)
    }

    // 应用数据变换
    const transformedValue = this.applyTransform(extractedValue, binding.transform)

    this.emitEvent({
      type: 'dataReceived',
      bindingId,
      protocol: binding.protocol,
      rawData,
      transformedData: transformedValue,
      timestamp: Date.now(),
    })

    // 将数据绑定到图元属性
    this.applyToPen(binding.penId, binding.propertyPath, transformedValue)
  }

  /**
   * 通过路径获取对象中的值
   * @param obj 源对象
   * @param path 属性路径（如 'data.temperature'）
   */
  private getValueByPath(obj: any, path: string): any {
    if (!obj || !path) return obj

    const keys = path.split('.')
    let result = obj
    for (const key of keys) {
      if (result == null || result == undefined) return undefined
      // 支持数组索引
      const arrayMatch = key.match(/^(\w+)\[(\d+)\]$/)
      if (arrayMatch) {
        const [, arrayKey, indexStr] = arrayMatch
        result = result[arrayKey]?.[parseInt(indexStr, 10)]
      } else {
        result = result[key]
      }
    }
    return result
  }

  /**
   * 应用数据变换
   */
  private applyTransform(value: any, transform?: DataTransform): any {
    if (!transform || !transform.type) return value

    switch (transform.type) {
      case 'scale':
        if (typeof value === 'number' && transform.scale !== undefined) {
          return value * transform.scale
        }
        return value

      case 'map':
        if (transform.map) {
          const key = String(value)
          return transform.map[key] !== undefined ? transform.map[key] : value
        }
        return value

      case 'unitConvert':
        if (typeof value === 'number' && transform.unitConvert) {
          return value * transform.unitConvert.factor
        }
        return value

      case 'custom':
        if (transform.customExpression) {
          try {
            const fn = new Function('value', transform.customExpression) as DataTransformFn
            return fn(value)
          } catch (e) {
            console.error('[CommunicationManager] 自定义变换函数执行失败:', e)
            return value
          }
        }
        return value

      default:
        return value
    }
  }

  /**
   * 将数据应用到图元属性
   */
  private applyToPen(penId: string, propertyPath: string, value: any): void {
    if (typeof meta2d === 'undefined') return

    try {
      // 使用meta2d.setValue API
      const dataList: Array<IValue> = [
        {
          id: penId,
          [propertyPath]: value,
        },
      ]

      meta2d.setValue(dataList[0], {
        render: true,
        doEvent: false,
        history: false,
      })

      // 持久化
      new Editor2DCache().saveCanvas()
    } catch (e) {
      console.error(`[CommunicationManager] 设置图元 ${penId} 属性 ${propertyPath} 失败:`, e)
    }
  }

  // ==================== 测试连接 ====================

  private testWebSocket(config: Editor2DWebSocket): Promise<boolean> {
    return new Promise((resolve) => {
      if (!config.url) {
        resolve(false)
        return
      }

      try {
        const ws = new WebSocket(config.url)
        const timeout = setTimeout(() => {
          ws.close()
          resolve(false)
        }, 5000)

        ws.onopen = () => {
          clearTimeout(timeout)
          ws.close()
          resolve(true)
        }

        ws.onerror = () => {
          clearTimeout(timeout)
          resolve(false)
        }
      } catch {
        resolve(false)
      }
    })
  }

  private testMqtt(config: Editor2DMqtt): Promise<boolean> {
    // MQTT依赖meta2d，简单验证配置
    return Promise.resolve(!!(config.mqtt && config.mqttTopics))
  }

  private async testHttp(config: Editor2DHttp): Promise<boolean> {
    if (!config.http) return false

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(config.http, {
        method: config.method || 'GET',
        headers: config.httpHeaders as Record<string, string> | undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      return response.ok
    } catch {
      return false
    }
  }

  // ==================== 工具方法 ====================

  /**
   * 更新连接状态
   */
  private updateStatus(bindingId: string, status: CommunicationStatus): void {
    const oldStatus = this.statuses.get(bindingId)
    this.statuses.set(bindingId, status)

    if (oldStatus !== status) {
      const binding = this.bindings.get(bindingId)
      this.emitEvent({
        type: 'statusChange',
        bindingId,
        protocol: binding?.protocol,
        status,
        timestamp: Date.now(),
      })
    }
  }

  /**
   * 发射通信事件
   */
  private emitEvent(event: CommunicationEvent): void {
    this.recentEvents.push(event)
    // 限制事件数量
    if (this.recentEvents.length > this.MAX_EVENTS) {
      this.recentEvents.shift()
    }

    // 通知监听器
    this.eventListeners.forEach((callback) => {
      try {
        callback(event)
      } catch (e) {
        console.error('[CommunicationManager] 事件监听器执行失败:', e)
      }
    })
  }

  /**
   * 生成唯一绑定ID
   */
  static generateBindingId(): string {
    return `binding_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  }
}

/**
 * 全局通信管理器实例
 */
export const communicationManager = new CommunicationManager()
