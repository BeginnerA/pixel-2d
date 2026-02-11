<template>
  <div class="editor2d-edit-code">
    <t-dialog :header="ceProps.title || ceProps.language" width="60%"
              :visible="ceProps.visible"
              :destroy-on-close="true"
              :close-btn="true"
              @close="onCancel"
              @confirm="onConfirm"
    >
      <code-edit-box v-model="value" :language="ceProps.language" height="500px" @change="handleChange">
        <template v-if="Object.keys($slots).length > 0" v-for="(value, key) in $slots" #[key]="slotProps" :key="key">
          <slot :name="key" :value="value" v-bind="slotProps"></slot>
        </template>
        <template v-else #footer>
          <span v-html="example"/>
        </template>
      </code-edit-box>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import {PropType, ref, watch} from "vue";
import CodeEditBox from "./CodeEditBox.vue";

interface Props {
  value?: string;
  visible?: boolean;
  title?: string;
  language?: string;
  example?: string;
  extend?: any;
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
    }
  },
});

let ceProps = ref<Props>({
  value: undefined,
  visible: undefined,
  title: undefined,
  language: undefined,
  example: undefined,
  extend: undefined,
});
let value = defineModel<string>();
let example = ref<string>();

const handleChange = (v: any) => {
  ceProps.value.value = v;
}

/**
 * 注册事件
 */
const emit = defineEmits(['confirm', 'close']);

/**
 * 确认
 */
const onConfirm = () => {
  emit('confirm', ceProps.value);
};

/**
 * 关闭
 */
const onCancel = () => {
  emit('close');
};

watch(
    () => props.modelValue,
    (newValue) => {
      ceProps.value.value = newValue;
    },
    {immediate: true},
)

watch(
    () => props.visible,
    (newVisible) => {
      ceProps.value.visible = newVisible;
    },
    {immediate: true},
)

watch(
    () => props.title,
    (newTitle) => {
      ceProps.value.title = newTitle;
    },
    {immediate: true},
)

watch(
    () => props.language,
    (newLanguage) => {
      ceProps.value.language = newLanguage;
    },
    {immediate: true},
)

watch(
    () => props.options,
    (newOptions) => {
      Object.assign(ceProps.value, newOptions);
      example.value = newOptions.example;
    },
    {immediate: true},
)

</script>