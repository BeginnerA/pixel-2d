<template>
  <div class="graphics-more-modal">
    <t-dialog header="图形库管理" width="800px"
              :visible="moreVisible"
              :destroy-on-close="true"
              :close-btn="true"
              @close="onCancel"
    >
      <template #header>
        <div>
          <t-icon name="component-space"/>
          <span style="vertical-align: middle">图形库管理</span>
        </div>
      </template>
      <template #body>
        <div>
          <t-enhanced-table maxHeight="500px" ref="tableRef" row-key="key" drag-sort="row-handler"
                            lazy-load
                            :data="graphicGroupsList"
                            :columns="columns"
                            :tree="treeConfig"
                            :tree-expand-and-fold-icon="treeExpandAndFoldIconRender"
                            :before-drag-sort="beforeDragSort"
                            @drag-sort="onDragSort"
          >
            <template #icon="{row}">
              <div v-if="row.data">
                <template v-if="row.data?.image">
                  <img :src="row.data.image" alt=""/>
                </template>
                <template v-else-if="row.data?.video">
                  <icon-font :name="row.icon" size="2em"/>
                </template>
                <template v-else-if="row.icon.indexOf('iconfont') !== -1">
                  <div :class="row.icon"></div>
                </template>
                <template v-else-if="row.data?.svg">
                  <div v-html="row.data.svg"></div>
                </template>
                <template v-else>
                  <svg class="l-icon" aria-hidden="true">
                    <use :xlink:href="'#' + row.icon"></use>
                  </svg>
                </template>
              </div>
            </template>
            <template #show="{row}">
              <div>
                <t-switch size="small" :default-value="row.show !== undefined ? row.show : true"
                          @change="onShowChange(row, $event)"/>
              </div>
            </template>
            <template #disabled="{row}">
              <div>
                <t-switch size="small" :default-value="row.disabled !== undefined ? row.disabled : true"
                          @change="onDisabledChange(row, $event)"/>
              </div>
            </template>
            <template #isCommon="{row}">
              <div v-if="row.data">
                <t-switch size="small" :default-value="row.isCommon !== undefined ? row.isCommon : false"
                          @change="onCommonChange(row, $event)"/>
              </div>
            </template>
          </t-enhanced-table>
        </div>
      </template>
      <template #footer>
        <div></div>
      </template>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import {EnhancedTableInstanceFunctions, EnhancedTableProps} from "tdesign-vue-next";
import {ChevronDownIcon, ChevronRightIcon, IconFont, MoveIcon} from 'tdesign-icons-vue-next';
import {reactive, ref, watch} from "vue";
import {DragSortContext} from "tdesign-vue-next/es/table/type";
import {Editor2DPropsMenu} from "../core/editor2d-global-type.ts";

let props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
});
let moreVisible = props.visible;
// 图元数据
let graphicGroupsList = defineModel<Array<Editor2DPropsMenu>>()
let tableRef = ref<EnhancedTableInstanceFunctions>();
// 图元管理表头
let columns: EnhancedTableProps['columns'] = [
  {
    colKey: 'drag',
    title: '排序',
    width: 46,
    cell: (h) => h(MoveIcon),
  },
  {
    colKey: 'title',
    title: '组件名称',
    width: 100,
    ellipsis: true,
  },
  {
    colKey: 'icon',
    title: '图元',
    width: 50,
    cell: 'icon',
  },
  {
    colKey: 'show',
    title: '显示',
    width: 30,
    cell: 'show',
  },
  {
    colKey: 'disabled',
    title: '启用',
    width: 30,
    cell: 'disabled',
  },
  {
    colKey: 'isCommon',
    title: '常用',
    width: 30,
    cell: 'isCommon',
  },
];

watch(
    () => props.visible,
    newVisible => {
      moreVisible = newVisible;
    }
)

/**
 * 显示/隐藏开关触发事件
 * @param row 数据
 * @param val 状态
 */
const onShowChange = (row: Editor2DPropsMenu, val: boolean) => {
  row.show = val;
  if (row.children) {
    row.children?.forEach(item => item.show = val);
  }
};

/**
 * 启用/禁用开关触发事件
 * @param row 数据
 * @param val 状态
 */
const onDisabledChange = (row: Editor2DPropsMenu, val: boolean) => {
  row.disabled = val
  if (row.children) {
    row.children?.forEach(item => item.disabled = val);
  }
};

/**
 * 是否是常用图元开关触发事件
 * @param row 数据
 * @param val 状态
 */
const onCommonChange = (row: Editor2DPropsMenu, val: boolean) => {
  row.isCommon = val
  if (row.children) {
    row.children?.forEach(item => item.isCommon = val);
  }
};

/**
 * 图元管理表配置
 */
const treeConfig: EnhancedTableProps['tree'] = reactive({
  childrenKey: 'children',
  indent: 25,
  treeNodeColumnIndex: 1,
  checkStrictly: true,
  expandTreeNodeOnClick: false,
});

/**
 * 自定义树形结构展开图标
 * @param h node
 * @param type 触发动作
 * @param row 数据
 */
const treeExpandAndFoldIconRender: EnhancedTableProps['treeExpandAndFoldIcon'] = (h, {type, row}) => {
  console.log('树展开和折叠图标渲染:', row);
  return type === 'expand' ? h(ChevronRightIcon) : h(ChevronDownIcon);
};

/**
 * 拖拽排序前触发事件
 * @param params 事件
 */
const beforeDragSort: EnhancedTableProps['beforeDragSort'] = (params: DragSortContext<any>) => {
  console.log('拖拽排序前触发:', params);
  // 应用于需要阻止拖拽排序的场景。如：当子节点存在时，则不允许调整顺序。
  // 返回值为 true，允许拖拽排序；返回值 为 false，则阻止拖拽排序
  return true;
};

/**
 * 拖拽排序时触发事件
 * @param params 数据
 */
const onDragSort: EnhancedTableProps['onDragSort'] = (params: DragSortContext<any>) => {
  console.log('拖拽排序时触发:', params);
};

/**
 * 注册事件
 */
const emit = defineEmits(['close']);

/**
 * 关闭
 */
const onCancel = () => {
  emit('close');
};

</script>

<style scoped lang="less">

img {
  max-width: 28px;
  max-height: 28px;
  margin: 4px;
}

.l-icon {
  width: 2em;
  height: 2em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>