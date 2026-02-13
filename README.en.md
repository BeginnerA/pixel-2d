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
- **Modular Design**: Clear layered architecture
- **TypeScript**: Full type support
- **Responsive Layout**: Adaptive to various screen sizes
- **Plugin-based Extension**: Custom plugin support

## 🚀 Technology Stack

### Core Framework
- **Vue 3.5.12** - Progressive JavaScript Framework
- **TypeScript 5.6.3** - JavaScript Superset
- **Vite 5.4.11** - Next Generation Frontend Build Tool

### UI Component Library
- **TDesign Vue Next 1.10.1** - Tencent Enterprise Design System
- **TDesign Icons** - Icon Component Library

### Graphics Engine
- **Meta2D Core 1.0.59** - Core Rendering Engine
- **Meta2D Graphics Suite**
  - Flow Diagram - Flowcharts
  - Sequence Diagram - Sequence Diagrams
  - Class Diagram - Class Diagrams
  - Activity Diagram - Activity Diagrams
  - Chart Diagram - Charts
  - Form Diagram - Forms
  - FTA Diagram - Fault Tree Analysis

### State Management
- **Pinia 2.2.6** - Official Vue State Management
- **Vue Router 4.4.5** - Official Router Manager

### Development Tools
- **ESLint** - Code Quality Checking
- **Prettier** - Code Formatting
- **Monaco Editor** - Code Editor

## 📦 Installation

### Requirements
- Node.js >= 18.0.0
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
│   │   │   └── core/               # Core logic
│   │   └── common/         # Common components
│   ├── core/               # Core architecture modules
│   │   ├── Editor.ts               # Editor core class
│   │   ├── ioc/                    # IoC container
│   │   ├── events/                 # Event bus
│   │   ├── commands/               # Command system
│   │   ├── plugins/                # Plugin system
│   │   ├── canvas/                 # Renderer abstraction
│   │   └── state/                  # State machine
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

## ✅ Implemented Features

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
- [x] Element appearance configuration
- [x] Dynamic event configuration
- [x] Animation effect configuration
- [x] Video element support
- [x] iframe element support
- [x] Custom animation frames
- [x] Dynamic data binding
- [x] Layout and structure settings
- [x] WebSocket communication binding

## 🚧 Features in Development

- [ ] Canvas right-click menu
- [ ] Complete drawing communication binding
- [ ] MQTT protocol support
- [ ] HTTP protocol support
- [ ] Common element library expansion
- [ ] Global menu configuration optimization
- [ ] Image resource management optimization

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
