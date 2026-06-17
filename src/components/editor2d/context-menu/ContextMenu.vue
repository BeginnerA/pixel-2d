<template>
  <teleport to="body">
    <div
      v-if="visible"
      class="context-menu-overlay"
      @click="handleOverlayClick"
      @contextmenu.prevent="handleOverlayClick"
    >
      <div
        class="context-menu"
        :style="menuStyle"
        @click.stop
        @contextmenu.prevent
      >
        <template v-for="item in filteredItems" :key="item.key">
          <!-- 分隔线 -->
          <div v-if="isSeparator(item)" class="context-menu__separator"></div>
          <!-- 有子菜单 -->
          <div
            v-else-if="item.children && item.children.length"
            class="context-menu__item context-menu__item--submenu"
            :class="{ 'context-menu__item--disabled': item.disabled }"
            @mouseenter="handleSubmenuEnter(item, $event)"
            @mouseleave="handleSubmenuLeave"
          >
            <div class="context-menu__item-content">
              <t-icon v-if="item.icon" :name="item.icon" class="context-menu__icon" />
              <span class="context-menu__label">{{ item.label }}</span>
              <t-icon name="chevron-right" class="context-menu__arrow" />
            </div>
            <!-- 子菜单 -->
            <div
              v-if="activeSubmenu === item.key"
              class="context-menu context-menu--sub"
              :style="submenuStyle"
            >
              <template v-for="child in item.children" :key="child.key">
                <div
                  v-if="!isSeparator(child)"
                  class="context-menu__item"
                  :class="{ 'context-menu__item--disabled': child.disabled }"
                  @click="handleItemClick(child)"
                >
                  <div class="context-menu__item-content">
                    <t-icon v-if="child.icon" :name="child.icon" class="context-menu__icon" />
                    <span class="context-menu__label">{{ child.label }}</span>
                    <span v-if="child.shortcut" class="context-menu__shortcut">{{ child.shortcut }}</span>
                  </div>
                </div>
                <div v-else class="context-menu__separator"></div>
              </template>
            </div>
          </div>
          <!-- 普通菜单项 -->
          <div
            v-else
            class="context-menu__item"
            :class="{ 'context-menu__item--disabled': item.disabled }"
            @click="handleItemClick(item)"
          >
            <div class="context-menu__item-content">
              <t-icon v-if="item.icon" :name="item.icon" class="context-menu__icon" />
              <span class="context-menu__label">{{ item.label }}</span>
              <span v-if="item.shortcut" class="context-menu__shortcut">{{ item.shortcut }}</span>
            </div>
          </div>
        </template>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onBeforeUnmount } from 'vue'
import { ContextMenuItem, isSeparator } from './context-menu-config'

const props = defineProps<{
  /** 是否显示 */
  visible: boolean
  /** 菜单项列表 */
  items: ContextMenuItem[]
  /** 菜单位置 x */
  x: number
  /** 菜单位置 y */
  y: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', item: ContextMenuItem): void
}>()

/** 当前激活的子菜单key */
const activeSubmenu = ref<string | null>(null)
/** 子菜单位置 */
const submenuPosition = ref({ x: 0, y: 0 })

/** 过滤不可见的菜单项 */
const filteredItems = computed(() => {
  return props.items.filter((item) => item.visible !== false)
})

/** 主菜单样式 */
const menuStyle = computed(() => {
  return {
    left: `${props.x}px`,
    top: `${props.y}px`,
  }
})

/** 子菜单样式 */
const submenuStyle = computed(() => {
  return {
    left: `${submenuPosition.value.x}px`,
    top: `${submenuPosition.value.y}px`,
  }
})

/**
 * 处理菜单项点击
 */
function handleItemClick(item: ContextMenuItem) {
  if (item.disabled) return
  if (item.action) {
    item.action()
  }
  emit('select', item)
  emit('close')
}

/**
 * 处理遮罩层点击
 */
function handleOverlayClick() {
  emit('close')
}

/**
 * 处理子菜单进入
 */
function handleSubmenuEnter(item: ContextMenuItem, event: MouseEvent) {
  if (item.disabled) return
  activeSubmenu.value = item.key
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  submenuPosition.value = {
    x: rect.right,
    y: rect.top,
  }
}

/**
 * 处理子菜单离开
 */
function handleSubmenuLeave() {
  activeSubmenu.value = null
}

/**
 * 监听 ESC 键关闭菜单
 */
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.visible) {
    emit('close')
  }
}

// 挂载时注册键盘事件
document.addEventListener('keydown', handleKeydown)

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped lang="less">
.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
}

.context-menu {
  position: fixed;
  min-width: 180px;
  max-width: 300px;
  padding: 4px 0;
  background: var(--td-bg-color-container, #fff);
  border: 1px solid var(--td-border-level-2-color, #e7e7e7);
  border-radius: var(--td-radius-medium, 6px);
  box-shadow: 0 4px 14px 0 rgba(0, 0, 0, 0.1);
  z-index: 10000;
  user-select: none;

  &--sub {
    z-index: 10001;
  }
}

.context-menu__separator {
  height: 1px;
  margin: 4px 8px;
  background: var(--td-border-level-1-color, #e7e7e7);
}

.context-menu__item {
  position: relative;
  padding: 0 12px;
  height: 32px;
  line-height: 32px;
  cursor: pointer;
  transition: background-color 0.15s;
  font-size: 14px;
  color: var(--td-text-color-primary, rgba(0, 0, 0, 0.9));

  &:hover:not(.context-menu__item--disabled) {
    background: var(--td-bg-color-container-hover, #f3f3f3);
  }

  &--disabled {
    color: var(--td-text-color-disabled, rgba(0, 0, 0, 0.26));
    cursor: not-allowed;
  }

  &--submenu {
    .context-menu__arrow {
      margin-left: auto;
      font-size: 12px;
      color: var(--td-text-color-secondary, rgba(0, 0, 0, 0.6));
    }
  }
}

.context-menu__item-content {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 100%;
}

.context-menu__icon {
  flex-shrink: 0;
  font-size: 16px;
  color: var(--td-text-color-secondary, rgba(0, 0, 0, 0.6));
}

.context-menu__label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.context-menu__shortcut {
  flex-shrink: 0;
  margin-left: auto;
  font-size: 12px;
  color: var(--td-text-color-placeholder, rgba(0, 0, 0, 0.35));
}
</style>
