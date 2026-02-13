<template>
  <div class="map-comm-config">
    <t-collapse expand-icon-placement="right" :default-value="activeCollapse">
      <t-collapse-panel header="WebSocket">
        <t-input
          v-model:value="editorMap.socketConfig['url']"
          :clearable="true"
          placeholder="请输入websocket地址"
          @blur="setWebSocketConfig"
        />
      </t-collapse-panel>
      <t-collapse-panel header="MQTT">
        <t-form :data="editorMap.mqttConfig" :rules="mqttRules" label-align="left">
          <t-form-item label="URL地址" name="mqtt">
            <t-input v-model:value="editorMap.mqttConfig['mqtt']" :clearable="true" @blur="setMqttConfig" />
          </t-form-item>
          <t-form-item label="Client ID">
            <t-input
              v-model:value="editorMap.mqttConfig['mqttOptions'].clientId"
              :clearable="true"
              @blur="setMqttConfig"
            />
          </t-form-item>
          <t-form-item label="自定义Client ID">
            <t-switch
              v-model:checked="editorMap.mqttConfig['mqttOptions'].customClientId"
              :clearable="true"
              @change="setMqttConfig"
            />
          </t-form-item>
          <t-form-item label="用户名">
            <t-input
              v-model:value="editorMap.mqttConfig['mqttOptions'].username"
              :clearable="true"
              @blur="setMqttConfig"
            />
          </t-form-item>
          <t-form-item label="密码">
            <t-input
              v-model:value="editorMap.mqttConfig['mqttOptions'].password"
              :clearable="true"
              @blur="setMqttConfig"
            />
          </t-form-item>
          <t-form-item label="Topics" name="mqttTopics">
            <t-input
              v-model:value="editorMap.mqttConfig['mqttTopics']"
              placeholder="多个topic以英文逗号“,”分隔"
              @blur="setMqttConfig"
            />
          </t-form-item>
        </t-form>
      </t-collapse-panel>
      <t-collapse-panel header="HTTP通信">
        <t-form label-align="left" label-width="70">
          <t-collapse-panel
            v-for="(item, index) in editorMap.httpConfig"
            :value="index"
            :header="'事件 ' + (index + 1)"
          >
            <t-form-item label="URL地址">
              <t-input v-model:value="item.http" :clearable="true" @blur="setHttpConfig" />
            </t-form-item>
            <t-form-item label="请求方式">
              <t-select v-model:value="item.method" placeholder="默认GET" :clearable="true" @change="setHttpConfig">
                <t-option value="GET" label="GET" />
                <t-option value="POST" label="POST" />
              </t-select>
            </t-form-item>
            <t-form-item label="时间间隔">
              <t-input-number v-model:value="item.httpTimeInterval" @blur="setHttpConfig" />
            </t-form-item>
            <t-form-item label="请求头">
              <t-button @click="openCodeEdit('httpHeaders', index)">...</t-button>
            </t-form-item>
            <template #headerRightContent>
              <DeleteIcon @click="onDeleteHttpNode(index)" />
            </template>
          </t-collapse-panel>
          <t-button type="button" :block="true" @click="onAddHttpSetData">增加HTTP通信</t-button>
        </t-form>
      </t-collapse-panel>
      <t-collapse-panel header="消息处理JavaScript">
        <t-form label-align="left">
          <t-form-item label="消息处理">
            <t-button @click="openCodeEdit">...</t-button>
          </t-form-item>
        </t-form>
      </t-collapse-panel>
    </t-collapse>

    <editor-code
      :title="editorCodeTitle"
      :visible="editorCodeVisible"
      :model-value="editorCodeValue"
      :options="editorCodeOptions"
      @close="closeEditorCode"
      @confirm="confirmEditorCode"
    >
    </editor-code>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { DeleteIcon } from 'tdesign-icons-vue-next'
import EditorCode from '../../edit-code/EditorCode.vue'
import { isValidWebSocketUrl } from '../../core/editor2d-communal'
import { Editor2DCache } from '../../core/editor2d-local-storage'
import { globalEditor2DData } from '../../core/editor2d-global-data'

// 全局默认配置
let editorMap = reactive<any>(globalEditor2DData)
// 激活的面板
let activeCollapse = ref<Array<number>>([0])
// 打开代码编辑器
let editorCodeVisible = ref<boolean>(false)
let editorCodeValue = ref<any>()
let editorCodeTitle = ref<string>()
let editorCodeOptions = ref<any>({})

// mqtt 配置校验规则
let mqttRules = reactive({
  mqtt: [{ required: true, message: '请输入 MQTT 地址' }],
  mqttTopics: [{ required: true, message: '请输入 Topics' }],
})

/**
 * 获取 socket 地址
 */
function setWebSocketConfig() {
  let socketConfig = editorMap.socketConfig
  if (socketConfig) {
    let url = socketConfig.url
    if (url) {
      if (isValidWebSocketUrl(url)) {
        meta2d.store.data['websocket'] = url
      } else {
        MessagePlugin.warning('不符合 WebSocket 地址的格式')
      }
    } else if (url == '') {
      meta2d.store.data['websocket'] = ''
    }
  }
  new Editor2DCache().saveCanvas()
}

/**
 * 配置 MQTT
 * https://doc.le5le.com/document/119620524#MQTT
 */
function setMqttConfig() {
  let mqttConfig = editorMap.mqttConfig
  if (mqttConfig) {
    meta2d.connectMqtt(mqttConfig as any)
  }
  new Editor2DCache().saveCanvas()
}

/**
 * 设置 HTTP 配置
 */
function setHttpConfig() {
  if (editorMap.httpConfig) {
    meta2d.store.data.https = editorMap.httpConfig as Array<any>
    meta2d.connectHttp()
  }
  new Editor2DCache().saveCanvas()
}

/**
 * 添加 HTTP 配置项
 */
function onAddHttpSetData() {
  let httpConfig = editorMap.httpConfig
  if (httpConfig) {
    httpConfig.push({
      http: '',
      method: '',
      httpTimeInterval: 3000,
      httpHeaders: {},
    })
  } else {
    editorMap.httpConfig = [
      {
        http: '',
        method: '',
        httpTimeInterval: 3000,
        httpHeaders: {},
      },
    ]
  }
  new Editor2DCache().saveCanvas()
}

/**
 * 删除 HTTP 配置项
 * @param index 索引
 */
function onDeleteHttpNode(index: number) {
  let httpConfig = editorMap.httpConfig
  if (httpConfig) {
    httpConfig.splice(index, 1)
  }
  new Editor2DCache().saveCanvas()
}

/**
 * 打开代码编辑器
 * @param prop 属性
 * @param eIndex 编辑索引
 */
function openCodeEdit(prop: string, eIndex: number) {
  if (prop === 'httpHeaders') {
    editorCodeTitle.value = 'HTTP 请求头设置'
    editorCodeOptions.value = { currentIndex: eIndex, prop: 'httpHeaders', example: '' }
    editorCodeValue.value = editorMap.httpConfig[eIndex].httpConfig
    editorCodeValue.value = '{}'
    if (!editorCodeValue.value) {
      editorCodeValue.value = '{}'
    }
  }
  editorCodeVisible.value = !editorCodeVisible.value
}

/**
 * 关闭代码编辑器
 */
function closeEditorCode() {
  editorCodeTitle.value = ''
  editorCodeValue.value = ''
  editorCodeOptions.value = {}
  editorCodeVisible.value = !editorCodeVisible.value
}

/**
 * 代码编辑器内容改变事件
 * @param v 值
 * @param e 扩展
 */
const confirmEditorCode = (v: string, e: any) => {
  if (e.prop === 'httpHeaders') {
    let httpConfig = editorMap.httpConfig
    if (httpConfig) {
      httpConfig[e.currentIndex].httpHeaders = v
    }
  }
}
</script>

<style scoped lang="less">
.map-comm-config {
  margin: 0;
  padding: 0;
}
</style>
