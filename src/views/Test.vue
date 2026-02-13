<template>
  <div>
    <code-diff-editor
      :newValue="content"
      :oldValue="previousContent"
      :opts="opts"
      :language="language"
      height="999px"
    />
  </div>
</template>

<script setup lang="ts">
import CodeDiffEditor from '../components/common/code-edit-box/CodeEditDiffBox.vue'
import { reactive, ref } from 'vue'

const opts = reactive({
  readOnly: true,
  contextmenu: false,
  automaticLayout: true,
})

let content = ref('{"name":"test","age":18,"sex":"男","address":"北京"}')
let previousContent = ref('{"name":"test","age":18,"sex":"男","address":"北京","phone":"13123123123"}')
let language = ref('JSON')
</script>

<style scoped lang="less"></style>
