<template>
  <div class="editor-form-item">
    <t-drawer v-model:visible="options.visible" :header="options.header || '编辑数据'" :on-confirm="onFormConfirm"
              @close="onFormClose">
      <t-form ref="form" :data="editItemModel" :rules="formRules" label-align="left">
        <t-form-item label="显示名称" name="title">
          <t-input v-model:value="editItemModel.title" placeholder="请输入名称"/>
        </t-form-item>
        <t-form-item label="属性名" name="key">
          <t-input v-model:value="editItemModel.key" placeholder="请输入属性"/>
        </t-form-item>
        <t-form-item label="类型" name="type">
          <t-select v-model:value="editItemModel.type" placeholder="请选择类型">
            <t-option value="text" label="文本"/>
            <t-option value="number" label="数字"/>
            <t-option value="color" label="颜色"/>
            <t-option value="textarea" label="多行文本"/>
            <t-option value="select" label="下拉框"/>
            <t-option value="switch" label="开关"/>
            <t-option value="slider" label="滑块"/>
            <t-option value="code" label="JSON"/>
          </t-select>
        </t-form-item>
        <template v-if="editItemModel.type
        && ['text','number','color','textarea','switch','code','slider',].includes(editItemModel.type)">
          <t-form-item label="提示文字" name="placeholder">
            <t-input v-model:value="(editItemModel.option as any)['placeholder']"/>
          </t-form-item>
        </template>
        <template v-if="editItemModel.type == 'select'">
          <table class="set-select-table">
            <thead>
            <tr>
              <td>label</td>
              <td>key</td>
              <td>value</td>
              <td>
                <AddCircleIcon @click="addSelectNode"/>
              </td>
            </tr>
            </thead>
            <tbody>
            <template v-for="(item, i) in (editItemModel.option as any)['list']" :key="i">
              <tr>
                <td>
                  <t-input v-model:value="item.label" placeholder="显示名称" size="small" style="width: 80px"/>
                </td>
                <td>
                  <t-input v-model:value="item.key" placeholder="key" size="small" style="width: 50px"/>
                </td>
                <td>
                  <t-input v-model:value="item.value" placeholder="值" size="small" style="width: 80px"/>
                </td>
                <td>
                  <CloseCircleIcon @click="onDeleteSelectNode(i)"/>
                </td>
              </tr>
            </template>
            </tbody>
          </table>
        </template>
        <template v-if="editItemModel.type && ['input', 'text', 'textarea'].includes(editItemModel.type)">
          <t-form-item label="最大长度">
            <t-input-number v-model:value="(editItemModel.option as any)['maxlength']"/>
          </t-form-item>
        </template>
        <template v-if="editItemModel.type && ['number', 'slider'].includes(editItemModel.type)">
          <t-form-item label="最小值">
            <t-input-number v-model:value="(editItemModel.option as any)['min']"/>
          </t-form-item>
          <t-form-item label="最大值">
            <t-input-number v-model:value="(editItemModel.option as any)['max']"/>
          </t-form-item>
          <t-form-item label="步长">
            <t-input-number v-model:value="(editItemModel.option as any)['step']"/>
          </t-form-item>
          <t-form-item label="精度">
            <t-input-number v-model:value="(editItemModel.option as any)['precision']"/>
          </t-form-item>
        </template>
      </t-form>
    </t-drawer>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref, watch} from 'vue';
import {DrawerProps, FormInstanceFunctions, MessagePlugin} from 'tdesign-vue-next';
import {AddCircleIcon, CloseCircleIcon} from "tdesign-icons-vue-next";
import {EditFormItem, FormItemProps} from "./editor-form-item-type";

export default defineComponent({
  name: 'EditorFormItem',
  components: {CloseCircleIcon, AddCircleIcon},
  props: FormItemProps,
  emits: ['confirm', 'close'],
  setup(props, {emit}) {
    let form = ref<FormInstanceFunctions>();
    let formRules = {key: [{required: true, message: '属性名必填'}]};
    let oldType: string = '';
    let editItemModel = ref<EditFormItem>(init());
    if (props.modelValue.key) {
      editItemModel.value = props.modelValue;
    }
    if (editItemModel.value && props.event) {
      editItemModel.value.event = props.event;
    }

    /**
     * 添加选择框选项内容
     */
    function addSelectNode() {
      let editItem = editItemModel.value;
      if (editItem && editItem.type === 'select' && editItem.option) {
        let node = {
          label: '',
          key: '',
          value: '',
        };
        if (editItem.option.list) {
          editItem.option.list.push(node);
        } else {
          editItem.option.list = [node];
        }
      }
    }

    /**
     * 删除选择框选项内容
     * @param index 索引
     */
    function onDeleteSelectNode(index: number) {
      let editItem = editItemModel.value;
      if (editItem && editItem.type === 'select' && editItem.option) {
        if (editItem.option.list) {
          editItem.option.list.splice(index, 1);
        }
      }
    }

    /**
     * 确认编辑表单
     */
    const onFormConfirm: DrawerProps['onConfirm'] = () => {
      if (form.value) {
        form.value.validate().then((validateResult) => {
          if (validateResult && Object.keys(validateResult).length) {
            let firstError = Object.values(validateResult)[0]?.[0]?.message;
            MessagePlugin.warning(firstError);
          } else {
            let editItem = editItemModel.value;
            if (editItem) {
              let valueKey = editItem.key as string;
              let val = undefined;
              if (editItem.type === oldType) {
                val = (editItem.data as any)[editItem.value];
              }
              editItem.value = valueKey;
              editItem.data = {
                [valueKey]: val
              }
            }
            emit('confirm', editItem);
            editItemModel.value = {};
            props.options.visible = false;
          }
        });
      }
    };

    /**
     * 关闭编辑表单
     */
    const onFormClose: DrawerProps['onClose'] = () => {
      emit('close');
      editItemModel.value = {};
      props.options.visible = false;
    };

    /**
     * 初始化
     */
    function init(): EditFormItem {
      return {
        key: undefined,
        value: '',
        title: '',
        type: '',
        option: {
          placeholder: '',
          min: undefined,
          max: undefined,
          step: undefined,
          precision: undefined,
          maxlength: undefined,
          list: [],
        },
        data: {},
      }
    }

    watch(
        () => props.modelValue,
        (newValue) => {
          if (newValue.key) {
            oldType = newValue.type as string;
            editItemModel.value = newValue;
          } else {
            editItemModel.value = init();
          }
        }
    )

    return {
      form,
      formRules,
      editItemModel,
      addSelectNode,
      onDeleteSelectNode,
      onFormConfirm,
      onFormClose
    };
  }
})
</script>

<style scoped>
.editor-form-item {
  margin: 0;
  padding: 0;
}

.set-select-table {
  width: 100%;
  margin: 0 0 12px;

  thead, tbody {
    tr {
      td {
        font-size: 12px;
        color: #000000d9;

        &:first-child,
        &:nth-child(2) {
          padding-left: 11px;
        }

        &:last-child {
          text-align: right;
        }
      }
    }
  }

  tbody {
    tr {
      td {
        padding: 6px 0;
      }
    }
  }
}
</style>