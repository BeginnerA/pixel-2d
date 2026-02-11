<template>
  <div class="editor2d-editor-view">
    <!-- 编辑器画布 -->
    <div id="meta2d"></div>
  </div>
</template>
<script setup lang="ts">
import {onMounted} from "vue";
import {Meta2d} from "@meta2d/core";
import {formPens} from "@meta2d/form-diagram";
import {classPens} from "@meta2d/class-diagram";
import {flowAnchors, flowPens} from "@meta2d/flow-diagram";
import {register as registerEcharts} from "@meta2d/chart-diagram";
import {ftaAnchors, ftaPens, ftaPensbyCtx} from "@meta2d/fta-diagram";
import {sequencePens, sequencePensbyCtx} from "@meta2d/sequence-diagram";
import {activityDiagram, activityDiagramByCtx,} from "@meta2d/activity-diagram";
import {Editor2DCanvas} from "../core/editor2d";
import {Editor2DCache} from "../core/editor2d-local-storage";
import {globalEditor2DProps} from "../core/editor2d-global-data";

// 常量配置
const HEADER_HEIGHT = 60; // 头部高度

/**
 * 加载本地数据
 */
function loadLocalDta() {
// 读取本地存储
  let data: any = new Editor2DCache().getCanvas();
  if (data) {
    // 判断是否为运行查看，是-设置为预览模式
    if (data.locked !== 0) {
      data.locked = 0;
    }
    meta2d.open(data, true);
  } else {
    new Editor2DCanvas().setCanvasStatus(0)
  }
}

/**
 * 初始化
 */
function init() {
  let meta2d = new Meta2d("meta2d");
  // 注册流程图库
  meta2d.register(flowPens());
  meta2d.registerAnchors(flowAnchors());
  // 注册注册活动图库
  meta2d.register(activityDiagram());
  // 原生 canvas 绘画图库，支持逻辑复杂的需求
  meta2d.registerCanvasDraw(activityDiagramByCtx());
  // 注册类图库
  meta2d.register(classPens());
  // 注册时序图库
  meta2d.register(sequencePens());
  meta2d.registerCanvasDraw(sequencePensbyCtx());
  // 注册表单图库
  meta2d.registerCanvasDraw(formPens());

  meta2d.register(ftaPens());
  meta2d.registerCanvasDraw(ftaPensbyCtx());
  meta2d.registerAnchors(ftaAnchors());

  // 注册 Echarts 图库，直接调用 Echarts 的注册函数
  registerEcharts();

  // 设置默认配置选项
  meta2d.setOptions(globalEditor2DProps)
  // 渲染
  meta2d.render();
}

onMounted(async () => {
  init();
  loadLocalDta();
});

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