<template>
  <div class="app-page">
    <Editor2d :options="options" />
  </div>
</template>

<script setup lang="ts">
import Editor2d from '@/components/editor2d/Editor2d.vue'
import { CUSTOM_GRAPHIC_GROUPS as customGraphic } from '@/data/graphic-groups-data'

const options = {
  enableBasicsPen: true,
  enableEchartsPen: true,
  extendPen: customGraphic,
}
</script>

<style scoped lang="less">
.app-page {
  width: 100vw;
  height: 100vh;
}
</style>