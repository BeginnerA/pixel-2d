/*
 * @description: 2D编辑器全局类型声明
 * @author: MC.Yang
 */
import {TNode} from "tdesign-vue-next/es/common";
import {Options, Pen, Point} from '@meta2d/core';
import {Event} from "@meta2d/core/src/event/event";
import {Meta2dData} from "@meta2d/core/src/store";


/**
 * 2D编辑器配置
 */
export interface Editor2DConfig {
    // key
    key?: string | number;
    // 显示菜单标题
    displayMenuTitle?: boolean;
    // 显示菜单图标
    displayMenuIcon?: boolean;
    // 禁用提示词
    disabledTips?: string;
}

/**
 * 2D编辑器菜单
 */
export interface Editor2DPropsMenu {
    // key
    key?: string | number;
    // 值
    value?: any;
    // 标题
    title?: string | TNode;
    // 图标
    icon?: string;
    // 类型
    type?: string;
    // 活动状态
    activeState?: boolean;
    // 是否禁用
    disabled?: boolean;
    // 是否显示
    show?: boolean;
    // 是常见的
    isCommon?: boolean;
    // 选项
    option?: {
        title?: string,
        language?: string,
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
        list?: Array<any>,
    };
    // 数据
    data?: {};
    // 功能
    action?: string | Function;
    // 事件
    event?: string;
    // 子项
    children?: Array<Editor2DPropsMenu>;
}

/**
 * 2D编辑器菜单选项卡配置
 */
export interface PropsTabsConfig {
    // 可拖拽
    dragSort?: boolean;
    // 激活的 key
    activeKey?: string | number;
    // tabs
    tabs?: Array<PropsTab>;
}

/**
 * 2D编辑器菜单选项卡
 */
export interface PropsTab {
    // key
    key?: string | number;
    // 标签
    label?: string | TNode;
    // 标题
    title?: string | TNode;
    // 可拖拽
    draggable?: boolean;
}

/**
 * 2D 编辑器数据
 */
export interface Editor2DData extends Meta2dData {
    // 文件夹
    folder?: string | number;
    // 文件类型
    fileType?: string | number;
    // 图纸配置项
    mapProps?: Editor2DOptions;
    // WebSocket 配置
    socketConfig?: Editor2DWebSocket;
    // Editor2DMqtt 配置
    mqttConfig?: Editor2DMqtt;
    // HTTP 配置
    httpConfig?: Array<Editor2DHttp>;
}

/**
 * 2D 编辑器点
 */
export interface Editor2DPoint extends Point {

}

/**
 * WebSocket 配置
 */
export interface Editor2DWebSocket {
    url?: string
}

/**
 * MQTT 配置
 */
export interface Editor2DMqtt {
    // MQTT 地址
    mqtt?: string,
    // MQTT 订阅主题
    mqttTopics?: string,
    mqttOptions?: {
        // 客户端 ID
        clientId?: string,
        // 用户名
        username?: string,
        // 密码
        password?: string,
        // ture - clientId 不变；false - clientId 随机，避免相同连接 clientId 冲突
        customClientId?: boolean,
    },
}

/**
 * HTTP 配置
 */
export interface Editor2DHttp {
    // 地址
    http?: string,
    // 方法
    method?: string,
    // 轮询间隔时间
    httpTimeInterval?: number,
    // 请求头设置
    httpHeaders?: Object,
}

/**
 * 编辑器属性
 */
export interface Editor2DOptions extends Options {
    // 画笔填充颜色
    penBackground?: string;
    // 背景图片
    backGroundImage?: string;
    // 网格旋转角度
    gridRotate?: number;
}

/**
 * 编辑器图元
 */
export interface Editor2DPen extends Pen {
    // 线条样式
    dash?: string | number;
    // 动画类型
    animateType?: string;
    // 图元描述
    description?: string;
}

/**
 * 事件
 */
export interface Editor2DEvent extends Event {
    // 全景图地址
    panoramaUrl?: string;
}
