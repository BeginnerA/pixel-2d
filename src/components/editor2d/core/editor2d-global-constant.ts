/*
 * @description: 2D编辑器全局默认声明
 * @author: MC.Yang
 */

/**
 * 事件动作枚举
 */
export enum EVENT_ACTION {
    Link,           // 打开链接
    SetProps,       // 更改属性
    StartAnimate,   // 执行动画
    PauseAnimate,   // 暂停动画
    StopAnimate,    // 停止动画
    JS,             // 执行JS代码
    GlobalFn,       // 执行全局函数
    Emit,           // 发送消息
    StartVideo,     // 播放视频
    PauseVideo,     // 暂停视频
    StopVideo,      // 停止视频
    SendPropData,   // 发送图元数据
    SendVarData,    // 发送绑定变量
}

/**
 * 锁定状态数据枚举
 */
export enum LOCK_STATE_DATA {
    // 0 -未锁定
    None,
    // 1 - 禁止编辑，隐藏大小、缩放、选中编辑框；可选中、高亮、移动、触发事件等
    DisableEdit,
    // 2 - 禁止编辑 + 移动；可选中、高亮、触发事件等
    DisableMove,
    // 3 - 禁止缩放（1.2.14版本以后）
    DisableScale,
    // 4 - 禁止移动和缩放（1.2.14版本以后）
    DisableMoveScale,
    // 10 - 不触发任何操作和事件
    Disable = 10,
}

/**
 * pen 类型枚举。0 - node；1 - line
 */
export enum PEN_TYPE {
    // 节点
    Node,
    // 连线
    Line,
}

/**
 * 渐变枚举
 */
export enum GRADIENT {
    None,   // 没有渐变
    Linear, // 线性渐变
    Radial, // 发散渐变
}

/**
 * 配置连线样式
 */
export const CONFIG_LINE_DASH = [
    {
        label: '直线',
        template: `
          <svg xmlns="http://www.w3.org/2000/svg" version="1.1" style="height: 20px;width: 80px;">
            <g fill="none" stroke="black" stroke-width="1">
              <path d="M0 9 l85 0"></path>
            </g>
          </svg>`,
        value: 0,
        data: '[0,0]',
    },
    {
        label: '虚线',
        template: `
          <svg xmlns="http://www.w3.org/2000/svg" version="1.1" style="height: 20px;width: 80px;">
            <g fill="none" stroke="black" stroke-width="1">
              <path stroke-dasharray="5 5" d="M0 9 l85 0"></path>
            </g>
          </svg>`,
        value: 1,
        data: '[5, 5]',
    },
    {
        label: '长虚线',
        template: `
          <svg xmlns="http://www.w3.org/2000/svg" version="1.1" style="height: 20px;width: 80px;">
            <g fill="none" stroke="black" stroke-width="1">
              <path stroke-dasharray="10 10" d="M0 9 l85 0"></path>
            </g>
          </svg>`,
        value: 2,
        data: '[10, 10]',
    },
    {
        label: '点横线',
        template: `
          <svg xmlns="http://www.w3.org/2000/svg" version="1.1" style="height: 20px;width: 80px;">
            <g fill="none" stroke="black" stroke-width="1">
              <path stroke-dasharray="10 10 2 10" d="M0 9 l85 0"></path>
            </g>
          </svg>`,
        value: 3,
        data: '[10, 10, 2, 10]',
    }
]

/**
 * 渐变类型
 */
export const GRADIENT_TYPE = [
    {
        label: '没有渐变',
        value: GRADIENT.None,
    },
    {
        label: '线性渐变',
        value: GRADIENT.Linear,
    },
    {
        label: '发散渐变',
        value: GRADIENT.Radial,
    },
]

/**
 * 事件类型
 * 'enter' | 'leave' | 'active' | 'inactive' | 'click' | 'mousedown' | 'mouseup' |
 * 'dblclick' | 'valueUpdate' | 'message' | 'contextmenu' | 'input' | 'change'
 */
export const EVENT_TYPE = [
    {
        name: '鼠标进入',
        value: 'enter',
    },
    {
        name: '鼠标离开',
        value: 'leave',
    },
    {
        name: '选中',
        value: 'active',
    },
    {
        name: '取消选中',
        value: 'inactive',
    },
    {
        name: '单击',
        value: 'click',
    },
    {
        name: '双击',
        value: 'dblclick',
    },
    {
        name: '鼠标按下',
        value: 'mousedown',
    },
    {
        name: '鼠标抬起',
        value: 'mouseup',
    },
    {
        name: '值变化',
        value: 'valueUpdate',
    },
]


/**
 * 事件行为
 */
export const EVENT_BEHAVIOR = [
    {
        name: '打开链接',
        value: EVENT_ACTION.Link,
    },
    {
        name: '更改属性',
        value: EVENT_ACTION.SetProps,
    },
    {
        name: '执行动画',
        value: EVENT_ACTION.StartAnimate,
    },
    {
        name: '暂停动画',
        value: EVENT_ACTION.PauseAnimate,
    },
    {
        name: '停止动画',
        value: EVENT_ACTION.StopAnimate,
    },
    {
        name: '执行JS代码',
        value: EVENT_ACTION.JS,
    },
    {
        name: '执行全局函数',
        value: EVENT_ACTION.GlobalFn,
    },
    {
        name: '发送消息',
        value: EVENT_ACTION.Emit,
    },
    {
        name: '播放视频',
        value: EVENT_ACTION.StartVideo,
    },
    {
        name: '暂停视频',
        value: EVENT_ACTION.PauseVideo,
    },
    {
        name: '停止视频',
        value: EVENT_ACTION.StopVideo,
    },
    {
        name: '发送图元数据',
        value: EVENT_ACTION.SendPropData,
    },
    {
        name: '发送绑定变量',
        value: EVENT_ACTION.SendVarData,
    }
]

/**
 * 动画类型
 */
export const ANIMATE_TYPE = [
    {
        name: '上下跳动',
        key: 'upDown',
        frames: [
            {
                duration: 100,
                y: -10
            }, {
                duration: 80,
                y: 10
            }, {
                duration: 50,
                y: -10
            }, {
                duration: 30,
                y: 10
            }, {
                duration: 300,
                y: 0
            }
        ]
    },
    {
        name: '左右跳动',
        key: 'leftRight',
        frames: [
            {
                duration: 100,
                x: -10
            }, {
                duration: 80,
                x: 10
            }, {
                duration: 50,
                x: -10
            }, {
                duration: 30,
                x: 10
            }, {
                duration: 300,
                x: 0
            }
        ]
    },
    {
        name: '心跳',
        key: 'heart',
        frames: [
            {
                duration: 100,
                scale: 1.1
            },
            {
                duration: 400,
                scale: 1
            }
        ],
    },
    {
        name: '成功',
        key: 'success',
        frames: [
            {
                background: "#389e0d22",
                color: "#237804",
                duration: 500
            }
        ],
    },
    {
        name: '警告',
        key: 'warning',
        frames: [
            {
                color: "#fa8c16",
                duration: 300,
                lineDash: [10, 10]
            },
            {
                color: "#fa8c16",
                duration: 500
            },
            {
                color: "#fa8c16",
                duration: 300,
                lineDash: [10, 10]
            }
        ],
    },
    {
        name: '错误',
        key: 'error',
        frames: [
            {
                background: "#cf132222",
                color: "#cf1322",
                duration: 100
            }
        ],
    },
    {
        name: '炫耀',
        key: 'show',
        frames: [
            {
                color: "#fa541c",
                duration: 100,
                rotate: -10
            },
            {
                color: "#fa541c",
                duration: 100,
                rotate: 10
            },
            {
                color: "#fa541c",
                duration: 100,
                rotate: 0
            }
        ],
    },
    {
        name: "跳动",
        key: "bounce",
        frames: [{
            duration: 300,
            y: 10
        }
        ]
    },
    {
        name: "旋转",
        key: "rotate",
        frames: [{
            duration: 1000,
            rotate: 360
        }]
    },
    {
        name: "提示",
        key: "tip",
        frames: [{
            duration: 300,
            scale: 1.3
        }]
    },
    {
        name: '自定义',
        key: 'custom',
        frames: [],
    }
]

/**
 * 字体
 */
export const FONT_FAMILY = [
    {
        name: 'serif',
        value: 'serif',
    },
    {
        name: 'sans-serif',
        value: 'sans-serif',
    },
    {
        name: 'monospace',
        value: 'monospace',
    },
    {
        name: 'cursive',
        value: 'cursive',
    },
    {
        name: 'fantasy',
        value: 'fantasy',
    },
    {
        name: 'system-ui',
        value: 'system-ui',
    },
    {
        name: 'emoji',
        value: 'emoji',
    },
    {
        name: 'math',
        value: 'math',
    },
    {
        name: 'fangsong',
        value: 'fangsong',
    },
    {
        name: '宋体',
        value: '宋体',
    },
    {
        name: '微软雅黑',
        value: '微软雅黑',
    },
    {
        name: '黑体',
        value: '黑体',
    },
    {
        name: '楷体',
        value: '楷体',
    }
]
