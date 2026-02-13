<template>
  <div class="pen-multi-appearance-config">
    <t-collapse v-model:value="activeCollapse" size="small" expand-icon-placement="right">
      <t-collapse-panel header="对齐(参照框)">
        <div>
          <i title="左对齐" class="iconfont icon-justification-left" @click="onAlignNodes('left')"></i>
          <i title="右对齐" class="iconfont icon-justification-right" @click="onAlignNodes('right')"></i>
          <i title="顶部对齐" class="iconfont icon-justification-top" @click="onAlignNodes('top')"></i>
          <i title="底部对齐" class="iconfont icon-justification-bottom" @click="onAlignNodes('bottom')"></i>
          <i title="垂直居中" class="iconfont icon-vertical-centering" @click="onAlignNodes('center')"></i>
          <i title="水平居中" class="iconfont icon-horizontal-centering" @click="onAlignNodes('middle')"></i>
          <i
            title="水平等分对齐"
            style="font-size: 20px; margin: 0 5px"
            class="iconfont icon-level-isometric-alignment"
            @click="onSpaceBetween"
          ></i>
          <i
            title="垂直等分对齐"
            style="font-size: 20px; margin: 0 5px"
            class="iconfont icon-vertical-isometric-alignment"
            @click="onSpaceBetweenColumn"
          ></i>
        </div>
      </t-collapse-panel>
      <t-collapse-panel header="对齐(参照第一个选中节点)">
        <div>
          <i title="左对齐" class="iconfont icon-justification-left" @click="onAlignNodesByFirst('left')"></i>
          <i title="右对齐" class="iconfont icon-justification-right" @click="onAlignNodesByFirst('right')"></i>
          <i title="顶部对齐" class="iconfont icon-justification-top" @click="onAlignNodesByFirst('top')"></i>
          <i title="底部对齐" class="iconfont icon-justification-bottom" @click="onAlignNodesByFirst('bottom')"></i>
          <i title="垂直居中" class="iconfont icon-vertical-centering" @click="onAlignNodesByFirst('center')"></i>
          <i title="水平居中" class="iconfont icon-horizontal-centering" @click="onAlignNodesByFirst('middle')"></i>
          <i
            title="相同大小"
            style="font-size: 20px; margin: 0 5px"
            class="iconfont icon-alike"
            @click="onBeSameByFirst"
          ></i>
          <i
            title="格式刷"
            style="font-size: 20px; margin: 0 5px"
            class="iconfont icon-format-brush"
            @click="onFormatPainterByFirst"
          ></i>
        </div>
      </t-collapse-panel>
      <t-collapse-panel header="对齐(参照最后一个选中节点)">
        <div>
          <i title="左对齐" class="iconfont icon-justification-left" @click="onAlignNodesByLast('left')"></i>
          <i title="右对齐" class="iconfont icon-justification-right" @click="onAlignNodesByLast('right')"></i>
          <i title="顶部对齐" class="iconfont icon-justification-top" @click="onAlignNodesByLast('top')"></i>
          <i title="底部对齐" class="iconfont icon-justification-bottom" @click="onAlignNodesByLast('bottom')"></i>
          <i title="垂直居中" class="iconfont icon-vertical-centering" @click="onAlignNodesByLast('center')"></i>
          <i title="水平居中" class="iconfont icon-horizontal-centering" @click="onAlignNodesByLast('middle')"></i>
          <i
            title="相同大小"
            style="font-size: 20px; margin: 0 5px"
            class="iconfont icon-alike"
            @click="onBeSameByLast"
          ></i>
          <i
            title="格式刷"
            style="font-size: 20px; margin: 0 5px"
            class="iconfont icon-format-brush"
            @click="onFormatPainterByLast"
          ></i>
        </div>
      </t-collapse-panel>
    </t-collapse>
  </div>
</template>

<script setup lang="ts">
import { PropType, ref, watch } from 'vue'
import { Editor2DPen } from '../../core/editor2d-global-type'

// 选中的图元
let props = defineProps({
  modelValue: {
    type: Array as PropType<Array<Editor2DPen> | any>,
    required: true,
  },
})
let activePens = ref<Array<Editor2DPen>>([])
// 激活的面板
let activeCollapse = ref<Array<number>>([0, 1, 2])

/**
 * 参照框对齐
 * @param align 对齐方式
 */
const onAlignNodes = (align: string) => {
  meta2d.alignNodes(align, activePens.value as any)
}

/**
 * 水平等分对齐
 */
const onSpaceBetween = () => {
  meta2d.spaceBetween()
}

/**
 * 垂直等分对齐
 */
const onSpaceBetweenColumn = () => {
  meta2d.spaceBetweenColumn()
}

/**
 * 参照第一个选中节点对齐
 * @param align 对齐方式
 */
const onAlignNodesByFirst = (align: string) => {
  meta2d.alignNodesByFirst(align, activePens.value as any)
}

/**
 * 参照第一个选中节点相同大小
 */
const onBeSameByFirst = () => {
  meta2d.beSameByFirst(activePens.value as any)
}

/**
 * 参照第一个选中节点格式刷
 */
const onFormatPainterByFirst = () => {
  meta2d.formatPainterByFirst(activePens.value as any)
}

/**
 * 参照最后一个选中节点对齐
 * @param align 对齐方式
 */
const onAlignNodesByLast = (align: string) => {
  meta2d.alignNodesByLast(align, activePens.value as any)
}

/**
 * 参照最后一个选中节点相同大小
 */
const onBeSameByLast = () => {
  meta2d.beSameByLast(activePens.value as any)
}

/**
 * 参照最后一个选中节点格式刷
 */
const onFormatPainterByLast = () => {
  meta2d.formatPainterByLast(activePens.value as any)
}

/**
 * 初始化
 * @param pens 图元
 */
function init(pens: Array<Editor2DPen>) {
  if (pens) {
    activePens.value = pens
  }
}

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      init(newValue)
    }
  },
  { immediate: true }
)
</script>

<style scoped lang="less"></style>
