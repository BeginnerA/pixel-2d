<template>
  <div class="app-page">
    <Pixel2D :options="options" />
  </div>
</template>

<script setup lang="ts">
import Pixel2D from '@/components/editor2d/Pixel2D.vue'
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
