/*
 * @description: 代码编辑器类型定义
 * @author: MC.Yang
 */
import {PropType} from "vue";
import {FormProps} from "tdesign-vue-next/es/form";
import {TNode} from "tdesign-vue-next/es/common";

export interface Options extends FormProps {

}

/**
 * 表单数据
 */
export interface FormData {
    key?: string | number;
    value?: any;
    title?: string | TNode;
    icon?: string | TNode;
    type?: string;
    activeState?: boolean;
    disabled?: boolean;
    show?: boolean;
    isCommon?: boolean;
    option?: {
        title?: string,
        language?: string,
        clearable?: boolean,
        placeholder?: string,
        type?: string,
        theme?: string,
        accept?: string,
        showImageFileName?: boolean,
        maxlength?: number,
        min?: number,
        max?: number,
        step?: number,
        list?: Array<any>,
    };
    data?: {};
    action?: string | Function;
    event?: string;
    children?: Array<FormData>;
}

export const GenerateFormProps = {
    modelValue: {
        type: Array as PropType<Array<FormData | any>>,
        default() {
            return []
        }
    },
    options: {
        type: Object as PropType<Options>,
        default() {
            return {
                labelAlign: 'left',
                layout: 'vertical',
            }
        }
    },
}
