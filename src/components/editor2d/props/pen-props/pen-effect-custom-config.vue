<template>
  <div class="pen-effect-custom-config">
    <t-drawer
      v-model:visible="options.visible"
      :header="options.header || '节点动画'"
      :footer="options.footer || false"
      @close="onEffectCustomClose"
    >
      <t-button style="margin-bottom: 10px" type="button" :block="true" @click="onAddEffectFrames">新增动画帧</t-button>
      <template v-if="framesData && framesData.length > 0">
        <t-form ref="form" label-align="left">
          <t-collapse v-model:value="activeKey" expand-icon-placement="right">
            <t-collapse-panel
              v-for="(data, index) in framesData"
              :value="index"
              :header="'动画帧 ' + (index + 1) + '/' + framesData.length"
            >
              <generate-form :model-value="getEffectFramesProps(data)" />
              <template #headerRightContent>
                <DeleteIcon @click="onDeleteFrames(index)" />
              </template>
            </t-collapse-panel>
          </t-collapse>
        </t-form>
      </template>
    </t-drawer>
  </div>
</template>

<script setup lang="ts">
import { PropType, ref, watch } from 'vue'
import { DeleteIcon } from 'tdesign-icons-vue-next'
import { DrawerProps } from 'tdesign-vue-next'
import GenerateForm from '../../../common/form-list/GenerateForm.vue'
import { Editor2DPen, Editor2DPropsMenu } from '../../core/editor2d-global-type'
import { CONFIG_LINE_DASH, FONT_FAMILY, GRADIENT_TYPE } from '../../core/editor2d-global-constant'

let props = defineProps({
  modelValue: {
    type: Object as PropType<Editor2DPen | any>,
    required: true,
  },
  options: {
    type: Object as PropType<DrawerProps>,
    default() {
      return {
        header: '节点动画',
        visible: false,
        footer: false,
      }
    },
  },
})

// 编辑中动效数据
let framesData = ref<Array<Editor2DPen>>([])
// 激活动效帧 key
let activeKey = ref<Array<number>>([])

/**
 * 设置动画帧项
 * @param prop 项
 */
function setOptionFunc(prop: string) {
  return (value: any) => {
    console.log(prop, value)
  }
}

/**
 * 获取动画帧配置项
 * @param data 数据
 */
function getEffectFramesProps(data: any): Array<Editor2DPropsMenu> {
  return [
    {
      title: '时长(ms)',
      type: 'number',
      value: 'duration',
      data: data,
      event: 'change',
      action: setOptionFunc('duration'),
    },
    {
      title: '偏移X',
      type: 'number',
      option: {
        placeholder: 'px',
      },
      value: 'x',
      data: data,
      event: 'change',
      action: setOptionFunc('x'),
    },
    {
      title: '偏移Y',
      type: 'number',
      option: {
        placeholder: 'px',
      },
      value: 'y',
      data: data,
      event: 'change',
      action: setOptionFunc('y'),
    },
    {
      title: '缩放',
      type: 'number',
      value: 'scale',
      data: data,
      event: 'change',
      action: setOptionFunc('scale'),
    },
    {
      title: '圆角',
      type: 'number',
      option: {
        placeholder: '< 1 比例',
      },
      value: 'borderRadius',
      data: data,
      event: 'change',
      action: setOptionFunc('borderRadius'),
    },
    {
      title: '旋转',
      type: 'number',
      option: {
        placeholder: '°',
      },
      value: 'rotate',
      data: data,
      event: 'change',
      action: setOptionFunc('rotate'),
    },
    {
      title: '进度',
      type: 'slider',
      option: {
        min: 0,
        max: 1,
        step: 0.1,
      },
      value: 'progress',
      data: data,
      event: 'change',
      action: setOptionFunc('progress'),
    },
    {
      title: '进度颜色',
      type: 'color',
      value: 'progressColor',
      data: data,
      event: 'change',
      action: setOptionFunc('progressColor'),
    },
    {
      title: '水平翻转',
      type: 'switch',
      value: 'flipX',
      data: data,
      event: 'change',
      action: setOptionFunc('flipX'),
    },
    {
      title: '垂直翻转',
      type: 'switch',
      value: 'flipY',
      data: data,
      event: 'change',
      action: setOptionFunc('flipY'),
    },
    {
      title: '线条样式',
      type: 'select',
      option: {
        placeholder: '线条样式',
        list: CONFIG_LINE_DASH,
      },
      value: 'dash',
      data: data,
      event: 'change',
      action: setOptionFunc('dash'),
    },
    {
      title: '线条宽度',
      type: 'number',
      option: {
        placeholder: 'px',
      },
      value: 'lineWidth',
      data: data,
      event: 'change',
      action: setOptionFunc('lineWidth'),
    },
    {
      title: '线条偏移',
      type: 'number',
      option: {
        placeholder: 'px',
      },
      value: 'lineDashOffset',
      data: data,
      event: 'change',
      action: setOptionFunc('lineDashOffset'),
    },
    {
      title: '透明度',
      type: 'slider',
      option: {
        placeholder: '(0-1)',
        min: 0,
        max: 1,
        step: 0.1,
      },
      value: 'globalAlpha',
      data: data,
      event: 'change',
      action: setOptionFunc('globalAlpha'),
    },
    {
      title: '显示',
      type: 'switch',
      value: 'visible',
      data: data,
      event: 'change',
      action: setOptionFunc('visible'),
    },
    {
      title: '线条渐变',
      type: 'select',
      option: {
        list: GRADIENT_TYPE,
      },
      value: 'lineGradientColors',
      data: data,
      event: 'change',
      action: setOptionFunc('lineGradientColors'),
    },
    {
      title: '线条渐变色',
      type: 'color',
      value: 'lineGradientColors',
      data: data,
      event: 'change',
      action: setOptionFunc('lineGradientColors'),
    },
    {
      title: '背景',
      type: 'select',
      option: {
        list: GRADIENT_TYPE,
      },
      value: 'bkType',
      data: data,
      event: 'change',
      action: setOptionFunc('bkType'),
    },
    {
      title: '背景渐变色',
      type: 'color',
      value: 'gradientColors',
      data: data,
      event: 'change',
      action: setOptionFunc('gradientColors'),
    },
    {
      title: '阴影颜色',
      type: 'color',
      value: 'shadowColor',
      data: data,
      event: 'change',
      action: setOptionFunc('shadowColor'),
    },
    {
      title: '阴影模糊',
      type: 'number',
      value: 'shadowBlur',
      data: data,
      event: 'change',
      action: setOptionFunc('shadowBlur'),
    },
    {
      title: '阴影 X 偏移',
      type: 'number',
      value: 'shadowOffsetX',
      data: data,
      event: 'change',
      action: setOptionFunc('shadowOffsetX'),
    },
    {
      title: '阴影 Y 偏移',
      type: 'number',
      value: 'shadowOffsetY',
      data: data,
      event: 'change',
      action: setOptionFunc('shadowOffsetY'),
    },
    {
      title: '文字阴影',
      type: 'switch',
      value: 'textHasShadow',
      data: data,
      event: 'change',
      action: setOptionFunc('textHasShadow'),
    },
    {
      title: '字体名',
      type: 'select',
      option: {
        list: FONT_FAMILY,
      },
      value: 'fontFamily',
      data: data,
      event: 'change',
      action: setOptionFunc('fontFamily'),
    },
    {
      title: '字体大小',
      type: 'number',
      value: 'fontSize',
      data: data,
      event: 'change',
      action: setOptionFunc('fontSize'),
    },
    {
      title: '文字颜色',
      type: 'color',
      value: 'textColor',
      data: data,
      event: 'change',
      action: setOptionFunc('textColor'),
    },
    {
      title: '浮动文字颜色',
      type: 'color',
      value: 'hoverTextColor',
      data: data,
      event: 'change',
      action: setOptionFunc('hoverTextColor'),
    },
    {
      title: '选中文字颜色',
      type: 'color',
      value: 'activeTextColor',
      data: data,
      event: 'change',
      action: setOptionFunc('activeTextColor'),
    },
    {
      title: '文字报警',
      type: 'color',
      value: 'textBackground',
      data: data,
      event: 'change',
      action: setOptionFunc('textBackground'),
    },
    {
      title: '倾斜',
      type: 'select',
      option: {
        list: [
          {
            label: '正常',
            value: 'normal',
          },
          {
            label: '倾斜',
            value: 'italic',
          },
        ],
      },
      value: 'fontStyle',
      data: data,
      event: 'change',
      action: setOptionFunc('fontStyle'),
    },
    {
      title: '加粗',
      type: 'select',
      option: {
        list: [
          {
            label: '正常',
            value: 'normal',
          },
          {
            label: '加粗',
            value: 'bold',
          },
        ],
      },
      value: 'fontWeight',
      data: data,
      event: 'change',
      action: setOptionFunc('fontWeight'),
    },
    {
      title: '浮动文字颜色',
      type: 'color',
      value: 'hoverTextColor',
      data: data,
      event: 'change',
      action: setOptionFunc('hoverTextColor'),
    },
    {
      title: '背景颜色',
      type: 'color',
      value: 'textBackground',
      data: data,
      event: 'change',
      action: setOptionFunc('textBackground'),
    },
    {
      title: '水平对齐',
      type: 'select',
      value: 'textAlign',
      option: {
        list: [
          {
            label: '左对齐',
            value: 'left',
          },
          {
            label: '居中',
            value: 'center',
          },
          {
            label: '右对齐',
            value: 'right',
          },
        ],
      },
      data: data,
      event: 'change',
      action: setOptionFunc('textAlign'),
    },
    {
      title: '垂直对齐',
      type: 'select',
      value: 'textBaseline',
      option: {
        list: [
          {
            label: '顶部对齐',
            value: 'top',
          },
          {
            label: '居中',
            value: 'middle',
          },
          {
            label: '底部对齐',
            value: 'bottom',
          },
        ],
      },
      data: data,
      event: 'change',
      action: setOptionFunc('textBaseline'),
    },
    {
      title: '行高',
      type: 'number',
      value: 'lineHeight',
      data: data,
      event: 'change',
      action: setOptionFunc('lineHeight'),
    },
    {
      title: '换行',
      type: 'select',
      value: 'whiteSpace',
      option: {
        placeholder: '默认',
        list: [
          {
            label: '不换行',
            value: 'nowrap',
          },
          {
            label: '回车换行',
            value: 'pre-line',
          },
          {
            label: '永远换行',
            value: 'break-all',
          },
        ],
      },
      data: data,
      event: 'change',
      action: setOptionFunc('whiteSpace'),
    },
    {
      title: '文字宽度',
      type: 'number',
      value: 'textWidth',
      data: data,
      event: 'change',
      action: setOptionFunc('textWidth'),
    },
    {
      title: '文字高度',
      type: 'number',
      value: 'textHeight',
      data: data,
      event: 'change',
      action: setOptionFunc('textHeight'),
    },
    {
      title: '水平偏移',
      type: 'number',
      value: 'textLeft',
      data: data,
      event: 'change',
      action: setOptionFunc('textLeft'),
    },
    {
      title: '垂直偏移',
      type: 'number',
      value: 'textTop',
      data: data,
      event: 'change',
      action: setOptionFunc('textTop'),
    },
    {
      title: '超出省略',
      type: 'switch',
      value: 'ellipsis',
      data: data,
      event: 'change',
      action: setOptionFunc('ellipsis'),
    },
    {
      title: '文本内容',
      type: 'textarea',
      value: 'text',
      data: data,
      event: 'change',
      action: setOptionFunc('text'),
    },
  ]
}

/**
 * 添加动画帧
 */
function onAddEffectFrames() {
  framesData.value.push({})
}

/**
 * 删除动画帧
 * @param index 索引
 */
function onDeleteFrames(index: number) {
  framesData.value.splice(index, 1)
}

/**
 * 关闭动效自定义窗口
 */
function onEffectCustomClose() {
  emit('confirm', framesData.value)
  props.options.visible = false
}

/**
 * 注册事件
 */
const emit = defineEmits(['confirm', 'close'])

/**
 * 初始化
 * @param pen 图元
 */
function init(pen: Editor2DPen) {
  framesData.value = []
  if (pen && pen.frames) {
    framesData.value = pen.frames as Array<Editor2DPen>
  }
}

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      init(newValue)
    }
  }
)
</script>

<style scoped lang="less"></style>
