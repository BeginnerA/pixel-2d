<template>
  <div class="editor2d-page">
    <t-layout>
      <t-header>
        <Header/>
      </t-header>
      <t-layout>
        <t-aside>
          <Graphics/>
        </t-aside>
        <t-layout>
          <t-content>
            <editor-view/>
          </t-content>
        </t-layout>
        <t-aside style="width: auto">
          <Props/>
        </t-aside>
      </t-layout>
    </t-layout>
  </div>
</template>

<script lang="ts">
import Props from './props/Props.vue';
import Header from './header/Header.vue';
import Graphics from './graphics/Graphics.vue';
import EditorView from './editor-view/EditorView.vue';
import {defineComponent, onBeforeMount} from "vue";
import {Editor2DProps} from "./editor2d-type";
import {ExtendGraphic} from "./core/editor2d-graphics.ts";
import {globalEditor2DConfig} from "./core/editor2d-global-data";

export default defineComponent({
  name: 'GenerateForm',
  components: {Props, Header, Graphics, EditorView},
  props: Editor2DProps,
  setup(props) {

    const init = (props: any) => {
      // 使用 !== undefined 替代 ! 防止 false 值被错误判断
      if (props.displayMenuTitle !== undefined) {
        globalEditor2DConfig.displayMenuTitle = props.displayMenuTitle;
      }
      if (props.displayMenuIcon !== undefined) {
        globalEditor2DConfig.displayMenuIcon = props.displayMenuIcon;
      }
      if (props.disabledTips !== undefined) {
        globalEditor2DConfig.disabledTips = props.disabledTips;
      }
      new ExtendGraphic().init(props.options);
    }

    onBeforeMount(() => {
      init(props);
    })
  }
})

</script>

<style scoped lang="less">
.editor2d-page {
  height: 100vh;
  overflow: hidden;
}
</style>