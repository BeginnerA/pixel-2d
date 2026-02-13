/*
 * @description 2D编辑器图元库
 * @author MC.Yang
 */
import { Editor2DConfig, PropsTabsConfig } from '../core/editor2d-global-type'
import { globalEditor2DConfig } from '../core/editor2d-global-data'

/**
 * 2D编辑器图形库菜单选项卡配置
 */
export const GRAPHICS_TABS_CONFIG: PropsTabsConfig = {
  dragSort: true,
  activeKey: 'sys_component',
  tabs: [
    {
      key: 'drawing_manage',
      label: '图纸',
      title: '图纸',
      draggable: false,
    },
    {
      key: 'sys_component',
      label: '系统组件',
      title: '系统组件',
    },
    {
      key: 'my_component',
      label: '我的组件',
      title: '我的组件',
    },
  ],
}

/**
 * 2D编辑器图形库配置
 */
export const GRAPHICS_CONFIG: Editor2DConfig = {
  key: 'sys-children-1',
  displayMenuTitle: globalEditor2DConfig.displayMenuTitle,
  displayMenuIcon: globalEditor2DConfig.displayMenuIcon,
  disabledTips: globalEditor2DConfig.disabledTips,
}
