<template>
  <div class="form-list">
    <t-form :label-align="options.labelAlign" :layout="options.layout">
      <t-form-item v-for="i in formListData" :label="i.title">
        <!-- 输入框 -->
        <t-input v-if="i.type && ['input','text'].includes(i.type)" v-model="(i.data as any)[i.value]"
                 :clearable="i.option?.clearable || true" :disabled="i.disabled"
                 :placeholder="i.option?.placeholder || '请输入'"
                 @[i.event]="i.action" :type="i.option?.type||'text'"/>
        <!-- 多行文本框 -->
        <t-textarea v-if="i.type==='textarea'" v-model="(i.data as any)[i.value]" :disabled="i.disabled"
                    :clearable="i.option?.clearable || true"
                    :maxlength="i.option?.maxlength || 1024" @[i.event]="i.action"
                    :placeholder="i.option?.placeholder || '请输入'"/>
        <!-- 数字框 -->
        <t-input-number v-else-if="i.type==='number'" v-model="(i.data as any)[i.value]"
                        :theme="i.option?.theme || 'column'" :disabled="i.disabled" :min="i.option?.min ?? -Infinity"
                        :max="i.option?.max ?? Infinity" :step="i.option?.step || 1"
                        :placeholder="i.option?.placeholder || '请输入'"
                        @[i.event]="i.action"/>
        <!-- 滑块 -->
        <t-slider v-else-if="i.type==='slider'" v-model="(i.data as any)[i.value]" :disabled="i.disabled"
                  :step="i.option?.step || 1" :min="i.option?.min ?? -Infinity" :max="i.option?.max ?? Infinity"
                  @[i.event]="i.action"/>
        <!-- 选择框 -->
        <t-select v-else-if="i.type==='select'" v-model="(i.data as any)[i.value]" :disabled="i.disabled"
                  :clearable="i.option?.clearable || true"
                  :placeholder="i.option?.placeholder"
                  @[i.event]="i.action">
          <t-option
              v-for="item in i.option?.list"
              :key="item.key || item.value"
              :label="item.label"
              :value="item.value"
              :disabled="item.disabled"
          >
            <div v-if="item.template" class="select_template" v-html="item.template"></div>
          </t-option>
        </t-select>
        <!-- 取色器 -->
        <t-color-picker v-else-if="i.type === 'color'" v-model="(i.data as any)[i.value]" :disabled="i.disabled"
                        :clearable="i.option?.clearable || true" :show-primary-color-preview="false"
                        @[i.event]="i.action"/>
        <!-- 开关 -->
        <t-switch v-else-if="i.type==='switch'" v-model="(i.data as any)[i.value]" :disabled="i.disabled"
                  @[i.event]="i.action"/>
        <!-- 按钮 -->
        <t-button v-else-if="i.type === 'button'" :disabled="i.disabled" :type="i.option?.type"
                  @[i.event]="i.action">
          {{ i.option?.title }}
        </t-button>
        <!-- 代码 -->
        <t-button v-else-if="i.type === 'code'" :disabled="i.disabled" :type="i.option?.type"
                  @[i.event]="i.action" @click="openCodeEdit(i)">
          ...
        </t-button>
        <!-- 文件 -->
        <t-upload v-else-if="i.type === 'file'" v-model="i.value" :disabled="i.disabled"
                  :theme="i.option?.theme || 'image'" :accept="i.option?.accept || '*/*'"
                  :show-image-file-name="i.option?.showImageFileName || false"
                  @[i.event]="i.action"
                  :request-method="requestMethod"/>

      </t-form-item>
    </t-form>

    <code-edit :visible="editorCodeVisible" :model-value="editorCodeValue" :options="editorCodeOptions"
               @close="closeEditorCode" @confirm="confirmEditorCode">
    </code-edit>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from "vue";
import {UploadFile} from "tdesign-vue-next";
import CodeEdit from "../code-edit-box/CodeEdit.vue";
import {GenerateFormProps} from "./generate-form-type";

export default defineComponent({
  name: 'GenerateForm',
  components: {CodeEdit},
  props: GenerateFormProps,
  setup(props) {
    let formListData = props.modelValue;
    // 打开代码编辑器
    let editorCodeVisible = ref<boolean>(false);
    let editorCodeValue = ref<any>();
    let editorCodeOptions = ref<any>();

    if (formListData) {
      formListData.forEach(item => {
        if (item['type'] === 'file') {
          item.value = toFilePropType((item['data'] as any)[item['value']]);
        }
      })
    }

    /**
     * 打开代码编辑器
     * @param item 编辑项
     */
    function openCodeEdit(item: any) {
      editorCodeOptions.value = {
        title: item.option['title'],
        language: item.option['language'],
        example: item.option['placeholder'],
        prop: item.value
      };
      editorCodeValue.value = item.data[item.value];
      editorCodeVisible.value = !editorCodeVisible.value;
    }

    /**
     * 关闭代码编辑器
     */
    function closeEditorCode() {
      editorCodeValue.value = '';
      editorCodeOptions.value = {};
      editorCodeVisible.value = !editorCodeVisible.value;
    }

    /**
     * 代码编辑器内容改变事件
     * @param value 值
     * @param prop 属性
     */
    const confirmEditorCode = ({value, prop}: any) => {
      formListData?.forEach(item => {
        if (item.value === prop) {
          (item.data as any)[prop] = value;
        }
      })
      closeEditorCode();
    }


    /**
     * 文件上传
     * @param uploadFile 文件
     */
    function requestMethod(uploadFile: UploadFile) {
      let file = uploadFile.raw as Blob;
      let fileUrl = URL.createObjectURL(file);
      return new Promise((resolve) => {
        resolve({
          status: 'success',
          response: {
            url: fileUrl,
          },
        });
      });
    }

    /**
     * 转文件
     * @param url 文件地址
     */
    function toFilePropType(url: string | undefined) {
      if (url) {
        return [{
          url: url,
          status: 'success',
        }];
      }
      return [];
    }

    return {
      formListData,
      editorCodeVisible,
      editorCodeValue,
      editorCodeOptions,
      openCodeEdit,
      closeEditorCode,
      confirmEditorCode,
      requestMethod
    }
  }
})

</script>

<style scoped lang="less">
.form-list {
  margin: 0;
  padding: 0;
}
</style>