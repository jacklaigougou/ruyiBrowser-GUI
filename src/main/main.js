const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('path')
const fs = require('fs')
const https = require('https')
const http = require('http')
const { spawn } = require('child_process')
const pythonBridge = require('./python-bridge')
const { queryIp } = require('./http/ipQuery')
const { buildSpeechLines } = require('./http/speechVoiceMap')

// 用户数据目录（打包后持久存储数据库、环境文件、foxprint）
function getDataDir(...subPaths) {
  return path.join(app.getPath('userData'), 'data', ...subPaths)
}

let mainWindow
let pythonProcess = null
let db = null

// ─── SQLite 数据库 ────────────────────────────────────────────────────────────

function initDatabase() {
  const Database = require('better-sqlite3')
  const dataDir = getDataDir()
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

  db = new Database(getDataDir('ruyipage.db'))
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
      webgl_version             TEXT DEFAULT '',
      webgl_glsl_version        TEXT DEFAULT '',
      webgl_unmasked_vendor     TEXT DEFAULT '',
      webgl_unmasked_renderer   TEXT DEFAULT '',
      webgl_max_texture         INTEGER,
      webgl_max_cube_map        INTEGER,
      webgl_max_texture_units   INTEGER,
      webgl_max_vertex_attribs  INTEGER,
      webgl_aliased_point_max   INTEGER,
      webgl_max_viewport_dim    INTEGER,
      cpu_cores   INTEGER,
      screen_w    INTEGER,
      screen_h    INTEGER,
      webdriver   TEXT DEFAULT '0',
      created_at  TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    )
  `)

  // 兼容旧版本数据库：CREATE TABLE IF NOT EXISTS 不会给已有表补新列
  const requiredColumns = {
    webgl_version: 'TEXT DEFAULT \'\'',
    webgl_glsl_version: 'TEXT DEFAULT \'\'',
    webgl_max_cube_map: 'INTEGER',
    webgl_max_texture_units: 'INTEGER',
    webgl_max_vertex_attribs: 'INTEGER',
    webgl_aliased_point_max: 'INTEGER',
    webgl_max_viewport_dim: 'INTEGER',
  }

  const existingCols = new Set(
    db.prepare('PRAGMA table_info(environments)').all().map(col => col.name)
  )

  for (const [name, ddl] of Object.entries(requiredColumns)) {
    if (!existingCols.has(name)) {
      db.exec(`ALTER TABLE environments ADD COLUMN ${name} ${ddl}`)
    }
  }
}

// ─── Python 服务生命周期 ───────────────────────────────────────────────────────

function startPythonServer() {
  // 开发时用源码目录，打包后 python 通过 extraResources 放在 resources/python
  const pythonDir = app.isPackaged
    ? path.join(process.resourcesPath, 'python')
    : path.join(__dirname, '../../python')
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
  const iconCandidates = [
    path.join(app.getAppPath(), 'assets', 'icon.ico'),
    path.join(process.resourcesPath, 'assets', 'icon.ico'),
  ]
  const iconPath = iconCandidates.find(p => fs.existsSync(p))

  const windowOptions = {
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(app.getAppPath(), 'src/preload/preload.js'),
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
  }

  if (iconPath) {
    windowOptions.icon = iconPath
  }

  mainWindow = new BrowserWindow(windowOptions)

  if (process.argv.includes('--dev')) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), 'dist/renderer/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
}

app.whenReady().then(() => {
  // Windows 任务栏图标归属到当前应用，避免显示为默认 Electron 图标
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.ruyipage.electron')
  }

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
    try {
      // options.envId 时：从数据库读取环境，生成临时 fpfile 后启动
      if (options.envId) {
        const env = db.prepare('SELECT * FROM environments WHERE id = ?').get(options.envId)
        if (!env) return { ok: false, error: '环境不存在' }

        const foxprintPath = resolveInstalledFoxprintPath()
        if (!foxprintPath) {
          const installerPath = getFoxprintInstallerPath()
          const hasInstaller = fs.existsSync(installerPath)
          return {
            ok: false,
            error: hasInstaller
              ? `未检测到已安装 foxprint 程序。请先运行安装包完成安装：${installerPath}`
              : '未检测到已安装 foxprint 程序，请先下载安装并完成安装',
          }
        }

        // 确保环境文件是最新的（启动前同步覆盖写一次）
        writeEnvFiles(env)

        const envDir = getEnvDir(env.id)
        const fpfilePath = path.join(envDir, 'fpfile.txt')
        const profileDir = getDataDir('profiles', String(env.id))
        if (!fs.existsSync(profileDir)) fs.mkdirSync(profileDir, { recursive: true })
        // 代理配置写入到 profile/user.js（foxprint 启动时会读取 profile 目录）
        const userJsFrom = path.join(envDir, 'user.js')
        const userJsTo = path.join(profileDir, 'user.js')
        if (fs.existsSync(userJsFrom)) fs.copyFileSync(userJsFrom, userJsTo)

        // 直接按 foxprint 文档方式启动，不经过 Python bridge
        const args = [
          `--fpfile=${fpfilePath}`,
          `--profile=${profileDir}`,
        ]
        const child = spawn(foxprintPath, args, {
          cwd: path.dirname(foxprintPath),
          detached: true,
          stdio: 'ignore',
          windowsHide: false,
        })
        child.unref()

        return { ok: true, data: { pid: child.pid, mode: 'native-foxprint' } }
      }
      return pythonBridge.call('launch', options)
    } catch (e) {
      return { ok: false, error: e?.message || '启动异常' }
    }
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

  ipcMain.handle('ruyi:db-get-env', (_event, id) => {
    return db.prepare('SELECT * FROM environments WHERE id = ?').get(id) || null
  })

  ipcMain.handle('ruyi:db-update-env', (_event, { id, env }) => {
    db.prepare(`
      UPDATE environments SET
        name=@name, remark=@remark,
        proxy_type=@proxyType, proxy_host=@proxyHost, proxy_port=@proxyPort,
        proxy_user=@proxyUser, proxy_pass=@proxyPass,
        webrtc_mode=@webrtcMode, local_ipv4=@localIpv4, local_ipv6=@localIpv6,
        public_ipv4=@publicIpv4, public_ipv6=@publicIpv6,
        timezone=@timezone, language=@language, font_system=@fontSystem,
        user_agent=@userAgent, canvas_seed=@canvasSeed,
        webgl_vendor=@webglVendor, webgl_renderer=@webglRenderer,
        webgl_version=@webglVersion, webgl_glsl_version=@webglGlslVersion,
        webgl_unmasked_vendor=@webglUnmaskedVendor, webgl_unmasked_renderer=@webglUnmaskedRenderer,
        webgl_max_texture=@webglMaxTexture, webgl_max_cube_map=@webglMaxCubeMapTextureSize,
        webgl_max_texture_units=@webglMaxTextureImageUnits, webgl_max_vertex_attribs=@webglMaxVertexAttribs,
        webgl_aliased_point_max=@webglAliasedPointSizeMax, webgl_max_viewport_dim=@webglMaxViewportDim,
        cpu_cores=@cpuCores, screen_w=@screenW, screen_h=@screenH, webdriver=@webdriver
      WHERE id=@id
    `).run({ ...env, id })
    const updatedEnv = db.prepare('SELECT * FROM environments WHERE id = ?').get(id)
    writeEnvFiles(updatedEnv)
    return { ok: true }
  })

  ipcMain.handle('ruyi:db-create-env', (_event, env) => {
    const stmt = db.prepare(`
      INSERT INTO environments (
        name, remark,
        proxy_type, proxy_host, proxy_port, proxy_user, proxy_pass,
        webrtc_mode, local_ipv4, local_ipv6, public_ipv4, public_ipv6,
        timezone, language, font_system, user_agent,
        canvas_seed, webgl_vendor, webgl_renderer, webgl_version, webgl_glsl_version,
        webgl_unmasked_vendor, webgl_unmasked_renderer, webgl_max_texture,
        webgl_max_cube_map, webgl_max_texture_units, webgl_max_vertex_attribs,
        webgl_aliased_point_max, webgl_max_viewport_dim,
        cpu_cores, screen_w, screen_h, webdriver
      ) VALUES (
        @name, @remark,
        @proxyType, @proxyHost, @proxyPort, @proxyUser, @proxyPass,
        @webrtcMode, @localIpv4, @localIpv6, @publicIpv4, @publicIpv6,
        @timezone, @language, @fontSystem, @userAgent,
        @canvasSeed, @webglVendor, @webglRenderer, @webglVersion, @webglGlslVersion,
        @webglUnmaskedVendor, @webglUnmaskedRenderer, @webglMaxTexture,
        @webglMaxCubeMapTextureSize, @webglMaxTextureImageUnits, @webglMaxVertexAttribs,
        @webglAliasedPointSizeMax, @webglMaxViewportDim,
        @cpuCores, @screenW, @screenH, @webdriver
      )
    `)
    const info = stmt.run(env)
    const newEnv = db.prepare('SELECT * FROM environments WHERE id = ?').get(info.lastInsertRowid)
    writeEnvFiles(newEnv)
    return { ok: true, id: info.lastInsertRowid }
  })

  ipcMain.handle('ruyi:db-delete-env', (_event, id) => {
    db.prepare('DELETE FROM environments WHERE id = ?').run(id)
    deleteEnvFiles(id)
    return { ok: true }
  })

  // ─── 下载 foxprint.exe ────────────────────────────────────────────────────

  ipcMain.handle('ruyi:download-foxprint', async (event) => {
    const dataDir = getDataDir('foxprint')
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
    const destPath = getDataDir('foxprint', 'foxprint.exe')

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
    return resolveInstalledFoxprintPath()
  })

  ipcMain.handle('ruyi:open-foxprint-folder', () => {
    const { shell } = require('electron')
    const dir = getDataDir('foxprint')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    shell.openPath(dir)
  })

  ipcMain.handle('ruyi:screen-size', () => {
    const { screen } = require('electron')
    const { width, height } = screen.getPrimaryDisplay().size
    return { width, height }
  })

  ipcMain.handle('ruyi:preview-fpfile', (_event, env) => {
    // 前端传来 camelCase，转成 buildFpfileLines 期望的 snake_case
    const row = {
      timezone:               env.timezone,
      language:               env.language,
      font_system:            env.fontSystem,
      user_agent:             env.userAgent,
      canvas_seed:            env.canvasSeed,
      webgl_vendor:           env.webglVendor,
      webgl_renderer:         env.webglRenderer,
      webgl_version:          env.webglVersion,
      webgl_glsl_version:     env.webglGlslVersion,
      webgl_unmasked_vendor:  env.webglUnmaskedVendor,
      webgl_unmasked_renderer:env.webglUnmaskedRenderer,
      webgl_max_texture:      env.webglMaxTexture,
      webgl_max_cube_map:     env.webglMaxCubeMapTextureSize,
      webgl_max_texture_units:env.webglMaxTextureImageUnits,
      webgl_max_vertex_attribs:env.webglMaxVertexAttribs,
      webgl_aliased_point_max: env.webglAliasedPointSizeMax,
      webgl_max_viewport_dim: env.webglMaxViewportDim,
      cpu_cores:              env.cpuCores,
      screen_w:               env.screenW,
      screen_h:               env.screenH,
      webdriver:              env.webdriver,
      proxy_type:             env.proxyType,
      proxy_user:             env.proxyUser,
      proxy_pass:             env.proxyPass,
      webrtc_mode:            env.webrtcMode,
      local_ipv4:             env.localIpv4,
      local_ipv6:             env.localIpv6,
      public_ipv4:            env.publicIpv4,
      public_ipv6:            env.publicIpv6,
    }
    return buildFpfileLines(row).join('\n')
  })

  ipcMain.handle('ruyi:test-proxy', async (_event, { type, host, port, user, pass }) => {
    const net = require('net')
    const TARGET_HOST = 'www.google.com'
    const TARGET_PORT = 80
    const TIMEOUT = 8000

    if (type === 'http') {
      // HTTP CONNECT 隧道测试
      return new Promise((resolve) => {
        const auth = user ? `${user}:${pass}` : ''
        const authHeader = auth ? `Proxy-Authorization: Basic ${Buffer.from(auth).toString('base64')}\r\n` : ''
        const socket = net.createConnection({ host, port: Number(port) }, () => {
          socket.write(`CONNECT ${TARGET_HOST}:${TARGET_PORT} HTTP/1.1\r\nHost: ${TARGET_HOST}\r\n${authHeader}\r\n`)
        })
        socket.setTimeout(TIMEOUT)
        let buf = ''
        socket.on('data', chunk => {
          buf += chunk.toString()
          if (buf.includes('\r\n\r\n')) {
            const ok = /HTTP\/1\.[01] 200/.test(buf)
            socket.destroy()
            resolve({ ok, msg: ok ? '连接成功' : `代理拒绝：${buf.split('\r\n')[0]}` })
          }
        })
        socket.on('timeout', () => { socket.destroy(); resolve({ ok: false, msg: '连接超时' }) })
        socket.on('error', e => resolve({ ok: false, msg: e.message }))
      })
    }

    if (type === 'socks5') {
      // SOCKS5 握手测试
      return new Promise((resolve) => {
        const socket = net.createConnection({ host, port: Number(port) }, () => {
          // 发送握手：支持无认证(0x00)和用户名密码(0x02)
          const authMethod = user ? 0x02 : 0x00
          socket.write(Buffer.from([0x05, 0x01, authMethod]))
        })
        socket.setTimeout(TIMEOUT)
        let step = 0
        socket.on('data', chunk => {
          if (step === 0) {
            // 服务器选择认证方式
            if (chunk[0] !== 0x05) { socket.destroy(); return resolve({ ok: false, msg: 'SOCKS5协议错误' }) }
            const method = chunk[1]
            if (method === 0xFF) { socket.destroy(); return resolve({ ok: false, msg: '代理不接受认证方式' }) }
            step = 1
            if (method === 0x02 && user) {
              // 用户名密码认证
              const u = Buffer.from(user), p = Buffer.from(pass || '')
              socket.write(Buffer.concat([Buffer.from([0x01, u.length]), u, Buffer.from([p.length]), p]))
            } else {
              // 发送 CONNECT 请求
              const host_buf = Buffer.from(TARGET_HOST)
              socket.write(Buffer.concat([
                Buffer.from([0x05, 0x01, 0x00, 0x03, host_buf.length]),
                host_buf,
                Buffer.from([TARGET_PORT >> 8, TARGET_PORT & 0xFF])
              ]))
              step = 2
            }
          } else if (step === 1) {
            // 认证响应
            if (chunk[1] !== 0x00) { socket.destroy(); return resolve({ ok: false, msg: '用户名或密码错误' }) }
            const host_buf = Buffer.from(TARGET_HOST)
            socket.write(Buffer.concat([
              Buffer.from([0x05, 0x01, 0x00, 0x03, host_buf.length]),
              host_buf,
              Buffer.from([TARGET_PORT >> 8, TARGET_PORT & 0xFF])
            ]))
            step = 2
          } else if (step === 2) {
            // CONNECT 响应
            const ok = chunk[1] === 0x00
            socket.destroy()
            resolve({ ok, msg: ok ? '连接成功' : `SOCKS5错误码: 0x${chunk[1].toString(16)}` })
          }
        })
        socket.on('timeout', () => { socket.destroy(); resolve({ ok: false, msg: '连接超时' }) })
        socket.on('error', e => resolve({ ok: false, msg: e.message }))
      })
    }

    return { ok: false, msg: '不支持的代理类型' }
  })
}

// ─── 环境文件管理 ─────────────────────────────────────────────────────────────

function getEnvDir(envId) {
  return getDataDir('envs', String(envId))
}

function getFoxprintInstallerPath() {
  return getDataDir('foxprint', 'foxprint.exe')
}

function resolveInstalledFoxprintPath() {
  const exeNames = ['foxprint.exe', 'firefox.exe']
  const baseDirs = [
    process.env.PROGRAMFILES,
    process.env['PROGRAMFILES(X86)'],
    process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Programs') : '',
  ].filter(Boolean)

  const seen = new Set()
  const candidates = []
  const pushCandidate = (p) => {
    if (!p) return
    const norm = path.normalize(p)
    if (seen.has(norm)) return
    seen.add(norm)
    candidates.push(norm)
  }

  // 1) 明确目录命中（优先）
  for (const baseDir of baseDirs) {
    for (const exeName of exeNames) {
      pushCandidate(path.join(baseDir, 'foxprint', exeName))
      pushCandidate(path.join(baseDir, 'firefox-fingerprintBrowser', exeName))
      pushCandidate(path.join(baseDir, 'ruyipage', exeName))
    }
  }

  // 2) 在常见安装目录里做一次轻量扫描（仅目录名包含关键词）
  const dirKeyword = /(foxprint|fingerprint|ruyipage|firefox)/i
  for (const baseDir of baseDirs) {
    if (!fs.existsSync(baseDir)) continue
    let entries = []
    try {
      entries = fs.readdirSync(baseDir, { withFileTypes: true })
    } catch (_) {
      continue
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      if (!dirKeyword.test(entry.name)) continue
      for (const exeName of exeNames) {
        pushCandidate(path.join(baseDir, entry.name, exeName))
      }
    }
  }

  for (const exePath of candidates) {
    if (fs.existsSync(exePath)) return exePath
  }
  return null
}

function writeEnvFiles(env) {
  const dir = getEnvDir(env.id)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  // 写 fpfile.txt
  const lines = buildFpfileLines(env)
  fs.writeFileSync(path.join(dir, 'fpfile.txt'), lines.join('\n'), 'utf8')

  // 写 user.js（代理配置）
  const userJsPath = path.join(dir, 'user.js')
  if (env.proxy_type !== 'none' && env.proxy_host) {
    const host = env.proxy_host
    const port = Number(env.proxy_port)
    let prefs
    if (env.proxy_type === 'socks5') {
      prefs = [
        `user_pref("network.proxy.type", 1);`,
        `user_pref("network.proxy.socks", "${host}");`,
        `user_pref("network.proxy.socks_port", ${port});`,
        `user_pref("network.proxy.socks_version", 5);`,
        `user_pref("network.proxy.socks_remote_dns", true);`,
        `user_pref("network.proxy.no_proxies_on", "");`,
      ]
    } else {
      // http / https
      prefs = [
        `user_pref("network.proxy.type", 1);`,
        `user_pref("network.proxy.http", "${host}");`,
        `user_pref("network.proxy.http_port", ${port});`,
        `user_pref("network.proxy.ssl", "${host}");`,
        `user_pref("network.proxy.ssl_port", ${port});`,
        `user_pref("network.proxy.no_proxies_on", "");`,
      ]
    }
    fs.writeFileSync(userJsPath, prefs.join('\n') + '\n', 'utf8')
  } else {
    // 直连：显式清除代理防止旧配置残留
    fs.writeFileSync(userJsPath, 'user_pref("network.proxy.type", 0);\n', 'utf8')
  }
}

function deleteEnvFiles(envId) {
  const dir = getEnvDir(envId)
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true })
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
  add('font_system', env.font_system)
  add('useragent', env.user_agent)
  add('canvas', env.canvas_seed)
  add('webgl.vendor', env.webgl_vendor)
  add('webgl.renderer', env.webgl_renderer)
  add('webgl.version', env.webgl_version)
  add('webgl.glsl_version', env.webgl_glsl_version)
  add('webgl.unmasked_vendor', env.webgl_unmasked_vendor)
  add('webgl.unmasked_renderer', env.webgl_unmasked_renderer)
  add('webgl.max_texture_size', env.webgl_max_texture)
  add('webgl.max_cube_map_texture_size', env.webgl_max_cube_map)
  add('webgl.max_texture_image_units', env.webgl_max_texture_units)
  add('webgl.max_vertex_attribs', env.webgl_max_vertex_attribs)
  add('webgl.aliased_point_size_max', env.webgl_aliased_point_max)
  add('webgl.max_viewport_dim', env.webgl_max_viewport_dim)
  add('hardwareConcurrency', env.cpu_cores)
  if (env.screen_w && env.screen_h) {
    add('width', env.screen_w)
    add('height', env.screen_h)
  }
  add('webdriver', env.webdriver)
  if (env.proxy_type !== 'none' && env.proxy_user) {
    add('httpauth.username', env.proxy_user)
    add('httpauth.password', env.proxy_pass)
  }
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
  } else if (env.webrtc_mode === 'proxy') {
    add('local_webrtc_ipv4', env.local_ipv4 || env.public_ipv4)
    add('local_webrtc_ipv6', env.local_ipv6)
    add('public_webrtc_ipv4', env.public_ipv4 || env.local_ipv4)
    add('public_webrtc_ipv6', env.public_ipv6)
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
