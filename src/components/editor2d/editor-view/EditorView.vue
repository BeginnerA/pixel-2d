<template>
  <div class="editor2d-editor-view" @contextmenu.prevent="handleContextMenu">
    <!-- 编辑器画布 -->
    <div id="meta2d"></div>
    <!-- 右键菜单 -->
    <context-menu
      :visible="contextMenuVisible"
      :items="contextMenuItems"
      :x="contextMenuPosition.x"
      :y="contextMenuPosition.y"
      @close="closeContextMenu"
      @select="handleMenuSelect"
    />
  </div>
</template>
<script setup lang="ts">
import { inject, onMounted, onBeforeUnmount, ref, Ref } from 'vue'
import { Editor2DCanvas } from '../core/editor2d'
import { Editor2DCache } from '../core/editor2d-local-storage'
import { globalEditor2DProps } from '../core/editor2d-global-data'
import { EditorCore, EditorEvents } from '@/core'
import { ContextMenu, getContextMenuItem } from '../context-menu'
import type { ContextMenuItem, ContextMenuTarget } from '../context-menu'

// 注入编辑器实例
const editor = inject<Ref<EditorCore | null>>('editorCore')
// 注入编辑器就绪回调
const onEditorReady = inject<(editorCore: EditorCore) => void>('onEditorReady')

/**
 * 加载本地数据
 */
function loadLocalData() {
  // 读取本地存储
  let data: any = new Editor2DCache().getCanvas()
  if (data) {
    // 判断是否为运行查看，是-设置为预览模式
    if (data.locked !== 0) {
      data.locked = 0
    }
    // 通过EditorCore获取meta2d实例
    if (editor?.value) {
      const meta2d = editor.value.getContext().meta2d
      if (meta2d) {
        meta2d.open(data, true)
      }
    }
  } else {
    new Editor2DCanvas().setCanvasStatus(0)
  }
}

/**
 * 初始化编辑器
 */
async function initEditor() {
  try {
    if (!editor?.value) {
      console.warn('[EditorView] 编辑器实例未找到')
      return
    }

    // 如果编辑器已初始化，直接加载数据
    if (editor.value.getContext().initialized) {
      console.log('[EditorView] 编辑器已初始化，加载本地数据')
      loadLocalData()
      return
    }

    // 使用新架构初始化编辑器
    await editor.value.init({
      container: 'meta2d',
      ...globalEditor2DProps
    })

    // 通知父组件编辑器已就绪
    if (onEditorReady) {
      onEditorReady(editor.value)
    }

    // 订阅编辑器事件
    setupEventListeners()

    // 加载本地数据
    loadLocalData()

    console.log('[EditorView] 编辑器初始化完成')
  } catch (error) {
    console.error('[EditorView] 初始化失败:', error)
  }
}

/**
 * 设置事件监听器
 */
function setupEventListeners() {
  if (!editor?.value) return

  const eventBus = editor.value.getEventBus()

  // 监听数据变更事件
  eventBus.on(EditorEvents.DATA_CHANGED, () => {
    console.log('[EditorView] 接收到数据变更事件')
  })

  // 监听选择变更事件
  eventBus.on(EditorEvents.SELECTION_CHANGED, (pens: any[]) => {
    console.log('[EditorView] 选中项变更:', pens.length)
  })
}

/**
 * 右键菜单状态
 */
const contextMenuVisible = ref(false)
const contextMenuItems = ref<ContextMenuItem[]>([])
const contextMenuPosition = ref({ x: 0, y: 0 })

/**
 * 处理右键菜单事件
 */
function handleContextMenu(event: MouseEvent) {
  event.preventDefault()

  if (!editor?.value) return
  const meta2d = editor.value.getContext().meta2d
  if (!meta2d) return

  // 获取当前选中状态
  const activePens: any[] = meta2d.store.active || []

  let target: ContextMenuTarget = 'canvas'
  let pen: any = undefined

  if (activePens.length === 1) {
    target = 'single'
    pen = activePens[0]
  } else if (activePens.length > 1) {
    target = 'multi'
  }

  // 获取菜单项
  contextMenuItems.value = getContextMenuItem(target, meta2d, pen)

  // 计算菜单位置，确保不超出视口
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  let x = event.clientX
  let y = event.clientY

  // 预估菜单尺寸，避免超出视口
  const menuWidth = 200
  const menuHeight = contextMenuItems.value.length * 32
  if (x + menuWidth > viewportWidth) {
    x = viewportWidth - menuWidth - 4
  }
  if (y + menuHeight > viewportHeight) {
    y = viewportHeight - menuHeight - 4
  }

  contextMenuPosition.value = { x, y }
  contextMenuVisible.value = true
}

/**
 * 关闭右键菜单
 */
function closeContextMenu() {
  contextMenuVisible.value = false
}

/**
 * 处理菜单项选择
 */
function handleMenuSelect(_item: ContextMenuItem) {
  closeContextMenu()
}

onMounted(async () => {
  await initEditor()
})

onBeforeUnmount(() => {
  contextMenuVisible.value = false
})
</script>

<style scoped lang="less">
.editor2d-editor-view {
  width: 100%;
  height: 100%;
  position: relative;
}

#meta2d {
  width: 100%;
  height: calc(100vh - var(--header-height, 60px)); /* 使用 CSS 变量 */
  position: absolute !important;
  touch-action: none;
  overflow: hidden;
}
</style>
