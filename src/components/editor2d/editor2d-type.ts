/*
 * @description 2D编辑器
 * @author MC.Yang
 */

import { PropType } from 'vue'
import { Editor2DPropsMenu } from './core/editor2d-global-type'

export interface Options {
  enableBasicsPen?: boolean
  enableEchartsPen?: boolean
  extendPen?: Array<Editor2DPropsMenu>
}

export const Editor2DProps = {
  displayMenuTitle: {
    type: Boolean as PropType<boolean>,
    default: true,
  },
  displayMenuIcon: {
    type: Boolean as PropType<boolean>,
    default: true,
  },
  disabledTips: {
    type: String as PropType<string>,
    default: '（已禁用）',
  },
  options: {
    type: Object as PropType<Options>,
    default() {
      return {
        enableBasicsPen: true,
        enableEchartsPen: true,
        extendPen: [],
      }
    },
  },
}
