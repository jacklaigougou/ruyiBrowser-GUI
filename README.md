# ruyiPage Electron GUI

基于 [ruyipage](https://github.com/LoseNine/ruyipage) 的 Electron 图形化工具。

## 架构

```
Renderer (UI only)
    ↓ window.ruyi.*
Preload (contextBridge, 仅暴露API)
    ↓ ipcRenderer.invoke
Main Process (所有业务逻辑)
    ↓ HTTP POST
Python HTTP Server (python/server.py)
    ↓
ruyipage (Firefox BiDi 自动化)
```

UI 层只负责展示，**所有网络请求、Python调用均在 main 进程完成**。

## 快速开始

### 1. 启动 Python 服务

```bash
cd python
pip install ruyipage
python server.py --port 7788
```

### 2. 启动 Electron

```bash
npm install
npm run dev
```

## 目录结构

```
src/
  main/
    main.js           # Electron main进程 + IPC handlers
    python-bridge.js  # HTTP调用Python服务
  preload/
    preload.js        # contextBridge，安全暴露API给renderer
  renderer/
    index.html        # UI骨架
    style.css         # 暗色主题样式
    app.js            # UI逻辑（只调用window.ruyi.*）
python/
  server.py           # ruyipage HTTP桥接服务
```
