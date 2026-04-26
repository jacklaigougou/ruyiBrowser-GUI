const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const pythonBridge = require('./python-bridge')

let mainWindow
let pythonProcess = null

// ─── Python 服务生命周期 ───────────────────────────────────────────────────────

function startPythonServer() {
  const pythonDir = path.join(__dirname, '../../python')
  // uv run 会自动激活 python/.venv 里的环境
  pythonProcess = spawn('uv', ['run', 'server.py'], {
    cwd: pythonDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
  })

  pythonProcess.stdout.on('data', (d) => process.stdout.write(`[python] ${d}`))
  pythonProcess.stderr.on('data', (d) => process.stderr.write(`[python] ${d}`))

  pythonProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`[python] server exited with code ${code}`)
    }
    pythonProcess = null
  })
}

function stopPythonServer() {
  if (pythonProcess) {
    pythonProcess.kill()
    pythonProcess = null
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: 'ruyiPage GUI',
    show: false,
    autoHideMenuBar: true,
  })

  mainWindow.loadFile(path.join(__dirname, '../../dist/renderer/index.html'))

  if (process.argv.includes('--dev')) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
}

app.whenReady().then(() => {
  startPythonServer()
  createWindow()
  registerIpcHandlers()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  stopPythonServer()
  if (process.platform !== 'darwin') app.quit()
})

// ─── IPC 处理器：所有与Python的通信都在main进程完成 ───────────────────────────

function registerIpcHandlers() {
  // 启动浏览器会话
  ipcMain.handle('ruyi:launch', async (_event, options) => {
    return pythonBridge.call('launch', options)
  })

  // 导航到URL
  ipcMain.handle('ruyi:navigate', async (_event, { sessionId, url }) => {
    return pythonBridge.call('navigate', { sessionId, url })
  })

  // 元素查找
  ipcMain.handle('ruyi:find-element', async (_event, { sessionId, selector }) => {
    return pythonBridge.call('find_element', { sessionId, selector })
  })

  // 元素点击
  ipcMain.handle('ruyi:click', async (_event, { sessionId, selector }) => {
    return pythonBridge.call('click', { sessionId, selector })
  })

  // 输入文字
  ipcMain.handle('ruyi:input', async (_event, { sessionId, selector, text }) => {
    return pythonBridge.call('input', { sessionId, selector, text })
  })

  // 截图
  ipcMain.handle('ruyi:screenshot', async (_event, { sessionId }) => {
    return pythonBridge.call('screenshot', { sessionId })
  })

  // 获取Cookie
  ipcMain.handle('ruyi:get-cookies', async (_event, { sessionId }) => {
    return pythonBridge.call('get_cookies', { sessionId })
  })

  // 设置Cookie
  ipcMain.handle('ruyi:set-cookies', async (_event, { sessionId, cookies }) => {
    return pythonBridge.call('set_cookies', { sessionId, cookies })
  })

  // 获取页面信息
  ipcMain.handle('ruyi:page-info', async (_event, { sessionId }) => {
    return pythonBridge.call('page_info', { sessionId })
  })

  // 关闭会话
  ipcMain.handle('ruyi:close', async (_event, { sessionId }) => {
    return pythonBridge.call('close', { sessionId })
  })

  // 列出所有活跃会话
  ipcMain.handle('ruyi:list-sessions', async () => {
    return pythonBridge.call('list_sessions', {})
  })

  // 执行JS
  ipcMain.handle('ruyi:execute-script', async (_event, { sessionId, script }) => {
    return pythonBridge.call('execute_script', { sessionId, script })
  })

  // 设置代理
  ipcMain.handle('ruyi:set-proxy', async (_event, { sessionId, proxy }) => {
    return pythonBridge.call('set_proxy', { sessionId, proxy })
  })

  // 设置地理位置
  ipcMain.handle('ruyi:set-geolocation', async (_event, { sessionId, lat, lon }) => {
    return pythonBridge.call('set_geolocation', { sessionId, lat, lon })
  })

  // 获取Python服务状态
  ipcMain.handle('ruyi:health', async () => {
    return pythonBridge.health()
  })

  // 更新Python服务配置
  ipcMain.handle('ruyi:config', async (_event, config) => {
    pythonBridge.updateConfig(config)
    return { ok: true }
  })

  // 开关 DevTools
  ipcMain.handle('ruyi:devtools', () => {
    if (mainWindow) mainWindow.webContents.toggleDevTools()
  })
}
