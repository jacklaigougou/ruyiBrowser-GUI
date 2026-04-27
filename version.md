# Changelog

## [Unreleased]

### v0.5.0 — ui: 全局界面美化，现代 SaaS 风格重设计

- `src/renderer/style.css`：完整重写全局样式
  - 新设计变量体系：`--accent: #6366F1`（靛蓝）替换旧蓝色，新增 `--accent-hover/light/dim`、`--radius-sm/lg`、`--shadow-xs/md/lg` 层次
  - 字体：引入 Google Fonts Plus Jakarta Sans，提升西文排版质感
  - 侧边栏：移除 border-left 指示条，改为圆角背景高亮激活态
  - 表格：表头全大写 + 字间距，行间距增加，hover 带极淡蓝底
  - 按钮：primary 加 box-shadow 光晕，新增 `.btn--sm`、`.btn--success`、pill 风格 `.tab-opt`
  - Modal：添加 `backdrop-filter: blur(2px)`，卡片加 border
  - Toggle：开关加 box-shadow 立体感
  - 新增 `.proxy-tag / .proxy-tag--active`：代理状态标签，无代理灰色，有代理靛蓝
  - 新增 `.env-name-badge`：环境名加粗展示
  - 新增 `.meta-chip`：时区/时间次要信息样式
  - 滚动条：细化为 5px，hover 变靛蓝
- `src/renderer/views/environment/index.vue`：更新环境列表模板
  - 环境名称使用 `.env-name-badge`
  - 代理列使用 `.proxy-tag` + `.proxy-tag--active` 条件类
  - 时区 / 创建时间使用 `.meta-chip`
  - 操作按钮：启动改为 `.btn--success`，全部添加 `.btn--sm` 紧凑版

### v0.4.9 — feat: 图标更新为如意1.svg、任务栏图标修复

- `make-icon.js`：重构为支持命令行参数指定 SVG 源文件，使用 `png-to-ico` ESM 导入修复兼容性
- `src/main/main.js`：`createWindow()` 新增图标路径自动检测并绑定到窗口；`app.whenReady()` 中设置 `appUserModelId` 修复 Windows 任务栏显示默认 Electron 图标问题
- `assets/`：更新为如意1.svg 渲染的多尺寸图标（16/32/48/64/128/256px）

### v0.4.7 — fix+feat: 打包路径修复、自定义图标

- `src/main/main.js`：
  - 新增 `getDataDir()` 辅助函数，所有 `data/` 路径改用 `app.getPath('userData')` 确保打包后数据持久化到用户目录
  - `createWindow()`：dev/prod 模式互斥加载，生产用 `app.getAppPath()` 定位 index.html 和 preload.js
  - `startPythonServer()`：打包后从 `process.resourcesPath/python` 启动，开发时用源码目录
- `package.json`：
  - `build.files` 新增 `dist/renderer/**/*`，修复打包后页面缺失导致无法启动的问题
  - `build.icon` 配置为 `assets/icon.ico`
  - `build.asarUnpack` 添加 `better-sqlite3` native 模块
  - `build.extraResources` 将 python 目录打入安装包
- `assets/icon.ico`：新增应用图标（多尺寸 16/32/48/64/128/256px）
- `assets/icon.png`：新增 256px PNG 图标源文件
- `assets/icon.svg`：新增 SVG 矢量图标

### v0.4.6 — fix+feat: 语言固定英文、启动错误弹窗提示

- `src/renderer/views/environment/create/TabFingerprint.vue`：根据 IP 设置时，语言不再根据国家代码映射，固定为 `en-US,en`
- `src/renderer/views/environment/index.vue`：`launch()` 函数增加 try/catch 错误处理，启动失败时弹窗提示具体错误信息
- `CLAUDE.md`：新增 git 提交规范（version.md 记录 + 版本号）

### v0.4.5 — feat: 环境文件持久化 + 启动修复

- `src/main/main.js`：
  - 新增 `getEnvDir(envId)`：环境文件目录固定为 `data/envs/<id>/`
  - 新增 `writeEnvFiles(env)`：创建/更新环境时同步写 `fpfile.txt`；有代理写完整 `user.js`（host/port/ssl），无代理写 `proxy.type=0` 清除残留
  - 新增 `deleteEnvFiles(envId)`：删除环境时递归删除整个目录
  - `ruyi:db-create-env`：insert 后立即调用 `writeEnvFiles`
  - `ruyi:db-update-env`：update 后重新读 DB 覆盖调用 `writeEnvFiles`
  - `ruyi:db-delete-env`：DELETE 后调用 `deleteEnvFiles`
  - `ruyi:launch`：启动前调用 `writeEnvFiles` 保证文件最新；将 `user.js` 从 `data/envs/<id>/` 复制到 Firefox profile 目录；改为直接 `spawn(foxprintPath, ['--fpfile=...', '--profile=...'])` 启动，不再经过 Python bridge；移除旧的临时 fpfile 生成与删除逻辑
  - 新增 `resolveInstalledFoxprintPath()`：在系统安装目录自动扫描 foxprint.exe / firefox.exe
  - 新增 `getFoxprintInstallerPath()`：返回 `data/foxprint/foxprint.exe` 路径用于错误提示
- `python/server.py`：
  - `api_launch`：参数名修正为 `exe_path`/`profile`/`fpfile`，对应 `set_browser_path`/`set_user_dir`/`set_fpfile`，移除未用的 `FirefoxPage` 导入

### v0.4.4 — feat: 环境修改功能

- `src/main/main.js`：新增 `ruyi:db-get-env`（按 id 查单条）和 `ruyi:db-update-env`（UPDATE 全字段）IPC handler
- `src/preload/preload.js`：暴露 `dbGetEnv(id)`、`dbUpdateEnv(id, env)`
- `src/renderer/main.js`：新增路由 `/environment/edit/:id`，复用 create 页面
- `create/index.vue`：
  - 路由参数 `id` 存在时进入编辑模式，标题改为「修改环境」
  - `onMounted` 通过 `dbGetEnv` 加载 DB 行，将所有 snake_case 字段回填到 camelCase form（含时区/语言模式推断）
  - `save()` 区分新建（dbCreateEnv）和编辑（dbUpdateEnv）
- `environment/index.vue`：操作列新增「修改」按钮，点击跳转 `/environment/edit/:id`

### v0.4.3 — feat: 预览弹窗增强、复制按钮、代理地址端口分类、WebRTC IP修正

- `index.vue`：
  - 预览弹窗新增「复制」按钮，复制当前过滤内容到剪贴板
  - 新增「代理地址端口」分类，展示 `user_pref("network.proxy.xxx")` 格式行（预览时动态生成）
  - WebRTC 默认模式改为 `proxy`
  - `buildEnv()` 修正：localIpv4/publicIpv4 优先取表单手填值，再回退到代理 Host；IPv6 字段同步透传
  - `buildEnv()` 移除 resolutionMode=random 时强制清空宽高的逻辑
  - 过滤前缀调整：`region` 加入 `speech.`，`hardware` 键名修正为实际输出键，`webrtc` 前缀更新为实际 fpfile 键名

### v0.4.2 — fix: 预览分类过滤 webdriver 归类修正

- `index.vue`：`webdriver:` 前缀从「指纹与硬件」分类移至「WebRTC」分类，修复「指纹与硬件」模式下仅显示 `webdriver:0` 的问题

### v0.4.1 — fix: fpfile预览数据缺失修正、预览加分类下拉过滤

- `src/main/main.js`：`ruyi:preview-fpfile` handler 新增 camelCase→snake_case 字段映射，修复前端传入字段名与 `buildFpfileLines()` 期望字段名不一致导致 WebGL/canvas/屏幕宽高等参数全部缺失的问题
- `index.vue`：
  - 预览弹窗标题行右侧新增分类下拉（全部 / 地区与语言 / WebGL / 指纹与硬件 / 代理认证 / 语音 / WebRTC），实时按前缀过滤显示的 fpfile 行
  - `fpfileLines` 存原始行数组，`filteredPreview` computed 按分类过滤后渲染

### v0.3.10 — feat: 根据IP设置读取代理IP

- `TabFingerprint.vue`：点击「根据 IP 设置」时，若代理页已填写代理类型（非直连）和代理 Host，则将代理 IP 传入 `queryIp()` 进行查询，否则查本机 IP

### v0.3.9 — feat: fpfile 预览、WebGL设置重构、fpfile键名修正

- `TabAdvanced.vue`：重命名为 WebGL 设置，所有 WebGL 字段改为 ComboInput 下拉输入；新增「一键设置」按钮，随机从 6 款 GPU 预设（AMD/NVIDIA/Intel）中选一套并填入所有 WebGL 参数
- `index.vue`：Tab「高级设置」改名为「WebGL 设置」；header 新增「查看」按钮，点击弹窗预览最终生成的 fpfile 内容
- `src/main/main.js`：
  - 数据库表新增列：`webgl_version`、`webgl_glsl_version`、`webgl_max_cube_map`、`webgl_max_texture_units`、`webgl_max_vertex_attribs`、`webgl_aliased_point_max`、`webgl_max_viewport_dim`
  - INSERT 语句同步更新
  - 新增 `ruyi:preview-fpfile` IPC handler，返回 fpfile 预览文本
  - `buildFpfileLines()` 键名全部修正为 foxprint 实际格式：`canvas`（非 canvasSeed）、`webgl.vendor/renderer/version/glsl_version/unmasked_vendor/unmasked_renderer/max_texture_size/max_cube_map_texture_size/max_texture_image_units/max_vertex_attribs/aliased_point_size_max/max_viewport_dim`、`width`/`height`（非 screenWidth/screenHeight）；新增 `httpauth.username`/`httpauth.password` 从代理凭据写入
- `src/preload/preload.js`：暴露 `previewFpfile(env)`

### v0.3.8 — feat: 指纹页重构、一键设置、硬件噪音删除、根据IP设置

- `TabFingerprint.vue`：两张可折叠卡片（地区与语言 / 硬件与指纹），标题栏下加分割线；卡片二新增「一键设置」按钮（随机 CPU 核心数、Canvas 种子 0-100、User-Agent、读取真实屏幕分辨率）；删除硬件噪音卡片；「查询 IP」改名为「根据 IP 设置」；系统字体集改为下拉（windows/linux/mac）；CPU 核心数 + Canvas 种子 + 字体同行；屏幕宽高同行后接 WebDriver 按钮组；User-Agent 置末行
- `src/main/main.js`：新增 `ruyi:screen-size` IPC handler
- `src/preload/preload.js`：暴露 `screenSize()`

### v0.3.7 — ui: 测试连通结果改为弹窗提示

- `TabProxy.vue`：测试连通成功/失败结果从行内文字改为 Modal 弹窗，点确定或遮罩关闭

### v0.3.6 — feat: 代理页重构、测试连通、一次性输入解析

- `TabProxy.vue`：
  - 仿指纹配置结构，改为两张可折叠卡片（代理设置 / WebRTC），标题栏下加分割线
  - 代理类型改为 tab-opt 按钮组（直连/HTTP/SOCKS5），WebRTC 改为按钮组（禁用/真实/使用代理）
  - 新增「一次性输入」行，支持 `ip|port|user|pass` 或 `ip:port:user:pass` 格式自动解析填入
  - 用户名和密码合并为同一行
  - Host 和端口同行，后接「测试连通」按钮及结果提示
- `src/main/main.js`：
  - 新增 `ruyi:test-proxy` IPC handler，HTTP 代理用 CONNECT 隧道测试，SOCKS5 完整握手（支持用户名密码认证），超时 8 秒
  - 修复 `registerIpcHandlers` 函数缺少闭合 `}` 的语法错误
- `src/preload/preload.js`：暴露 `testProxy(opts)`

### v0.3.5 — feat: 一键设置、分割线、删除硬件噪音、重命名按钮

- `TabFingerprint.vue`：
  - 硬件与指纹卡新增「一键设置」按钮，随机填入 CPU 核心数、Canvas 噪声种子（0-100）、User-Agent，屏幕宽高读取真实屏幕分辨率
  - 删除硬件噪音卡片
  - 「查询 IP」按钮改名为「根据IP设置」
  - 两张可折叠卡片标题栏下方各加分割线
- `src/main/main.js`：新增 `ruyi:screen-size` IPC handler，返回主屏幕 `width/height`
- `src/preload/preload.js`：暴露 `screenSize()`

### v0.3.4 — ui: 硬件与指纹卡片布局重构、WebDriver 字段移入指纹卡、字体集简化

- `TabFingerprint.vue`：
  - 卡片二（硬件与指纹）改为可折叠，新增标题"硬件与指纹"
  - 系统字体集简化为直接下拉（Windows/Linux/Mac），默认 Windows，去掉默认/自定义两态
  - 系统字体集 + CPU 逻辑核心数 + Canvas 噪声种子合并为第一行
  - 屏幕宽高合并为一行，后接 WebDriver 隐藏/暴露按钮组
  - User-Agent 移至最后一行
  - WebDriver 字段从 TabAdvanced 移入硬件与指纹卡，绑定 `form.webdriver`
- `TabProxy.vue`：代理类型、WebRTC 下拉框改为 `width:auto`，修复撑满整行问题
- `index.vue`：`fontMode` 字段移除，`fontSystem` 默认值改为 `'windows'`；概要面板字体列直接显示 `form.fontSystem`；保存时直接传 `fontSystem`

### v0.3.3 — feat: speech 语音映射、语音预览行、同行输入框布局

- `src/main/http/speechVoiceMap.js`：新增文件，内含 22 种语言的 Windows 内置语音映射表及 countryCode→lang 映射；`buildSpeechLines()` 生成 6 条 speech.* fpfile 配置行
- `src/main/main.js`：引入 `buildSpeechLines`，`buildFpfileLines()` 中从 `env.language` 提取主语言代码，自动写入 speech 配置
- `TabFingerprint.vue`：
  - 新增「语音」独立行，实时显示当前语言对应的默认语音预览
  - 时区、地理位置、语言改为同行布局（按钮组 + 输入框在同一行）
  - 按钮组固定宽度 230px，输入框 flex:1 撑满剩余空间
- `style.css`：`.combo-input-row` 加 `width:100%`，修复 ComboInput 宽度未撑满问题；`.combo-wrap` 移除默认 `margin-top`

### v0.3.2 — feat: IP 查询、ComboInput 组件、布局修复、样式优化

- `src/main/http/ipQuery.js`：新增文件，封装 `ip-api.com` 免费 IP 地理信息查询
- `src/main/main.js`：注册 `ruyi:query-ip` IPC handler；引入 `./http/ipQuery`
- `src/preload/preload.js`：暴露 `window.ruyi.queryIp(ip)`
- `src/renderer/components/ComboInput.vue`：新增可输入+可下拉组合框组件，支持字符串/对象选项、模糊过滤、点击外部关闭
- `TabFingerprint.vue`：
  - 卡片右上角加「查询 IP」按钮，点击后自动填入时区、语言、地理位置
  - 时区/语言输入框改为 `ComboInput`，支持预设下拉
  - 删除「界面语言」字段（fpfile 只支持单一 language 字段）
  - 删除地理位置「每次询问」toggle
  - 分辨率、字体移入第二张卡片（与 UA/WebGL 同卡）
  - 语言预设格式符合 fpfile 规范（如 `zh-CN,zh`）
- `style.css`：
  - `.create-form` 加 `min-width: 0`，修复概要面板被挤出可视区域的布局 bug
  - `.main-content:has(.create-page)` 加 `height: 100%; display: flex; flex-direction: column`
  - `.create-page` 改为 `flex: 1; min-height: 0`
  - `.tab-opt` 改为独立圆角（后调整为小圆角）pill 风格，选中态浅蓝底+蓝字
  - 新增 `.combo-wrap / .combo-input-row / .combo-arrow / .combo-dropdown` 样式
  - 新增 `.card-toolbar` 卡片右上角工具栏样式

### v0.3.1 — ui: card layout polish + label/WebRTC fixes
- `TabBasic.vue`：三字段合并为一张卡片；「fox浏览器」标签改为「浏览器」；移除字数计数显示
- `TabProxy.vue`：WebRTC 移回代理信息 Tab，改为4个可填写 IP 输入框（本地/公网 IPv4/IPv6）；代理字段与 WebRTC 字段分两张卡片
- `TabFingerprint.vue`：移除 WebRTC 区块；字段分3张卡片（地区语言 / UA+WebGL / 硬件噪音）
- `TabAdvanced.vue`：字段合入一张卡片
- `style.css`：
  - 新增 `.form-card`：卡片容器（8px圆角、双层阴影、`0 20px` 内边距）
  - `.field-label`：改为左对齐，宽度收至 56px
  - `.field-row` gap 从 24px 收至 12px
  - 卡片内分割线已移除


- `create/index.vue`：重构为薄壳组件，用 `v-show` 加载4个 Tab 子组件，保留概要面板和 save 逻辑；form 增加 `timezoneMode / geoMode / geoLat / geoLon / geoPermission / languageMode / uiLangMode / uiLang / resolutionMode / resolutionPreset / fontMode / noise*` 字段
- 新增 `create/TabBasic.vue`：基础设置（名称、foxprint 下载、备注）
- 新增 `create/TabProxy.vue`：代理信息（类型/Host/Port/用户名/密码），WebRTC 已移至指纹配置
- 新增 `create/TabFingerprint.vue`：指纹配置，仿截图风格重设计
  - WebRTC：5 选项分段按钮（转发/替换/真实/禁用/代理UDP）
  - 时区/地理位置/语言/界面语言：分段按钮 + 条件输入框
  - 分辨率：随机/预定义/自定义三态，预定义时显示下拉
  - 字体：默认/自定义
  - User-Agent / Canvas种子 / WebGL字段
  - 硬件噪音：Canvas/WebGL图像/AudioContext/媒体设备/ClientRects/SpeechVoices — iOS 风格 toggle 开关
- 新增 `create/TabAdvanced.vue`：高级设置（CPU核心、屏幕分辨率、WebDriver标记）
- `style.css`：
  - `.field-label` 改为 `color: var(--accent)`（蓝色，匹配截图）
  - 新增 `.toggle` / `.toggle-slider` / `.toggle-wrap`：iOS 风格开关样式
  - 新增 `.noise-row`：硬件噪音开关横向排列容器

### feat: SQLite persistence + foxprint auto-download + fpfile generation
- `src/main/main.js`：
  - 新增 `initDatabase()`：在 `data/ruyipage.db` 初始化 environments 表（better-sqlite3，WAL模式）
  - `ruyi:launch` handler：当传入 `envId` 时，从数据库读取环境配置，临时生成 fpfile，启动后自动删除
  - 新增 `ruyi:db-list-envs`、`ruyi:db-create-env`、`ruyi:db-delete-env` IPC handlers
  - 新增 `ruyi:download-foxprint`：自动查询 GitHub Releases API，下载最新 .exe 到 `data/foxprint/foxprint.exe`，实时发送 `ruyi:download-progress` 进度事件
  - 新增 `ruyi:foxprint-path`：检测 foxprint.exe 是否已存在
  - 新增 `buildFpfileLines(env)`：根据数据库环境配置生成 fpfile key:value 行
  - 新增 `fetchJson()` / `downloadFile()`：HTTP/HTTPS 工具函数，支持 301/302 重定向
- `src/preload/preload.js`：暴露 `dbListEnvs`、`dbCreateEnv`、`dbDeleteEnv`、`downloadFoxprint`、`foxprintPath`、`onDownloadProgress`、`offDownloadProgress`
- `src/renderer/views/environment/create/index.vue`：
  - 基础设置：移除 exePath / profileDir / fpfilePath 手动输入字段
  - 新增 foxprint.exe 状态显示（已就绪 / 未下载）+ 下载按钮 + 进度条
  - 保存改为调用 `window.ruyi.dbCreateEnv()`，写入 SQLite
- `src/renderer/views/environment/index.vue`：
  - 列表改为 `window.ruyi.dbListEnvs()` 从数据库加载
  - 启动改为 `window.ruyi.launch({ envId })` 传 ID
  - 删除改为 `window.ruyi.dbDeleteEnv(id)` 后刷新列表
  - 移除浏览器可执行文件列（改由内部管理）
- `src/renderer/style.css`：新增 `.foxprint-status`、`.foxprint-ok`、`.foxprint-warn`、`.download-progress`、`.download-bar`、`.download-bar-fill`、`.download-pct`
- `package.json`：新增 `postinstall` 脚本自动 rebuild better-sqlite3；`better-sqlite3 ^12.9.0` 加入 dependencies；`@electron/rebuild ^4.0.4` 加入 devDependencies


- `create/index.vue`：改为顶部 Tab 导航 + 左表单 + 右概要两栏布局
  - Tab：基础设置 / 代理信息 / 指纹配置 / 高级设置
  - 代理信息：代理类型切换 + WebRTC 三态选项组
  - 右侧概要面板实时反映所有配置项
- 新增 `create/SummaryRow.vue`：概要面板行组件
- `style.css`：新增 tab-nav / field-row / summary-panel 等全套样式

### feat: environment create page with full fingerprint fields
- 新增路由 `/environment/create`
- 新增 `views/environment/create/index.vue`：独立新建环境页面（路由跳转，非 Modal）
  - 分四个区块：基础信息 / 网络WebRTC / 语言地区 / 硬件指纹
  - 字段覆盖 firefox-fingerprintBrowser 所有 fpfile 配置项
  - 保存后写入 `useEnvStore`，跳回列表页
- 新增 `composables/useEnvStore.js`：环境列表全局单例（add/remove/get）
- `views/environment/index.vue`：新建按钮改为路由跳转，表格新增时区列，启动参数对齐 foxprint.exe
- `style.css`：新增 `.form-section`、`.form-grid`、`.form-item` 等表单布局样式

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
