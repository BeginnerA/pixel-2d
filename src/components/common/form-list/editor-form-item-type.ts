/*
 * @description: 表单编辑
 * @author: MC.Yang
 */

import {PropType} from "vue";
import {DrawerProps} from "tdesign-vue-next/es/drawer";

export interface Options extends DrawerProps {

}

/**
 * 编辑表单项
 */
export interface EditFormItem {
    key?: string | number;
    value?: any;
    title?: string;
    icon?: string;
    type?: string;
    activeState?: boolean;
    disabled?: boolean;
    show?: boolean;
    option?: {
        title?: string,
        clearable?: string,
        placeholder?: string,
        type?: string,
        theme?: string,
        accept?: string,
        showImageFileName?: boolean,
        maxlength?: number,
        min?: number,
        max?: number,
        step?: number,
        precision?: number,
        list?: Array<any>,
    };
    data?: {};
    action?: string | Function;
    event?: string;
}

/**
 * 表单配置选项
 */
export const FormItemProps = {
    modelValue: {
        type: Object as PropType<EditFormItem>,
        default: {}
    },
    event: {
        type: String as PropType<string>,
        default: ''
    },
    options: {
        type: Object as PropType<Options>,
        default() {
            return {
                header: '编辑数据',
                visible: false,
            }
        }
    },
}
