<template>
  <div class="pen-effect-config">
    <t-form label-align="left">
      <t-collapse v-model:value="activeCollapse" size="small" expand-icon-placement="right">
        <t-collapse-panel v-if="editorPen.name !== 'video'" header="动画">
          <template v-if="editorPen.name !== 'line'">
            <t-form-item label="时长">
              <t-input v-model:value="editorPen.duration" placeholder="" :readonly="true" :borderless="true"
                       @change="setOptionFunc('duration')"
              />
            </t-form-item>
          </template>
          <t-form-item label="动画效果">
            <template v-if="editorPen.name === 'line'">
              <t-select v-model:value="editorPen.lineAnimateType" :clearable="true" placeholder="请选择动画效果"
                        @change="setOptionFunc('lineAnimateType')"
              >
                <t-option :value="0" label="水流"/>
                <t-option :value="1" label="水珠流动"/>
                <t-option :value="2" label="圆点"/>
              </t-select>
            </template>
            <template v-else>
              <t-select v-model:value="editorPen.animateType" :clearable="true" placeholder="请选择动画效果"
                        @change="changeAnimate" style="width: 80%"
              >
                <t-option v-for="vo in animateType" :value="vo.key" :label="vo.name"/>
              </t-select>
              <template v-if="editorPen.animateType === 'custom'">
                <QueueIcon size="2em" @click="openFrames"/>
              </template>
            </template>
          </t-form-item>
          <t-form-item label="循环次数">
            <t-input-number v-model:value="editorPen.animateCycle" theme="column" placeholder="默认无限循环"
                            @change="setOptionFunc('animateCycle')"/>
          </t-form-item>
          <t-form-item label="下个动画">
            <t-input v-model:value="editorPen.nextAnimate" placeholder="tag" @change="setOptionFunc('nextAnimate')"/>
          </t-form-item>
          <t-form-item label="自动播放">
            <t-switch v-model:value="editorPen.autoPlay" @change="setOptionFunc('autoPlay')"/>
          </t-form-item>
          <t-form-item label="保持动画状态">
            <t-switch v-model:value="editorPen.keepAnimateState" @change="setOptionFunc('keepAnimateState')"/>
          </t-form-item>
          <t-form-item v-if="editorPen.name === 'line'" label="动画线宽">
            <t-input-number v-model:value="editorPen.animateLineWidth" theme="column" placeholder="请输入动画线宽"
                            @change="setOptionFunc('animateLineWidth')"
            />
          </t-form-item>
          <t-form-item v-if="editorPen.name === 'line'" label="动画颜色">
            <t-color-picker class="w-full" v-model:value="editorPen.animateColor" format="CSS"
                            :show-primary-color-preview="false"
                            :color-modes="['monochrome']" :clearable="true" @change="setOptionFunc('animateColor')"
            />
          </t-form-item>
          <t-form-item v-if="editorPen.name === 'line'" label="动画速度">
            <t-slider v-model:value="editorPen.animateSpan" :min="1" :max="5" @change="setOptionFunc('animateSpan')"/>
          </t-form-item>
          <t-form-item v-if="editorPen.name === 'line'" label="反向流动">
            <t-switch v-model:value="editorPen.animateReverse" @change="setOptionFunc('animateReverse')"/>
          </t-form-item>
          <t-form-item label="线性播放">
            <t-switch v-model:value="editorPen.linear" :label="['是', '否']" @change="setOptionFunc('linear')"/>
          </t-form-item>
          <t-form-item :label-width="15">
            <t-space size="small">
              <t-button size="small" theme="primary" @click="onPlay()">
                <template #icon>
                  <PlayIcon/>
                </template>
                <span>播放</span>
              </t-button>
              <t-button size="small" variant="dashed" theme="primary" @click="onPause()">
                <template #icon>
                  <PauseIcon/>
                </template>
                <span>暂停</span>
              </t-button>
              <t-button size="small" variant="dashed" theme="danger" @click="onStop()">
                <template #icon>
                  <StopIcon/>
                </template>
                <span>停止</span>
              </t-button>
            </t-space>
          </t-form-item>
        </t-collapse-panel>
        <t-collapse-panel v-if="editorPen.name === 'video'" header="视频">
          <t-form-item label="音频URL">
            <t-input v-model:value="editorPen.audio" @change="setOptionFunc('audio')"/>
          </t-form-item>
          <t-form-item label="视频URL">
            <t-input v-model:value="editorPen.video" @change="setOptionFunc('video')"/>
          </t-form-item>
          <t-form-item label="自动播放">
            <t-switch v-model:value="editorPen.autoPlay" @change="setOptionFunc('autoPlay')"/>
          </t-form-item>
          <t-form-item label="下个播放">
            <t-input v-model:value="editorPen.nextAnimate" placeholder="tag"
                     @change="setOptionFunc('nextAnimate')"/>
          </t-form-item>
          <t-form-item label="循环播放">
            <t-switch v-model:value="editorPen.playLoop" @change="setOptionFunc('playLoop')"/>
          </t-form-item>
          <t-form-item :label-width="15">
            <t-space size="small">
              <t-button size="small" theme="primary" @click="onPlay()">
                <template #icon>
                  <PlayIcon/>
                </template>
                <span>播放</span>
              </t-button>
              <t-button size="small" variant="dashed" theme="primary" @click="onPause()">
                <template #icon>
                  <PauseIcon/>
                </template>
                <span>暂停</span>
              </t-button>
              <t-button size="small" variant="dashed" theme="danger" @click="onStop()">
                <template #icon>
                  <StopIcon/>
                </template>
                <span>停止</span>
              </t-button>
            </t-space>
          </t-form-item>
        </t-collapse-panel>
        <t-collapse-panel v-if="editorPen.name === 'iframe'" header="网页">
          <t-form-item label="网页URL">
            <t-input v-model:value="editorPen.iframe" @change="setOptionFunc('iframe')"/>
          </t-form-item>
        </t-collapse-panel>
        <t-collapse-panel header="鼠标提示">
          <t-form-item label="Markdown">
            <t-button @click="openCodeEdit('markdown')">...</t-button>
          </t-form-item>
          <t-form-item label="Mark 函数">
            <t-button @click="openCodeEdit('JavaScript')">...</t-button>
          </t-form-item>
        </t-collapse-panel>
      </t-collapse>
    </t-form>

    <pen-effect-custom-config :options="{visible: effectCustomVisible}" :model-value="editorPen"
                              @close="confirmFrames" @confirm="confirmFrames"/>

    <editor-code :visible="editorCodeVisible" :model-value="editorCodeValue" :language="editorCodeLanguage"
                 :options="editorCodeOptions" @close="closeEditorCode" @confirm="confirmEditorCode">
    </editor-code>
  </div>
</template>
<script setup lang="ts">
import {PropType, ref, watch} from "vue";
import {MessagePlugin} from "tdesign-vue-next";
import {IValue} from "@meta2d/core/src/pen";
import EditorCode from "../../edit-code/EditorCode.vue";
import {PauseIcon, PlayIcon, QueueIcon, StopIcon} from "tdesign-icons-vue-next";
import {Editor2DCanvas} from "../../core/editor2d";
import {Editor2DPen} from "../../core/editor2d-global-type";
import {globalEditor2DPen} from "../../core/editor2d-global-data";
import PenEffectCustomConfig from "../../props/pen-props/pen-effect-custom-config.vue";
import {ANIMATE_TYPE as animateType, CONFIG_LINE_DASH} from "../../core/editor2d-global-constant";

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
// 打开自定义节点动画
let effectCustomVisible = ref<boolean>(false);
// 打开代码编辑器
let editorCodeVisible = ref<boolean>(false);
let editorCodeValue = ref<any>();
let editorCodeLanguage = ref<string>('');
let editorCodeOptions = ref<any>({});

/**
 * 设置动效
 * @param props 图元选项
 */
function setOptionFunc(...props: Array<string>) {
  let locked = meta2d.store.data.locked;
  if (locked !== 0) {
    MessagePlugin.warning('当前状态非编辑状态不可编辑');
    return
  }
  let dataList: Array<IValue> = [];
  props.forEach(prop => {
    let penKey = prop;
    let penVal = (editorPen.value as any)[penKey];
    switch (prop) {
      case 'dash':
        CONFIG_LINE_DASH.map((_, v) => {
          if (penVal === v) {
            penKey = 'lineDash';
            penVal = JSON.parse(_.data);
          }
        });
        break;
      default:
        break;
    }

    dataList.push({
      id: editorPen.value.id,
      [penKey]: penVal
    });
  })

  if (dataList.length > 0) {
    dataList.forEach(data => {
      Object.assign(editorPen.value, data);
    })
    editor2DCanvas.setValue(dataList);
  }
}

/**
 * 选择动画
 * @param f 动画 key
 */
function changeAnimate(f: string) {
  let data = animateType.find((_: any) => _.key === f);
  if (data) {
    let {frames} = data;
    if (frames.length !== 0) {
      Object.assign(editorPen.value, {
        frames,
        duration: frames[0].duration,
      });
    }
    setOptionFunc('animateType', 'frames');
  }
}

/**
 * 开始播放动画
 */
function onPlay() {
  let penName = editorPen.value.name;
  if (penName === 'video') {
    meta2d.startVideo(editorPen.value.id);
  } else {
    meta2d.startAnimate(editorPen.value.id);
  }
}

/**
 * 暂停播放
 */
function onPause() {
  let penName = editorPen.value.name;
  if (penName === 'video') {
    meta2d.pauseVideo(editorPen.value.id);
  } else {
    meta2d.pauseAnimate(editorPen.value.id);
  }
}

/**
 * 结束动画
 */
function onStop() {
  let penName = editorPen.value.name;
  if (penName === 'video') {
    meta2d.stopVideo(editorPen.value.id);
  } else {
    meta2d.stopAnimate(editorPen.value.id);
  }
}

/**
 * 打开代码编辑器
 * @param language 语言
 */
function openCodeEdit(language: string) {
  if (language === 'markdown') {
    editorCodeValue.value = editorPen.value.title;
    editorCodeOptions.value = {
      prop: 'title',
      example: '',
    }
  } else {
    editorCodeValue.value = editorPen.value.titleFnJs;
    editorCodeOptions.value = {
      prop: 'titleFnJs',
    }
  }
  editorCodeLanguage.value = language
  editorCodeVisible.value = !editorCodeVisible.value;
}

/**
 * 关闭代码编辑器
 */
function closeEditorCode() {
  editorCodeOptions.value = {};
  editorCodeValue.value = '';
  editorCodeVisible.value = !editorCodeVisible.value;
}

/**
 * 代码编辑器内容改变事件
 * @param v 值
 * @param e 扩展
 */
const confirmEditorCode = (v: string, e: any) => {
  let pen = editorPen.value;
  if (pen) {
    (pen as any)[e.prop] = v;
    setOptionFunc(e.prop);
  }
  closeEditorCode();
}


/**
 * 打开编辑节点动画帧弹窗
 */
function openFrames() {
  effectCustomVisible.value = !effectCustomVisible.value;
}

/**
 * 确认编辑节点动画帧
 * @param frames 节点动画帧
 */
function confirmFrames(frames: any) {
  editorPen.value.frames = frames;
  setOptionFunc('frames');
  openFrames();
}

/**
 * 初始化
 * @param pen 图元
 */
function init(pen: Editor2DPen) {
  if (pen) {
    editorPen.value = pen;
    if (!editorPen.value.animateSpan) {
      editorPen.value.animateSpan = 1;
    }
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

<style scoped lang="less">

</style>