<template>
  <div class="editor2d-page">
    <t-layout>
      <t-header>
        <Header />
      </t-header>
      <t-layout>
        <t-aside>
          <Graphics />
        </t-aside>
        <t-layout>
          <t-content>
            <editor-view />
          </t-content>
        </t-layout>
        <t-aside style="width: auto">
          <Props />
        </t-aside>
      </t-layout>
    </t-layout>
  </div>
</template>

<script lang="ts">
import Props from './props/Props.vue'
import Header from './header/Header.vue'
import Graphics from './graphics/Graphics.vue'
import EditorView from './editor-view/EditorView.vue'
import { defineComponent, onBeforeMount, provide, ref } from 'vue'
import { Editor2DProps } from './editor2d-type'
import { ExtendGraphic } from './core/editor2d-graphics.ts'
import { globalEditor2DConfig } from './core/editor2d-global-data'
import { createEditor, EditorCore } from '@/core'

export default defineComponent({
  name: 'Pixel2DEditor',
  components: { Props, Header, Graphics, EditorView },
  props: Editor2DProps,
  setup(props) {
    const editor = ref<EditorCore | null>(null)
    const isReady = ref(false)

    const init = async (props: any) => {
      // 使用 !== undefined 替代 ! 防止 false 值被错误判断
      if (props.displayMenuTitle !== undefined) {
        globalEditor2DConfig.displayMenuTitle = props.displayMenuTitle
      }
      if (props.displayMenuIcon !== undefined) {
        globalEditor2DConfig.displayMenuIcon = props.displayMenuIcon
      }
      if (props.disabledTips !== undefined) {
        globalEditor2DConfig.disabledTips = props.disabledTips
      }

      // 初始化图形库（保持原有功能）
      new ExtendGraphic().init(props.options)

      // 创建编辑器核心实例（使用新架构）
      editor.value = createEditor()

      // 标记编辑器已创建，等待子组件初始化
      console.log('[Pixel2D] 编辑器核心实例已创建')
    }

    // 统一的编辑器就绪回调，由EditorView调用
    const onEditorReady = (editorCore: EditorCore) => {
      editor.value = editorCore
      isReady.value = true
      console.log('[Pixel2D] 编辑器已就绪')
    }

    // 提供编辑器就绪回调给子组件
    provide('onEditorReady', onEditorReady)

    onBeforeMount(() => {
      init(props)
    })

    // 提供编辑器实例给子组件
    provide('editorCore', editor)
  },
})
</script>

<style scoped lang="less">
.editor2d-page {
  height: 100vh;
  overflow: hidden;
}
</style>
