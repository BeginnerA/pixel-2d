<template>
  <t-dialog
    v-model:visible="dialogVisible"
    header="快捷键帮助"
    :width="640"
    :footer="false"
    placement="center"
    class="shortcut-help-dialog"
  >
    <div class="shortcut-help">
      <t-tabs v-model="activeScope" :list="scopeTabs" />
      <div class="shortcut-list">
        <t-table
          :data="filteredShortcuts"
          :columns="columns"
          :bordered="false"
          size="small"
          row-key="id"
          :pagination="false"
          :max-height="400"
        />
      </div>
      <div class="shortcut-tip">
        <t-tag variant="light" size="small">
          Mac 用户请使用 Cmd 替代 Ctrl
        </t-tag>
      </div>
    </div>
  </t-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import type { ShortcutBinding, ShortcutScope } from '@/core/shortcuts/shortcut-types'
import { SCOPE_LABELS } from '@/core/shortcuts/shortcut-types'
import { ShortcutManager } from '@/core/shortcuts/ShortcutManager'
import { defaultShortcuts } from '@/core/shortcuts/default-shortcuts'
import { EditorCore } from '@/core/Editor'

export default defineComponent({
  name: 'ShortcutHelp',
  setup() {
    const dialogVisible = ref(false)
    const activeScope = ref<string>('all')
    const editorCore = ref<EditorCore | null>(null)
    const shortcutManager = ref<ShortcutManager | null>(null)

    // 作用域标签页
    const scopeTabs = computed(() => {
      const tabs = [{ label: '全部', value: 'all' }]
      const scopes: ShortcutScope[] = ['global', 'canvas', 'panel', 'code-editor']
      scopes.forEach((scope) => {
        tabs.push({ label: SCOPE_LABELS[scope], value: scope })
      })
      return tabs
    })

    // 获取所有快捷键
    const allShortcuts = computed<ShortcutBinding[]>(() => {
      if (shortcutManager.value) {
        return shortcutManager.value.getAll()
      }
      return defaultShortcuts
    })

    // 按作用域筛选
    const filteredShortcuts = computed(() => {
      const all = allShortcuts.value
      if (activeScope.value === 'all') {
        return all.map(formatShortcutRow)
      }
      return all
        .filter((s) => (s.scope || 'global') === activeScope.value)
        .map(formatShortcutRow)
    })

    // 格式化快捷键行为表格行
    function formatShortcutRow(binding: ShortcutBinding) {
      return {
        id: binding.id,
        description: binding.description || binding.id,
        keys: formatKeyCombination(binding.keys),
        scope: SCOPE_LABELS[binding.scope || 'global'],
        enabled: binding.enabled !== false,
      }
    }

    // 格式化按键组合为可读字符串
    function formatKeyCombination(keys: {
      ctrl?: boolean
      shift?: boolean
      alt?: boolean
      meta?: boolean
      key: string
    }): string {
      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)
      const parts: string[] = []

      if (keys.ctrl) {
        parts.push(isMac ? '⌘' : 'Ctrl')
      }
      if (keys.shift) {
        parts.push(isMac ? '⇧' : 'Shift')
      }
      if (keys.alt) {
        parts.push(isMac ? '⌥' : 'Alt')
      }
      if (keys.meta && !keys.ctrl) {
        parts.push(isMac ? '⌘' : 'Win')
      }

      // 格式化主键
      let keyName = keys.key
      const keyAliases: Record<string, string> = {
        ' ': 'Space',
        '=': '+',
        '-': '-',
        Delete: 'Del',
        Backspace: '⌫',
        Escape: 'Esc',
      }
      keyName = keyAliases[keyName] || keyName

      // F键保持大写
      if (/^F\d+$/.test(keyName)) {
        keyName = keyName.toUpperCase()
      } else if (keyName.length === 1) {
        keyName = keyName.toUpperCase()
      }

      parts.push(keyName)
      return parts.join(' + ')
    }

    // 表格列定义
    const columns = [
      {
        colKey: 'description',
        title: '功能',
        width: 160,
        cell: (h: any, { row }: { row: any }) => {
          return h('span', { class: row.enabled ? '' : 'shortcut-disabled' }, row.description)
        },
      },
      {
        colKey: 'keys',
        title: '快捷键',
        cell: (h: any, { row }: { row: any }) => {
          const keys = row.keys.split(' + ')
          return h(
            'div',
            { class: 'shortcut-keys' },
            keys.map((key: string, index: number) => {
              const elements = [
                h('kbd', { class: 'shortcut-key' }, key),
              ]
              if (index < keys.length - 1) {
                elements.push(h('span', { class: 'shortcut-plus' }, '+'))
              }
              return elements
            }).flat()
          )
        },
      },
    ]

    // 打开帮助弹窗
    function open() {
      dialogVisible.value = true
    }

    // 关闭帮助弹窗
    function close() {
      dialogVisible.value = false
    }

    // 切换弹窗
    function toggle() {
      dialogVisible.value = !dialogVisible.value
    }

    // 全局键盘监听 - ? 或 Ctrl+/ 打开帮助
    function handleKeydown(e: KeyboardEvent) {
      // ? 键
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return
        }
        toggle()
        e.preventDefault()
        return
      }
      // Ctrl+/
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        toggle()
        e.preventDefault()
      }
    }

    onMounted(() => {
      document.addEventListener('keydown', handleKeydown, true)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('keydown', handleKeydown, true)
    })

    // 设置编辑器核心引用
    function setEditorCore(core: EditorCore) {
      editorCore.value = core
      shortcutManager.value = core.getShortcutManager()
    }

    return {
      dialogVisible,
      activeScope,
      scopeTabs,
      filteredShortcuts,
      columns,
      open,
      close,
      toggle,
      setEditorCore,
    }
  },
})
</script>

<style scoped lang="less">
.shortcut-help {
  padding: 8px 0;
}

.shortcut-list {
  margin-top: 12px;
}

.shortcut-tip {
  margin-top: 12px;
  text-align: center;
}

.shortcut-keys {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.shortcut-key {
  display: inline-block;
  padding: 2px 8px;
  font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  line-height: 1.5;
  color: #333;
  background-color: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  box-shadow: 0 1px 0 #d9d9d9;
  white-space: nowrap;
}

.shortcut-plus {
  color: #999;
  font-size: 12px;
}

.shortcut-disabled {
  color: #bbb;
  text-decoration: line-through;
}
</style>
