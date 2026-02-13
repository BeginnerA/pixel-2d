<template>
  <div class="graphics-more-modal">
    <t-dialog
      header="编辑器画布设置"
      width="800px"
      :visible="visible"
      :destroy-on-close="true"
      :close-btn="true"
      @close="onCancel"
    >
      <template #header>
        <div>
          <t-icon name="component-space" />
          <span style="vertical-align: middle">编辑器设置</span>
        </div>
      </template>
      <template #body>
        <t-tabs :value="activeTabsKey" @change="handlerChange">
          <t-tab-panel value="canvas">
            <template #label>
              <t-icon name="transform-1" class="tabs-icon-margin" />
              画布
            </template>
            <div class="modal-tabs-content">
              <t-card v-for="item in formListData">
                <template #header>
                  <div>
                    <t-icon v-if="item.icon" :name="item.icon" />
                    <span style="vertical-align: middle">{{ item.title }}</span>
                  </div>
                  <div v-if="item.type === 'switch'">
                    <t-switch
                      :disabled="item.disabled"
                      v-model="(item.data as any)[item.value]"
                      :label="['开', '关']"
                      @[item.event]="item.action"
                    />
                  </div>
                </template>
                <div>
                  <generate-form :options="{ layout: 'inline' }" :model-value="item.children" />
                </div>
              </t-card>
            </div>
          </t-tab-panel>
          <t-tab-panel value="other">
            <template #label>
              <t-icon name="palette-1" class="tabs-icon-margin" />
              其它
            </template>
            <div class="modal-tabs-content">
              <t-card header="待开发"> 待开发 </t-card>
            </div>
          </t-tab-panel>
        </t-tabs>
      </template>
      <template #footer>
        <div></div>
      </template>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { TabsProps } from 'tdesign-vue-next'
import { computed, reactive, ref } from 'vue'
import GenerateForm from '../../common/form-list/GenerateForm.vue'
import { Editor2D } from '../core/editor2d'
import { Editor2DPropsMenu } from '../core/editor2d-global-type'
import { globalEditor2DProps } from '../core/editor2d-global-data'
import { Editor2DCache } from '@/components/editor2d/core/editor2d-local-storage.ts'

// 2d编辑器全局配置
let m = reactive(globalEditor2DProps)
// 激活卡片
let activeTabsKey = ref<string | number>('canvas')
let editor2d = new Editor2D()

defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
})

/**
 * 2D编辑器属性面板功能菜单调度函数
 * @param prop 设置属性
 */
function setOptionFunc(prop: string) {
  return (value: any) => {
    editor2d.setData(prop, value)
    new Editor2DCache().saveCanvas()
  }
}

/**
 * 激活卡片事件
 * @param activeKey 激活卡片 key
 */
const handlerChange: TabsProps['onChange'] = (activeKey) => {
  activeTabsKey.value = activeKey
}

/**
 * 注册事件
 */
const emit = defineEmits(['confirm', 'close'])

/**
 * 关闭
 */
const onCancel = () => {
  emit('close')
}

/**
 * 属性面板菜单
 */
const formListData = computed(() => {
  return PROPS_MENU_LIST
})

/**
 * 属性面板菜单
 */
const PROPS_MENU_LIST: Array<Editor2DPropsMenu> = [
  {
    title: '标尺',
    icon: 'measurement-1',
    type: 'switch',
    value: 'rule',
    data: m,
    event: 'change',
    action: setOptionFunc('rule'),
    children: [
      {
        title: '颜色',
        type: 'color',
        value: 'ruleColor',
        data: m,
        event: 'change',
        action: setOptionFunc('ruleColor'),
      },
    ],
  },
  {
    title: '网格',
    icon: 'map-grid',
    type: 'switch',
    value: 'grid',
    data: m,
    event: 'change',
    action: setOptionFunc('grid'),
    children: [
      {
        title: '颜色',
        type: 'color',
        value: 'gridColor',
        data: m,
        event: 'change',
        action: setOptionFunc('gridColor'),
      },
      {
        title: '网格尺寸',
        type: 'number',
        value: 'gridSize',
        option: {
          step: 10,
          min: 10,
          max: 100,
        },
        data: m,
        event: 'change',
        action: setOptionFunc('gridSize'),
      },
    ],
  },
  {
    title: '画笔',
    icon: 'pen-brush',
    children: [
      {
        title: '默认颜色',
        type: 'color',
        value: 'color',
        data: m,
        event: 'change',
        action: setOptionFunc('color'),
      },
      {
        title: '选中颜色',
        type: 'color',
        value: 'activeColor',
        data: m,
        event: 'change',
        action: setOptionFunc('activeColor'),
      },
      {
        title: 'hover颜色',
        type: 'color',
        value: 'hoverColor',
        data: m,
        event: 'change',
        action: setOptionFunc('hoverColor'),
      },
      {
        title: 'hover背景颜色',
        type: 'color',
        value: 'hoverBackground',
        data: m,
        event: 'change',
        action: setOptionFunc('hoverBackground'),
      },
    ],
  },
  {
    title: '锚点',
    icon: 'palette-1',
    children: [
      {
        title: '颜色',
        type: 'color',
        value: 'anchorColor',
        event: 'change',
        data: m,
        action: setOptionFunc('anchorColor'),
      },
      {
        title: '半径',
        type: 'number',
        value: 'anchorRadius',
        data: m,
        event: 'change',
        action: setOptionFunc('anchorRadius'),
      },
      {
        title: '背景颜色',
        type: 'color',
        value: 'anchorBackground',
        data: m,
        event: 'change',
        action: setOptionFunc('anchorBackground'),
      },
    ],
  },
  {
    title: '辅助线',
    icon: 'transform-1',
    children: [
      {
        title: '锚点颜色',
        type: 'color',
        value: 'dockColor',
        event: 'change',
        data: m,
        action: setOptionFunc('dockColor'),
      },
      {
        title: '框选颜色',
        type: 'color',
        value: 'dragColor',
        data: m,
        event: 'change',
        action: setOptionFunc('dragColor'),
      },
      {
        title: '连线动画颜色',
        type: 'color',
        value: 'animateColor',
        data: m,
        event: 'change',
        action: setOptionFunc('animateColor'),
      },
    ],
  },
  {
    title: '文字',
    icon: 'translate-1',
    children: [
      {
        title: '颜色',
        type: 'color',
        value: 'textColor',
        event: 'change',
        data: m,
        action: setOptionFunc('textColor'),
      },
      {
        title: '字体',
        type: 'input',
        value: 'fontFamily',
        data: m,
        event: 'change',
        action: setOptionFunc('fontFamily'),
      },
      {
        title: '大小',
        type: 'number',
        value: 'fontSize',
        data: m,
        event: 'change',
        action: setOptionFunc('fontSize'),
      },
      {
        title: '行高',
        type: 'number',
        value: 'lineHeight',
        data: m,
        event: 'change',
        action: setOptionFunc('lineHeight'),
      },
      {
        title: '水平对齐方式',
        type: 'input',
        value: 'textAlign',
        data: m,
        event: 'change',
        action: setOptionFunc('textAlign'),
      },
      {
        title: '垂直对齐方式',
        type: 'input',
        value: 'textBaseline',
        data: m,
        event: 'change',
        action: setOptionFunc('textBaseline'),
      },
    ],
  },
  {
    title: '鼠标样式',
    icon: 'gesture-click',
    children: [
      {
        title: '旋转控制点的',
        type: 'input',
        value: 'rotateCursor',
        event: 'change',
        data: m,
        action: setOptionFunc('rotateCursor'),
      },
      {
        title: 'hover样式',
        type: 'input',
        value: 'hoverCursor',
        data: m,
        event: 'change',
        action: setOptionFunc('hoverCursor'),
      },
    ],
  },
  {
    title: '禁止',
    icon: 'map-blocked',
    children: [
      {
        title: '双击弹出输入框',
        type: 'switch',
        value: 'disableInput',
        event: 'change',
        data: m,
        action: setOptionFunc('disableInput'),
      },
      {
        title: '旋转',
        type: 'switch',
        value: 'disableRotate',
        data: m,
        event: 'change',
        action: setOptionFunc('disableRotate'),
      },
      {
        title: '显示锚点',
        type: 'switch',
        value: 'disableAnchor',
        data: m,
        event: 'change',
        action: setOptionFunc('disableAnchor'),
      },
      {
        title: '两端关联连线',
        type: 'switch',
        value: 'disableEmptyLine',
        data: m,
        event: 'change',
        action: setOptionFunc('disableEmptyLine'),
      },
      {
        title: '关联重复连线',
        type: 'switch',
        value: 'disableRepeatLine',
        data: m,
        event: 'change',
        action: setOptionFunc('disableRepeatLine'),
      },
      {
        title: '画布缩放',
        type: 'switch',
        value: 'disableScale',
        data: m,
        event: 'change',
        action: setOptionFunc('disableScale'),
      },
      {
        title: '辅助线',
        type: 'switch',
        value: 'disableDockLine',
        data: m,
        event: 'change',
        action: setOptionFunc('disableDockLine'),
      },
      {
        title: '画布移动',
        type: 'switch',
        value: 'disableTranslate',
        data: m,
        event: 'change',
        action: setOptionFunc('disableTranslate'),
      },
    ],
  },
  {
    title: '画布设置',
    icon: 'map-setting',
    children: [
      {
        title: '最小缩放',
        type: 'number',
        value: 'minScale',
        event: 'change',
        data: m,
        action: setOptionFunc('minScale'),
      },
      {
        title: '最大缩放',
        type: 'number',
        value: 'maxScale',
        data: m,
        event: 'change',
        action: setOptionFunc('maxScale'),
      },
    ],
  },
  {
    title: '其他设置',
    icon: 'extension',
    children: [
      {
        title: '自动锚点',
        type: 'switch',
        value: 'autoAnchor',
        event: 'change',
        data: m,
        action: setOptionFunc('autoAnchor'),
      },
      {
        title: '绘画帧时长',
        type: 'number',
        value: 'interval',
        option: {
          min: 1,
        },
        data: m,
        event: 'change',
        action: setOptionFunc('interval'),
      },
      {
        title: '动画帧时长',
        type: 'number',
        value: 'animateInterval',
        option: {
          min: 1,
        },
        data: m,
        event: 'change',
        action: setOptionFunc('animateInterval'),
      },
      {
        title: '文字是否选择',
        type: 'switch',
        value: 'textRotate',
        data: m,
        event: 'change',
        action: setOptionFunc('textRotate'),
      },
      {
        title: '文字是否镜像',
        type: 'switch',
        value: 'textFlip',
        data: m,
        event: 'change',
        action: setOptionFunc('textFlip'),
      },
    ],
  },
]
</script>

<style scoped lang="less">
.graphics-more-modal {
  :deep(.t-card__header) {
    padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-s);
  }

  :deep(.t-card__body) {
    padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingLR-s);
  }
}

.modal-tabs-content {
  max-height: 500px;
  overflow-y: auto;

  :deep(.t-form__item) {
    margin-bottom: var(--td-comp-margin-s);
  }
}

/*定义滚动条轨道 内阴影+圆角*/
::-webkit-scrollbar {
  width: 3px;
  height: 6px;
  background: transparent;
}

::-webkit-scrollbar-corner {
  background-color: transparent;
}

/*滚动条里面小方块*/
::-webkit-scrollbar-thumb {
  background-color: var(--color-scrollbar) !important;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-scrollbar-hover);
}

::-webkit-scrollbar-track {
  background-color: transparent !important;
}
</style>
