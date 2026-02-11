<template>
  <div class="pen-event-config">
    <div class="event-config-layout">
      <t-button type="button" :block="true" @click="onAddEvent">增加事件</t-button>
      <t-form ref="form" :data="eventData" label-align="left">
        <t-collapse v-model:value="activeKey" expand-icon-placement="right">
          <t-collapse-panel v-for="(vo, eIndex) in eventData" :value="eIndex" :header="'事件 ' + (eIndex + 1)">
            <t-form-item label="事件类型">
              <t-select
                  v-model:value="vo.name"
                  allowClear
                  placeholder="请选择事件类型"
                  @change="changeValue(vo, 'name', eIndex)"
              >
                <template v-for="item in eventType">
                  <t-option :value="item.value" :label="item.name"/>
                </template>
              </t-select>
            </t-form-item>
            <t-form-item label="事件行为">
              <t-select
                  v-model:value="vo.action"
                  allowClear
                  placeholder="请选择事件行为"
                  @change="changeValue(vo, 'action', eIndex)"
              >
                <template v-for="item in eventBehavior">
                  <t-option :value="item.value" :label="item.name"/>
                </template>
              </t-select>
            </t-form-item>
            <template v-if="vo.action === 0">
              <t-form-item label="链接地址">
                <t-input
                    v-model:value="vo.value"
                    placeholder="请输入链接地址"
                    @blur="changeValue(vo, 'value', eIndex)"
                />
              </t-form-item>
              <t-form-item label="打开方式">
                <t-select
                    v-model:value="vo.params"
                    allowClear
                    placeholder="请选择打开方式"
                    @change="changeValue(vo, 'params', eIndex)"
                >
                  <t-option value="_blank" label="打开新窗口"/>
                  <t-option value="_self" label="覆盖当前窗口"/>
                </t-select>
              </t-form-item>
            </template>
            <template v-if="[7].includes(vo.action)">
              <t-form-item label="消息名">
                <t-select v-model:value="vo.value">
                  <t-option value="l-dialog" label="对话框"/>
                  <t-option value="iframe-dialog" label="小窗展示"/>
                  <t-option value="navigator" label="导航"/>
                </t-select>
              </t-form-item>
              <t-form-item label="消息参数">
                <t-input v-model:value="vo.params"/>
              </t-form-item>
              <t-form-item label="全景地址">
                <t-input v-model:value="vo.panoramaUrl" placeholder="请输入全景图地址"/>
              </t-form-item>
            </template>
            <template v-if="[8, 9, 10].includes(vo.action)">
              <t-form-item label="视频目标">
                <t-input v-model:value="vo.params" :clearable="true" placeholder="请输入视频目标"/>
              </t-form-item>
            </template>
            <template v-if="[1, 11, 12].includes(vo.action)">
              <t-form-item label="目标">
                <t-input v-model:value="vo.params" placeholder="请输入目标ID"/>
              </t-form-item>
              <table class="set-props-table">
                <thead>
                <tr>
                  <td>key</td>
                  <td>value</td>
                  <td>
                    <AddCircleIcon @click="addExtendNode(eIndex)"/>
                  </td>
                </tr>
                </thead>
                <tbody>
                <template v-for="(kv, i) in keysValue[eIndex].list" :key="i">
                  <tr>
                    <td>
                      <t-select
                          v-model:value="kv.key"
                          size="small"
                          style="width: 80px"
                          @change="setExtend(eIndex)"
                      >
                        <t-option value="background" label="背景颜色"/>
                        <t-option value="color" label="背景"/>
                        <t-option value="text" label="文字"/>
                        <t-option value="width" label="宽度"/>
                        <t-option value="height" label="高度"/>
                        <t-option value="visible" label="显示"/>
                        <t-option value="progress" label="进度条"/>
                        <t-option value="value" label="值"/>
                        <t-option value="showChild" label="状态"/>
                      </t-select>
                    </td>
                    <td>
                      <t-input v-model:value="kv.value" size="small" style="width: 100px" @change="setExtend(eIndex)"/>
                    </td>
                    <td>
                      <CloseCircleIcon @click="onDeleteKeyValue(eIndex, i)"/>
                    </td>
                  </tr>
                </template>
                </tbody>
              </table>
            </template>
            <template v-if="[2, 3, 4].includes(vo.action)">
              <t-form-item label="动画目标">
                <t-input v-model:value="vo.value" :clearable="true" placeholder="请输入动画目标"/>
              </t-form-item>
            </template>
            <template v-if="vo.action == 5">
              <t-form-item label="JavaScript">
                <t-button @click="openCodeEdit(vo, eIndex)">...</t-button>
              </t-form-item>
            </template>
            <template v-if="[0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12].includes(vo.action)">
              <t-form-item label="触发条件">
                <t-select v-model:value="(vo.where as any)['type']" :clearable="true" placeholder="请选择触发条件"
                          @change="changeTriggerConditions(vo, eIndex)"
                >
                  <t-option value="comparison" label="关系运算"/>
                  <t-option value="code1" label="代码1"/>
                  <t-option value="code2" label="代码2"/>
                  <t-option value="custom" label="自定义代码判断"/>
                </t-select>
              </t-form-item>
              <template v-if="vo.where?.type == 'comparison'">
                <t-form-item label="属性名">
                  <t-input v-model:value="vo.where.key" placeholder="请输入属性名"
                           @change="changeValue(vo, 'where', eIndex)"/>
                </t-form-item>
                <t-form-item label="条件">
                  <t-select v-model:value="vo.where.comparison" :clearable="true" placeholder="请选择触发条件"
                            @change="changeValue(vo, 'where', eIndex)"
                  >
                    <t-option value=">" label="大于"/>
                    <t-option value=">=" label="大于等于"/>
                    <t-option value="<" label="小于"/>
                    <t-option value="<=" label="小于等于"/>
                    <t-option value="==" label="等于"/>
                    <t-option value="!=" label="不等于"/>
                  </t-select>
                </t-form-item>
                <t-form-item label="属性值">
                  <t-input v-model:value="vo.where.value" placeholder="请输入属性值"
                           @blur="onUpdateWhereParams(eIndex, vo.where.value)"
                  />
                </t-form-item>
              </template>
            </template>
            <template v-if="vo.where?.type == 'custom'">
              <t-form-item label="高优先级判断">
                <t-button @click="openCodeEdit(vo.where, eIndex)">...</t-button>
              </t-form-item>
            </template>
            <template #headerRightContent>
              <DeleteIcon @click="onDelete(eIndex)"/>
            </template>
          </t-collapse-panel>
        </t-collapse>
      </t-form>
    </div>
    <editor-code :visible="editorCodeVisible" :model-value="editorCodeValue" :options="editorCodeOptions"
                 @close="closeEditorCode" @confirm="confirmEditorCode">
    </editor-code>
  </div>
</template>
<script setup lang="ts">
import {PropType, ref, watch} from "vue";
import {MessagePlugin} from "tdesign-vue-next";
import EditorCode from "../../edit-code/EditorCode.vue";
import {AddCircleIcon, CloseCircleIcon, DeleteIcon} from "tdesign-icons-vue-next";
import {Editor2DCanvas} from "../../core/editor2d";
import {globalEditor2DPen} from "../../core/editor2d-global-data";
import {Editor2DEvent, Editor2DPen} from "../../core/editor2d-global-type";
import {EVENT_BEHAVIOR, EVENT_TYPE} from "../../core/editor2d-global-constant";

// 编辑中的图元
let props = defineProps({
  modelValue: {
    type: Object as PropType<Editor2DPen | any>,
    required: true
  },
});
let editorPen = ref<Editor2DPen>(globalEditor2DPen);
// 画布配置
let editor2DCanvas = new Editor2DCanvas();
//事件类型
let eventType = ref(EVENT_TYPE);
// 事件行为
let eventBehavior = ref(EVENT_BEHAVIOR);
// 添加的事件列表
let eventData = ref<Array<Editor2DEvent>>([]);
// 激活事件 key
let activeKey = ref<Array<number>>([]);
// 事件 key 列表
let keysValue = ref<Array<{ list: Array<any> }>>([{
  list: [],
}]);
// 当前事件索引
let currentIndex = ref<number>(0);
// 打开代码编辑器
let editorCodeVisible = ref<boolean>(false);
let editorCodeValue = ref<any>();
let editorCodeOptions = ref<any>({});

/**
 * 添加事件
 */
function onAddEvent() {
  let newEvent: any = {
    name: undefined,
    action: undefined,
    value: '',
    where: {
      type: ''
    },
  };
  eventData.value.push(newEvent);
  activeKey.value.push(eventData.value.length - 1);
  setPenEvents();
}

/**
 * 改变事件行为
 * @param e 事件
 * @param key key
 * @param eIndex 数据索引
 */
function changeValue(e: Editor2DEvent | any, key: string, eIndex: number) {
  switch (e.action) {
    case 2:
      eventData.value[eIndex].value = "";
      break;
    case 1:
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
    case 12:
      if ([1, 7, 8, 9, 10, 11, 12].includes(e.action) && key == "action" && typeof e.value == "string") {
        keysValue.value.push({
          list: [],
        });
        eventData.value[eIndex].value = {};
      }
      break;
  }
  setPenEvents();
}

/**
 * 获取触发条件值
 * @param data 数据
 * @param eIndex 数据索引
 */
function changeTriggerConditions(data: any, eIndex: number) {
  let {type} = data.where;
  let _ = {type,};
  switch (type) {
    case "comparison":
      Object.assign(_, {
        key: "",
        comparison: "",
        value: "",
      });
      break;
    case "code1":
      Object.assign(_, {
        fnJs: "return true",
      });
      break;
    case "code2":
      Object.assign(_, {
        fnJs: "return false",
      });
      break;
    case "custom":
      Object.assign(_, {
        fnJs: "",
      });
      break;
    default:
      Object.assign(_, {
        type: null,
      });
      break;
  }
  eventData.value[eIndex].where = _;
  setPenEvents();
}

/**
 * 删除事件
 * @param eIndex 事件索引
 */
function onDelete(eIndex: number) {
  eventData.value.splice(eIndex, 1);
  activeKey.value.splice(eIndex, 1);
  setPenEvents();
}

/**
 * 打开代码编辑器
 * @param data 数据
 * @param eIndex 事件索引
 */
function openCodeEdit(data: any, eIndex: number) {
  currentIndex.value = eIndex;
  if (data.where) {
    editorCodeOptions.value = {currentIndex: eIndex};
    editorCodeValue.value = data.value;
  } else {
    editorCodeOptions.value = {currentIndex: eIndex, type: 'where'};
    editorCodeValue.value = data.fnJs;
  }
  editorCodeVisible.value = !editorCodeVisible.value;
}

/**
 * 关闭代码编辑器
 */
function closeEditorCode() {
  editorCodeOptions.value = {};
  editorCodeValue.value = '';
  editorCodeVisible.value = !editorCodeVisible.value;
}

/**
 * 代码编辑器内容改变事件
 * @param v 值
 * @param e 扩展
 */
const confirmEditorCode = (v: string, e: any) => {
  if (e.type !== "where") {
    eventData.value[e.currentIndex]["value"] = v;
  } else {
    Object.assign(eventData.value[e.currentIndex].where as any, {
      fnJs: v,
    });
  }
  closeEditorCode();
}

/**
 * 添加扩展属性节点
 * @param eIndex 事件索引
 */
function addExtendNode(eIndex: number) {
  currentIndex.value = eIndex;
  keysValue.value[eIndex].list.push({
    key: "",
    value: "",
  });
  setPenEvents();
}

/**
 * 设置事件扩展属性
 * @param eIndex 事件索引
 */
function setExtend(eIndex: number) {
  currentIndex.value = eIndex;
  let lists = keysValue.value[eIndex].list;
  eventData.value[eIndex].value = {};
  for (let i = 0; i < lists.length; i++) {
    eventData.value[eIndex].value[lists[i].key] = lists[i].value;
  }
  setPenEvents();
}

/**
 * 更新条件值
 * @param eIndex 事件索引
 * @param value 值
 */
function onUpdateWhereParams(eIndex: number, value: any) {
  currentIndex.value = eIndex;
  let where = eventData.value[eIndex].where;
  if (where) {
    if (/^\d+$/.test(value)) {
      where.value = parseInt(value, 10);
    } else {
      where.value = value;
    }
  }
  setPenEvents();
}

/**
 * 删除 keysValue 数组
 * @param eIndex 事件索引
 * @param sIndex  属性索引
 */
function onDeleteKeyValue(eIndex: number, sIndex: number) {
  currentIndex.value = eIndex;
  keysValue.value[eIndex].list.splice(sIndex, 1);
  let lists: Array<string> = [];
  keysValue.value[eIndex].list.map((e) => {
    lists.push(e.key);
  });
  let v = Object.keys(eventData.value[eIndex].value as any);
  v.map((_) => {
    if (!lists.includes(_)) {
      delete (eventData.value[eIndex].value as any)[_];
    }
  });
  setPenEvents();
}

/**
 * 设置图元事件
 */
function setPenEvents() {
  let locked = meta2d.store.data.locked;
  if (locked !== 0) {
    MessagePlugin.warning('当前状态非编辑状态不可编辑');
    return
  }
  editorPen.value.events = eventData.value;
  editor2DCanvas.setValue([{
    id: editorPen.value.id,
    ['events']: eventData.value as any
  }]);
}

/**
 * 初始化
 * @param pen 图元
 */
function init(pen: Editor2DPen) {
  if (pen) {
    editorPen.value = pen;
    let penEvents = pen.events;
    eventData.value = [];
    if (penEvents) {
      eventData.value = penEvents;
      let list = eventData.value;
      list.map((e, i) => {
        activeKey.value.push(i);
        keysValue.value.push({
          list: [],
        });
        let {action, value} = e;
        switch (action) {
          case 1:
          case 7:
          case 8:
          case 9:
          case 10:
          case 11:
          case 12:
            let keys = Object.keys(value as any);
            Object.values(value as any).map((v, j) => {
              console.log(v);
              keysValue.value[i].list.push({
                key: keys[j],
                value: (value as any)[keys[j]],
              });
            });
            break;
          default:
            break;
        }
      });
    }
  }
}

watch(
    () => props.modelValue,
    (newValue) => {
      if (newValue) {
        init(newValue);
      }
    },
    {immediate: true},
)

</script>

<style scoped lang="less">
.event-config-layout {
  margin: 12px 0 0;
}

.set-props-table {
  width: 100%;
  margin: 0 0 12px;

  thead, tbody {
    tr {
      td {
        font-size: 12px;
        color: #000000d9;

        &:first-child,
        &:nth-child(2) {
          padding-left: 11px;
        }

        &:last-child {
          text-align: right;
        }
      }
    }
  }

  tbody {
    tr {
      td {
        padding: 6px 0;
      }
    }
  }
}
</style>