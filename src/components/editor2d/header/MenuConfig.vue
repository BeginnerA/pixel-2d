<template>
  <div class="menu-config-panel">
    <!-- 区域切换 -->
    <t-tabs v-model="activeZone" size="small">
      <t-tab-panel value="app">
        <template #label>
          <t-icon name="view-list" />
          <span>应用菜单</span>
        </template>
      </t-tab-panel>
      <t-tab-panel value="editor">
        <template #label>
          <t-icon name="edit" />
          <span>画布工具栏</span>
        </template>
      </t-tab-panel>
      <t-tab-panel value="extend">
        <template #label>
          <t-icon name="extension" />
          <span>扩展菜单</span>
        </template>
      </t-tab-panel>
    </t-tabs>

    <!-- 说明提示 + 重置 -->
    <div class="config-toolbar">
      <t-alert theme="info" message="拖拽行可调整菜单顺序，勾选/取消勾选可控制菜单显示/隐藏。" class="config-alert" />
      <t-button theme="default" variant="text" size="small" @click="onReset">
        <template #icon><t-icon name="refresh" /></template>
        重置默认
      </t-button>
    </div>

    <!-- 菜单列表 -->
    <div class="menu-list-container">
      <div class="menu-list-header">
        <span class="col-drag"></span>
        <span class="col-check">显示</span>
        <span class="col-icon">图标</span>
        <span class="col-title">菜单名称</span>
        <span class="col-shortcut">快捷键</span>
        <span class="col-group">分组</span>
      </div>
      <transition-group name="list-move" tag="div">
        <div
          v-for="(item, index) in currentMenuList"
          :key="String(item.key)"
          class="menu-list-item"
          :class="{ 'item-hidden': !getItemVisible(item), 'drag-over': dragOverIndex === index }"
          draggable="true"
          @dragstart="onDragStart(index, $event)"
          @dragover.prevent="onDragOver(index, $event)"
          @dragleave="onDragLeave"
          @drop="onDrop(index)"
          @dragend="onDragEndNative"
        >
          <span class="col-drag drag-handle">
            <t-icon name="move" />
          </span>
          <span class="col-check">
            <t-checkbox
              :checked="getItemVisible(item)"
              @change="(val: boolean) => toggleItem(item, val)"
            />
          </span>
          <span class="col-icon">
            <template v-if="item.icon">
              <div
                v-if="item.icon.indexOf('iconfont') !== -1"
                :class="item.icon"
                style="font-size: 14px"
              ></div>
              <svg
                v-else-if="item.icon.startsWith('l-')"
                class="l-icon-sm"
                aria-hidden="true"
              >
                <use :xlink:href="'#' + item.icon"></use>
              </svg>
              <t-icon v-else :name="item.icon" />
            </template>
            <span v-else class="no-icon">—</span>
          </span>
          <span class="col-title">
            <span :class="{ 'text-disabled': !getItemVisible(item) }">
              {{ typeof item.title === 'string' ? item.title : '(自定义)' }}
            </span>
            <span v-if="item.children?.length" class="sub-count">
              {{ item.children.length }} 项
            </span>
          </span>
          <span class="col-shortcut">
            <t-tag v-if="item.shortcut" size="small" variant="outline" class="shortcut-tag">
              {{ item.shortcut }}
            </t-tag>
          </span>
          <span class="col-group">
            <t-tag v-if="item.group" size="small" theme="primary" variant="light">
              {{ getGroupLabel(item.group) }}
            </t-tag>
          </span>
        </div>
      </transition-group>

      <t-empty v-if="currentMenuList.length === 0" description="暂无菜单项" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import { MenuRegistry } from './menu-registry'
import type { MenuZone } from './menu-registry'
import type { Editor2DPropsMenu } from '../core/editor2d-global-type'

// ─── Emits ────────────────────────────────────────────────────────────────────

const emit = defineEmits<{
  confirm: []
}>()

// ─── 状态 ─────────────────────────────────────────────────────────────────────

const activeZone = ref<MenuZone>('app')

/** 当前区域正在编辑的菜单列表（副本） */
const currentMenuList = ref<Array<Editor2DPropsMenu>>([])

/** 本次编辑的可见性变更（key -> boolean） */
const pendingVisibility = ref<Record<string, boolean>>({})

/** 本次编辑的排序变更（key -> order） */
const pendingOrder = ref<Record<string, number>>({})

/** 拖拽状态 */
const dragSrcIndex = ref<number>(-1)
const dragOverIndex = ref<number>(-1)

// ─── 监听区域切换，重新加载菜单 ───────────────────────────────────────────────

watch(
  activeZone,
  (zone) => {
    loadMenuList(zone)
  },
  { immediate: true }
)

function loadMenuList(zone: MenuZone) {
  // 获取所有菜单（包含隐藏项），深拷贝避免直接修改
  const all = MenuRegistry.getAllMenus(zone)
  currentMenuList.value = all.map((item) => ({ ...item }))
  pendingVisibility.value = {}
  pendingOrder.value = {}
}

// ─── 分组标签映射 ─────────────────────────────────────────────────────────────

function getGroupLabel(groupKey: string): string {
  const groups = MenuRegistry.getGroups(activeZone.value)
  const found = groups.find((g) => g.key === groupKey)
  return found?.label ?? groupKey
}

// ─── 可见性操作 ───────────────────────────────────────────────────────────────

function getItemVisible(item: Editor2DPropsMenu): boolean {
  const k = String(item.key ?? '')
  if (k in pendingVisibility.value) {
    return pendingVisibility.value[k]
  }
  return MenuRegistry.isVisible(item)
}

function toggleItem(item: Editor2DPropsMenu, val: boolean) {
  const k = String(item.key ?? '')
  pendingVisibility.value[k] = val
}

// ─── 拖拽排序（原生 HTML5 拖拽） ──────────────────────────────────────────────

function onDragStart(index: number, e: DragEvent) {
  dragSrcIndex.value = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
  }
}

function onDragOver(index: number, e: DragEvent) {
  if (dragSrcIndex.value !== index) {
    dragOverIndex.value = index
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move'
    }
  }
}

function onDragLeave() {
  dragOverIndex.value = -1
}

function onDrop(targetIndex: number) {
  const src = dragSrcIndex.value
  if (src === -1 || src === targetIndex) return
  const list = currentMenuList.value
  const [moved] = list.splice(src, 1)
  list.splice(targetIndex, 0, moved)
  dragSrcIndex.value = -1
  dragOverIndex.value = -1
  // 记录排序变更
  list.forEach((item, idx) => {
    const k = String(item.key ?? '')
    if (k) {
      pendingOrder.value[k] = idx * 10
    }
  })
}

function onDragEndNative() {
  dragSrcIndex.value = -1
  dragOverIndex.value = -1
}

// ─── 操作按钮 ─────────────────────────────────────────────────────────────────

function save() {
  // 提交可见性变更
  if (Object.keys(pendingVisibility.value).length > 0) {
    MenuRegistry.batchSetVisibility(pendingVisibility.value)
  }
  // 提交排序变更
  if (Object.keys(pendingOrder.value).length > 0) {
    MenuRegistry.batchSetOrder(pendingOrder.value)
  }
  MessagePlugin.success('菜单配置已保存')
  emit('confirm')
}

defineExpose({ save })

function onReset() {
  const confirmInstance = DialogPlugin.confirm({
    header: '重置菜单配置',
    body: '确定要将菜单恢复为默认配置吗？此操作将清除所有自定义排序和显示设置。',
    confirmBtn: { content: '确认重置', theme: 'danger' },
    cancelBtn: '取消',
    onConfirm: () => {
      MenuRegistry.resetToDefault()
      loadMenuList(activeZone.value)
      MessagePlugin.success('已重置为默认配置')
      confirmInstance.destroy()
    },
    onClose: () => {
      confirmInstance.destroy()
    },
  })
}
</script>

<style scoped lang="less">
.menu-config-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-alert {
  margin: 0;
  flex: 1;
}

.config-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

// ── 列表 ──────────────────────────────────────────────────────────────────────

.menu-list-container {
  border: 1px solid var(--td-border-level-2-color);
  border-radius: var(--td-radius-medium);
  overflow: hidden;
}

.menu-list-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: var(--td-bg-color-secondarycontainer);
  border-bottom: 1px solid var(--td-border-level-2-color);
  font-size: 12px;
  color: var(--td-text-color-secondary);
  font-weight: 500;
  gap: 0;
}

.menu-list-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid var(--td-border-level-2-color);
  transition: background 0.15s;
  gap: 0;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--td-bg-color-container-hover);
  }

  &.item-hidden {
    opacity: 0.45;
  }
}

// ── 列宽定义 ───────────────────────────────────────────────────────────────────

.col-drag {
  width: 28px;
  flex-shrink: 0;
}

.col-check {
  width: 48px;
  flex-shrink: 0;
}

.col-icon {
  width: 36px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.col-title {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.col-shortcut {
  width: 100px;
  flex-shrink: 0;
}

.col-group {
  width: 80px;
  flex-shrink: 0;
}

// ── 拖拽 ──────────────────────────────────────────────────────────────────────

.drag-handle {
  cursor: grab;
  color: var(--td-text-color-placeholder);
  display: flex;
  align-items: center;

  &:active {
    cursor: grabbing;
  }
}

.drag-over {
  background: var(--td-brand-color-light) !important;
  border-top: 2px solid var(--td-brand-color);
}

.list-move-move {
  transition: transform 0.2s ease;
}

// ── 文字 ──────────────────────────────────────────────────────────────────────

.text-disabled {
  color: var(--td-text-color-disabled);
  text-decoration: line-through;
}

.sub-count {
  font-size: 11px;
  color: var(--td-text-color-placeholder);
  background: var(--td-bg-color-secondarycontainer);
  padding: 0 5px;
  border-radius: 8px;
}

.shortcut-tag {
  font-family: monospace;
  font-size: 11px;
}

.no-icon {
  color: var(--td-text-color-placeholder);
  font-size: 12px;
}

.l-icon-sm {
  width: 1.2em;
  height: 1.2em;
  vertical-align: middle;
  fill: currentColor;
  overflow: hidden;
}


</style>
