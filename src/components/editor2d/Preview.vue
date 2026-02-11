<template>
  <div class="editor2d-preview">
    <editor-view/>
  </div>
</template>

<script lang="ts" setup>
import {onMounted} from "vue";
import EditorView from "./editor-view/EditorView.vue";
import {Editor2DCache} from "./core/editor2d-local-storage";

onMounted(() => {
  // 读取本地存储
  let data: any = new Editor2DCache().getCanvas();
  if (data) {
    data.locked = 1;
    data.rule = false;
    data.grid = false;
    meta2d.open(data, true);
    // 自适应屏幕显示
    meta2d.fitView(true, 24);
  }
});
</script>

<style lang="less" scoped>
.editor2d-preview {
  height: 100vh;
}
</style>