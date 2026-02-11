/*
 * @description: 2D编辑器属性面板
 * @author: MC.Yang
 */
import {Editor2DConfig, PropsTabsConfig} from "../core/editor2d-global-type";
import {globalEditor2DConfig} from "../core/editor2d-global-data";

/**
 * 2D编辑器属性面板菜单选项卡配置
 */
export const PROPS_TABS_CONFIG: PropsTabsConfig = {
    dragSort: true,
    activeKey: 'map_drawing_config',
    tabs: [
        {
            key: 'map_drawing_config',
            label: '图纸',
            title: '图纸',
            draggable: false,
        },
        {
            key: 'map_comm_config',
            label: '通信',
            title: '通信',
        },
        {
            key: 'pen_appearance_config',
            label: '外观',
            title: '外观',
            draggable: false,
        },
        {
            key: 'pen_event_config',
            label: '事件',
            title: '事件',
        },
        {
            key: 'pen_effect_config',
            label: '动效',
            title: '动效',
        },
        {
            key: 'pen_data_config',
            label: '数据',
            title: '数据',
        },
        {
            key: 'pen_multi_appearance_config',
            label: '外观',
            title: '外观',
        },
        {
            key: 'map_layout_config',
            label: '布局',
            title: '布局',
        },
        {
            key: 'map_structure_config',
            label: '结构',
            title: '结构',
        },
    ],
};

/**
 * 2D编辑器属性面板配置
 */
export const PROPS_CONFIG: Editor2DConfig = {
    key: 'sys-props-1',
    displayMenuTitle: globalEditor2DConfig.displayMenuTitle,
    displayMenuIcon: globalEditor2DConfig.displayMenuIcon,
    disabledTips: globalEditor2DConfig.disabledTips,
}
