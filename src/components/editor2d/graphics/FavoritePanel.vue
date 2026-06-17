<template>
  <div class="favorite-panel">
    <!-- 顶部标签页 -->
    <div class="favorite-panel__tabs">
      <span
        class="tab-item"
        :class="{ 'tab-item--active': activeTab === 'recent' }"
        @click="activeTab = 'recent'"
      >
        最近使用
      </span>
      <span
        class="tab-item"
        :class="{ 'tab-item--active': activeTab === 'frequent' }"
        @click="activeTab = 'frequent'"
      >
        高频使用
      </span>
      <span
        class="tab-item"
        :class="{ 'tab-item--active': activeTab === 'favorites' }"
        @click="activeTab = 'favorites'"
      >
        我的收藏
        <t-badge v-if="favoritesCount > 0" :count="favoritesCount" size="small" />
      </span>
    </div>

    <!-- 内容区域 -->
    <div class="favorite-panel__body">
      <!-- 空状态 -->
      <div v-if="currentItems.length === 0" class="empty-tip">
        <t-icon name="star" size="32px" style="opacity: 0.3" />
        <p>{{ emptyText }}</p>
      </div>

      <!-- 图元网格 -->
      <div v-else class="graphic-grid">
        <div
          v-for="item in currentItems"
          :key="item.key"
          class="graphic-cell"
          :title="item.title"
          draggable="true"
          @dragstart="onDragStart(item, $event)"
          @click.prevent="onDragStart(item, $event)"
          @contextmenu.prevent="onContextMenu(item, $event)"
        >
          <!-- 图元图标 -->
          <div class="graphic-cell__icon">
            <template v-if="item.data?.image">
              <img :src="item.data.image" alt="" />
            </template>
            <template v-else-if="item.icon && item.icon.indexOf('iconfont') !== -1">
              <div :class="item.icon"></div>
            </template>
            <template v-else-if="item.icon">
              <svg class="l-icon" aria-hidden="true">
                <use :xlink:href="'#' + item.icon"></use>
              </svg>
            </template>
            <template v-else>
              <t-icon name="component" size="20px" />
            </template>
          </div>

          <!-- 收藏星标 -->
          <div
            class="favorite-star"
            :class="{ 'favorite-star--active': isFavorite(item.key) }"
            @click.stop="toggleFavorite(item)"
          >
            <t-icon :name="isFavorite(item.key) ? 'star-filled' : 'star'" size="12px" />
          </div>

          <!-- 标题 -->
          <div class="graphic-cell__label">{{ item.title }}</div>

          <!-- 使用次数（仅最近/高频标签页显示） -->
          <div v-if="activeTab !== 'favorites' && getUsageCount(item.key) > 1" class="usage-count">
            {{ getUsageCount(item.key) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="favorite-panel__footer">
      <t-button size="small" variant="text" @click="clearCurrent">
        <template #icon><t-icon name="delete" /></template>
        清空{{ activeTab === 'favorites' ? '收藏' : '记录' }}
      </t-button>
      <span class="item-count">共 {{ currentItems.length }} 个</span>
    </div>

    <!-- 右键菜单 -->
    <t-popup
      v-if="contextMenu.visible"
      :visible="contextMenu.visible"
      :attach="contextMenu.attachEl"
      trigger="context-menu"
      placement="bottom-left"
      style="position: fixed"
      @visible-change="onPopupVisibleChange"
    >
      <template #content>
        <div class="ctx-menu">
          <div class="ctx-menu__item" @click="onCtxFavorite">
            <t-icon :name="contextMenu.isFav ? 'star-filled' : 'star'" />
            {{ contextMenu.isFav ? '取消收藏' : '添加收藏' }}
          </div>
          <div v-if="activeTab !== 'favorites'" class="ctx-menu__item" @click="onCtxRemoveRecent">
            <t-icon name="delete" />
            从记录中移除
          </div>
        </div>
      </template>
    </t-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue'
import { graphicFavorites, FavoriteItem, RecentItem } from './graphic-favorites'
import { Editor2DPropsMenu } from '../core/editor2d-global-type'

// ─────────────────────────────────────────────
// 注入编辑器
// ─────────────────────────────────────────────
const editor = inject<any>('editorCore')

function getMeta2d() {
  return editor?.value?.getContext()?.meta2d
}

// ─────────────────────────────────────────────
// Tab 状态
// ─────────────────────────────────────────────
const activeTab = ref<'recent' | 'frequent' | 'favorites'>('recent')

// 刷新触发器（修改收藏/记录后强制视图更新）
const refreshTick = ref(0)

function refresh() {
  refreshTick.value++
}

// ─────────────────────────────────────────────
// 数据计算
// ─────────────────────────────────────────────
type DisplayItem = {
  key: string
  title: string
  icon?: string
  data: Record<string, any>
  usageCount?: number
}

function toDisplayItem(item: FavoriteItem | RecentItem): DisplayItem {
  return {
    key: item.key,
    title: item.title,
    icon: item.icon,
    data: item.data,
    usageCount: (item as RecentItem).usageCount,
  }
}

const currentItems = computed<DisplayItem[]>(() => {
  void refreshTick.value // 依赖刷新触发器
  if (activeTab.value === 'recent') {
    return graphicFavorites.getRecentItems(20).map(toDisplayItem)
  } else if (activeTab.value === 'frequent') {
    return graphicFavorites.getFrequentItems(20).map(toDisplayItem)
  } else {
    return graphicFavorites.getFavorites().map(toDisplayItem)
  }
})

const favoritesCount = computed(() => {
  void refreshTick.value
  return graphicFavorites.getFavorites().length
})

const emptyText = computed(() => {
  if (activeTab.value === 'recent') return '暂无最近使用记录'
  if (activeTab.value === 'frequent') return '暂无高频使用记录'
  return '暂无收藏，右键图元可添加收藏'
})

function isFavorite(key: string): boolean {
  void refreshTick.value
  return graphicFavorites.isFavorite(key)
}

function getUsageCount(key: string): number {
  void refreshTick.value
  const items = graphicFavorites.getRecentItems(20)
  return items.find((i) => i.key === key)?.usageCount ?? 0
}

// ─────────────────────────────────────────────
// 拖拽 / 点击添加图元
// ─────────────────────────────────────────────
function buildPropsMenu(item: DisplayItem): Editor2DPropsMenu {
  return {
    key: item.key,
    title: item.title,
    icon: item.icon,
    data: item.data,
  }
}

function onDragStart(item: DisplayItem, e: MouseEvent | DragEvent) {
  e.stopPropagation()

  // 记录使用
  graphicFavorites.recordUsage(buildPropsMenu(item))
  refresh()

  if (e instanceof DragEvent) {
    e.dataTransfer?.setData('Meta2d', JSON.stringify(item.data))
  } else {
    const meta2d = getMeta2d()
    if (meta2d) {
      meta2d.canvas.addCaches = [item.data]
    }
  }

  // 通知事件总线
  const eventBus = editor?.value?.getEventBus()
  if (eventBus) {
    eventBus.emitSync('graphics:drag-start', {
      element: buildPropsMenu(item),
      data: item.data,
      event: e,
    })
  }
}

// ─────────────────────────────────────────────
// 收藏操作
// ─────────────────────────────────────────────
function toggleFavorite(item: DisplayItem) {
  graphicFavorites.toggleFavorite(buildPropsMenu(item))
  refresh()
}

// ─────────────────────────────────────────────
// 清空
// ─────────────────────────────────────────────
function clearCurrent() {
  if (activeTab.value === 'favorites') {
    graphicFavorites.clearFavorites()
  } else {
    graphicFavorites.clearRecent()
  }
  refresh()
}

// ─────────────────────────────────────────────
// 右键菜单
// ─────────────────────────────────────────────
interface ContextMenuState {
  visible: boolean
  item: DisplayItem | null
  isFav: boolean
  attachEl: string | null
  x: number
  y: number
}

const contextMenu = ref<ContextMenuState>({
  visible: false,
  item: null,
  isFav: false,
  attachEl: null,
  x: 0,
  y: 0,
})

function onContextMenu(item: DisplayItem, e: MouseEvent) {
  contextMenu.value = {
    visible: true,
    item,
    isFav: graphicFavorites.isFavorite(item.key),
    attachEl: null,
    x: e.clientX,
    y: e.clientY,
  }
}

function onPopupVisibleChange(visible: boolean) {
  if (!visible) {
    contextMenu.value.visible = false
  }
}

function onCtxFavorite() {
  if (!contextMenu.value.item) return
  graphicFavorites.toggleFavorite(buildPropsMenu(contextMenu.value.item))
  contextMenu.value.visible = false
  refresh()
}

function onCtxRemoveRecent() {
  if (!contextMenu.value.item) return
  graphicFavorites.removeRecent(contextMenu.value.item.key)
  contextMenu.value.visible = false
  refresh()
}
</script>

<style scoped lang="less">
.favorite-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  font-size: 12px;
}

// ─── 标签页 ────────────────────────────────────
.favorite-panel__tabs {
  display: flex;
  border-bottom: 1px solid var(--td-border-level-2-color, #e5e5e5);
  padding: 0 4px;
  flex-shrink: 0;
}

.tab-item {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 4px;
  cursor: pointer;
  color: var(--td-text-color-secondary, #888);
  transition: color 0.2s;

  &:hover {
    color: var(--td-brand-color, #0052d9);
  }

  &--active {
    color: var(--td-brand-color, #0052d9);
    font-weight: 500;

    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 20%;
      right: 20%;
      height: 2px;
      background: var(--td-brand-color, #0052d9);
      border-radius: 1px;
    }
  }
}

// ─── 内容区 ────────────────────────────────────
.favorite-panel__body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 6px 4px;

  &::-webkit-scrollbar {
    width: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--color-scrollbar, #ccc);
    border-radius: 4px;
  }
}

// ─── 空状态 ────────────────────────────────────
.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 8px;
  color: var(--td-text-color-disabled, #bbb);

  p {
    margin-top: 8px;
    font-size: 12px;
    text-align: center;
  }
}

// ─── 图元网格 ──────────────────────────────────
.graphic-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.graphic-cell {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 56px;
  border-radius: 4px;
  cursor: pointer;
  padding: 4px 2px 2px;
  transition: background 0.15s;

  &:hover {
    background: var(--td-bg-color-container-hover, #f0f4ff);
  }

  &:active {
    background: var(--td-bg-color-container-active, #e0eaff);
  }
}

.graphic-cell__icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  img {
    max-width: 28px;
    max-height: 28px;
  }

  .l-icon {
    width: 2em;
    height: 2em;
    fill: currentColor;
    overflow: hidden;
  }
}

.graphic-cell__label {
  width: 100%;
  margin-top: 2px;
  font-size: 11px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--td-text-color-primary, #333);
  line-height: 1.3;
}

// ─── 收藏星标 ──────────────────────────────────
.favorite-star {
  position: absolute;
  top: 2px;
  right: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  opacity: 0;
  color: #bbb;
  transition: opacity 0.15s, color 0.15s;

  .graphic-cell:hover & {
    opacity: 1;
  }

  &--active {
    opacity: 1 !important;
    color: #faad14;
  }

  &:hover {
    color: #faad14;
  }
}

// ─── 使用次数角标 ──────────────────────────────
.usage-count {
  position: absolute;
  top: 2px;
  left: 2px;
  font-size: 10px;
  color: #fff;
  background: var(--td-brand-color, #0052d9);
  border-radius: 8px;
  padding: 0 4px;
  line-height: 16px;
  min-width: 16px;
  text-align: center;
}

// ─── 底部工具栏 ────────────────────────────────
.favorite-panel__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  border-top: 1px solid var(--td-border-level-2-color, #e5e5e5);
  flex-shrink: 0;
}

.item-count {
  font-size: 11px;
  color: var(--td-text-color-secondary, #888);
}

// ─── 右键菜单 ──────────────────────────────────
.ctx-menu {
  min-width: 120px;
  padding: 4px 0;
}

.ctx-menu__item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 13px;
  color: var(--td-text-color-primary, #333);
  transition: background 0.15s;

  &:hover {
    background: var(--td-bg-color-container-hover, #f5f5f5);
  }
}
</style>
