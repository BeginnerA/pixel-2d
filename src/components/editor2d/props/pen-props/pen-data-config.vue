<template>
  <div class="editorPen-data-config">
    <t-form label-align="left" style="margin: 10px 0">
      <t-form-item label="ID">
        <t-input v-model:value="editorPen.id" style="width: 150px" @blur="onUpdatePen('id')" />
      </t-form-item>
      <t-form-item label="名称">
        <t-input v-model:value="editorPen.description" style="width: 150px" @blur="onUpdatePen('description')" />
      </t-form-item>
    </t-form>
    <t-collapse v-model:value="activeCollapse" size="small" expand-icon-placement="right">
      <t-collapse-panel header="Tag标签">
        <t-space class="data-tag-block">
          <t-tag
            v-for="(tag, index) in editorPen.tags"
            :key="index"
            :closable="true"
            :max-width="100"
            @close="closePenTag(index)"
          >
            {{ tag }}
          </t-tag>
        </t-space>
        <t-space>
          <t-input
            v-model:value="inputPenTag"
            placeholder="按回车添加(最大长度100)"
            :maxlength="100"
            :clearable="true"
            style="width: 238px"
            @blur="addPenTags"
            @enter="addPenTags"
          />
        </t-space>
      </t-collapse-panel>
      <t-collapse-panel header="数据">
        <template v-if="editorPen.form !== undefined && editorPen.form.length !== 0">
          <t-form label-align="left" :label-width="70">
            <t-form-item v-for="(i, index) in editorPen.form as Array<Editor2DPropsMenu>" :label="i.title">
              <!-- 输入框 -->
              <t-input
                v-if="i.type && ['input', 'text'].includes(i.type)"
                :clearable="true"
                :disabled="i.disabled"
                v-model="(i.data as any)[i.value]"
                style="width: 68%"
                :placeholder="i.option?.placeholder || '请输入'"
                :type="i.option?.type || 'text'"
                @change="onUpdatePen(i.value, true)"
              />
              <!-- 多行文本框 -->
              <t-textarea
                v-if="i.type === 'textarea'"
                :disabled="i.disabled"
                v-model="(i.data as any)[i.value]"
                :maxlength="i.option?.maxlength || 20"
                style="width: 68%"
                :placeholder="i.option?.placeholder || '请输入'"
                @change="onUpdatePen(i.value, true)"
              />
              <!-- 数字框 -->
              <t-input-number
                v-else-if="i.type === 'number'"
                :disabled="i.disabled"
                theme="column"
                :placeholder="i.option?.placeholder || '请输入'"
                :step="i.option?.step || 1"
                v-model="(i.data as any)[i.value]"
                :min="i.option?.min ?? -Infinity"
                :max="i.option?.max ?? Infinity"
                @change="onUpdatePen(i.value, true)"
              />
              <!-- 滑块 -->
              <t-slider
                v-else-if="i.type === 'slider'"
                :disabled="i.disabled"
                style="width: 68%"
                v-model="(i.data as any)[i.value]"
                :step="i.option?.step || 1"
                :min="i.option?.min ?? -Infinity"
                :max="i.option?.max ?? Infinity"
                @change="onUpdatePen(i.value, true)"
              />
              <!-- 选择框 -->
              <t-select
                v-else-if="i.type === 'select'"
                :disabled="i.disabled"
                v-model="(i.data as any)[i.value]"
                :placeholder="i.option?.placeholder"
                style="width: 68%"
                @change="onUpdatePen(i.value, true)"
              >
                <t-option
                  v-for="item in i.option?.list"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                  :disabled="item.disabled"
                >
                  <div v-if="item.template" class="select_template" v-html="item.template"></div>
                </t-option>
              </t-select>
              <!-- 取色器 -->
              <t-color-picker
                v-else-if="i.type === 'color'"
                :disabled="i.disabled"
                v-model="(i.data as any)[i.value]"
                :show-primary-color-preview="false"
                @change="onUpdatePen(i.value, true)"
              />
              <!-- 开关 -->
              <t-switch
                v-else-if="i.type === 'switch'"
                :disabled="i.disabled"
                v-model="(i.data as any)[i.value]"
                @change="onUpdatePen(i.value, true)"
              />
              <!-- 代码 -->
              <t-button
                v-else-if="i.type === 'code'"
                :disabled="i.disabled"
                :type="i.option?.type"
                @change="onUpdatePen(i.value, true)"
                @click="openCodeEdit(i)"
              >
                ...
              </t-button>

              <div style="margin-left: 2px">
                <LinkIcon size="medium" @click="linkData(editorPen, index)" />
                <CreditcardIcon size="medium" @click="editData(editorPen, index)" />
                <DeleteIcon size="medium" @click="deleteData(editorPen, index)" />
              </div>
            </t-form-item>
          </t-form>
          <t-button style="margin-top: 10px" :block="true" variant="outline" @click="openAddData">
            <template #icon>
              <add-icon />
            </template>
            添加
          </t-button>
        </template>
        <template v-else>
          <t-space align="center">
            <div>暂无数据</div>
            <t-button variant="text" theme="primary" @click="openAddData">添加</t-button>
          </t-space>
        </template>
      </t-collapse-panel>
      <t-collapse-panel v-if="editorPen.dropdownList" header="下拉列表">
        <table class="set-select-table">
          <thead>
            <tr>
              <td>label</td>
              <td>key</td>
              <td>value</td>
              <td>
                <AddCircleIcon @click="addSelectNode" />
              </td>
            </tr>
          </thead>
          <tbody>
            <template v-for="(item, i) in dropdownList" :key="i">
              <tr>
                <td>
                  <t-input
                    v-model:value="item.text"
                    placeholder="显示名称"
                    size="small"
                    style="width: 60px"
                    @change="onDropdownValue(i)"
                  />
                </td>
                <td>
                  <t-select v-model:value="item.key" size="small" style="width: 80px" @change="onDropdownValue(i)">
                    <t-option value="background" label="背景颜色" />
                    <t-option value="color" label="背景" />
                    <t-option value="text" label="文字" />
                    <t-option value="width" label="宽度" />
                    <t-option value="height" label="高度" />
                    <t-option value="visible" label="显示" />
                    <t-option value="progress" label="进度条" />
                    <t-option value="value" label="值" />
                    <t-option value="showChild" label="状态" />
                  </t-select>
                </td>
                <td>
                  <t-input
                    v-model:value="item.value"
                    placeholder="值"
                    size="small"
                    style="width: 80px"
                    @change="onDropdownValue(i)"
                  />
                </td>
                <td>
                  <CloseCircleIcon @click="onDeleteSelectNode(i)" />
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </t-collapse-panel>
    </t-collapse>
  </div>

  <editor-form-item
    :options="{ visible: editorFormVisible }"
    :model-value="editorFormData"
    @confirm="confirmData"
    @close="openAddData"
  />

  <editor-code
    :visible="editorCodeVisible"
    :model-value="editorCodeValue"
    :extend="editorCodeExtend"
    @close="closeEditorCode"
    @confirm="confirmEditorCode"
  />
</template>
<script setup lang="ts">
import { IValue } from '@meta2d/core/src/pen'
import { PropType, ref, watch } from 'vue'
import { InputProps, MessagePlugin } from 'tdesign-vue-next'
import { AddCircleIcon, AddIcon, CloseCircleIcon, CreditcardIcon, DeleteIcon, LinkIcon } from 'tdesign-icons-vue-next'
import EditorFormItem from '../../../common/form-list/EditorFormItem.vue'
import EditorCode from '../../edit-code/EditorCode.vue'
import { Editor2DCanvas } from '../../core/editor2d'
import { Editor2DPen, Editor2DPropsMenu } from '../../core/editor2d-global-type'
import { globalEditor2DPen } from '../../core/editor2d-global-data'

// 编辑中的图元
let props = defineProps({
  modelValue: {
    type: Object as PropType<Editor2DPen | any>,
    required: true,
  },
})
let editorPen = ref<Editor2DPen>(globalEditor2DPen)
// 激活的面板
let activeCollapse = ref<Array<number>>([0, 1, 2])
// 输入的标签内容
let inputPenTag = ref('')
// 表单编辑模板
let editorFormVisible = ref(false)
let editorFormData = ref()
// 画布配置
let editor2DCanvas = new Editor2DCanvas()
// 打开代码编辑器
let editorCodeVisible = ref<boolean>(false)
let editorCodeValue = ref<any>()
let editorCodeExtend = ref<any>()
// 下拉列表图元数据
let dropdownList = ref<
  Array<{
    text?: string
    key?: string
    value?: string
  }>
>([])

/**
 * 更新图元
 * @param prop 设置项
 * @param isFormData 是更新表单数据
 */
function onUpdatePen(prop: string, isFormData?: boolean) {
  let locked = meta2d.store.data.locked
  if (locked !== 0) {
    MessagePlugin.warning('当前状态非编辑状态不可编辑')
    return
  }
  let pen = editorPen.value as any
  let val = pen[prop]
  if (isFormData) {
    pen.form.forEach((item: any) => {
      if (item.value === prop) {
        val = item.data[item.value]
      }
    })
  }

  let dataList: Array<IValue> = [
    {
      id: editorPen.value.id,
      [prop]: val,
    },
  ]
  dataList.forEach((data) => {
    Object.assign(editorPen.value, data)
  })
  editor2DCanvas.setValue(dataList)
}

/**
 * 添加标签
 */
const addPenTags: InputProps['onEnter'] = (val: any) => {
  if (!val) {
    return false
  }
  let tags = editorPen.value.tags
  if (tags) {
    if (!tags.includes(val)) {
      tags.push(val)
    } else {
      MessagePlugin.warning('标签已存在')
    }
  } else {
    editorPen.value.tags = [val]
  }
  onUpdatePen('tags')
  return (inputPenTag.value = '')
}

/**
 * 删除标签
 * @param index 删除索引
 */
const closePenTag = (index: number) => {
  let tags = editorPen.value.tags
  if (tags) {
    tags.splice(index, 1)
  }
  onUpdatePen('tags')
}

/**
 * 打开添加数据
 */
function openAddData() {
  editorFormData.value = {}
  editorFormVisible.value = !editorFormVisible.value
}

/**
 * 绑定数据
 * @param data 数据
 * @param i 索引
 */
function linkData(data: any, i: number) {
  console.log(data, i)
}

/**
 * 编辑数据
 * @param data 数据
 * @param i 索引
 */
function editData(data: any, i: number) {
  let form = data.form
  if (form) {
    editorFormData.value = form[i]
    editorFormVisible.value = !editorFormVisible.value
  }
}

/**
 * 删除数据
 * @param data 数据
 * @param i 索引
 */
function deleteData(data: any, i: number) {
  let form = data.form
  if (form) {
    form.splice(i, 1)
  }
  onUpdatePen('form')
}

/**
 * 确认添加数据
 * @param item 数据项
 */
function confirmData(item: any) {
  let penForm = editorPen.value.form
  let val = (editorPen.value as any)[item.value]
  if (val) {
    item.data[item.value] = val
  }
  if (penForm) {
    // 通过 key 判断是否是修改
    if (!penForm.some((i) => i.key === item.key)) {
      penForm.push({ ...item, name: item.title })
    }
  } else {
    editorPen.value.form = [{ ...item, name: item.title }]
  }
  onUpdatePen('form')
  openAddData()
}

/**
 * 打开代码编辑器
 * @param item 编辑项
 */
function openCodeEdit(item: any) {
  editorCodeExtend.value = item.value
  editorCodeValue.value = item.data[item.value]
  editorCodeVisible.value = !editorCodeVisible.value
}

/**
 * 关闭代码编辑器
 */
function closeEditorCode() {
  editorCodeValue.value = ''
  editorCodeExtend.value = ''
  editorCodeVisible.value = !editorCodeVisible.value
}

/**
 * 代码编辑器内容改变事件
 * @param v 值
 * @param e 扩展
 */
const confirmEditorCode = (v: string, e: string) => {
  let penForm = editorPen.value.form
  if (penForm) {
    penForm.forEach((item) => {
      let data = (item as any)['data']
      let val = (item as any)['value']
      if (data && val === e) {
        data[e] = v
      }
    })
  }
  onUpdatePen('form')
  closeEditorCode()
}

/**
 * 添加下拉列表选择框选项内容
 */
function addSelectNode() {
  let pen = editorPen.value
  let dropdown = dropdownList.value
  if (pen && pen.dropdownList) {
    let node = {
      text: '',
      key: '',
      value: '',
    }
    if (dropdown) {
      dropdown.push(node)
    }
  }
}

/**
 * 删除下拉列表选择框选项内容
 * @param index 索引
 */
function onDeleteSelectNode(index: number) {
  let editItem = editorPen.value
  if (editItem && editItem.dropdownList) {
    editItem.dropdownList.splice(index, 1)
    dropdownList.value.splice(index, 1)
  }
  onUpdatePen('dropdownList')
}

/**
 * 下拉列表值改变事件
 * @param index 索引
 */
function onDropdownValue(index: number) {
  let newDropdown = dropdownList.value[index]
  let pen = editorPen.value
  if (pen && newDropdown) {
    if (pen.dropdownList) {
      let data = {
        text: newDropdown.text,
        [newDropdown.key as string]: newDropdown.value,
      }
      if (pen.dropdownList[index]) {
        pen.dropdownList[index] = data
      } else {
        pen.dropdownList.push(data)
      }
      onUpdatePen('dropdownList')
    }
  }
}

/**
 * 初始化图元表单数据
 * @param pen 图元
 */
function initFormData(pen: Editor2DPen) {
  let penName = pen.name as string
  if (!pen.form) {
    let form: any = {}
    if (
      [
        'square',
        'rectangle',
        'circle',
        'triangle',
        'diamond',
        'pentagon',
        'hexagon',
        'pentagram',
        'leftArrow',
        'rightArrow',
        'twowayArrow',
        'cloud',
        'message',
        'file',
        'cube',
        'text',
      ].includes(penName)
    ) {
      form = {
        key: 'text',
        value: 'text',
        title: '文本',
        name: '文本',
        type: 'text',
        data: { text: pen.text },
        option: {
          maxlength: undefined,
        },
      }
    } else if (['switch'].includes(penName)) {
      form = {
        key: 'checked',
        value: 'checked',
        title: '开关状态',
        name: '开关状态',
        type: 'switch',
        data: { checked: (pen as any)['checked'] },
        option: {
          placeholder: '',
        },
      }
    }
    if (form) {
      pen.form = [form]
    }
  }
}

/**
 * 初始化
 * @param pen 图元
 */
function init(pen: Editor2DPen) {
  if (pen) {
    editorPen.value = pen
  }
  // 下拉框图元数据
  if (pen && pen.dropdownList) {
    pen.dropdownList.forEach((item) => {
      let dropdown = {
        text: '',
        key: '',
        value: '',
      }
      let keys = Object.keys(item)
      Object.values(item).map((_, i) => {
        if (keys[i] === 'text') {
          dropdown.text = _
        } else {
          dropdown.key = keys[i]
          dropdown.value = _
        }
      })
      dropdownList.value.push(dropdown)
    })
  }
}

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      init(newValue)
      initFormData(newValue)
    }
  },
  { immediate: true }
)
</script>

<style scoped lang="less">
.data-tag-block {
  flex-wrap: wrap;
  margin-bottom: 10px;
}
</style>
