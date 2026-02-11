/*
 * @description: 2D编辑器图形组件数据
 * @author: MC.Yang
 */
import {ReplaceMode} from "@meta2d/chart-diagram";
import {Editor2DPropsMenu} from "./editor2d-global-type.ts";

/**
 * 获取格式化后的时间（YYYY-MM-DD HH:mm:ss）
 * @param date 时间（默认当前时间）
 */
function formatCurrentTime(date: Date = new Date()): string {
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');
    let hours = date.getHours().toString().padStart(2, '0');
    let minutes = date.getMinutes().toString().padStart(2, '0');
    let seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * meta2d 默认图形组件数据
 */
const DEFAULT_GRAPHIC_GROUPS: Array<Editor2DPropsMenu> = [
    {
        key: 'default-graphic-1',
        title: '基本形状',
        children: [
            {
                key: 'default-graphic-1-1',
                title: '正方形',
                icon: 'l-rect',
                data: {
                    width: 100,
                    height: 100,
                    name: 'square',
                    text: '正方形',
                },
            },
            {
                key: 'default-graphic-1-2',
                title: '矩形',
                icon: 'l-rectangle',
                data: {
                    width: 200,
                    height: 50,
                    borderRadius: 0.1,
                    name: 'rectangle',
                    text: '矩形',
                },
            },
            {
                key: 'default-graphic-1-3',
                title: '圆',
                icon: 'l-circle',
                data: {
                    width: 100,
                    height: 100,
                    name: 'circle',
                    text: '圆',
                },
            },
            {
                key: 'default-graphic-1-4',
                title: '三角形',
                icon: 'l-triangle',
                data: {
                    width: 100,
                    height: 100,
                    name: 'triangle',
                    text: '三角形',
                },
            },
            {
                key: 'default-graphic-1-5',
                title: '菱形',
                icon: 'l-diamond',
                data: {
                    width: 100,
                    height: 100,
                    name: 'diamond',
                    text: '菱形',
                },
            },
            {
                key: 'default-graphic-1-6',
                title: '五边形',
                icon: 'l-pentagon',
                data: {
                    width: 100,
                    height: 100,
                    name: 'pentagon',
                    text: '五边形',
                },
            },
            {
                key: 'default-graphic-1-7',
                title: '六边形',
                icon: 'l-hexagon',
                data: {
                    width: 100,
                    height: 100,
                    name: 'hexagon',
                    text: '六边形',
                },
            },
            {
                key: 'default-graphic-1-8',
                title: '五角星',
                icon: 'l-pentagram',
                data: {
                    width: 100,
                    height: 100,
                    name: 'pentagram',
                    text: '五角星',
                },
            },
            {
                key: 'default-graphic-1-9',
                title: '左箭头',
                icon: 'l-arrow-left',
                data: {
                    width: 120,
                    height: 60,
                    name: 'leftArrow',
                    text: '左箭头',
                },
            },
            {
                key: 'default-graphic-1-10',
                title: '右箭头',
                icon: 'l-arrow-right',
                data: {
                    width: 120,
                    height: 60,
                    name: 'rightArrow',
                    text: '右箭头',
                },
            },
            {
                key: 'default-graphic-1-11',
                title: '双向箭头',
                icon: 'l-twoway-arrow',
                data: {
                    width: 150,
                    height: 60,
                    name: 'twowayArrow',
                    text: '双向箭头',
                },
            },
            {
                key: 'default-graphic-1-12',
                title: '云',
                icon: 'l-cloud',
                data: {
                    width: 100,
                    height: 100,
                    name: 'cloud',
                    text: '云',
                },
            },
            {
                key: 'default-graphic-1-13',
                title: '消息框',
                icon: 'l-msg',
                data: {
                    textTop: -0.1,
                    width: 100,
                    height: 100,
                    name: 'message',
                    text: '消息框',
                },
            },
            {
                key: 'default-graphic-1-14',
                title: '文件',
                icon: 'l-file',
                data: {
                    width: 80,
                    height: 100,
                    name: 'file',
                    text: '文件',
                },
            },
            {
                key: 'default-graphic-1-15',
                title: '立方体',
                icon: 'l-cube',
                data: {
                    width: 60,
                    height: 100,
                    name: 'cube',
                    text: '立方体',
                    z: 0.25,
                    props: {
                        custom: [{
                            key: 'z',
                            label: 'Z',
                            type: 'number',
                            min: 0,
                            placeholder: '<= 1 即宽度的比例',
                        }, {
                            key: 'backgroundFront',
                            label: '前背景色',
                            type: 'color',
                        }, {
                            key: 'backgroundUp',
                            label: '顶背景色',
                            type: 'color',
                        }, {
                            key: 'backgroundRight',
                            label: '右背景色',
                            type: 'color',
                        }],
                    },
                },
            },
            {
                key: 'default-graphic-1-16',
                title: '人',
                icon: 'l-people',
                data: {
                    width: 70,
                    height: 100,
                    name: 'people',
                    text: '人',
                },
            },
            {
                key: 'default-graphic-1-17',
                title: '文本',
                icon: 'l-text',
                data: {
                    height: 30,
                    name: "text",
                    text: "文本内容",
                    width: 160,
                },
            },
            {
                key: 'default-graphic-1-18',
                title: 'iframe',
                icon: 'l-iframe',
                data: {
                    externElement: true,
                    name: "iframe",
                    iframe: 'https://blog.csdn.net/qq_39035773',
                    width: 160,
                    height: 100,
                },
            },
            {
                key: 'default-graphic-1-19',
                title: '图片',
                icon: 'l-image',
                data: {
                    width: 100,
                    height: 100,
                    name: 'image',
                    image: "https://assets.le5lecdn.com/2d/img/logo.png",
                },
            },
            {
                key: 'default-graphic-1-20',
                title: '视频',
                icon: 'video',
                data: {
                    name: 'video',
                    width: 100,
                    height: 100,
                    video: 'https://video.699pic.com/videos/17/69/11/a_aa3jeKZ0D63g1556176911_10s.mp4',
                    autoPlay: true,
                },
            },
        ],
    },
    {
        key: 'default-graphic-2',
        title: '表单',
        children: [
            {
                key: 'default-graphic-2-1',
                title: '按钮',
                icon: 'iconfont icon-buy-button',
                data: {
                    name: "rectangle",
                    width: 80,
                    height: 30,
                    borderRadius: 0.2,
                    text: "按钮",
                    background: "#1890ff",
                    color: "#1890ff",
                    textColor: "#fff",
                    activeBackground: "#40a9ff", //选中
                    activeColor: "#40a9ff",
                    activeTextColor: "#fff",
                    hoverBackground: "#40a9ff", //鼠标经过
                    hoverColor: "#40a9ff",
                    hoverTextColor: "#fff",
                }
            },
            {
                key: 'default-graphic-2-2',
                title: '开关',
                icon: 'iconfont icon-switchButton',
                data: {
                    name: 'switch',
                    height: 30,
                    width: 60,
                    checked: false,
                    offColor: "#BFBFBF",
                    onColor: "#1890ff",
                    disableOffColor: "#E5E5E5",
                    disableOnColor: "#A3D3FF",
                    locked: 0,
                },
            },
            {
                // https://doc.le5le.com/document/119756343#radio%20%E5%8D%95%E9%80%89%E6%A1%86
                key: 'default-graphic-2-3',
                title: '单选框',
                icon: 'iconfont icon-danxuanzu',
                data: {
                    name: 'radio',
                    text: '单选框',
                    width: 150,
                    height: 100,
                    direction: "vertical",
                    checked: '',
                    options: [
                        {text: "选项一"},
                        {text: "选项二"},
                        {text: "选项三", isForbidden: true},
                    ],
                },
            },
            {
                key: 'default-graphic-2-4',
                title: '多选框',
                icon: 'iconfont icon-md-checkbox-outline',
                data: {
                    name: "checkbox",
                    text: '多选框',
                    width: 30,
                    height: 30,
                    checked: true,
                    value: '选项一',
                }
            },
            {
                key: 'default-graphic-2-5',
                title: '滑动输入条',
                icon: 'iconfont icon-sliders-h',
                data: {
                    name: "slider",
                    text: '滑动输入条',
                    width: 300,
                    height: 30,
                    value: 10,
                    textWidth: 50,
                    barHeight: 4,
                    min: 0,
                    max: 100,
                    color: "#1890ff",
                    background: "#D4D6D9",
                    textColor: "#222",
                    unit: "%",
                }
            },
            {
                key: 'default-graphic-2-6',
                title: '输入框',
                icon: 'iconfont icon-keshihuapingtaiicon_shurukuang',
                data: {
                    name: "rectangle",
                    height: 50,
                    width: 200,
                    input: true,
                    borderRadius: 0.05,
                    ellipsis: true,
                    text: "输入数据",
                    textAlign: "left",
                    color: "#D9D9D9FF",
                    textColor: "#000000FF",
                    hoverTextColor: "#000000FF",
                    activeTextColor: "#000000FF",
                    textLeft: 10,
                }
            },
            {
                key: 'default-graphic-2-7',
                title: '选择器',
                icon: 'iconfont icon-selector',
                data: {
                    name: "rectangle",
                    height: 50,
                    width: 200,
                    borderRadius: 0.05,
                    ellipsis: true,
                    text: "选项1",
                    textAlign: "left",
                    color: "#D9D9D9FF",
                    textColor: "#000000FF",
                    hoverTextColor: "#000000FF",
                    activeTextColor: "#000000FF",
                    textLeft: 10,
                    title: '下拉列表',
                    dropdownList: [{
                        text: "选项1",
                    }, {
                        text: "选项2"
                    }, {
                        text: "选项3"
                    }],
                }
            },
            {
                key: 'default-graphic-2-8',
                title: '时间',
                icon: 'iconfont icon-shangpaishijian',
                data: {
                    name: 'time',
                    width: 300,
                    height: 40,
                    text: `${formatCurrentTime()}`,
                    lineWidth: 0,
                    // 绘画帧时长
                    interval: 67,
                    fillZero: true,
                    form: [{
                        key: 'timeFormat',
                        name: '显示格式',
                        type: 'text',
                    }, {
                        key: 'fillZero',
                        name: '是否补0',
                        type: 'switch',
                    }],
                    timeFormat: "`${year}-${month}-${day} ${hours}:${minutes}:${seconds} 星期${week}`",
                },
            }
        ]
    },
    {
        key: 'default-graphic-3',
        title: '流程图',
        children: [
            {
                key: 'default-graphic-3-1',
                title: '开始/结束',
                icon: 'l-flow-start',
                data: {
                    text: '开始/结束',
                    width: 120,
                    height: 40,
                    borderRadius: 0.5,
                    name: 'rectangle',
                },
            },
            {
                key: 'default-graphic-3-2',
                title: '流程',
                icon: 'l-rectangle',
                data: {
                    text: '流程',
                    width: 120,
                    height: 40,
                    name: 'rectangle',
                },
            },
            {
                key: 'default-graphic-3-3',
                title: '判定',
                icon: 'l-diamond',
                data: {
                    text: '判定',
                    width: 120,
                    height: 60,
                    name: 'diamond',
                },
            },
            {
                key: 'default-graphic-3-4',
                title: '数据',
                icon: 'l-flow-data',
                data: {
                    text: '数据',
                    width: 120,
                    height: 50,
                    name: 'flowData',
                    offsetX: 0.14,
                },
            },
            {
                key: 'default-graphic-3-5',
                title: '准备',
                icon: 'l-flow-ready',
                data: {
                    text: '准备',
                    width: 120,
                    height: 50,
                    name: 'hexagon',
                },
            },
            {
                key: 'default-graphic-3-6',
                title: '子流程',
                icon: 'l-flow-subprocess',
                data: {
                    text: '子流程',
                    width: 120,
                    height: 50,
                    name: 'flowSubprocess',
                },
            },
            {
                key: 'default-graphic-3-7',
                title: '数据库',
                icon: 'l-db',
                data: {
                    text: '数据库',
                    width: 80,
                    height: 120,
                    name: 'flowDb',
                },
            },
            {
                key: 'default-graphic-3-8',
                title: '文档',
                icon: 'l-flow-document',
                data: {
                    text: '文档',
                    width: 120,
                    height: 100,
                    name: 'flowDocument',
                },
            },
            {
                key: 'default-graphic-3-9',
                title: '内部存储',
                icon: 'l-internal-storage',
                data: {
                    text: '内部存储',
                    width: 120,
                    height: 80,
                    name: 'flowInternalStorage',
                },
            },
            {
                key: 'default-graphic-3-10',
                title: '外部存储',
                icon: 'l-extern-storage',
                data: {
                    text: '外部存储',
                    width: 120,
                    height: 80,
                    name: 'flowExternStorage',
                },
            },
            {
                key: 'default-graphic-3-11',
                title: '队列',
                icon: 'l-flow-queue',
                data: {
                    text: '队列',
                    width: 100,
                    height: 100,
                    name: 'flowQueue',
                },
            },
            {
                key: 'default-graphic-3-12',
                title: '手动输入',
                icon: 'l-flow-manually',
                data: {
                    text: '手动输入',
                    width: 120,
                    height: 80,
                    name: 'flowManually',
                },
            },
            {
                key: 'default-graphic-3-13',
                title: '展示',
                icon: 'l-flow-display',
                data: {
                    text: '展示',
                    width: 120,
                    height: 80,
                    name: 'flowDisplay',
                },
            },
            {
                key: 'default-graphic-3-14',
                title: '并行模式',
                icon: 'l-flow-parallel',
                data: {
                    text: '并行模式',
                    width: 120,
                    height: 50,
                    name: 'flowParallel',
                },
            },
            {
                key: 'default-graphic-3-15',
                title: '注释',
                icon: 'l-flow-comment',
                data: {
                    text: '注释',
                    width: 100,
                    height: 100,
                    name: 'flowComment',
                },
            }
        ],
    },
    {
        key: 'default-graphic-4',
        title: '活动图',
        children: [
            {
                key: 'default-graphic-4-1',
                title: '开始',
                icon: 'l-inital',
                data: {
                    text: '开始',
                    width: 30,
                    height: 30,
                    name: 'circle',
                    background: '#555',
                    lineWidth: 0,
                },
            },
            {
                key: 'default-graphic-4-2',
                title: '结束',
                icon: 'l-final',
                data: {
                    width: 30,
                    height: 30,
                    name: 'activityFinal',
                    text: '结束',
                },
            },
            {
                key: 'default-graphic-4-3',
                title: '活动',
                icon: 'l-action',
                data: {
                    text: '活动',
                    width: 120,
                    height: 50,
                    borderRadius: 0.25,
                    name: 'rectangle',
                },
            },
            {
                key: 'default-graphic-4-4',
                title: '决策/合并',
                icon: 'l-diamond',
                data: {
                    text: '决策/合并',
                    width: 120,
                    height: 50,
                    name: 'diamond',
                },
            },
            {
                key: 'default-graphic-4-5',
                title: '垂直泳道',
                icon: 'l-swimlane-v',
                data: {
                    text: '垂直泳道',
                    width: 200,
                    height: 500,
                    name: 'swimlaneV',
                    textBaseline: 'top',
                    textTop: 20,
                    lineTop: 0.08,
                },
            },
            {
                key: 'default-graphic-4-6',
                title: '水平泳道',
                icon: 'l-swimlane-h',
                data: {
                    text: '水平泳道',
                    width: 500,
                    height: 200,
                    name: 'swimlaneH',
                    textWidth: 0.01,
                    textLeft: 0.04,
                    textAlign: 'left',
                    lineLeft: 0.08,
                },
            },
            {
                key: 'default-graphic-4-7',
                title: '垂直分岔/汇合',
                icon: 'l-fork-v',
                data: {
                    text: '垂直分岔/汇合',
                    width: 10,
                    height: 150,
                    name: 'forkV',
                    fillStyle: '#555',
                    strokeStyle: 'transparent',
                },
            },
            {
                key: 'default-graphic-4-8',
                title: '水平分岔/汇合',
                icon: 'l-fork',
                data: {
                    text: '水平分岔/汇合',
                    width: 150,
                    height: 10,
                    name: 'forkH',
                    fillStyle: '#555',
                    strokeStyle: 'transparent',
                },
            }
        ],
    },
    {
        key: 'default-graphic-5',
        title: '时序图和类图',
        children: [
            {
                key: 'default-graphic-5-1',
                title: '生命线',
                icon: 'l-lifeline',
                data: {
                    text: '生命线',
                    width: 150,
                    height: 400,
                    textHeight: 50,
                    name: 'lifeline',
                },
            },
            {
                key: 'default-graphic-5-2',
                title: '激活',
                icon: 'l-focus',
                data: {
                    text: '激活',
                    width: 12,
                    height: 200,
                    name: 'sequenceFocus',
                },
            },
            {
                key: 'default-graphic-5-3',
                title: '简单类',
                icon: 'l-simple-class',
                data: {
                    text: '简单类',
                    width: 270,
                    height: 200,
                    textHeight: 200,
                    name: 'simpleClass',
                    textAlign: 'center',
                    textBaseline: 'top',
                    textTop: 10,
                    children: [{
                        text: '- name: string\n+ setName(name: string): void',
                    }],
                },
            },
            {
                key: 'default-graphic-5-4',
                title: '类',
                icon: 'l-class',
                data: {
                    text: '类',
                    width: 270,
                    height: 200,
                    textHeight: 200,
                    name: 'interfaceClass',
                    textAlign: 'center',
                    textBaseline: 'top',
                    textTop: 10,
                    children: [{
                        text: '- name: string',
                    }, {
                        text: '+ setName(name: string): void',
                    }],
                },
            },
        ],
    },
    {
        key: 'default-graphic-6',
        title: '故障树',
        children: [
            {
                key: 'default-graphic-6-1',
                title: '与门',
                icon: 'l-ANDmen',
                data: {
                    name: 'andGate',
                    text: '与门',
                    width: 100,
                    height: 150,
                },
            },
            {
                key: 'default-graphic-6-2',
                title: '基本事件',
                icon: 'l-jibenshijian',
                data: {
                    name: 'basicEvent',
                    text: '基本事件',
                    width: 100,
                    height: 150,
                },
            },
            {
                key: 'default-graphic-6-3',
                title: '未展开事件',
                icon: 'l-weizhankaishijian',
                data: {
                    name: 'unexpandedEvent',
                    text: '未展开事件',
                    width: 100,
                    height: 150,
                },
            },
            {
                key: 'default-graphic-6-4',
                title: '优先AND门',
                icon: 'l-youxianANDmen',
                data: {
                    name: 'priorityAndGate',
                    text: '优先AND门',
                    width: 100,
                    height: 150,
                },
            },
            {
                key: 'default-graphic-6-5',
                title: '禁止门',
                icon: 'l-jinzhimen',
                data: {
                    name: 'forbiddenGate',
                    text: '禁止门',
                    width: 100,
                    height: 150,
                },
            },
            {
                key: 'default-graphic-6-6',
                title: '事件',
                icon: 'l-shijian',
                data: {
                    name: 'event',
                    text: '事件',
                    width: 100,
                    height: 150,
                },
            },
            {
                key: 'default-graphic-6-7',
                title: '开关事件',
                icon: 'l-kaiguanshijian',
                data: {
                    name: 'switchEvent',
                    text: '开关事件',
                    width: 100,
                    height: 150,
                },
            },
            {
                key: 'default-graphic-6-8',
                title: '条件事件',
                icon: 'l-tiaojianshijian',
                data: {
                    name: 'conditionalEvent',
                    text: '条件事件',
                    width: 150,
                    height: 100,
                },
            },
            {
                key: 'default-graphic-6-9',
                title: '转移符号',
                icon: 'l-zhuanyifuhao',
                data: {
                    name: 'transferSymbol',
                    text: '转移符号',
                    width: 100,
                    height: 150,
                },
            },
            {
                key: 'default-graphic-6-10',
                title: '或门',
                icon: 'l-ORmen',
                data: {
                    name: 'orGate',
                    text: '或门',
                    width: 100,
                    height: 150,
                },
            },
            {
                key: 'default-graphic-6-11',
                title: '异或门',
                icon: 'l-yihuomen',
                data: {
                    name: 'xorGate',
                    text: '异或门',
                    width: 100,
                    height: 150,
                },
            },
            {
                key: 'default-graphic-6-12',
                title: '表决门',
                icon: 'l-biaojuemen',
                data: {
                    name: 'votingGate',
                    text: '表决门',
                    width: 100,
                    height: 150,
                },
            },
        ],
    },
    {
        key: 'default-graphic-7',
        title: '脑图',
        children: [
            {
                key: 'default-graphic-7-1',
                title: '主题',
                icon: 'l-zhuti',
                data: {
                    text: '主题',
                    width: 200,
                    height: 50,
                    name: 'mindNode',
                    borderRadius: 0.5,
                },
            },
            {
                key: 'default-graphic-7-2',
                title: '子主题',
                icon: 'l-zizhuti',
                data: {
                    text: '子主题',
                    width: 160,
                    height: 40,
                    name: 'mindLine',
                },
            }
        ],
    }
]

/**
 * Echarts 图表组件数据
 */
const ECHARTS_GRAPHIC_GROUPS: Array<Editor2DPropsMenu> = [
    {
        key: 'echarts-1',
        title: 'Echarts图表',
        children: [
            {
                key: 'echarts-1-1',
                title: '折线图',
                icon: 'l-line-chart',
                data: {
                    name: 'echarts',
                    width: 400,
                    height: 300,
                    externElement: true,
                    disableAnchor: true,
                    echarts: {
                        option: {
                            grid: {
                                top: 10,
                                bottom: 50,
                                left: 40,
                                right: 5,
                            },
                            dataZoom: [
                                {
                                    height: 16,
                                    bottom: 10,
                                },
                            ],
                            xAxis: {
                                type: 'category',
                                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                                axisLabel: {
                                    fontSize: 12,
                                },
                            },
                            yAxis: {
                                type: 'value',
                                axisLabel: {
                                    fontSize: 12,
                                },
                            },
                            series: [
                                {
                                    data: [820, 932, 901, 934, 1290, 1330, 1320],
                                    type: 'line',
                                },
                            ],
                        },
                        max: 100,
                    },
                },
            },
            {
                key: 'echarts-1-2',
                title: '柱状图',
                icon: 'l-bar-chart',
                data: {
                    width: 300,
                    height: 200,
                    disableAnchor: true,
                    externElement: true,
                    name: 'echarts',
                    echarts: {
                        option: {
                            tooltip: {
                                trigger: 'axis',
                                axisPointer: {
                                    // 坐标轴指示器，坐标轴触发有效
                                    type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
                                },
                            },
                            grid: {
                                left: '3%',
                                right: '4%',
                                bottom: '3%',
                                containLabel: true,
                            },
                            xAxis: {
                                type: 'category',
                                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                                axisTick: {
                                    alignWithLabel: true,
                                },
                            },
                            yAxis: [
                                {
                                    type: 'value',
                                },
                            ],
                            series: [
                                {
                                    name: '直接访问',
                                    type: 'bar',
                                    barWidth: '60%',
                                    data: [10, 52, 200, 334, 390, 330, 220],
                                },
                            ],
                        },
                        max: 100,
                    },
                },
            },
            {
                key: 'echarts-1-3',
                title: '饼图',
                icon: 'l-pie-chart',
                data: {
                    width: 200,
                    height: 200,
                    disableAnchor: true,
                    externElement: true,
                    name: 'echarts',
                    echarts: {
                        option: {
                            tooltip: {
                                trigger: 'item',
                                formatter: '{a} <br/>{b}: {c} ({d}%)',
                            },
                            legend: {},
                            series: [
                                {
                                    name: '访问来源',
                                    type: 'pie',
                                    radius: ['50%', '70%'],
                                    avoidLabelOverlap: false,
                                    label: {
                                        normal: {
                                            show: false,
                                            position: 'center',
                                        },
                                        emphasis: {
                                            show: true,
                                            textStyle: {
                                                fontSize: '30',
                                                fontWeight: 'bold',
                                            },
                                        },
                                    },
                                    labelLine: {
                                        normal: {
                                            show: false,
                                        },
                                    },
                                    data: [
                                        {value: 335, name: '直接访问'},
                                        {value: 310, name: '邮件营销'},
                                        {value: 234, name: '联盟广告'},
                                        {value: 135, name: '视频广告'},
                                        {value: 1548, name: '搜索引擎'},
                                    ],
                                },
                            ],
                        },
                        replaceMode: ReplaceMode.Replace,
                    },
                },
            },
            {
                key: 'echarts-1-4',
                title: '仪表盘',
                icon: 'l-dashboard-chart',
                data: {
                    width: 300,
                    height: 300,
                    disableAnchor: true,
                    externElement: true,
                    name: 'echarts',
                    echarts: {
                        option: {
                            tooltip: {
                                formatter: '{a} <br/>{b} : {c}%',
                            },
                            series: [
                                {
                                    name: '业务指标',
                                    type: 'gauge',
                                    detail: {formatter: '{value}%'},
                                    data: [{value: 50, name: '完成率'}],
                                },
                            ],
                        },
                        replaceMode: ReplaceMode.Replace,
                    },
                },
            },
        ],
    }
]

/**
 * 图形菜单数据(使用单例模式)
 */
class GraphicsMenusDataManager {
    private static instance: GraphicsMenusDataManager;
    private menusData: Array<Editor2DPropsMenu> = [];
    private initialized: boolean = false;

    private constructor() {}

    static getInstance(): GraphicsMenusDataManager {
        if (!GraphicsMenusDataManager.instance) {
            GraphicsMenusDataManager.instance = new GraphicsMenusDataManager();
        }
        return GraphicsMenusDataManager.instance;
    }

    getData(): Array<Editor2DPropsMenu> {
        return this.menusData;
    }

    addMenus(menus: Array<Editor2DPropsMenu>): void {
        this.menusData.push(...menus);
    }

    clearMenus(): void {
        this.menusData = [];
        this.initialized = false;
    }

    isInitialized(): boolean {
        return this.initialized;
    }

    setInitialized(): void {
        this.initialized = true;
    }
}

/**
 * 获取图形菜单数据(导出给外部使用)
 */
export const graphicsMenusData: Array<Editor2DPropsMenu> = GraphicsMenusDataManager.getInstance().getData();

/**
 * 图元选项
 */
interface GraphicOptions {
    enableBasicsPen?: boolean,
    enableEchartsPen?: boolean,
    extendPen?: Array<Editor2DPropsMenu>
}

/**
 * 抽象图元
 */
abstract class Graphic {

    /**
     * 初始化图元(防止重复初始化)
     * @param options 选项
     */
    init(options?: GraphicOptions): void {
        const manager = GraphicsMenusDataManager.getInstance();
        
        // 防止重复初始化
        if (manager.isInitialized()) {
            console.warn('图形组件已初始化,跳过重复初始化');
            return;
        }

        // 默认启用基础图形
        const defaultOptions: GraphicOptions = {
            enableBasicsPen: true,
            enableEchartsPen: false,
            extendPen: [],
            ...options
        };

        if (defaultOptions.enableBasicsPen) {
            manager.addMenus(DEFAULT_GRAPHIC_GROUPS);
        }
        if (defaultOptions.enableEchartsPen) {
            manager.addMenus(ECHARTS_GRAPHIC_GROUPS);
        }
        if (defaultOptions.extendPen && defaultOptions.extendPen.length > 0) {
            manager.addMenus(defaultOptions.extendPen);
        }

        manager.setInitialized();
    }

    /**
     * 获取图元
     */
    getGraphic(): Array<Editor2DPropsMenu> {
        return GraphicsMenusDataManager.getInstance().getData();
    }

    /**
     * 重置图元(用于清理或重新初始化)
     */
    reset(): void {
        GraphicsMenusDataManager.getInstance().clearMenus();
    }
}

/**
 * 扩展图元
 */
export class ExtendGraphic extends Graphic {

}
