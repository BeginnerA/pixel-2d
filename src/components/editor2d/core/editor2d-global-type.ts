/*
 * @description 2D编辑器全局类型声明
 * @author MC.Yang
 */
import { TNode } from 'tdesign-vue-next'
import { Options, Pen, Point } from '@meta2d/core'
import { Event } from '@meta2d/core/src/event/event'
import { Meta2dData } from '@meta2d/core/src/store'

/**
 * 2D编辑器配置
 */
export interface Editor2DConfig {
  // key
  key?: string | number
  // 显示菜单标题
  displayMenuTitle?: boolean
  // 显示菜单图标
  displayMenuIcon?: boolean
  // 禁用提示词
  disabledTips?: string
}

/**
 * 菜单分组
 */
export interface Editor2DMenuGroup {
  // 分组 key
  key: string
  // 分组名称
  label: string
  // 分组图标
  icon?: string
  // 排序顺序
  order?: number
  // 是否折叠
  collapsed?: boolean
}

/**
 * 2D编辑器菜单
 */
export interface Editor2DPropsMenu {
  // key
  key?: string | number
  // 值
  value?: any
  // 标题
  title?: string | TNode
  // 图标
  icon?: string
  // 类型
  type?: string
  // 活动状态
  activeState?: boolean
  // 是否禁用
  disabled?: boolean
  // 是否显示
  show?: boolean
  // 是常见的
  isCommon?: boolean
  // 快捷键（显示用，如 "Ctrl+Z"）
  shortcut?: string
  // 所属分组 key
  group?: string
  // 排序顺序（越小越靠前）
  order?: number
  // 选项
  option?: {
    title?: string
    language?: string
    clearable?: string
    placeholder?: string
    type?: string
    theme?: string
    accept?: string
    showImageFileName?: boolean
    maxlength?: number
    min?: number
    max?: number
    step?: number
    list?: Array<any>
  }
  // 数据
  data?: {}
  // 功能
  action?: string | Function
  // 事件
  event?: string
  // 子项
  children?: Array<Editor2DPropsMenu>
}

/**
 * 2D编辑器菜单选项卡配置
 */
export interface PropsTabsConfig {
  // 可拖拽
  dragSort?: boolean
  // 激活的 key
  activeKey?: string | number
  // tabs
  tabs?: Array<PropsTab>
}

/**
 * 2D编辑器菜单选项卡
 */
export interface PropsTab {
  // key
  key?: string | number
  // 标签
  label?: string | TNode
  // 标题
  title?: string | TNode
  // 可拖拽
  draggable?: boolean
}

/**
 * 2D 编辑器数据
 */
export interface Editor2DData extends Meta2dData {
  // 文件夹
  folder?: string | number
  // 文件类型
  fileType?: string | number
  // 图纸配置项
  mapProps?: Editor2DOptions
  // WebSocket 配置
  socketConfig?: Editor2DWebSocket
  // Editor2DMqtt 配置
  mqttConfig?: Editor2DMqtt
  // HTTP 配置
  httpConfig?: Array<Editor2DHttp>
}

/**
 * 2D 编辑器点
 */
export interface Editor2DPoint extends Point {}

/**
 * WebSocket 配置
 */
export interface Editor2DWebSocket {
  url?: string
}

/**
 * MQTT 配置
 */
export interface Editor2DMqtt {
  // MQTT 地址
  mqtt?: string
  // MQTT 订阅主题
  mqttTopics?: string
  mqttOptions?: {
    // 客户端 ID
    clientId?: string
    // 用户名
    username?: string
    // 密码
    password?: string
    // ture - clientId 不变；false - clientId 随机，避免相同连接 clientId 冲突
    customClientId?: boolean
  }
}

/**
 * HTTP 配置
 */
export interface Editor2DHttp {
  // 地址
  http?: string
  // 方法
  method?: string
  // 轮询间隔时间
  httpTimeInterval?: number
  // 请求头设置
  httpHeaders?: Object
}

/**
 * 编辑器属性
 */
export interface Editor2DOptions extends Options {
  // 画笔填充颜色
  penBackground?: string
  // 背景图片
  backGroundImage?: string
  // 网格旋转角度
  gridRotate?: number
}

/**
 * 编辑器图元
 */
export interface Editor2DPen extends Pen {
  // 线条样式
  dash?: string | number
  // 动画类型
  animateType?: string
  // 图元描述
  description?: string
}

/**
 * 事件
 */
export interface Editor2DEvent extends Event {
  // 全景图地址
  panoramaUrl?: string
}

// ==================== 通信动态绑定类型 ====================

/**
 * 通信协议类型
 */
export type CommunicationProtocol = 'websocket' | 'mqtt' | 'http'

/**
 * 通信连接状态
 */
export enum CommunicationStatus {
  /** 未连接 */
  Disconnected = 'disconnected',
  /** 连接中 */
  Connecting = 'connecting',
  /** 已连接 */
  Connected = 'connected',
  /** 重连中 */
  Reconnecting = 'reconnecting',
  /** 连接错误 */
  Error = 'error',
  /** 已关闭 */
  Closed = 'closed',
}

/**
 * 数据变换函数类型
 * @param rawValue 原始值
 * @returns 变换后的值
 */
export type DataTransformFn = (rawValue: any) => any

/**
 * 数据变换配置
 */
export interface DataTransform {
  /** 变换类型 */
  type?: 'scale' | 'map' | 'custom' | 'unitConvert'
  /** 缩放系数（type=scale 时使用） */
  scale?: number
  /** 值映射表（type=map 时使用） */
  map?: Record<string, any>
  /** 单位转换配置（type=unitConvert 时使用） */
  unitConvert?: {
    fromUnit: string
    toUnit: string
    factor: number
  }
  /** 自定义变换函数表达式（type=custom 时使用，字符串形式的函数体） */
  customExpression?: string
}

/**
 * 通信绑定 - 将接收的数据映射到指定图元的指定属性
 */
export interface CommunicationBinding {
  /** 绑定唯一标识 */
  bindingId: string
  /** 通信协议 */
  protocol: CommunicationProtocol
  /** 协议配置 */
  config: Editor2DWebSocket | Editor2DMqtt | Editor2DHttp
  /** 目标图元ID */
  penId: string
  /** 目标属性路径（如 'text', 'color', 'calculative.fillStyle'） */
  propertyPath: string
  /** 数据点路径（从消息中提取数据的路径，如 'data.temperature'） */
  dataPath?: string
  /** 数据变换配置 */
  transform?: DataTransform
  /** 是否启用 */
  enabled?: boolean
  /** 创建时间 */
  createdAt?: number
  /** 更新时间 */
  updatedAt?: number
}

/**
 * WebSocket 扩展配置（含高级选项）
 */
export interface Editor2DWebSocketAdvanced extends Editor2DWebSocket {
  /** 自动重连 */
  autoReconnect?: boolean
  /** 初始重连延迟（毫秒） */
  reconnectBaseDelay?: number
  /** 最大重连延迟（毫秒） */
  reconnectMaxDelay?: number
  /** 最大重连次数 */
  maxReconnectAttempts?: number
  /** 心跳间隔（毫秒），0 表示不启用心跳 */
  heartbeatInterval?: number
  /** 心跳消息内容 */
  heartbeatMessage?: string
  /** 期望的 pong 响应消息 */
  expectedPongMessage?: string
}

/**
 * MQTT 扩展配置（含高级选项）
 */
export interface Editor2DMqttAdvanced extends Editor2DMqtt {
  /** QoS 级别 (0, 1, 2) */
  qos?: 0 | 1 | 2
  /** 额外订阅主题列表 */
  additionalTopics?: Array<{ topic: string; qos?: 0 | 1 | 2 }>
  /** 遗嘱消息配置 */
  willMessage?: {
    topic: string
    payload: string
    qos?: 0 | 1 | 2
    retain?: boolean
  }
  /** 清除会话 */
  cleanSession?: boolean
  /** 连接超时（毫秒） */
  connectTimeout?: number
}

/**
 * HTTP 扩展配置（含高级选项）
 */
export interface Editor2DHttpAdvanced extends Editor2DHttp {
  /** 请求体 */
  httpBody?: any
  /** 是否启用请求去重 */
  deduplication?: boolean
  /** 去重间隔（毫秒） */
  deduplicationInterval?: number
  /** 缓存策略 */
  cacheStrategy?: 'none' | 'memory' | 'sessionStorage'
  /** 缓存过期时间（毫秒） */
  cacheTtl?: number
  /** 请求超时（毫秒） */
  timeout?: number
  /** 重试次数 */
  retryCount?: number
  /** 重试延迟（毫秒） */
  retryDelay?: number
}

/**
 * 通信事件
 */
export interface CommunicationEvent {
  /** 事件类型 */
  type: 'statusChange' | 'dataReceived' | 'error' | 'bindingUpdated'
  /** 绑定ID */
  bindingId?: string
  /** 协议类型 */
  protocol?: CommunicationProtocol
  /** 状态（statusChange 时使用） */
  status?: CommunicationStatus
  /** 接收到的原始数据（dataReceived 时使用） */
  rawData?: any
  /** 变换后的数据（dataReceived 时使用） */
  transformedData?: any
  /** 错误信息（error 时使用） */
  error?: Error
  /** 时间戳 */
  timestamp: number
}

/**
 * 通信管理器状态
 */
export interface CommunicationManagerState {
  /** 所有绑定 */
  bindings: Map<string, CommunicationBinding>
  /** 各绑定的连接状态 */
  statuses: Map<string, CommunicationStatus>
  /** 最近的事件 */
  recentEvents: CommunicationEvent[]
}
