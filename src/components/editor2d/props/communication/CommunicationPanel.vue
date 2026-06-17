<template>
  <div class="communication-panel">
    <t-collapse v-model:value="activeCollapse" expand-icon-placement="right" size="small">
      <!-- 绑定列表 -->
      <t-collapse-panel header="数据绑定">
        <div v-if="bindings.length === 0" class="empty-hint">
          <span>暂无绑定</span>
          <t-button variant="text" theme="primary" size="small" @click="openAddDialog">添加绑定</t-button>
        </div>
        <div v-else class="binding-list">
          <div
            v-for="binding in bindings"
            :key="binding.bindingId"
            class="binding-item"
            :class="{ disabled: !binding.enabled }"
          >
            <div class="binding-header">
              <div class="binding-info">
                <t-tag
                  size="small"
                  :theme="protocolTheme(binding.protocol)"
                  variant="light"
                  class="protocol-tag"
                >
                  {{ protocolLabel(binding.protocol) }}
                </t-tag>
                <span class="binding-pen-id" :title="binding.penId">
                  {{ shortId(binding.penId) }}
                </span>
                <span class="binding-arrow">→</span>
                <span class="binding-prop">{{ binding.propertyPath }}</span>
              </div>
              <div class="binding-actions">
                <t-tag
                  size="small"
                  :theme="statusTheme(binding.bindingId)"
                  variant="light"
                >
                  {{ statusLabel(binding.bindingId) }}
                </t-tag>
                <t-popup :content="binding.enabled ? '禁用' : '启用'">
                  <t-button
                    size="small"
                    variant="text"
                    :theme="binding.enabled ? 'warning' : 'success'"
                    @click="toggleBinding(binding)"
                  >
                    <template #icon>
                      <PoweroffIcon />
                    </template>
                  </t-button>
                </t-popup>
                <t-popup content="删除">
                  <t-button
                    size="small"
                    variant="text"
                    theme="danger"
                    @click="removeBinding(binding.bindingId)"
                  >
                    <template #icon>
                      <DeleteIcon />
                    </template>
                  </t-button>
                </t-popup>
              </div>
            </div>
          </div>
          <t-button variant="outline" size="small" block @click="openAddDialog" style="margin-top: 8px">
            <template #icon><AddIcon /></template>
            添加绑定
          </t-button>
        </div>
      </t-collapse-panel>

      <!-- WebSocket 配置 -->
      <t-collapse-panel header="WebSocket">
        <t-form label-align="left" :label-width="80" size="small">
          <t-form-item label="URL地址">
            <t-input
              v-model:value="wsConfig.url"
              :clearable="true"
              placeholder="ws://host:port/path"
              @blur="saveWsConfig"
            />
          </t-form-item>
          <t-form-item label="自动重连">
            <t-switch v-model:value="wsAdvanced.autoReconnect" @change="saveWsConfig" />
          </t-form-item>
          <t-form-item v-if="wsAdvanced.autoReconnect" label="初始延迟">
            <t-input-number
              v-model:value="wsAdvanced.reconnectBaseDelay"
              :min="100"
              :step="500"
              theme="column"
              style="width: 100%"
              suffix="ms"
              @blur="saveWsConfig"
            />
          </t-form-item>
          <t-form-item v-if="wsAdvanced.autoReconnect" label="最大延迟">
            <t-input-number
              v-model:value="wsAdvanced.reconnectMaxDelay"
              :min="1000"
              :step="5000"
              theme="column"
              style="width: 100%"
              suffix="ms"
              @blur="saveWsConfig"
            />
          </t-form-item>
          <t-form-item v-if="wsAdvanced.autoReconnect" label="最大重连次数">
            <t-input-number
              v-model:value="wsAdvanced.maxReconnectAttempts"
              :min="1"
              :max="50"
              theme="column"
              style="width: 100%"
              @blur="saveWsConfig"
            />
          </t-form-item>
          <t-form-item label="心跳间隔">
            <t-input-number
              v-model:value="wsAdvanced.heartbeatInterval"
              :min="0"
              :step="5000"
              theme="column"
              style="width: 100%"
              suffix="ms (0关闭)"
              @blur="saveWsConfig"
            />
          </t-form-item>
          <t-form-item v-if="wsAdvanced.heartbeatInterval && wsAdvanced.heartbeatInterval > 0" label="心跳消息">
            <t-input
              v-model:value="wsAdvanced.heartbeatMessage"
              placeholder="ping"
              @blur="saveWsConfig"
            />
          </t-form-item>
          <t-form-item v-if="wsAdvanced.heartbeatInterval && wsAdvanced.heartbeatInterval > 0" label="Pong消息">
            <t-input
              v-model:value="wsAdvanced.expectedPongMessage"
              placeholder="pong"
              @blur="saveWsConfig"
            />
          </t-form-item>
          <t-form-item>
            <t-button size="small" variant="outline" :loading="testLoading === 'ws'" @click="testWsConnection">
              测试连接
            </t-button>
          </t-form-item>
        </t-form>
      </t-collapse-panel>

      <!-- MQTT 配置 -->
      <t-collapse-panel header="MQTT">
        <t-form label-align="left" :label-width="80" size="small">
          <t-form-item label="服务器地址">
            <t-input
              v-model:value="mqttConfig.mqtt"
              :clearable="true"
              placeholder="ws://host:port/mqtt"
              @blur="saveMqttConfig"
            />
          </t-form-item>
          <t-form-item label="订阅主题">
            <t-input
              v-model:value="mqttConfig.mqttTopics"
              :clearable="true"
              placeholder="多个topic以逗号分隔"
              @blur="saveMqttConfig"
            />
          </t-form-item>
          <t-form-item label="Client ID">
            <t-input
              v-model:value="mqttConfig.mqttOptions!.clientId"
              :clearable="true"
              @blur="saveMqttConfig"
            />
          </t-form-item>
          <t-form-item label="固定CID">
            <t-switch v-model:checked="mqttConfig.mqttOptions!.customClientId" @change="saveMqttConfig" />
          </t-form-item>
          <t-form-item label="用户名">
            <t-input v-model:value="mqttConfig.mqttOptions!.username" :clearable="true" @blur="saveMqttConfig" />
          </t-form-item>
          <t-form-item label="密码">
            <t-input
              v-model:value="mqttConfig.mqttOptions!.password"
              :clearable="true"
              type="password"
              @blur="saveMqttConfig"
            />
          </t-form-item>
          <t-form-item label="QoS">
            <t-select v-model:value="mqttAdvanced.qos" placeholder="QoS级别" @change="saveMqttConfig">
              <t-option :value="0" label="0 - 最多一次" />
              <t-option :value="1" label="1 - 至少一次" />
              <t-option :value="2" label="2 - 恰好一次" />
            </t-select>
          </t-form-item>
          <t-form-item label="清除会话">
            <t-switch v-model:value="mqttAdvanced.cleanSession" @change="saveMqttConfig" />
          </t-form-item>
          <t-form-item>
            <t-button size="small" variant="outline" :loading="testLoading === 'mqtt'" @click="testMqttConnection">
              测试连接
            </t-button>
          </t-form-item>
        </t-form>
      </t-collapse-panel>

      <!-- HTTP 配置 -->
      <t-collapse-panel header="HTTP通信">
        <t-collapse v-model:value="httpActivePanel" size="small">
          <t-collapse-panel
            v-for="(item, index) in httpConfigs"
            :key="index"
            :value="index"
            :header="'接口 ' + (index + 1)"
          >
            <t-form label-align="left" :label-width="70" size="small">
              <t-form-item label="URL">
                <t-input v-model:value="item.http" :clearable="true" placeholder="https://api.example.com/data" @blur="saveHttpConfig" />
              </t-form-item>
              <t-form-item label="方法">
                <t-select v-model:value="item.method" placeholder="GET" :clearable="true" @change="saveHttpConfig">
                  <t-option value="GET" label="GET" />
                  <t-option value="POST" label="POST" />
                  <t-option value="PUT" label="PUT" />
                  <t-option value="DELETE" label="DELETE" />
                </t-select>
              </t-form-item>
              <t-form-item label="轮询间隔">
                <t-input-number
                  v-model:value="item.httpTimeInterval"
                  :min="500"
                  :step="1000"
                  theme="column"
                  style="width: 100%"
                  suffix="ms"
                  @blur="saveHttpConfig"
                />
              </t-form-item>
              <t-form-item label="请求头">
                <t-button size="small" variant="outline" @click="openHeaderCodeEdit(index)">编辑</t-button>
              </t-form-item>
            </t-form>
            <template #headerRightContent>
              <DeleteIcon @click="onDeleteHttpNode(index)" />
            </template>
          </t-collapse-panel>
        </t-collapse>
        <t-button variant="outline" size="small" block @click="onAddHttpConfig" style="margin-top: 8px">
          <template #icon><AddIcon /></template>
          增加HTTP接口
        </t-button>
      </t-collapse-panel>
    </t-collapse>

    <!-- 添加绑定对话框 -->
    <t-dialog
      v-model:visible="addDialogVisible"
      header="添加通信绑定"
      :confirm-on-enter="false"
      @confirm="confirmAddBinding"
      @close="closeAddDialog"
    >
      <t-form label-align="top" size="small">
        <t-form-item label="通信协议">
          <t-select v-model:value="newBinding.protocol" @change="onProtocolChange">
            <t-option value="websocket" label="WebSocket" />
            <t-option value="mqtt" label="MQTT" />
            <t-option value="http" label="HTTP" />
          </t-select>
        </t-form-item>
        <t-form-item label="目标图元ID">
          <t-select
            v-model:value="newBinding.penId"
            :clearable="true"
            filterable
            placeholder="选择图元"
          >
            <t-option
              v-for="pen in penList"
              :key="pen.id"
              :value="pen.id"
              :label="penName(pen)"
            />
          </t-select>
        </t-form-item>
        <t-form-item label="目标属性路径">
          <t-select
            v-model:value="newBinding.propertyPath"
            :clearable="true"
            filterable
            creatable
            placeholder="输入或选择属性路径"
          >
            <t-option value="text" label="text (文本)" />
            <t-option value="color" label="color (颜色)" />
            <t-option value="background" label="background (背景色)" />
            <t-option value="visible" label="visible (可见性)" />
            <t-option value="progress" label="progress (进度)" />
            <t-option value="value" label="value (值)" />
            <t-option value="showChild" label="showChild (状态)" />
            <t-option value="image" label="image (图片)" />
            <t-option value="fontSize" label="fontSize (字号)" />
            <t-option value="lineWidth" label="lineWidth (线宽)" />
          </t-select>
        </t-form-item>
        <t-form-item label="数据点路径">
          <t-input
            v-model:value="newBinding.dataPath"
            :clearable="true"
            placeholder="如 data.temperature（留空则使用完整消息）"
          />
        </t-form-item>
        <t-form-item label="数据变换">
          <t-select v-model:value="newBinding.transformType" :clearable="true" placeholder="无变换">
            <t-option value="scale" label="值缩放" />
            <t-option value="map" label="值映射" />
            <t-option value="unitConvert" label="单位转换" />
            <t-option value="custom" label="自定义函数" />
          </t-select>
        </t-form-item>
        <t-form-item v-if="newBinding.transformType === 'scale'" label="缩放系数">
          <t-input-number v-model:value="newBinding.transformScale" theme="column" style="width: 100%" />
        </t-form-item>
        <t-form-item v-if="newBinding.transformType === 'unitConvert'" label="转换系数">
          <t-input-number v-model:value="newBinding.transformFactor" theme="column" style="width: 100%" />
        </t-form-item>
        <t-form-item v-if="newBinding.transformType === 'custom'" label="函数体">
          <t-textarea
            v-model:value="newBinding.transformExpression"
            placeholder="return value * 2;"
            :autosize="true"
          />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted, computed } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { AddIcon, DeleteIcon, PoweroffIcon } from 'tdesign-icons-vue-next'
import {
  CommunicationBinding,
  CommunicationEvent,
  CommunicationProtocol,
  CommunicationStatus,
  Editor2DHttp,
  Editor2DMqtt,
  Editor2DWebSocket,
  Editor2DWebSocketAdvanced,
  Editor2DMqttAdvanced,
  DataTransform,
} from '../../core/editor2d-global-type'
import { CommunicationManager, communicationManager } from '../../core/editor2d-communication'
import { globalEditor2DData } from '../../core/editor2d-global-data'
import { Editor2DCache } from '../../core/editor2d-local-storage'

// ==================== 响应式数据 ====================

const activeCollapse = ref<Array<number>>([0])
const httpActivePanel = ref<Array<number>>([])
const testLoading = ref<string | null>(null)

// 绑定列表
const bindings = ref<CommunicationBinding[]>([])
const statuses = ref<Map<string, CommunicationStatus>>(new Map())

// WebSocket 配置
const wsConfig = reactive<Editor2DWebSocket>({
  url: globalEditor2DData.socketConfig?.url || '',
})
const wsAdvanced = reactive<Editor2DWebSocketAdvanced>({
  ...wsConfig,
  autoReconnect: true,
  reconnectBaseDelay: 1000,
  reconnectMaxDelay: 30000,
  maxReconnectAttempts: 10,
  heartbeatInterval: 0,
  heartbeatMessage: 'ping',
  expectedPongMessage: 'pong',
})

// MQTT 配置
const mqttConfig = reactive<Editor2DMqtt>({
  mqtt: globalEditor2DData.mqttConfig?.mqtt || '',
  mqttTopics: globalEditor2DData.mqttConfig?.mqttTopics || '',
  mqttOptions: {
    clientId: globalEditor2DData.mqttConfig?.mqttOptions?.clientId || '',
    username: globalEditor2DData.mqttConfig?.mqttOptions?.username || '',
    password: globalEditor2DData.mqttConfig?.mqttOptions?.password || '',
    customClientId: globalEditor2DData.mqttConfig?.mqttOptions?.customClientId || false,
  },
})
const mqttAdvanced = reactive<Editor2DMqttAdvanced>({
  ...mqttConfig,
  qos: 0,
  cleanSession: true,
  connectTimeout: 10000,
})

// HTTP 配置
const httpConfigs = reactive<Editor2DHttp[]>(
  globalEditor2DData.httpConfig?.length
    ? globalEditor2DData.httpConfig.map((item) => ({ ...item }))
    : [{ http: '', method: '', httpTimeInterval: 3000, httpHeaders: {} }]
)

// 添加绑定对话框
const addDialogVisible = ref(false)
const newBinding = reactive({
  protocol: 'websocket' as CommunicationProtocol,
  penId: '',
  propertyPath: '',
  dataPath: '',
  transformType: '' as 'scale' | 'map' | 'unitConvert' | 'custom' | '',
  transformScale: 1,
  transformFactor: 1,
  transformExpression: '',
})

// 图元列表
const penList = computed(() => {
  if (typeof meta2d !== 'undefined' && meta2d.store?.data?.pens) {
    return meta2d.store.data.pens.filter((pen: any) => pen.id)
  }
  return []
})

// 事件取消订阅函数
let unsubscribe: (() => void) | null = null

// ==================== 方法 ====================

function protocolLabel(protocol: CommunicationProtocol): string {
  const labels: Record<CommunicationProtocol, string> = {
    websocket: 'WS',
    mqtt: 'MQTT',
    http: 'HTTP',
  }
  return labels[protocol]
}

function protocolTheme(protocol: CommunicationProtocol): string {
  const themes: Record<CommunicationProtocol, string> = {
    websocket: 'primary',
    mqtt: 'success',
    http: 'warning',
  }
  return themes[protocol]
}

function statusLabel(bindingId: string): string {
  const status = statuses.value.get(bindingId)
  const labels: Record<string, string> = {
    [CommunicationStatus.Disconnected]: '断开',
    [CommunicationStatus.Connecting]: '连接中',
    [CommunicationStatus.Connected]: '已连接',
    [CommunicationStatus.Reconnecting]: '重连中',
    [CommunicationStatus.Error]: '错误',
    [CommunicationStatus.Closed]: '已关闭',
  }
  return labels[status || 'disconnected'] || '断开'
}

function statusTheme(bindingId: string): string {
  const status = statuses.value.get(bindingId)
  const themes: Record<string, string> = {
    [CommunicationStatus.Disconnected]: 'default',
    [CommunicationStatus.Connecting]: 'primary',
    [CommunicationStatus.Connected]: 'success',
    [CommunicationStatus.Reconnecting]: 'warning',
    [CommunicationStatus.Error]: 'danger',
    [CommunicationStatus.Closed]: 'default',
  }
  return themes[status || 'disconnected'] || 'default'
}

function shortId(id: string): string {
  if (!id) return ''
  return id.length > 8 ? id.substring(0, 8) + '...' : id
}

function penName(pen: any): string {
  if (pen.description) return `${pen.description} (${pen.id?.substring(0, 6)})`
  if (pen.name) return `${pen.name} (${pen.id?.substring(0, 6)})`
  return pen.id?.substring(0, 8) || ''
}

// ==================== 绑定操作 ====================

function refreshBindings(): void {
  bindings.value = communicationManager.getBindings()
  statuses.value = communicationManager.getStatuses()
}

function toggleBinding(binding: CommunicationBinding): void {
  if (binding.enabled) {
    communicationManager.disableBinding(binding.bindingId)
  } else {
    communicationManager.enableBinding(binding.bindingId)
  }
  refreshBindings()
}

function removeBinding(bindingId: string): void {
  communicationManager.removeBinding(bindingId)
  refreshBindings()
}

function openAddDialog(): void {
  newBinding.protocol = 'websocket'
  newBinding.penId = ''
  newBinding.propertyPath = ''
  newBinding.dataPath = ''
  newBinding.transformType = ''
  newBinding.transformScale = 1
  newBinding.transformFactor = 1
  newBinding.transformExpression = ''
  addDialogVisible.value = true
}

function closeAddDialog(): void {
  addDialogVisible.value = false
}

function onProtocolChange(): void {
  // 协议切换时重置部分配置
}

function confirmAddBinding(): void {
  if (!newBinding.penId) {
    MessagePlugin.warning('请选择目标图元')
    return
  }
  if (!newBinding.propertyPath) {
    MessagePlugin.warning('请输入目标属性路径')
    return
  }

  // 根据协议获取配置
  let config: Editor2DWebSocket | Editor2DMqtt | Editor2DHttp
  switch (newBinding.protocol) {
    case 'websocket':
      config = { url: wsConfig.url }
      break
    case 'mqtt':
      config = { ...mqttConfig }
      break
    case 'http':
      config = httpConfigs[0] || { http: '', method: '', httpTimeInterval: 3000, httpHeaders: {} }
      break
    default:
      return
  }

  // 构建数据变换
  let transform: DataTransform | undefined
  if (newBinding.transformType) {
    transform = { type: newBinding.transformType }
    if (newBinding.transformType === 'scale') {
      transform.scale = newBinding.transformScale
    } else if (newBinding.transformType === 'unitConvert') {
      transform.unitConvert = {
        fromUnit: '',
        toUnit: '',
        factor: newBinding.transformFactor,
      }
    } else if (newBinding.transformType === 'custom') {
      transform.customExpression = newBinding.transformExpression
    }
  }

  const binding: CommunicationBinding = {
    bindingId: CommunicationManager.generateBindingId(),
    protocol: newBinding.protocol,
    config,
    penId: newBinding.penId,
    propertyPath: newBinding.propertyPath,
    dataPath: newBinding.dataPath || undefined,
    transform,
    enabled: true,
  }

  communicationManager.addBinding(binding)
  refreshBindings()
  closeAddDialog()
  MessagePlugin.success('绑定已添加')
}

// ==================== 配置保存 ====================

function saveWsConfig(): void {
  if (typeof meta2d !== 'undefined') {
    if (wsConfig.url) {
      meta2d.store.data.websocket = wsConfig.url
    }
  }
  globalEditor2DData.socketConfig = { url: wsConfig.url }
  new Editor2DCache().saveCanvas()
}

function saveMqttConfig(): void {
  if (typeof meta2d !== 'undefined' && mqttConfig.mqtt) {
    meta2d.connectMqtt(mqttConfig as any)
  }
  globalEditor2DData.mqttConfig = { ...mqttConfig }
  new Editor2DCache().saveCanvas()
}

function saveHttpConfig(): void {
  if (typeof meta2d !== 'undefined') {
    meta2d.store.data.https = httpConfigs as Array<any>
    meta2d.connectHttp()
  }
  globalEditor2DData.httpConfig = httpConfigs.map((item) => ({ ...item }))
  new Editor2DCache().saveCanvas()
}

function onAddHttpConfig(): void {
  httpConfigs.push({
    http: '',
    method: '',
    httpTimeInterval: 3000,
    httpHeaders: {},
  })
}

function onDeleteHttpNode(index: number): void {
  httpConfigs.splice(index, 1)
  saveHttpConfig()
}

function openHeaderCodeEdit(index: number): void {
  // 简化处理：用prompt代替代码编辑器
  const current = httpConfigs[index]?.httpHeaders
  const input = prompt('HTTP请求头 (JSON格式)', typeof current === 'string' ? current : JSON.stringify(current || {}))
  if (input !== null) {
    try {
      httpConfigs[index].httpHeaders = JSON.parse(input)
      saveHttpConfig()
    } catch {
      MessagePlugin.warning('JSON格式不正确')
    }
  }
}

// ==================== 测试连接 ====================

async function testWsConnection(): Promise<void> {
  if (!wsConfig.url) {
    MessagePlugin.warning('请输入WebSocket地址')
    return
  }
  testLoading.value = 'ws'
  try {
    const result = await communicationManager.testConnection('websocket', wsConfig)
    MessagePlugin[result ? 'success' : 'error'](result ? 'WebSocket连接成功' : 'WebSocket连接失败')
  } finally {
    testLoading.value = null
  }
}

async function testMqttConnection(): Promise<void> {
  if (!mqttConfig.mqtt) {
    MessagePlugin.warning('请输入MQTT地址')
    return
  }
  testLoading.value = 'mqtt'
  try {
    const result = await communicationManager.testConnection('mqtt', mqttConfig)
    MessagePlugin[result ? 'success' : 'error'](result ? 'MQTT配置有效' : 'MQTT配置无效')
  } finally {
    testLoading.value = null
  }
}

// ==================== 生命周期 ====================

onMounted(() => {
  refreshBindings()

  // 监听通信事件，自动刷新状态
  unsubscribe = communicationManager.onEvent((event: CommunicationEvent) => {
    if (event.type === 'statusChange' || event.type === 'bindingUpdated') {
      refreshBindings()
    }
  })
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>

<style scoped lang="less">
.communication-panel {
  margin: 0;
  padding: 0;
}

.empty-hint {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--td-text-color-secondary, #999);
  font-size: 12px;
  padding: 4px 0;
}

.binding-list {
  .binding-item {
    padding: 6px 0;
    border-bottom: 1px solid var(--td-border-level-1-color, #eee);

    &:last-child {
      border-bottom: none;
    }

    &.disabled {
      opacity: 0.5;
    }

    .binding-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 4px;
    }

    .binding-info {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      overflow: hidden;
      flex: 1;
      min-width: 0;
    }

    .binding-actions {
      display: flex;
      align-items: center;
      gap: 2px;
      flex-shrink: 0;
    }

    .protocol-tag {
      flex-shrink: 0;
    }

    .binding-pen-id {
      color: var(--td-text-color-secondary, #666);
      font-family: monospace;
      font-size: 11px;
    }

    .binding-arrow {
      color: var(--td-text-color-placeholder, #999);
    }

    .binding-prop {
      color: var(--td-brand-color, #0052d9);
      font-size: 12px;
    }
  }
}
</style>
