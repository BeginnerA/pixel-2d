<template>
  <t-select
    :value="currentLocale"
    :options="localeOptions"
    @change="handleLocaleChange"
    style="width: 120px"
    size="small"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { setLocale, getCurrentLocale, type LocaleType } from '@/i18n'

/** 当前语言 */
const currentLocale = computed(() => getCurrentLocale())

/** 语言选项 */
const localeOptions = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' },
]

/**
 * 切换语言
 * @param value 选中的语言
 */
function handleLocaleChange(value: string) {
  setLocale(value as LocaleType)
}
</script>
