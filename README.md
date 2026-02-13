# Pixel-2D

> 专业的 2D 图形编辑器 - 基于 Vue3 + TypeScript + Meta2D

## 📖 项目简介

Pixel-2D 是一个功能强大的在线 2D 图形编辑器，提供了丰富的绘图工具和图形库，支持流程图、时序图、类图等多种图表类型。基于现代化的前端技术栈构建，提供流畅的编辑体验和强大的扩展能力。

🚀 **在线预览**: [https://beginnera.github.io/pixel-2d/#/](https://beginnera.github.io/pixel-2d/#/)

## ✨ 核心特性

### 🎨 丰富的图形库
- **流程图**：支持各种流程图形状和连接线
- **时序图**：UML 时序图绘制
- **类图**：UML 类图设计
- **活动图**：业务流程活动图
- **表单组件**：可交互的表单元素
- **自定义图形**：支持扩展自定义图元

### 🛠️ 强大的编辑功能
- **多种绘图工具**：钢笔、铅笔、连线工具等
- **智能连线**：支持曲线、折线、直线、脑图曲线
- **连接点样式**：丰富的起点和终点箭头样式
- **画布操作**：放大镜、小地图、撤销/重做
- **状态管理**：编辑、预览、锁定三种模式
- **实时预览**：支持画布实时预览功能

### ⚙️ 完善的配置系统
- **图元外观**：颜色、边框、阴影、渐变等
- **事件绑定**：支持动态事件配置
- **动画效果**：丰富的动画和动效配置
- **数据绑定**：支持动态数据绑定
- **通信协议**：WebSocket、MQTT、HTTP 通信支持

### 🏗️ 现代化架构
- **模块化设计**：基于核心架构模块的清晰分层设计
- **依赖注入**：IoC容器管理服务生命周期
- **事件驱动**：全局事件总线支持发布订阅模式
- **命令模式**：完善的撤销/重做系统
- **状态管理**：有限状态机管理编辑器状态
- **渲染抽象**：多渲染器支持（Canvas/SVG）
- **插件系统**：可扩展的插件架构
- **TypeScript**：完整的类型安全支持
- **响应式布局**：自适应各种屏幕尺寸

## 🚀 技术栈

### 核心框架
- **Vue 3.5.28** - 渐进式 JavaScript 框架
- **TypeScript 5.9.3** - JavaScript 的超集
- **Vite 7.3.1** - 下一代前端构建工具

### UI 组件库
- **TDesign Vue Next 1.18.2** - 腾讯企业级设计体系
- **TDesign Icons 0.4.2** - 图标组件库

### 图形引擎
- **Meta2D Core 1.1.14** - 核心渲染引擎
- **Meta2D 图形库套件**
  - Flow Diagram 1.0.2 - 流程图
  - Sequence Diagram 1.0.1 - 时序图
  - Class Diagram 1.0.2 - 类图
  - Activity Diagram 1.0.1 - 活动图
  - Chart Diagram 1.0.20 - 图表
  - Form Diagram 1.0.29 - 表单
  - FTA Diagram 1.0.1 - 故障树分析图
  - Le5le Charts 1.0.5 - 图表组件

### 状态管理
- **Pinia 3.0.4** - Vue 官方状态管理库
- **Vue Router 5.0.2** - 官方路由管理器

### 开发工具
- **ESLint 10.0.0** - 代码质量检查
- **Prettier 3.8.1** - 代码格式化
- **Monaco Editor 0.55.1** - 代码编辑器

## 📦 安装

### 环境要求
- Node.js >= 20.19.0
- pnpm >= 8.0.0 (推荐)

### 克隆项目
```bash
git clone <repository-url>
cd pixel-2d
```

### 安装依赖
```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install
```

## 🎯 使用

### 开发模式
```bash
# 启动开发服务器
pnpm dev
# 或
pnpm start

# 访问 http://localhost:5173
```

### 生产构建
```bash
# 类型检查
pnpm type-check

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

### 代码质量
```bash
# ESLint 检查并修复
pnpm lint

# Prettier 格式化
pnpm format

# 清理构建文件
pnpm clean
```

## 📁 项目结构

```
pixel-2d/
├── src/
│   ├── components/          # 组件目录
│   │   ├── editor2d/       # 2D 编辑器核心组件
│   │   │   ├── Editor2d.vue        # 主编辑器组件
│   │   │   ├── header/             # 顶部工具栏
│   │   │   ├── graphics/           # 图形库面板
│   │   │   ├── editor-view/        # 画布编辑区
│   │   │   ├── props/              # 属性配置面板
│   │   │   ├── core/               # 编辑器核心逻辑
│   │   │   └── edit-code/          # 代码编辑器
│   │   └── common/         # 通用组件
│   ├── core/               # 核心架构模块
│   │   ├── Editor.ts               # 编辑器核心类
│   │   ├── ioc/                    # IoC 容器（依赖注入）
│   │   ├── events/                 # 事件总线
│   │   ├── commands/               # 命令系统
│   │   ├── plugins/                # 插件系统
│   │   ├── renderer/               # 渲染器抽象层
│   │   ├── state/                  # 状态机管理
│   │   ├── services/               # 核心服务
│   │   ├── lifecycle/              # 生命周期管理
│   │   ├── constants/              # 常量定义
│   │   └── utils/                  # 核心工具
│   ├── views/              # 页面视图
│   ├── router/             # 路由配置
│   ├── stores/             # Pinia 状态管理
│   ├── types/              # TypeScript 类型定义
│   ├── utils/              # 工具函数
│   ├── data/               # 数据配置
│   ├── styles/             # 全局样式
│   ├── App.vue             # 根组件
│   └── main.ts             # 应用入口
├── public/                 # 静态资源
├── .vscode/                # VSCode 配置
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript 配置
├── vite.config.ts          # Vite 配置
└── README.md               # 项目文档
```

## ✅ 已实现功能

### 基础功能
- [x] 项目框架搭建
- [x] 编辑器基本布局
- [x] 图元管理（图纸、系统组件、自定义组件）
- [x] 画布编辑功能
- [x] 绘图工具（钢笔、铅笔、放大镜）
- [x] 画布操作（撤销、重做、缩放）
- [x] 连线工具（曲线、折线、直线、脑图曲线）
- [x] 连接点样式（起点、终点箭头）
- [x] 自动锚点定位
- [x] 小地图导航
- [x] 画布状态管理（编辑、预览、锁定）
- [x] 实时预览功能

### 配置功能
- [x] 图元外观配置
- [x] 事件动态配置
- [x] 动画效果配置
- [x] 视频图元支持
- [x] iframe 图元支持
- [x] 自定义动画帧
- [x] 动态数据绑定
- [x] 布局和结构设置

### 通信功能
- [x] WebSocket 通信绑定
- [x] MQTT 通信协议支持
- [x] HTTP 通信协议支持

### 核心架构
- [x] 依赖注入容器（IoC）
- [x] 全局事件总线
- [x] 命令模式系统
- [x] 插件管理系统
- [x] 多渲染器支持
- [x] 状态机管理
- [x] 服务注册中心
- [x] 生命周期管理

## 🚧 开发中功能

- [ ] 画布右键菜单
- [ ] 图纸通信动态绑定完善
- [ ] 常用图元库扩展
- [ ] 全局菜单配置优化
- [ ] 图片资源管理优化
- [ ] 更多图形库扩展
- [ ] 性能优化和内存管理
- [ ] 国际化支持
- [ ] 主题系统
- [ ] 快捷键系统完善

## 🔧 配置说明

### 开发环境配置

项目使用 `.env.development` 配置开发环境变量：
```env
# 开发环境配置
VITE_APP_TITLE=Pixel-2D Editor
VITE_APP_ENV=development
```

### 生产环境配置

使用 `.env.production` 配置生产环境：
```env
# 生产环境配置  
VITE_APP_TITLE=Pixel-2D Editor
VITE_APP_ENV=production
```

## 📝 开发指南

### 代码规范

项目使用 ESLint 和 Prettier 进行代码规范管理：

- **ESLint**：代码质量检查，配置文件 `eslint.config.js`
- **Prettier**：代码格式化，配置文件 `.prettierrc.json`

提交代码前请运行：
```bash
pnpm lint    # 检查并自动修复
pnpm format  # 格式化代码
```

### 组件开发

1. 所有组件使用 Vue 3 Composition API
2. 使用 TypeScript 进行类型约束
3. 组件文件使用 PascalCase 命名
4. 样式使用 scoped less

### 提交规范

推荐使用约定式提交格式：
```
feat: 新功能
fix: 修复问题
docs: 文档更新
style: 代码格式调整
refactor: 重构代码
perf: 性能优化
test: 测试相关
chore: 构建/工具链相关
```

## 🤝 参与贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 License

本项目采用 Apache-2.0 许可证

## 👨‍💻 作者

MC.Yang

## 🙏 致谢

- [Meta2D](https://github.com/le5le-com/meta2d.js) - 强大的 2D 图形引擎
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [TDesign](https://tdesign.tencent.com/) - 企业级设计体系
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
