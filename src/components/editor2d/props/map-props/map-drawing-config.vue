<template>
  <div class="map-drawing-config">
    <!-- 图纸 -->
    <t-collapse expand-icon-placement="right" :default-value="activeCollapse">
      <t-collapse-panel v-for="(item, index) in formListData" :value="item.key ? item.key : index" :header="item.title">
        <generate-form :model-value="item.children"/>
      </t-collapse-panel>
    </t-collapse>
  </div>
</template>
<script setup lang="ts">
import {computed, onBeforeMount, ref} from 'vue';
import GenerateForm from "../../../common/form-list/GenerateForm.vue";
import {Editor2D} from "../../core/editor2d";
import {Editor2DCache} from "../../core/editor2d-local-storage";
import {globalEditor2DData} from "../../core/editor2d-global-data";
import {Editor2DData, Editor2DPropsMenu} from '../../core/editor2d-global-type';

// 全局默认配置
let editorMap = ref<Editor2DData>();
// 激活的面板
let activeCollapse = ref<Array<number>>([1, 2]);
// 画布配置
let editor2d = new Editor2D();

/**
 * 2D编辑器属性面板功能菜单调度函数
 * @param prop 设置属性
 * @param isFile 是文件
 */
function setOptionFunc(prop: string, isFile?: boolean) {
  return (value: any) => {
    if (isFile) {
      if (value.length > 0) {
        let file = value[0].raw as Blob;
        if (file) {
          value = URL.createObjectURL(file);
        }
      } else {
        value = '';
      }
    }
    editor2d.setData(prop, value);
    new Editor2DCache().saveCanvas();
  }
}

/**
 * 属性面板菜单
 */
const formListData = computed(() => {
  return ref(PROPS_MENU_LIST).value;
})


/**
 * 属性面板菜单
 */
const PROPS_MENU_LIST: Array<Editor2DPropsMenu> = [
  {
    key: 1,
    title: '文件',
    children: [
      {
        title: '文件名',
        type: 'input',
        value: 'name',
        option: {
          type: 'text',
          placeholder: '请输入文件名'
        },
        data: editorMap,
        event: 'change',
        action: setOptionFunc('name'),
      },
      {
        title: '文件夹',
        type: 'select',
        value: 'folder',
        option: {
          placeholder: "选择文件夹",
          list: [
            {
              label: "文件夹1",
              value: "miter"
            },
            {
              label: "文件夹2",
              value: "round"
            },
            {
              label: "文件夹3",
              value: "bevel"
            }
          ]
        },
        data: editorMap,
        event: 'change',
        action: setOptionFunc('folder'),
      },
      {
        title: '分类',
        type: 'select',
        value: 'fileType',
        option: {
          placeholder: "选择文件分类",
          list: [
            {
              label: "默认",
              value: "miter"
            },
          ]
        },
        data: editorMap,
        event: 'change',
        action: setOptionFunc('fileType'),
      },
    ]
  },
  {
    key: 2,
    title: '画布',
    children: [
      {
        title: '默认颜色',
        type: 'color',
        value: 'color',
        data: editorMap,
        event: 'change',
        action: setOptionFunc('color'),
      },
      {
        title: "画笔填充颜色",
        type: "color",
        value: "penBackground",
        data: editorMap,
        event: 'change',
        action: setOptionFunc('penBackground'),
      },
      {
        title: '背景颜色',
        type: 'color',
        value: 'background',
        data: editorMap,
        event: 'change',
        action: setOptionFunc('background'),
      },
      {
        title: '背景图片',
        type: 'file',
        value: 'bkImage',
        option: {
          accept: 'image/*'
        },
        data: editorMap,
        event: "change",
        action: setOptionFunc('bkImage', true),
      },
      {
        title: '背景图片URL',
        type: 'input',
        value: 'bkImage',
        data: editorMap,
        event: 'change',
        action: setOptionFunc('bkImage')
      },
      {
        title: '标尺',
        type: 'switch',
        value: 'rule',
        data: editorMap,
        event: "change",
        action: setOptionFunc('rule'),
      },
      {
        title: '标尺颜色',
        type: 'color',
        value: 'ruleColor',
        data: editorMap,
        event: "change",
        action: setOptionFunc('ruleColor'),
      },
      {
        title: "网格",
        type: "switch",
        value: "grid",
        data: editorMap,
        event: "change",
        action: setOptionFunc('grid'),
      },
      {
        title: '网格颜色',
        type: 'color',
        value: 'gridColor',
        data: editorMap,
        event: 'change',
        action: setOptionFunc('gridColor'),
      },
      {
        title: '网格大小',
        type: 'number',
        value: 'gridSize',
        option: {
          min: 10,
          max: 100
        },
        data: editorMap,
        event: "change",
        action: setOptionFunc('gridSize'),
      },
      {
        title: '网格角度',
        type: 'number',
        value: 'gridRotate',
        option: {
          min: -Infinity,
          max: Infinity
        },
        data: editorMap,
        event: 'change',
        action: setOptionFunc('gridRotate'),
      },
      {
        title: '初始化JS',
        type: 'code',
        value: 'initJs',
        option: {
          title: '初始化JS数据',
          language: 'JavaScript',
          placeholder: '打开图纸后，执行的初始脚本。',
        },
        data: editorMap,
        event: 'change',
        action: setOptionFunc('initJs'),
      },
      {
        title: "连线相交弯曲",
        type: "switch",
        value: "lineCross",
        data: editorMap,
        event: "change",
        action: setOptionFunc('lineCross'),
      },
      {
        title: "pc端自动缩放",
        type: "switch",
        value: "autoSizeinPc",
        data: editorMap,
        event: "change",
        action: setOptionFunc('autoSizeinPc'),
      },
      {
        title: "移动端自动缩放",
        type: "switch",
        value: "autoSizeinMobile",
        data: editorMap,
        event: "change",
        action: setOptionFunc('autoSizeinMobile'),
      },
      {
        title: "预览不充满窗口",
        type: "switch",
        value: "previewUnScale",
        data: editorMap,
        event: "change",
        action: setOptionFunc('previewUnScale'),
      },
    ]
  }
]

/**
 * 初始化
 */
function init() {
  editor2d.initGlobalData();
  editorMap.value = globalEditor2DData;
}

onBeforeMount(() => {
  init();
});

</script>

<style scoped lang="less">

</style>