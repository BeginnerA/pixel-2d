<template>
  <div class="code-edit">
    <header>
      <slot name="header"></slot>
    </header>
    <main>
      <div class="edit-box" ref="codeEditBox"></div>
    </main>
    <footer>
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { EditorProps } from './code-editor-type'
import { Dawn } from './dawn'
import * as monaco from 'monaco-editor'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'

self.MonacoEnvironment = {
  getWorker(_: string, label: string) {
    if (label === 'json') {
      return new jsonWorker()
    }
    if (['css', 'scss', 'less'].includes(label)) {
      return new cssWorker()
    }
    if (['html', 'handlebars', 'razor'].includes(label)) {
      return new htmlWorker()
    }
    if (['typescript', 'javascript'].includes(label)) {
      return new tsWorker()
    }
    return new EditorWorker()
  },
}

export default defineComponent({
  name: 'CodeEditor',
  props: EditorProps,
  emits: ['update:modelValue', 'change', 'editor-mounted'],
  setup(props, { emit }) {
    let editor: monaco.editor.IStandaloneCodeEditor
    let codeEditBox = ref()

    const init = () => {
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: false,
      })
      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true,
      })
      monaco.editor.defineTheme('customTheme', Dawn as any)
      monaco.editor.setTheme('customTheme')

      editor = monaco.editor.create(codeEditBox.value, {
        value: props.modelValue,
        language: props.language,
        theme: props.theme,
        ...props.options,
      })

      // 监听值的变化
      editor.onDidChangeModelContent(() => {
        // 给父组件实时返回最新文本
        const value = editor.getValue()
        emit('update:modelValue', value)
        emit('change', value)
      })

      emit('editor-mounted', editor)
    }

    watch(
      () => props.modelValue,
      (newValue) => {
        if (editor) {
          const value = editor.getValue()
          if (newValue !== value) {
            editor.setValue(newValue)
          }
        }
      }
    )

    watch(
      () => props.options,
      (newValue) => {
        editor.updateOptions(newValue)
      },
      { deep: true }
    )

    watch(
      () => props.language,
      (newValue) => {
        monaco.editor.setModelLanguage(editor.getModel()!, newValue)
      }
    )

    onBeforeUnmount(() => {
      editor.dispose()
    })

    onMounted(() => {
      init()
    })

    return { codeEditBox }
  },
})
</script>

<style scoped>
.code-edit {
  margin: 0;
  padding: 0;
}

.edit-box {
  width: v-bind(width);
  height: v-bind(height);
}
</style>
