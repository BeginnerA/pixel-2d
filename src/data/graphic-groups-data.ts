/*
 * @description: 2D编辑器图形组件数据
 * @author: MC.Yang
 */
let CACHE_KEY: string = 'meta2d-graphic-groups-key';

/**
 * 自定义图形组件数据
 */
export const CUSTOM_GRAPHIC_GROUPS: Array<any> = [
    {
        title: '2.5D-光伏系统',
        show: true,
        children: [],
        file: {
            import: import.meta.glob(`@/assets/editor2d/graphics/2.5D-光伏系统/*`),
            mkdir: '2.5D-光伏系统',
        }
    },
    {
        title: '2.5D-制冷站',
        show: true,
        children: [],
        file: {
            import: import.meta.glob(`@/assets/editor2d/graphics/2.5D-制冷站/*`),
            mkdir: '2.5D-制冷站',
        }
    },
    {
        title: '2.5D-废气治理',
        show: true,
        children: [],
        file: {
            import: import.meta.glob(`@/assets/editor2d/graphics/2.5D-废气治理/*`),
            mkdir: '2.5D-废气治理',
        }
    },
    {
        title: '2.5D-废水处理',
        show: true,
        children: [],
        file: {
            import: import.meta.glob(`@/assets/editor2d/graphics/2.5D-废水处理/*`),
            mkdir: '2.5D-废水处理',
        }
    },
    {
        title: '2.5D-智慧城市',
        show: true,
        children: [],
        file: {
            import: import.meta.glob(`@/assets/editor2d/graphics/2.5D-智慧城市/*`),
            mkdir: '2.5D-智慧城市',
        }
    },
    {
        title: '2.5D-智慧港口',
        show: true,
        children: [],
        file: {
            import: import.meta.glob(`@/assets/editor2d/graphics/2.5D-智慧港口/*`),
            mkdir: '2.5D-智慧港口',
        }
    },
    {
        title: '2.5D-电信机房',
        show: true,
        children: [],
        file: {
            import: import.meta.glob(`@/assets/editor2d/graphics/2.5D-电信机房/*`),
            mkdir: '2.5D-电信机房',
        }
    },
    {
        title: '2.5D-火力发电',
        show: true,
        children: [],
        file: {
            import: import.meta.glob(`@/assets/editor2d/graphics/2.5D-火力发电/*`),
            mkdir: '2.5D-火力发电',
        }
    },
    {
        title: '2.5D-风力发电',
        show: true,
        children: [],
        file: {
            import: import.meta.glob(`@/assets/editor2d/graphics/2.5D-风力发电/*`),
            mkdir: '2.5D-风力发电',
        }
    },
    {
        title: '2.5D-太阳能光伏发电',
        show: true,
        children: [],
        file: {
            import: import.meta.glob(`@/assets/editor2d/graphics/2.5D-太阳能光伏发电/*`),
            mkdir: '2.5D-太阳能光伏发电',
        }
    },
    {
        title: '2.5D-矿山',
        show: true,
        children: [],
        file: {
            import: import.meta.glob(`@/assets/editor2d/graphics/2.5D-矿山/*`),
            mkdir: '2.5D-矿山',
        }
    },
    {
        title: '2.5D-锅炉房',
        show: true,
        children: [],
        file: {
            import: import.meta.glob(`@/assets/editor2d/graphics/2.5D-锅炉房/*`),
            mkdir: '2.5D-锅炉房',
        }
    },
    {
        title: 'IoT-鼓风机',
        show: true,
        children: [],
        file: {
            import: import.meta.glob(`@/assets/editor2d/graphics/IoT-鼓风机/*`),
            mkdir: 'IoT-鼓风机',
        }
    },
    {
        title: 'IoT-锅炉',
        show: true,
        children: [],
        file: {
            import: import.meta.glob(`@/assets/editor2d/graphics/IoT-锅炉/*`),
            mkdir: 'IoT-锅炉',
        }
    },
    {
        title: 'IoT-流量计',
        show: true,
        children: [],
        file: {
            import: import.meta.glob(`@/assets/editor2d/graphics/IoT-流量计/*`),
            mkdir: 'IoT-流量计',
        }
    },
    {
        title: 'IoT-暖通空调',
        show: true,
        children: [],
        file: {
            import: import.meta.glob(`@/assets/editor2d/graphics/IoT-暖通空调/*`),
            mkdir: 'IoT-暖通空调',
        }
    },
    {
        title: 'IoT-移动网管域',
        show: true,
        children: [],
        file: {
            import: import.meta.glob(`@/assets/editor2d/graphics/IoT-移动网管域/*`),
            mkdir: 'IoT-移动网管域',
        }
    },
    {
        title: 'IoT-管道',
        show: true,
        children: [],
        file: {
            import: import.meta.glob(`@/assets/editor2d/graphics/IoT-管道/*`),
            mkdir: 'IoT-管道',
        }
    },
    {
        title: 'IoT-安全',
        show: true,
        children: [],
        file: {
            import: import.meta.glob(`@/assets/editor2d/graphics/IoT-安全/*`),
            mkdir: 'IoT-安全',
        }
    },
    {
        title: 'IoT-废水处理',
        show: true,
        children: [],
        file: {
            import: import.meta.glob(`@/assets/editor2d/graphics/IoT-废水处理/*`),
            mkdir: 'IoT-废水处理',
        }
    },
    {
        title: 'IoT-水槽',
        show: true,
        children: [],
        file: {
            import: import.meta.glob(`@/assets/editor2d/graphics/IoT-水槽/*`),
            mkdir: 'IoT-水槽',
        }
    }
]

importFile();

function importFile() {
    CUSTOM_GRAPHIC_GROUPS.map((item, index) => {
        item['key'] = ++index;
        let file = item.file;
        let modules: any = file.import;
        Object.keys(modules).forEach((key: string) => {
            const NEW_KEY: any = getFileContent(key);
            modules[NEW_KEY] = GET_IMAGE_PATH(file.mkdir, NEW_KEY);
            delete modules[key];
            modules[NEW_KEY].then((path: string) => {
                let graphic = commonImportFile(path);
                item.children.push(graphic);
            })
        })
    })

    if (Object.keys(getGraphicGroups()).length == 0) {
        let obj: any = {};
        CUSTOM_GRAPHIC_GROUPS.map((_: any) => {
            obj[_.title] = _.show;
        });
        setGraphicGroups(obj);
    }

    /**
     * 获取图片 URL
     * @param mkdir 文件夹
     * @param title 文件名称
     * @constructor
     */
    async function GET_IMAGE_PATH(mkdir: string, title: string) {
        return new URL(`/src/assets/editor2d/graphics/${mkdir}/${title}`, import.meta.url).href;
    }

    /**
     * 通用导入文件
     * @param path 地址
     */
    function commonImportFile(path: string): any {
        let regex = /\.(svg|gif)/g;
        let suffix = path.substring(path.lastIndexOf(".") + 1)
        let _ = path.replace(regex, '').split('/');
        let fileName = decodeURIComponent(_[_.length - 1].split('-')[0]).trim();
        //
        let filePath = new URL(path, import.meta.url).href;
        return {
            title: fileName, //path.replace(regex, ''),
            // icon: '',
            data: {
                name: suffix == 'svg' ? 'rectangle' : "gif",
                width: 101,
                height: 101,
                imageRatio: true,
                image: filePath,
                label: fileName,
                lineWidth: 0
            },
        };
    }

    /**
     * 获取文件名
     * @param keys 文件
     */
    function getFileContent(keys: string) {
        let array = keys.split('/')
        return array[array.length - 1];
    }

    function getGraphicGroups() {
        let data: any = localStorage.getItem(CACHE_KEY);
        if (data) {
            return JSON.parse(data);
        } else {
            return {}
        }
    }

    function setGraphicGroups(data: any) {
        return localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    }
}
