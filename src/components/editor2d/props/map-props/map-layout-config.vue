<template>
  <div class="map-layout-config">
    <t-collapse v-model:value="activeCollapse" size="small" expand-icon-placement="right">
      <t-collapse-panel header="布局">
        <t-form ref="form" label-align="left">
          <t-form-item label="最大宽度">
            <t-input-number v-model:value="layoutData.maxWidth" theme="column" placeholder="自适应"/>
          </t-form-item>
          <t-form-item label="间距">
            <t-input-number v-model:value="layoutData.spacing" theme="column" placeholder="请输入间距"/>
          </t-form-item>
        </t-form>
        <div style="margin-top: 10px">
          <t-button type="button" :block="true" @click="setLayout">开始排版</t-button>
        </div>
      </t-collapse-panel>
    </t-collapse>
  </div>
</template>
<script setup lang="ts">
import {ref} from "vue";

// 激活的面板
let activeCollapse = ref<Array<number>>([0]);
// 布局数据
let layoutData = ref<{
  maxWidth?: number,
  spacing?: number
}>({});


/**
 * 设置布局
 */
function setLayout() {
  let data = layoutData.value;
  let pens = meta2d.store.data.pens;
  if (pens && pens.length > 1 && data) {
    meta2d.layout(pens, data.maxWidth, data.spacing);
    if (!data.maxWidth) {
      meta2d.fillView();
    }
  }
}

</script>

<style scoped lang="less">

</style>