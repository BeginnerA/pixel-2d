<template>
  <div class="editor2d-graphics">
    <!-- 图形库 -->
    <t-menu v-model:expanded="activeMenuKeys" :default-value="menuConfig.key" :collapsed="false">
      <div class="graphics-search">
        <t-input v-model="keyword" size="medium" placeholder="搜索图元" @change="filterComponent">
          <template #suffixIcon>
            <search-icon :style="{ cursor: 'pointer' }" />
          </template>
        </t-input>
      </div>
      <div class="graphics-tabs">
        <t-tabs
          :drag-sort="tabsConfig.dragSort"
          :value="activeTabsKey"
          @drag-sort="onGraphicsTabDragend"
          @change="onGraphicsTabChange"
        >
          <t-tab-panel
            v-for="panel in panelTabs"
            :key="panel.key"
            :value="panel.key"
            :label="panel.label"
            :draggable="panel.draggable"
          >
            <div class="graphics-list">
              <template v-if="activeTabsKey === 'drawing_manage'">
                <p>图纸开发中</p>
              </template>
              <template v-if="activeTabsKey === 'sys_component'" v-for="(menu, index) in graphicGroupsList">
                <t-submenu
                  :value="menu.key ? menu.key : index"
                  v-if="menu.show !== undefined ? menu.show : true"
                  :disabled="menu.disabled !== undefined ? !menu.disabled : false"
                >
                  <template v-if="displayMenuIcon" #icon>
                    <t-icon :name="activeMenuKeys.includes(menu.key as string) ? 'folder-open-1' : 'folder-open'" />
                  </template>
                  <template v-if="isDisplayTitle(displayMenuTitle, menu.title, menu.icon)" #title>
                    <div v-if="menu.disabled === undefined || menu.disabled">
                      <span class="group-title">
                        {{ menu.title }}
                      </span>
                      <span class="group-total">
                        {{ '(' + menu.children?.length + ')' }}
                      </span>
                    </div>
                    <div v-else>{{ menu.title }}({{ menuConfig.disabledTips }})</div>
                  </template>
                  <template class="graphics-icon">
                    <div v-for="(item, index) in menu.children">
                      <div
                        class="graphics-icon-icon-item"
                        v-if="item.show !== undefined ? item.show : true"
                        :draggable="item.disabled !== undefined ? item.disabled : true"
                        :key="item.key ? item.key : index"
                        :title="
                          item.disabled === undefined || item.disabled
                            ? (item.title as string)
                            : item.title + (menuConfig.disabledTips || '')
                        "
                        @dragstart="dragStart(item, $event)"
                        @click.prevent="dragStart(item, $event)"
                      >
                        <template v-if="item.data && (item.data as any)['image']">
                          <img :src="(item.data as any)['image']" alt="" :title="(item.data as any)['label']" />
                        </template>
                        <template v-else-if="item.data && (item.data as any)['video']">
                          <icon-font :name="item.icon" size="2em" />
                        </template>
                        <template v-else-if="item.data && (item.data as any)['item.data.svg']">
                          <div v-html="(item.data as any)['item.data.svg']"></div>
                        </template>
                        <template v-else-if="item.icon && item.icon.indexOf('iconfont') !== -1">
                          <div :class="item.icon"></div>
                        </template>
                        <template v-else>
                          <svg class="l-icon" aria-hidden="true">
                            <use :xlink:href="'#' + item.icon"></use>
                          </svg>
                        </template>
                      </div>
                    </div>
                  </template>
                </t-submenu>
              </template>
              <template v-if="activeTabsKey === 'my_component'">
                <p>我的组件开发中</p>
              </template>
            </div>
          </t-tab-panel>
        </t-tabs>
      </div>
      <div class="graphics-manage">
        <t-button @click="openGraphicsManage">
          <template #icon>
            <grid-view-icon />
          </template>
          管理图元
        </t-button>
        <graphics-more-modal
          :visible="graphicsMoreVisible"
          :model-value="graphicGroupsList"
          @close="openGraphicsManage"
        />
      </div>
    </t-menu>
  </div>
</template>
<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import { isDisplayTitle } from '../core/editor2d-communal'
import { GRAPHICS_CONFIG as graphicsConfig, GRAPHICS_TABS_CONFIG as graphicsTabsConfig } from '../graphics/graphics'
import { MenuValue, TabsProps } from 'tdesign-vue-next'
import { ExtendGraphic } from '../core/editor2d-graphics.ts'
import { GridViewIcon, IconFont, SearchIcon } from 'tdesign-icons-vue-next'
import GraphicsMoreModal from '../graphics/graphics-more-modal.vue'
import { Editor2DConfig, PropsTab, PropsTabsConfig } from '../core/editor2d-global-type'

// 注入编辑器实例
const editor = inject<any>('editorCore')

// 使用计算属性确保响应式
const editorCore = computed(() => editor?.value)

// 图元组件分类配置
let tabsConfig = ref<PropsTabsConfig>(graphicsTabsConfig).value
// 图元组件分类数据
let panelTabs = ref<Array<PropsTab>>(tabsConfig.tabs ?? [])
// 激活图元分类
let activeTabsKey = ref(tabsConfig.activeKey)
// 图元菜单配置
let menuConfig = ref<Editor2DConfig>(graphicsConfig).value
// 显示菜单图标
let displayMenuIcon = menuConfig.displayMenuIcon ?? true
// 显示菜单标题
let displayMenuTitle = menuConfig.displayMenuTitle ?? true
// 源图元菜单数据
let originalGraphicGroups = new ExtendGraphic().getGraphic()
// 图元菜单数据（搜索）
let graphicGroupsList = ref(originalGraphicGroups)
// 激活图元菜单
let activeMenuKeys = ref<Array<MenuValue>>([])
// 搜索关键字
let keyword = ref('')
// 显示管理图元
let graphicsMoreVisible = ref<boolean>(false)

// 获取meta2d实例的辅助函数
function getMeta2d() {
  return editorCore.value?.getContext()?.meta2d
}

/**
 * 拖拽事件
 * @param elem 拖动元素
 * @param e 鼠标事件
 */
const dragStart = (elem: any, e: any) => {
  if (!elem) {
    return
  }
  e.stopPropagation()

  // 使用EditorCore处理拖拽
  if (editorCore.value) {
    // 通过事件系统处理
    console.log('[Graphics] 使用EditorCore处理拖拽:', elem.data.name)
    const eventBus = editorCore.value.getEventBus()
    eventBus.emitSync('graphics:drag-start', {
      element: elem,
      data: elem.data,
      event: e
    })
  }

  // 拖拽事件
  if (e instanceof DragEvent) {
    // 设置拖拽数据
    e.dataTransfer?.setData('Meta2d', JSON.stringify(elem.data))
  } else {
    // 支持单击添加图元。平板模式
    const meta2d = getMeta2d()
    if (meta2d) {
      meta2d.canvas.addCaches = [elem.data]
    }
  }
}

/**
 * 过滤组件
 */
function filterComponent() {
  if (activeTabsKey.value == 'sys_component') {
    filterGraphicGroups()
  }
}

/**
 * 筛选过滤组件
 */
function filterGraphicGroups() {
  let searchContent = keyword.value
  if (searchContent) {
    let list = originalGraphicGroups ?? []
    let array: any = []
    for (let i = 0; i < list.length; i++) {
      if ((list[i].title as string).indexOf(searchContent) !== -1) {
        array.push({
          ...list[i],
        })
      }
      const foundInList = list[i].children?.filter((item: any) => {
        let { title } = item
        if (title.indexOf('http') !== -1) {
          const decodedStr = decodeURIComponent(title)
          if (decodedStr.indexOf(searchContent) !== -1) {
            return item
          }
        } else {
          if (title.indexOf(searchContent) !== -1) {
            return item
          }
        }
      })
      if (foundInList?.length !== 0) {
        array.push({
          ...list[i],
          children: [...(foundInList || [])],
        })
      }
    }
    graphicGroupsList.value = array
  } else {
    graphicGroupsList.value = originalGraphicGroups
  }
}

/**
 * 2D编辑器图形库菜单选项卡拖拽事件
 * @param currentIndex 当前索引
 * @param targetIndex 目标索引
 */
const onGraphicsTabDragend: TabsProps['onDragSort'] = ({ currentIndex, targetIndex }) => {
  ;[panelTabs.value[currentIndex], panelTabs.value[targetIndex]] = [
    panelTabs.value[targetIndex],
    panelTabs.value[currentIndex],
  ]
}

/**
 * 2D编辑器图形库菜单选项卡选中事件
 * @param activeTabs 激活卡片
 */
const onGraphicsTabChange: TabsProps['onChange'] = (activeTabs: string | number) => (activeTabsKey.value = activeTabs)

/**
 * 打开管理图元页面
 */
function openGraphicsManage() {
  graphicsMoreVisible.value = !graphicsMoreVisible.value
}
</script>

<style scoped lang="less">
.editor2d-graphics {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.graphics-search {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 10px;
}

.graphics-tabs {
  :deep(.t-tabs__nav-item-wrapper) {
    padding: 0 var(--td-comp-paddingLR-xs);
    margin-left: var(--td-comp-margin-xs);
    margin-right: var(--td-comp-margin-xs);
  }
}

.graphics-list {
  height: calc(100vh - 210px);
  overflow-y: auto;
  overflow-x: hidden;

  .group-title {
    display: inline-block;
    vertical-align: top;
    max-width: 110px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.graphics-icon {
  display: flex;
  justify-content: flex-start;
  overflow: auto;
  flex-wrap: wrap;
  align-content: center;
  padding: 5px;
}

.graphics-icon-icon-item {
  padding: 7px;
  cursor: pointer;

  img {
    width: 100%;
    max-width: 28px;
    max-height: 28px;
    margin: 4px;
  }
}

.graphics-manage {
  border-top: 1px solid #e5e5e5;
  display: flex;
  padding: 10px 0;
  justify-content: center;
  align-items: center;
}

.l-icon {
  width: 2em;
  height: 2em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
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
