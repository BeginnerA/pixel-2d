<template>
  <div class="editor2d-props">
    <!-- 属性面板 -->
    <div class="props-tabs">
      <t-tabs :drag-sort="tabsConfig.dragSort" :value="activeTabsKey"
              @drag-sort="onGraphicsTabDragend"
              @change="onGraphicsTabChange">
        <t-tab-panel
            v-for="panel in panelTabs"
            :key="panel.key"
            :value="panel.key"
            :label="panel.label"
            :draggable="panel.draggable"
        >
          <div class="props-list">
            <template v-if="activeTabsKey === 'map_drawing_config'">
              <map-drawing-config/>
            </template>
            <template v-if="activeTabsKey === 'map_comm_config'">
              <map-comm-config/>
            </template>

            <template v-if="activeTabsKey === 'pen_appearance_config'">
              <pen-appearance-config :model-value="editorPen"/>
            </template>
            <template v-if="activeTabsKey === 'pen_event_config'">
              <pen-event-config :model-value="editorPen"/>
            </template>
            <template v-if="activeTabsKey === 'pen_effect_config'">
              <pen-effect-config :model-value="editorPen"/>
            </template>
            <template v-if="activeTabsKey === 'pen_data_config'">
              <pen-data-config :model-value="editorPen"/>
            </template>

            <template v-if="activeTabsKey === 'pen_multi_appearance_config'">
              <pen-multi-appearance-config :model-value="activePens"/>
            </template>

            <template v-if="activeTabsKey === 'map_layout_config'">
              <map-layout-config/>
            </template>
            <template v-if="activeTabsKey === 'map_structure_config'">
              <map-structure-config :model-value="editorPen" @change="changeActive"/>
            </template>
          </div>
        </t-tab-panel>
      </t-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref} from "vue";
import {TabsProps} from "tdesign-vue-next";
import MapDrawingConfig from "../props/map-props/map-drawing-config.vue";
import MapLayoutConfig from "../props/map-props/map-layout-config.vue";
import MapCommConfig from "../props/map-props/map-comm-config.vue";
import MapStructureConfig from "../props/map-props/map-structure-config.vue";
import PenAppearanceConfig from "../props/pen-props/pen-appearance-config.vue";
import PenEventConfig from "../props/pen-props/pen-event-config.vue";
import PenEffectConfig from "../props/pen-props/pen-effect-config.vue";
import PenDataConfig from "../props/pen-props/pen-data-config.vue";
import PenMultiAppearanceConfig from "../props/pen-multi-props/pen-multi-appearance-config.vue";
import {Editor2DCache} from "../core/editor2d-local-storage";
import {globalEditor2DPen} from "../core/editor2d-global-data";
import {PROPS_TABS_CONFIG as propsTabsConfig,} from "../props/props"
import {Editor2DPen, PropsTab, PropsTabsConfig} from "../core/editor2d-global-type";

/**
 * 防抖函数 - 限制高频操作
 * @param func 要执行的函数
 * @param delay 延迟时间(毫秒)
 */
function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };
}

// 创建防抖的保存函数(延迟 500ms)
const debouncedSaveCanvas = debounce(() => {
  new Editor2DCache().saveCanvas();
}, 500);


// 图元组件分类配置
let tabsConfig = ref<PropsTabsConfig>(propsTabsConfig).value;
// 图元组件分类数据
let panelTabs = ref<Array<PropsTab>>([]);
// 激活图元分类
let recentActiveTabsKey = tabsConfig.activeKey;
let activeTabsKey = ref(tabsConfig.activeKey);
// 图元选中状态
let activePenStatus = ref(false);
let multiPenStatus = ref(false);
// 选中图元
let activePens = reactive([]);
// 编辑中的图元
let editorPen = reactive<Editor2DPen>(globalEditor2DPen);

/**
 * 改变选中节点
 * @param pen 节点
 */
function changeActive(pen: any) {
  meta2d.active([pen]);
  meta2d.render();
  editorPen = pen;
}

/**
 * 2D编辑器图形库菜单选项卡拖拽事件
 * @param currentIndex 当前索引
 * @param targetIndex 目标索引
 */
const onGraphicsTabDragend: TabsProps['onDragSort'] = ({currentIndex, targetIndex}) => {
  [panelTabs.value[currentIndex], panelTabs.value[targetIndex]] = [
    panelTabs.value[targetIndex],
    panelTabs.value[currentIndex],
  ];
};

/**
 * 2D编辑器图形库菜单选项卡选中事件
 * @param activeTabs 激活卡片
 */
const onGraphicsTabChange: TabsProps['onChange'] = (activeTabs: string | number) => {
  activeTabsKey.value = activeTabs;
  recentActiveTabsKey = activeTabs;
};

/**
 * 得到要显示的配置选项卡片
 * @param keys 要显示的卡片 key
 */
function showTabs(keys: Array<string>) {
  if (keys.includes(recentActiveTabsKey as string)) {
    activeTabsKey.value = recentActiveTabsKey;
  } else {
    activeTabsKey.value = keys[0];
  }
  panelTabs.value = tabsConfig.tabs?.filter(item => keys.includes(item.key as string)) ?? [];
}

/**
 * 初始化
 */
function init() {
  showTabs(['map_drawing_config', 'map_comm_config', 'map_layout_config', 'map_structure_config']);
}

onMounted(() => {
  init();

  // 先注册编辑相关事件(在 active 之前),防止重复注册
  meta2d.on('update', () => {
    meta2d.emit('editPen');
  });
  meta2d.on('resizePens', () => {
    meta2d.emit('editPen');
  });
  meta2d.on('rotatePens', () => {
    meta2d.emit('editPen');
  });
  meta2d.on('valueUpdate', () => {
    meta2d.emit('editPen');
  });
  meta2d.on('editPen', () => {
    debouncedSaveCanvas(); // 使用防抖函数
  });

  // 监听鼠标点击事件
  meta2d.on('active', (pens) => {
    let locked = meta2d.store.data.locked;
    if (locked !== 0) {
      // 当前状态非编辑状态
      return
    }
    if (pens.length >= 1) {
      activePenStatus.value = true;
      activePens = pens;
    }
    multiPenStatus.value = pens.length > 1;

    // 只修改一个
    if (activePenStatus.value) {
      if (multiPenStatus.value) {
        editorPen = activePens[activePens.length - 1];
      } else {
        editorPen = activePens[0];
      }
    }

    if (activePenStatus.value && !multiPenStatus.value) {
      showTabs(['pen_appearance_config', 'pen_event_config', 'pen_effect_config', 'pen_data_config', 'map_structure_config']);
    } else if (multiPenStatus.value) {
      showTabs(['pen_multi_appearance_config', 'map_layout_config', 'map_structure_config']);
    }
  });

  meta2d.on('inactive', () => {
    if (activePenStatus.value) {
      activePenStatus.value = false;
      multiPenStatus.value = false;
      activePens = [];
      editorPen = {};
      init();
    }
  });
});

</script>

<style scoped lang="less">

.editor2d-props {
  width: 265px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.props-tabs {
  :deep(.t-tabs__nav-item-wrapper) {
    padding: 0 var(--td-comp-paddingLR-xs);
    margin-left: var(--td-comp-margin-xxs);
    margin-right: var(--td-comp-margin-xxs);
  }
}

.props-list {
  height: calc(100vh - var(--header-tabs-height, 110px)); /* 使用 CSS 变量 */
  overflow-y: auto;

  :deep(.t-collapse-panel__wrapper .t-collapse-panel__content) {
    padding: var(--td-comp-paddingLR-m);
  }

  :deep(.t-input--auto-width) {
    max-width: 134px;
  }
}

.props-manage {
  border-top: 1px solid #e5e5e5;
  display: flex;
  padding: 10px 0;
  justify-content: center;
  align-items: center;
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