<template>
  <div class="pen-appearance-config">
    <!-- 外观 -->
    <t-collapse expand-icon-placement="right" :default-value="activeCollapse">
      <t-collapse-panel v-for="(item, index) in formListData" :value="item.key ? item.key : index" :header="item.title">
        <generate-form :model-value="item.children"/>
      </t-collapse-panel>
    </t-collapse>
  </div>
</template>
<script setup lang="ts">
import {computed, PropType, ref, watch} from 'vue';
import {IValue} from "@meta2d/core/src/pen";
import {MessagePlugin} from "tdesign-vue-next";
import GenerateForm from "../../../common/form-list/GenerateForm.vue";
import {Editor2DPen, Editor2DPropsMenu} from '../../core/editor2d-global-type';
import {Editor2DCanvas} from "../../core/editor2d";
import {CONFIG_LINE_DASH} from "../../core/editor2d-global-constant";
import {globalEditor2DPen} from "../../core/editor2d-global-data";

// 编辑中的图元
let props = defineProps({
  modelValue: {
    type: Object as PropType<Editor2DPen | any>,
    required: true
  },
});
let editorPen = ref<Editor2DPen>(globalEditor2DPen);
// 激活的面板
let activeCollapse = ref<Array<number>>([0]);
// 画布配置
let editor2DCanvas = new Editor2DCanvas();
// TODO 位置数据（当前版本位置需要动态计算获取）
let penRect = ref<any>();

/**
 * 2D编辑器属性面板功能菜单调度函数
 * @param prop 设置项
 * @param isFile 是文件
 */
function setOptionFunc(prop: string, isFile?: boolean) {
  return (value: any) => {
    let locked = meta2d.store.data.locked;
    if (locked !== 0) {
      MessagePlugin.warning('当前状态非编辑状态不可编辑');
      return
    }
    let penKey = prop;
    let penVal = value;
    switch (prop) {
      case 'x':
      case 'y':
      case 'width':
      case 'height':
        value = penRect.value[prop];
        break;
      case 'dash':
        CONFIG_LINE_DASH.map((_, v) => {
          if (value === v) {
            penKey = 'lineDash';
            penVal = JSON.parse(_.data);
          }
        });
        break;
      default:
        break;
    }

    let dataList: Array<IValue> = [];
    if (['width', 'height'].includes(penKey) && editorPen.value.ratio) {
      let width = editorPen.value.width || 0;
      let height = editorPen.value.height || 0;
      if ('width' === penKey) {
        dataList = [{
          id: editorPen.value.id,
          width: penVal,
          height: penVal / width * height,
        }];
      } else if ('height' === penKey) {
        dataList = [{
          id: editorPen.value.id,
          height: penVal,
          width: penVal / height * width,
        }];
      }
    } else if (isFile) {
      if (penVal.length > 0) {
        let file = penVal[0].raw as Blob;
        if (file) {
          let fileUrl = URL.createObjectURL(file);
          dataList = [{
            id: editorPen.value.id,
            [penKey]: fileUrl
          }];
        }
      } else {
        dataList = [{
          id: editorPen.value.id,
          [penKey]: '',
        }];
      }
    } else {
      dataList = [{
        id: editorPen.value.id,
        [penKey]: penVal
      }];
    }
    if (dataList.length > 0) {
      dataList.forEach(data => {
        Object.assign(editorPen.value, data);
      })
      editor2DCanvas.setValue(dataList);
    }
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
    title: '位置与大小',
    children: [
      {
        title: 'x',
        type: 'number',
        value: 'x',
        option: {
          placeholder: 'px'
        },
        data: penRect,
        event: 'change',
        action: setOptionFunc('x'),
      },
      {
        title: 'y',
        type: 'number',
        value: 'y',
        option: {
          placeholder: 'px'
        },
        data: penRect,
        event: 'change',
        action: setOptionFunc('y'),
      },
      {
        title: '宽度',
        type: 'number',
        value: 'width',
        data: penRect,
        option: {
          min: 0
        },
        event: 'change',
        action: setOptionFunc('width'),
      },
      {
        title: '高度',
        type: 'number',
        value: 'height',
        data: penRect,
        event: 'change',
        action: setOptionFunc('height'),
      },
      {
        title: '锁定宽高比',
        type: 'switch',
        value: 'ratio',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('ratio'),
      },
      {
        title: '圆角',
        type: 'number',
        value: 'borderRadius',
        option: {
          placeholder: '<1为比例',
          min: 0
        },
        data: editorPen,
        event: 'change',
        action: setOptionFunc('borderRadius'),
      },
      {
        title: '旋转',
        type: 'number',
        value: 'rotate',
        option: {
          placeholder: '角度',
        },
        data: editorPen,
        event: 'change',
        action: setOptionFunc('rotate')
      },
      {
        title: '内边距上',
        type: 'number',
        value: 'paddingTop',
        option: {
          placeholder: 'px',
        },
        data: editorPen,
        event: 'change',
        action: setOptionFunc('paddingTop')
      },
      {
        title: '内边距下',
        type: 'number',
        value: 'paddingBottom',
        option: {
          placeholder: 'px',
        },
        data: editorPen,
        event: 'change',
        action: setOptionFunc('paddingBottom')
      },
      {
        title: '内边距左',
        type: 'number',
        value: 'paddingLeft',
        option: {
          placeholder: 'px',
        },
        data: editorPen,
        event: 'change',
        action: setOptionFunc('paddingLeft')
      },
      {
        title: '内边距右',
        type: 'number',
        value: 'paddingRight',
        option: {
          placeholder: 'px',
        },
        data: editorPen,
        event: 'change',
        action: setOptionFunc('paddingRight')
      },
      {
        title: '进度',
        type: 'number',
        value: 'progress',
        option: {
          placeholder: 'px',
          min: 0,
          step: 0.1,
          max: 1
        },
        data: editorPen,
        event: 'change',
        action: setOptionFunc('progress')
      },
      {
        title: '垂直进度',
        type: 'switch',
        value: 'verticalProgress',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('verticalProgress')
      },
      {
        title: '水平翻转',
        type: 'switch',
        value: 'flipX',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('flipX')
      },
      {
        title: '垂直翻转',
        type: 'switch',
        value: 'flipY',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('flipY')
      },
    ]
  },
  {
    title: '样式',
    children: [
      {
        title: '线条样式',
        type: 'select',
        value: 'dash',
        option: {
          placeholder: '线条样式',
          list: CONFIG_LINE_DASH,
        },
        data: editorPen,
        event: 'change',
        action: setOptionFunc('dash')
      },
      {
        title: '连接样式',
        type: 'select',
        option: {
          placeholder: '连接样式',
          list: [
            {
              label: '默认',
              value: 'miter'
            },
            {
              label: '圆形',
              value: 'round'
            },
            {
              label: '斜角',
              value: 'bevel'
            }
          ]
        },
        value: 'lineJoin',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('lineJoin')
      },
      {
        title: '末端样式',
        type: 'select',
        option: {
          placeholder: '末端样式',
          list: [
            {
              label: '默认',
              value: 'butt'
            },
            {
              label: '圆形',
              value: 'round'
            },
            {
              label: '方形',
              value: 'square'
            }
          ]
        },
        value: 'lineCap',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('lineCap')
      },
      {
        title: '颜色',
        type: 'color',
        value: 'color',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('color')
      },
      {
        title: '浮动颜色',
        type: 'color',
        value: 'hoverColor',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('hoverColor')
      },
      {
        title: '选中颜色',
        type: 'color',
        value: 'activeColor',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('activeColor')
      },
      {
        title: '线条宽度',
        type: 'number',
        value: 'lineWidth',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('lineWidth')
      },
      {
        title: '背景颜色',
        type: 'color',
        value: 'background',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('background')
      },
      {
        title: '浮动背景颜色',
        type: 'color',
        value: 'hoverBackground',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('hoverBackground')
      },
      {
        title: '选中背景颜色',
        type: 'color',
        value: 'activeBackground',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('activeBackground')
      },
      {
        title: '透明度',
        type: 'number',
        value: 'globalAlpha',
        option: {
          min: 0,
          step: 0.1,
          max: 1
        },
        data: editorPen,
        event: 'change',
        action: setOptionFunc('globalAlpha')
      },
      {
        title: '锚点颜色',
        type: 'color',
        value: 'anchorColor',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('anchorColor')
      },
      {
        title: '锚点半径',
        type: 'number',
        value: 'anchorRadius',
        option: {
          min: 0,
          step: 1,
          max: 10
        },
        data: editorPen,
        event: 'change',
        action: setOptionFunc('anchorRadius')
      },
      {
        title: '阴影颜色',
        type: 'color',
        value: 'shadowColor',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('shadowColor')
      },
      {
        title: '阴影模糊',
        type: 'number',
        value: 'shadowBlur',
        option: {
          min: 0,
          step: 1,
          max: Infinity
        },
        data: editorPen,
        event: 'change',
        action: setOptionFunc('shadowBlur')
      },
      {
        title: '阴影x偏移',
        type: 'number',
        value: 'shadowOffsetX',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('shadowOffsetX')
      },
      {
        title: '阴影y偏移',
        type: 'number',
        value: 'shadowOffsetY',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('shadowOffsetY')
      },
      {
        title: '文字阴影',
        type: 'switch',
        value: 'textHasShadow',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('textHasShadow')
      },
    ]
  },
  {
    title: '文字',
    children: [
      {
        title: '字体名',
        type: 'select',
        value: 'fontFamily',
        option: {
          placeholder: '请选择字体',
          list: [
            {
              label: '宋体',
              value: '宋体'
            }, {
              label: '黑体',
              value: '黑体'
            }
          ]
        },
        data: editorPen,
        event: 'change',
        action: setOptionFunc('fontFamily')

      }, {
        title: '字体大小',
        type: 'number',
        value: 'fontSize',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('fontSize')

      },
      {
        title: '字体颜色',
        type: 'color',
        value: 'textColor',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('textColor')
      },
      {
        title: '浮动字体颜色',
        type: 'color',
        value: 'hoverTextColor',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('hoverTextColor')
      },
      {
        title: '选中字体颜色',
        type: 'color',
        value: 'activeTextColor',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('activeTextColor')
      },
      {
        title: '文字背景颜色',
        type: 'color',
        value: 'textBackground',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('textBackground')
      },
      {
        title: '水平对齐',
        type: 'select',
        value: 'textAlign',
        option: {
          placeholder: '请选择对齐方式',
          list: [
            {
              label: '左对齐',
              value: 'left'
            }, {
              label: '居中对齐',
              value: 'center'
            }, {
              label: '右对齐',
              value: 'right'
            }
          ]
        },
        data: editorPen,
        event: 'change',
        action: setOptionFunc('textAlign')
      },
      {
        title: '垂直对齐',
        type: 'select',
        value: 'textBaseline',
        option: {
          placeholder: '请选择对齐方式',
          list: [
            {
              label: '顶部对齐',
              value: 'top'
            }, {
              label: '居中对齐',
              value: 'center'
            }, {
              label: '底部对齐',
              value: 'bottom'
            }
          ]
        },
        data: editorPen,
        event: 'change',
        action: setOptionFunc('textBaseline')
      },
      {
        title: '行高',
        type: 'number',
        option: {
          step: 0.1
        },
        value: 'lineHeight',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('lineHeight')
      },
      {
        title: '换行',
        type: 'select',
        value: 'whiteSpace',
        option: {
          placeholder: '请选择换行方式',
          list: [
            {
              label: '默认',
              value: 'nowrap'
            }, {
              label: '不换行',
              value: 'nowrap'
            }, {
              label: '回车换行',
              value: 'pre-line'
            },
            {
              label: '永远换行',
              value: 'break-all'
            }
          ]
        },
        data: editorPen,
        event: 'change',
        action: setOptionFunc('whiteSpace')

      },
      {
        title: '文字宽度',
        type: 'number',
        value: 'textWidth',
        option: {
          min: 0,
        },
        data: editorPen,
        event: 'change',
        action: setOptionFunc('textWidth')

      },
      {
        title: '文字高度',
        type: 'number',
        value: 'textHeight',
        option: {
          min: 0,
        },
        data: editorPen,
        event: 'change',
        action: setOptionFunc('textHeight')
      },
      {
        title: '超出省略',
        type: 'switch',
        value: 'ellipsis',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('ellipsis')
      },
      {
        title: '隐藏文字',
        type: 'switch',
        value: 'hiddenText',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('hiddenText')
      },
      {
        title: '文字内容',
        type: 'textarea',
        value: 'text',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('text')
      }
    ]
  },
  {
    title: '图片',
    children: [
      {
        title: '图片',
        type: 'file',
        value: 'image',
        option: {
          accept: 'image/*'
        },
        data: editorPen,
        event: 'change',
        action: setOptionFunc('image', true)
      },
      {
        title: '图片URL',
        type: 'input',
        value: 'image',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('image')
      },
      {
        title: '背景图片',
        type: 'file',
        value: 'backgroundImage',
        option: {
          accept: 'image/*'
        },
        data: editorPen,
        event: 'change',
        action: setOptionFunc('backgroundImage', true)
      },
      {
        title: '背景图片URL',
        type: 'input',
        value: 'backgroundImage',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('backgroundImage')
      },
      {
        title: '描绘图片',
        type: 'file',
        value: 'strokeImage',
        option: {
          accept: 'image/*'
        },
        data: editorPen,
        event: 'change',
        action: setOptionFunc('strokeImage', true)
      },
      {
        title: '描绘图片URL',
        type: 'input',
        value: 'strokeImage',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('strokeImage')
      },
      {
        title: '宽度',
        type: 'number',
        value: 'iconWidth',
        option: {
          placeholder: '自适应'
        },
        data: editorPen,
        event: 'change',
        action: setOptionFunc('iconWidth')
      },
      {
        title: '高度',
        type: 'number',
        value: 'iconHeight',
        option: {
          placeholder: '自适应'
        },
        data: editorPen,
        event: 'change',
        action: setOptionFunc('iconHeight')
      },
      {
        title: '保持比例',
        type: 'switch',
        value: 'imageRatio',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('imageRatio')
      },
      {
        title: '水平偏移',
        type: 'number',
        value: 'iconLeft',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('iconLeft')
      },
      {
        title: '垂直偏移',
        type: 'number',
        value: 'iconTop',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('iconTop')
      },
      {
        title: '对齐方式',
        type: 'select',
        value: 'iconAlign',
        option: {
          placeholder: '请选择对齐方式',
          list: [
            {
              label: '上',
              value: 'top'
            },
            {
              label: '右',
              value: 'right'
            },
            {
              label: '下',
              value: 'bottom'
            },
            {
              label: '左',
              value: 'left'
            },
            {
              label: '左上',
              value: 'left-top'
            },
            {
              label: '右上',
              value: 'right-top'
            },
            {
              label: '左下',
              value: 'left-bottom'
            },
            {
              label: '右下',
              value: 'right-bottom'
            },
            {
              label: '居中',
              value: 'center'
            }
          ]
        },
        data: editorPen,
        event: 'change',
        action: setOptionFunc('iconAlign')
      }
    ]
  },
  {
    title: '禁止',
    children: [
      {
        title: '禁止输入',
        type: 'switch',
        value: 'disableInput',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('disableInput')
      },
      {
        title: '禁止旋转',
        type: 'switch',
        value: 'disableRotate',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('disableRotate')
      },
      {
        title: '禁止缩放',
        type: 'switch',
        value: 'disableSize',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('disableSize')
      },
      {
        title: '禁止锚点',
        type: 'switch',
        value: 'disableAnchor',
        data: editorPen,
        event: 'change',
        action: setOptionFunc('disableAnchor')
      }
    ]
  },
]

/**
 * 初始化
 * @param pen 图元
 */
function init(pen: Editor2DPen) {
  if (pen) {
    editorPen.value = pen;
    penRect.value = meta2d.getPenRect(pen);
  }
}

watch(
    () => props.modelValue,
    (newValue) => {
      if (newValue) {
        init(newValue);
      }
    },
    {immediate: true},
)

</script>