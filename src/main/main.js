const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('path')
const fs = require('fs')
const https = require('https')
const http = require('http')
const { spawn } = require('child_process')
const pythonBridge = require('./python-bridge')
const { queryIp } = require('./http/ipQuery')
const { buildSpeechLines } = require('./http/speechVoiceMap')

let mainWindow
let pythonProcess = null
let db = null

// ─── SQLite 数据库 ────────────────────────────────────────────────────────────

function initDatabase() {
  const Database = require('better-sqlite3')
  const dataDir = path.join(__dirname, '../../data')
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

  db = new Database(path.join(dataDir, 'ruyipage.db'))
  db.pragma('journal_mode = WAL')

  db.exec(`
    CREATE TABLE IF NOT EXISTS environments (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      remark      TEXT DEFAULT '',
      proxy_type  TEXT DEFAULT 'none',
      proxy_host  TEXT DEFAULT '',
      proxy_port  TEXT DEFAULT '',
      proxy_user  TEXT DEFAULT '',
      proxy_pass  TEXT DEFAULT '',
      webrtc_mode TEXT DEFAULT 'disabled',
      local_ipv4  TEXT DEFAULT '',
      local_ipv6  TEXT DEFAULT '',
      public_ipv4 TEXT DEFAULT '',
      public_ipv6 TEXT DEFAULT '',
      timezone    TEXT DEFAULT '',
      language    TEXT DEFAULT '',
      font_system TEXT DEFAULT '',
      user_agent  TEXT DEFAULT '',
      canvas_seed INTEGER,
      webgl_vendor              TEXT DEFAULT '',
      webgl_renderer            TEXT DEFAULT '',
      webgl_unmasked_vendor     TEXT DEFAULT '',
      webgl_unmasked_renderer   TEXT DEFAULT '',
      webgl_max_texture         INTEGER,
      cpu_cores   INTEGER,
      screen_w    INTEGER,
      screen_h    INTEGER,
      webdriver   TEXT DEFAULT '0',
      created_at  TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    )
  `)
}

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
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#ffffff',
      symbolColor: '#606266',
      height: 40,
    },
  })

  mainWindow.loadFile(path.join(__dirname, '../../dist/renderer/index.html'))

  if (process.argv.includes('--dev')) {
    mainWindow.loadURL('http://localhost:5173')
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
}

app.whenReady().then(() => {
  initDatabase()
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
    // options.envId 时：从数据库读取环境，生成临时 fpfile 后启动
    if (options.envId) {
      const env = db.prepare('SELECT * FROM environments WHERE id = ?').get(options.envId)
      if (!env) return { ok: false, error: '环境不存在' }

      const foxprintPath = path.join(__dirname, '../../data/foxprint/foxprint.exe')
      if (!fs.existsSync(foxprintPath)) return { ok: false, error: '请先下载 foxprint.exe' }

      const tmpDir = path.join(__dirname, '../../data/tmp')
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
      const fpfilePath = path.join(tmpDir, `env_${env.id}_${Date.now()}.fpfile`)

      const lines = buildFpfileLines(env)
      fs.writeFileSync(fpfilePath, lines.join('\n'), 'utf8')

      const profileDir = path.join(__dirname, '../../data/profiles', String(env.id))
      if (!fs.existsSync(profileDir)) fs.mkdirSync(profileDir, { recursive: true })

      const launchOpts = {
        exe_path: foxprintPath,
        profile: profileDir,
        fpfile: fpfilePath,
      }
      if (env.proxy_type !== 'none' && env.proxy_host) {
        launchOpts.proxy = `${env.proxy_type}://${env.proxy_host}:${env.proxy_port}`
      }
      const result = await pythonBridge.call('launch', launchOpts)
      // 启动后清理临时 fpfile
      try { fs.unlinkSync(fpfilePath) } catch (_) {}
      return result
    }
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

  // 查询 IP 地理信息（时区/语言等）
  ipcMain.handle('ruyi:query-ip', async (_event, ip) => {
    return queryIp(ip || '')
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

  // ─── 环境数据库 CRUD ──────────────────────────────────────────────────────

  ipcMain.handle('ruyi:db-list-envs', () => {
    return db.prepare('SELECT * FROM environments ORDER BY id DESC').all()
  })

  ipcMain.handle('ruyi:db-create-env', (_event, env) => {
    const stmt = db.prepare(`
      INSERT INTO environments (
        name, remark,
        proxy_type, proxy_host, proxy_port, proxy_user, proxy_pass,
        webrtc_mode, local_ipv4, local_ipv6, public_ipv4, public_ipv6,
        timezone, language, font_system, user_agent,
        canvas_seed, webgl_vendor, webgl_renderer,
        webgl_unmasked_vendor, webgl_unmasked_renderer, webgl_max_texture,
        cpu_cores, screen_w, screen_h, webdriver
      ) VALUES (
        @name, @remark,
        @proxyType, @proxyHost, @proxyPort, @proxyUser, @proxyPass,
        @webrtcMode, @localIpv4, @localIpv6, @publicIpv4, @publicIpv6,
        @timezone, @language, @fontSystem, @userAgent,
        @canvasSeed, @webglVendor, @webglRenderer,
        @webglUnmaskedVendor, @webglUnmaskedRenderer, @webglMaxTexture,
        @cpuCores, @screenW, @screenH, @webdriver
      )
    `)
    const info = stmt.run(env)
    return { ok: true, id: info.lastInsertRowid }
  })

  ipcMain.handle('ruyi:db-delete-env', (_event, id) => {
    db.prepare('DELETE FROM environments WHERE id = ?').run(id)
    return { ok: true }
  })

  // ─── 下载 foxprint.exe ────────────────────────────────────────────────────

  ipcMain.handle('ruyi:download-foxprint', async (event) => {
    const dataDir = path.join(__dirname, '../../data/foxprint')
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
    const destPath = path.join(dataDir, 'foxprint.exe')

    // 查询最新 GitHub Release
    const releaseMeta = await fetchJson(
      'https://api.github.com/repos/LoseNine/firefox-fingerprintBrowser/releases/latest'
    )
    const asset = releaseMeta.assets?.find(a => a.name.toLowerCase().endsWith('.exe'))
    if (!asset) throw new Error('未找到 .exe 资源')

    const downloadUrl = asset.browser_download_url
    const totalSize = asset.size

    await downloadFile(downloadUrl, destPath, (received) => {
      const progress = totalSize > 0 ? Math.round((received / totalSize) * 100) : 0
      event.sender.send('ruyi:download-progress', { received, total: totalSize, progress })
    })

    return { ok: true, path: destPath }
  })

  ipcMain.handle('ruyi:foxprint-path', () => {
    const p = path.join(__dirname, '../../data/foxprint/foxprint.exe')
    return fs.existsSync(p) ? p : null
  })

  ipcMain.handle('ruyi:open-foxprint-folder', () => {
    const { shell } = require('electron')
    const dir = path.join(__dirname, '../../data/foxprint')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    shell.openPath(dir)
  })

  ipcMain.handle('ruyi:screen-size', () => {
    const { screen } = require('electron')
    const { width, height } = screen.getPrimaryDisplay().size
    return { width, height }
  })
}

// ─── 工具函数 ─────────────────────────────────────────────────────────────────

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const opts = new URL(url)
    const mod = opts.protocol === 'https:' ? https : http
    mod.get({ hostname: opts.hostname, path: opts.pathname + opts.search,
               headers: { 'User-Agent': 'ruyipage-electron' } }, (res) => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) } catch (e) { reject(e) }
      })
    }).on('error', reject)
  })
}

function buildFpfileLines(env) {
  const lines = []
  const add = (key, val) => { if (val !== null && val !== undefined && val !== '') lines.push(`${key}:${val}`) }
  add('timezone', env.timezone)
  add('language', env.language)
  add('fontSystem', env.font_system)
  add('userAgent', env.user_agent)
  add('canvasSeed', env.canvas_seed)
  add('webglVendor', env.webgl_vendor)
  add('webglRenderer', env.webgl_renderer)
  add('webglUnmaskedVendor', env.webgl_unmasked_vendor)
  add('webglUnmaskedRenderer', env.webgl_unmasked_renderer)
  add('webglMaxTexture', env.webgl_max_texture)
  add('hardwareConcurrency', env.cpu_cores)
  if (env.screen_w && env.screen_h) {
    add('screenWidth', env.screen_w)
    add('screenHeight', env.screen_h)
  }
  add('webdriver', env.webdriver)

  // speech 语音配置：从 language 字段提取主语言代码（如 zh-CN,zh → zh-CN）
  if (env.language && env.language !== 'ip' && env.language !== 'real') {
    const primaryLang = env.language.split(',')[0].trim()
    // 从语言代码反推 countryCode（取区域部分，如 zh-CN → CN，ja-JP → JP）
    const regionPart = primaryLang.split('-')[1] || ''
    const speechLines = buildSpeechLines(regionPart.toUpperCase())
    speechLines.forEach(l => lines.push(l))
  }

  if (env.webrtc_mode === 'disabled') {
    lines.push('webrtcPolicy:disable_non_proxied_udp')
    lines.push('webdriver:0')
  } else if (env.webrtc_mode === 'real') {
    lines.push('webdriver:1')
  } else if (env.webrtc_mode === 'proxy') {
    const ip = env.public_ipv4
    if (ip) {
      add('webrtcLocalIp4',  ip)
      add('webrtcPublicIp4', ip)
    }
  }
  return lines
}

function downloadFile(url, dest, onProgress) {
  return new Promise((resolve, reject) => {
    const doGet = (u) => {
      const opts = new URL(u)
      const mod = opts.protocol === 'https:' ? https : http
      mod.get(u, { headers: { 'User-Agent': 'ruyipage-electron' } }, (res) => {
        if (res.statusCode === 302 || res.statusCode === 301) {
          doGet(res.headers.location)
          return
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`)); return
        }
        const out = fs.createWriteStream(dest)
        let received = 0
        res.on('data', chunk => {
          received += chunk.length
          onProgress(received)
          out.write(chunk)
        })
        res.on('end', () => { out.end(); resolve() })
        res.on('error', reject)
        out.on('error', reject)
      }).on('error', reject)
    }
    doGet(url)
  })
}
