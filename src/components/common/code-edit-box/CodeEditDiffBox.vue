<template>
  <div class="code-edit-diff">
    <header>
      <slot name="header"></slot>
    </header>
    <main>
      <div class="edit-diff-box" ref="codeEditDiffBox"></div>
    </main>
    <footer>
      <slot name="footer"></slot>
    </footer>
  </div>

</template>

<script lang="ts">
import {defineComponent, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import {EditorDiffProps} from './code-editor-type';
import * as monaco from 'monaco-editor';
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
  }
}

export default defineComponent({
  name: 'CodeDiffEditor',
  props: EditorDiffProps,
  setup(props) {
    let editor: monaco.editor.IStandaloneDiffEditor;
    let codeEditDiffBox = ref();
    let monacoEditor = ref();
    let defaultOpts = {
      value: '', // 编辑器的值
      roundedSelection: true, // 右侧不显示编辑器预览框
      autoIndent: true, // 自动缩进
      language: props.language,
      theme: props.theme,
    };

    const init = () => {
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: false,
      })
      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true,
      })
      // 生成编辑器配置
      const editorOptions = Object.assign(defaultOpts, props.opts)
      // 初始化编辑器实例
      editor = monaco.editor.createDiffEditor(
          codeEditDiffBox.value,
          editorOptions as any
      )
      editor.setModel({
        // oldValue 为以前的值
        original: monaco.editor.createModel(
            props.oldValue,
            editorOptions.language
        ),
        // oldValue 为新的值
        modified: monaco.editor.createModel(
            props.newValue,
            editorOptions.language
        )
      })
    }

    watch(
        () => props.opts,
        () => {
          init();
        },
        {deep: true}
    )

    watch(
        () => props.newValue,
        newValue => {
          if (editor) {
            editor.setModel({
              // oldValue 为以前的值
              original: monaco.editor.createModel(
                  props.oldValue,
                  props.language
              ),
              // oldValue 为新的值
              modified: monaco.editor.createModel(
                  newValue,
                  props.language
              )
            })
          }
        },
        {deep: true}
    )

    watch(
        () => props.oldValue,
        oldValue => {
          if (editor) {
            editor.setModel({
              // oldValue 为以前的值
              original: monaco.editor.createModel(
                  oldValue,
                  props.language
              ),
              // oldValue 为新的值
              modified: monaco.editor.createModel(
                  props.newValue,
                  props.language
              )
            })
          }
        },
        {deep: true}
    );

    onBeforeUnmount(() => {
      editor.dispose();
    })

    onMounted(() => {
      init();
    })

    /**
     * 供父组件调用手动获取值
     */
    function getVal() {
      return monacoEditor.value;
    }

    return {codeEditDiffBox, getVal};
  }
})

</script>

<style scoped>
.code-edit-diff {
  margin: 0;
  padding: 0;
}

.edit-diff-box {
  width: v-bind(width);
  height: v-bind(height);
}
</style>