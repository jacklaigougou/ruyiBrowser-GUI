# Changelog

## [Unreleased]

---

## [0.2.0] - 2026-04-27

### docs: add version.md with full changelog
- 新增 `version.md`，补录项目初始化至今所有提交的改动记录
- 建立 `[Unreleased]` 区块规范，每次 commit 前在此追加变更



### b72f290 — feat: remove unused views, build environment management page
- 删除 `views/browser`、`views/dashboard`、`views/sessions` 目录
- 新增 `views/environment/index.vue`：环境管理页
  - 表格展示环境列表（名称、浏览器路径、代理、创建时间）
  - 「新建环境」Modal：支持名称、路径、用户目录、代理、轨迹算法、无头模式
  - 启动按钮调用 `window.ruyi.launch()`，删除按钮移除列表项

### 4d902b0 — fix: replace emoji nav icons with clean SVG line icons
- `AppSidebar.vue`：将 emoji 字符图标替换为 Lucide 风格 SVG 线条图标
  - 环境管理 → Layers 叠层图标
  - 系统设置 → 齿轮图标
- `style.css`：`.nav-icon` 改为透明背景 + 描边色，active 状态变蓝

### d034450 — refactor: simplify sidebar to two flat nav items
- `AppSidebar.vue`：去掉两级折叠结构，改为扁平两项导航
- 路由更新：仅保留 `/environment` 和 `/settings`
- 新增 `views/environment/index.vue` 占位页
- 清理 `style.css` 中折叠分组（nav-group / nav-children）相关样式

### e077c82 — fix: devtools button not working
- `TitleBar.vue`：将模板内联 `window.ruyi.devtools()` 移至 `script setup` 函数，修复 Vue 模板无法访问 `window` 的问题

### 22c0e24 — feat: custom title bar with DevTools icon
- `main.js`：启用 `titleBarStyle: 'hidden'` + `titleBarOverlay`，隐藏原生标题栏同时保留 Windows 原生控制按钮
- 新增 `components/TitleBar.vue`：自定义拖拽标题栏，`</>` 图标紧贴系统按钮左侧
- `AppLayout.vue`：改为垂直布局（TitleBar 在顶部）
- `AppSidebar.vue`：移除侧边栏内的 DevTools 按钮

### 1ba2572 — fix: devtools auto-open on startup
- `main.js`：移除 `--dev` 模式下自动调用 `openDevTools()` 的逻辑

### 73f38ee — feat: hide menu bar and add DevTools toggle
- `main.js`：`autoHideMenuBar: true` 隐藏 File/Edit/View 等系统菜单栏
- `main.js`：新增 `ruyi:devtools` IPC handler，调用 `toggleDevTools()`
- `preload.js`：暴露 `window.ruyi.devtools()`
- `AppSidebar.vue`：侧边栏底部加 DevTools 切换按钮（后被移至标题栏）

### d3960f2 — feat: redesign UI to light theme
- `style.css`：全面重写为浅色主题（`#f0f2f5` 背景、白色卡片、Element Plus 色板）
- `AppSidebar.vue`：树形可折叠导航，active 项左侧蓝色竖线
- 所有 view 改用 `page-card` + `page-header` 布局
- `sessions/index.vue`：改为 `data-table` 表格样式
- 新增 `.btn--danger`、`.btn--text`、`.titlebar-btn` 等样式

### 4dea350 — refactor: restructure renderer into components/ + domain views/
- 新增 `components/AppLayout.vue`：布局 shell（侧边栏 + `<slot>`）
- 新增 `components/AppSidebar.vue`：导航 + 服务状态
- `composables/useHealth.js`：重构为纯单例 store + `refreshHealth()`，消除多实例 timer 泄漏
- 新增 `composables/useOpResult.js`：抽取操作结果/日志通用 pattern
- `views/` 按功能域分目录：`dashboard/`、`sessions/`、`browser/`、`settings/`
- 路由改为 lazy import（动态 import）

### 51de8b4 — feat: migrate renderer to Vite + Vue3
- 引入 Vite + `@vitejs/plugin-vue` + `vue-router`
- 旧纯 HTML/CSS/JS renderer 全部迁移为 Vue3 SFC
- `main.js`：Vue 挂载 + Hash 路由配置
- `App.vue`：根组件，唯一健康检测轮询
- `npm run dev`：`concurrently` 并行启动 Vite dev server + Electron

### 9f3c6b3 — feat: add uv Python environment
- `python/` 目录下执行 `uv init`，添加 `ruyipage>=1.2.1` 依赖
- `python/pyproject.toml`、`python/uv.lock`、`python/.python-version` 入库
- `main.js`：Electron 启动时自动 `uv run server.py`，关闭时 kill 进程
- `.gitignore`：排除 `python/.venv/`

### b2c734e — feat: init project scaffold
- 初始化 `package.json`、`.gitignore`、`README.md`
- `src/main/main.js`：Electron 主进程 + 所有 IPC handlers
- `src/main/python-bridge.js`：HTTP fetch 封装，调用 Python 服务
- `src/preload/preload.js`：`contextBridge` 安全 API 暴露
- `src/renderer/`：原始 HTML/CSS/JS UI（后被 Vue 替换）
- `python/server.py`：ruyipage HTTP 桥接服务，监听 `127.0.0.1:7788`
