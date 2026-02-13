<template>
  <div class="editor2d-edit-code">
    <t-dialog
      :header="props.title || props.language"
      width="60%"
      :visible="props.visible"
      :destroy-on-close="true"
      :close-btn="true"
      @close="onCancel"
      @confirm="onConfirm"
    >
      <code-edit-box v-model="value" :language="props.language" height="350px" @change="handleChange">
        <template #footer>
          <span v-if="example" v-html="example" />
          <span v-else-if="example === ''" />
          <span v-else>
            打开图纸后，执行的初始脚本。 <br />
            可获取pen和context参数 <br />
            例如：return `${pen.name}:${pen.text}`;
          </span>
        </template>
        <!--        <template v-for="(value, key) in $slots" #[key]="slotProps" :key="key">-->
        <!--          <slot :name="key" v-bind="slotProps"></slot>-->
        <!--        </template>-->
      </code-edit-box>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import { onMounted, PropType, ref, watch } from 'vue'
import CodeEditBox from '../../common/code-edit-box/CodeEditBox.vue'

interface Props {
  example?: string
  extend?: any
}

let props = defineProps({
  modelValue: {
    type: String as PropType<string>,
    default: '',
  },
  visible: {
    type: Boolean as PropType<boolean>,
    required: true,
    default: false,
  },
  title: {
    type: String as PropType<string>,
    default: '',
  },
  language: {
    type: String as PropType<string>,
    default: 'JavaScript',
  },
  options: {
    type: Object as PropType<Props>,
    default() {
      return {}
    },
  },
})

let value = defineModel<string>()
let example = ref<string>()
let editorValue = ref<string>()

const handleChange = (v: any) => {
  editorValue.value = v
}

/**
 * 注册事件
 */
const emit = defineEmits(['confirm', 'close'])

/**
 * 确认
 */
const onConfirm = () => {
  emit('confirm', editorValue.value, props.options)
}

/**
 * 关闭
 */
const onCancel = () => {
  emit('close')
}

/**
 * 初始化
 */
function init() {
  editorValue.value = props.modelValue
  example.value = props.options.example
}

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      editorValue.value = newValue
    }
  },
  { immediate: true }
)

watch(
  () => props.options,
  (newOptions) => {
    if (newOptions) {
      example.value = props.options.example
    }
  },
  { immediate: true }
)

onMounted(() => {
  init()
})
</script>
