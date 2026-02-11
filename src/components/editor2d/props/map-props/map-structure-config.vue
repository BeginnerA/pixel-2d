<template>
  <div class="map-structure-config">
    <t-list>
      <t-list-item v-for="(item) in activePens">
        <t-button variant="text" :theme="activePenTheme(item)" @click="changeActive(item)">
          <template #icon>
            <activity-icon/>
          </template>
          {{ item.name }}
        </t-button>
        <template #action>
          <t-button theme="default" size="small">
            {{ canvasLayerText(item) }}
          </t-button>

          <t-tooltip :content="lockedContent(item)">
            <t-button variant="text" shape="square" @click="changeLocked(item)">
              <template v-if="item.locked === 1">
                <lock-on-icon/>
              </template>
              <template v-else-if="item.locked === 2">
                <div class="iconfont icon-lock-on" style="font-size: 1.3em"></div>
              </template>
              <template v-else-if="item.locked === 10">
                <work-off-icon/>
              </template>
              <template v-else>
                <lock-off-icon/>
              </template>
            </t-button>
          </t-tooltip>

          <t-button variant="text" shape="square" @click="changeVisible(item)">
            <template v-if="item.visible || item.visible === undefined">
              <browse-icon/>
            </template>
            <template v-else>
              <browse-off-icon/>
            </template>
          </t-button>
        </template>
      </t-list-item>
    </t-list>
  </div>
</template>

<script setup lang="ts">
import {onMounted, PropType, ref, watch} from "vue";
import {LockState} from "@meta2d/core/src/pen/model";
import {Editor2DCanvas} from "../../core/editor2d";
import {Editor2DPen} from "../../core/editor2d-global-type";
import {ActivityIcon, BrowseIcon, BrowseOffIcon, LockOffIcon, LockOnIcon, WorkOffIcon} from "tdesign-icons-vue-next";

// 编辑中的图元
let props = defineProps({
  modelValue: {
    type: Object as PropType<Editor2DPen | any>,
    required: true
  },
});
let editorPen = ref<Editor2DPen>();
// 选中的图元
let activePens = ref<Array<Editor2DPen>>([]);

/**
 * 改变选中图元
 * @param pen 图元
 */
function changeActive(pen: any) {
  editorPen.value = pen;
  emit('change', pen);
}

/**
 * 选中图元主题
 * @param pen 图元
 */
function activePenTheme(pen: any) {
  if (editorPen && editorPen.value?.id === pen.id) {
    return 'primary';
  } else {
    return 'default';
  }
}

/**
 * 画布图层
 * @param pen 图元
 */
function canvasLayerText(pen: any) {
  switch (pen.canvasLayer) {
    case 1:
      return '模板层';
    case 2:
      return '下层';
    case 4:
      return '上层';
    default:
      return '中层';
  }
}

/**
 * 锁状态
 * @param pen 图元
 */
function lockedContent(pen: any) {
  switch (pen.locked) {
    case LockState.DisableEdit:
      return '禁止编辑';
    case LockState.DisableMove:
      return '禁止编辑和移动';
    case LockState.Disable:
      return '禁止所有事件';
    default:
      return '可编辑';
  }
}

/**
 * 改变图元锁状态
 * @param pen 图元
 */
function changeLocked(pen: any) {
  if (pen.locked === LockState.None) {
    pen.locked = LockState.DisableEdit;
  } else if (pen.locked === LockState.DisableEdit) {
    pen.locked = LockState.DisableMove;
  } else if (pen.locked === LockState.DisableMove) {
    pen.locked = LockState.Disable;
  } else {
    pen.locked = LockState.None;
  }
  new Editor2DCanvas().setValue([{
    id: pen.id,
    locked: pen.locked,
  }]);
}

/**
 * 改变图元可见状态
 * @param pen 图元
 */
function changeVisible(pen: any) {
  pen.visible = !pen.visible;
  new Editor2DCanvas().setValue([{
    id: pen.id,
    visible: pen.visible
  }]);
}

/**
 * 初始化
 * @param pens 图元
 */
function init(pens: Array<Editor2DPen>) {
  activePens.value = meta2d.store.data.pens;
  editorPen.value = pens;
}

/**
 * 注册事件
 */
const emit = defineEmits(['change']);

watch(
    () => props.modelValue,
    (newValue) => {
      if (newValue) {
        init(newValue);
      }
    },
    {immediate: true},
)

onMounted(() => {
  init(props.modelValue);
})

</script>

<style scoped lang="less">
.map-structure-config {
  :deep(.t-list-item) {
    padding: var(--td-comp-paddingTB-xxs) var(--td-comp-paddingLR-xxs);
  }
}
</style>