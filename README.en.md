# Pixel-2D

> Professional 2D Graphics Editor - Built with Vue3 + TypeScript + Meta2D

## 📖 Introduction

Pixel-2D is a powerful online 2D graphics editor that provides rich drawing tools and graphic libraries, supporting various diagram types such as flowcharts, sequence diagrams, class diagrams, and more. Built on modern frontend technology stack, it offers a smooth editing experience and powerful extensibility.

🚀 **Online Preview**: [https://beginnera.github.io/pixel-2d/#/](https://beginnera.github.io/pixel-2d/#/)

## ✨ Core Features

### 🎨 Rich Graphics Library
- **Flowcharts**: Support for various flowchart shapes and connectors
- **Sequence Diagrams**: UML sequence diagram drawing
- **Class Diagrams**: UML class diagram design
- **Activity Diagrams**: Business process activity diagrams
- **Form Components**: Interactive form elements
- **Custom Graphics**: Support for custom graphic extensions

### 🛠️ Powerful Editing Features
- **Multiple Drawing Tools**: Pen, pencil, line tools, etc.
- **Smart Connectors**: Support for curves, polylines, straight lines, mind map curves
- **Connector Styles**: Rich start and end arrow styles
- **Canvas Operations**: Zoom, minimap, undo/redo
- **State Management**: Edit, preview, and lock modes
- **Real-time Preview**: Live canvas preview functionality

### ⚙️ Complete Configuration System
- **Element Appearance**: Colors, borders, shadows, gradients, etc.
- **Event Binding**: Dynamic event configuration support
- **Animation Effects**: Rich animation and effect configurations
- **Data Binding**: Dynamic data binding support
- **Communication Protocols**: WebSocket, MQTT, HTTP communication support

### 🏗️ Modern Architecture
- **Modular Design**: Clear layered architecture based on core modules
- **Dependency Injection**: IoC container managing service lifecycles
- **Event-driven**: Global event bus supporting publish-subscribe pattern
- **Command Pattern**: Complete undo/redo system
- **State Management**: Finite state machine managing editor states
- **Renderer Abstraction**: Multi-renderer support (Canvas/SVG)
- **Plugin System**: Extensible plugin architecture
- **TypeScript**: Full type safety support
- **Responsive Layout**: Adaptive to various screen sizes

## 🚀 Technology Stack

### Core Framework
- **Vue 3.5.28** - Progressive JavaScript Framework
- **TypeScript 5.9.3** - JavaScript Superset
- **Vite 7.3.1** - Next Generation Frontend Build Tool

### UI Component Library
- **TDesign Vue Next 1.18.2** - Tencent Enterprise Design System
- **TDesign Icons 0.4.2** - Icon Component Library

### Graphics Engine
- **Meta2D Core 1.1.14** - Core Rendering Engine
- **Meta2D Graphics Suite**
  - Flow Diagram 1.0.2 - Flowcharts
  - Sequence Diagram 1.0.1 - Sequence Diagrams
  - Class Diagram 1.0.2 - Class Diagrams
  - Activity Diagram 1.0.1 - Activity Diagrams
  - Chart Diagram 1.0.20 - Charts
  - Form Diagram 1.0.29 - Forms
  - FTA Diagram 1.0.1 - Fault Tree Analysis
  - Le5le Charts 1.0.5 - Chart Components

### State Management
- **Pinia 3.0.4** - Official Vue State Management
- **Vue Router 5.0.2** - Official Router Manager

### Development Tools
- **ESLint 10.0.0** - Code Quality Checking
- **Prettier 3.8.1** - Code Formatting
- **Monaco Editor 0.55.1** - Code Editor

## 📦 Installation

### Requirements
- Node.js >= 20.19.0
- pnpm >= 8.0.0 (recommended)

### Clone Repository
```bash
git clone <repository-url>
cd pixel-2d
```

### Install Dependencies
```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

## 🎯 Usage

### Development Mode
```bash
# Start development server
pnpm dev
# Or
pnpm start

# Visit http://localhost:5173
```

### Production Build
```bash
# Type checking
pnpm type-check

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Code Quality
```bash
# ESLint check and fix
pnpm lint

# Prettier formatting
pnpm format

# Clean build files
pnpm clean
```

## 📁 Project Structure

```
pixel-2d/
├── src/
│   ├── components/          # Components directory
│   │   ├── editor2d/       # 2D editor core components
│   │   │   ├── Editor2d.vue        # Main editor component
│   │   │   ├── header/             # Top toolbar
│   │   │   ├── graphics/           # Graphics library panel
│   │   │   ├── editor-view/        # Canvas editing area
│   │   │   ├── props/              # Property configuration panel
│   │   │   ├── core/               # Editor core logic
│   │   │   └── edit-code/          # Code editor
│   │   └── common/         # Common components
│   ├── core/               # Core architecture modules
│   │   ├── Editor.ts               # Editor core class
│   │   ├── ioc/                    # IoC container (dependency injection)
│   │   ├── events/                 # Event bus
│   │   ├── commands/               # Command system
│   │   ├── plugins/                # Plugin system
│   │   ├── renderer/               # Renderer abstraction layer
│   │   ├── state/                  # State machine management
│   │   ├── services/               # Core services
│   │   ├── lifecycle/              # Lifecycle management
│   │   ├── constants/              # Constant definitions
│   │   └── utils/                  # Core utilities
│   ├── views/              # Page views
│   ├── router/             # Router configuration
│   ├── stores/             # Pinia state management
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── data/               # Data configuration
│   ├── styles/             # Global styles
│   ├── App.vue             # Root component
│   └── main.ts             # Application entry
├── public/                 # Static assets
├── .vscode/                # VSCode configuration
├── package.json            # Project configuration
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
└── README.md               # Project documentation
```

### Core Architecture Modules

The project adopts a modern enterprise-level architecture design:

#### 1. Dependency Injection Container (IoC)
- **Function**: Manage service lifecycles and dependencies
- **Features**: Supports singleton, transient, and scoped lifecycle modes, automatic circular dependency resolution
- **File**: `src/core/ioc/Container.ts`

#### 2. Event Bus
- **Function**: Implement global event publish-subscribe mechanism
- **Features**: Priority sorting, event interceptors, asynchronous processing, one-time listening
- **File**: `src/core/events/EventBus.ts`

#### 3. Command System
- **Function**: Implement complete undo/redo functionality
- **Features**: Command pattern based, supports command history, transaction processing, maximum history limit
- **File**: `src/core/commands/CommandManager.ts`

#### 4. Plugin System
- **Function**: Support feature extension and custom plugins
- **Features**: Modular plugin architecture, plugin state management and lifecycle support
- **File**: `src/core/plugins/PluginManager.ts`

#### 5. Renderer Abstraction
- **Function**: Provide unified rendering interface
- **Features**: Multi-renderer support (Canvas/SVG), abstract renderer base class
- **File**: `src/core/renderer/BaseRenderer.ts`

#### 6. State Management
- **Function**: Manage various editor states
- **Features**: Finite state machine based, supports state transitions and hook functions
- **File**: `src/core/state/StateMachine.ts`

#### 7. Service Registry
- **Function**: Unified service registration and resolution mechanism
- **Features**: Centralized core service management, simplified service acquisition
- **File**: `src/core/services/ServiceRegistry.ts`

#### 8. Lifecycle Management
- **Function**: Manage complete editor lifecycle
- **Features**: Standardized lifecycle hooks, supports initialization, destruction phases
- **File**: `src/core/lifecycle/EditorLifecycle.ts`

## ✅ Implemented Features

### Basic Features
- [x] Project framework setup
- [x] Editor basic layout
- [x] Element management (drawings, system components, custom components)
- [x] Canvas editing functionality
- [x] Drawing tools (pen, pencil, magnifier)
- [x] Canvas operations (undo, redo, zoom)
- [x] Line tools (curves, polylines, straight lines, mind map curves)
- [x] Connector styles (start and end arrows)
- [x] Auto anchor positioning
- [x] Minimap navigation
- [x] Canvas state management (edit, preview, lock)
- [x] Real-time preview

### Configuration Features
- [x] Element appearance configuration
- [x] Dynamic event configuration
- [x] Animation effect configuration
- [x] Video element support
- [x] iframe element support
- [x] Custom animation frames
- [x] Dynamic data binding
- [x] Layout and structure settings

### Communication Features
- [x] WebSocket communication binding
- [x] MQTT protocol support
- [x] HTTP protocol support

### Core Architecture
- [x] Dependency injection container (IoC)
- [x] Global event bus
- [x] Command pattern system
- [x] Plugin management system
- [x] Multi-renderer support
- [x] State machine management
- [x] Service registry center
- [x] Lifecycle management

## 🚧 Features in Development

- [ ] Canvas right-click menu
- [ ] Complete drawing communication binding
- [ ] Common element library expansion
- [ ] Global menu configuration optimization
- [ ] Image resource management optimization
- [ ] More graphics library expansion
- [ ] Performance optimization and memory management
- [ ] Internationalization support
- [ ] Theme system
- [ ] Shortcut key system improvement

## 🔧 Configuration

### Development Environment

The project uses `.env.development` for development environment variables:
```env
# Development environment configuration
VITE_APP_TITLE=Pixel-2D Editor
VITE_APP_ENV=development
```

### Production Environment

Use `.env.production` for production configuration:
```env
# Production environment configuration
VITE_APP_TITLE=Pixel-2D Editor
VITE_APP_ENV=production
```

## 📝 Development Guide

### Code Standards

The project uses ESLint and Prettier for code management:

- **ESLint**: Code quality checking, configuration file `eslint.config.js`
- **Prettier**: Code formatting, configuration file `.prettierrc.json`

Before committing code, please run:
```bash
pnpm lint    # Check and auto-fix
pnpm format  # Format code
```

### Component Development

1. All components use Vue 3 Composition API
2. Use TypeScript for type constraints
3. Component files use PascalCase naming
4. Styles use scoped less

### Commit Guidelines

Recommended conventional commit format:
```
feat: New feature
fix: Bug fix
docs: Documentation update
style: Code format adjustment
refactor: Code refactoring
perf: Performance optimization
test: Testing related
chore: Build/toolchain related
```

## 🤝 Contributing

Contributions via Issues and Pull Requests are welcome!

1. Fork this repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the Apache-2.0 License

## 👨‍💻 Author

MC.Yang

## 🙏 Acknowledgments

- [Meta2D](https://github.com/le5le-com/meta2d.js) - Powerful 2D graphics engine
- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework
- [TDesign](https://tdesign.tencent.com/) - Enterprise design system
- [Vite](https://vitejs.dev/) - Next generation frontend build tool
