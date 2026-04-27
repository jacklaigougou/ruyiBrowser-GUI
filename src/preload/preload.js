const { contextBridge, ipcRenderer } = require('electron')

// 只暴露有限的API给renderer，所有实际请求走main进程
contextBridge.exposeInMainWorld('ruyi', {
  // 服务状态
  health: () => ipcRenderer.invoke('ruyi:health'),
  config: (cfg) => ipcRenderer.invoke('ruyi:config', cfg),
  devtools: () => ipcRenderer.invoke('ruyi:devtools'),

  // 会话管理
  launch: (options) => ipcRenderer.invoke('ruyi:launch', options),
  listSessions: () => ipcRenderer.invoke('ruyi:list-sessions'),
  close: (sessionId) => ipcRenderer.invoke('ruyi:close', { sessionId }),

  // 导航
  navigate: (sessionId, url) => ipcRenderer.invoke('ruyi:navigate', { sessionId, url }),
  pageInfo: (sessionId) => ipcRenderer.invoke('ruyi:page-info', { sessionId }),

  // 元素操作
  findElement: (sessionId, selector) => ipcRenderer.invoke('ruyi:find-element', { sessionId, selector }),
  click: (sessionId, selector) => ipcRenderer.invoke('ruyi:click', { sessionId, selector }),
  input: (sessionId, selector, text) => ipcRenderer.invoke('ruyi:input', { sessionId, selector, text }),

  // 工具
  screenshot: (sessionId) => ipcRenderer.invoke('ruyi:screenshot', { sessionId }),
  executeScript: (sessionId, script) => ipcRenderer.invoke('ruyi:execute-script', { sessionId, script }),

  // Cookie
  getCookies: (sessionId) => ipcRenderer.invoke('ruyi:get-cookies', { sessionId }),
  setCookies: (sessionId, cookies) => ipcRenderer.invoke('ruyi:set-cookies', { sessionId, cookies }),

  // 配置
  setProxy: (sessionId, proxy) => ipcRenderer.invoke('ruyi:set-proxy', { sessionId, proxy }),
  setGeolocation: (sessionId, lat, lon) => ipcRenderer.invoke('ruyi:set-geolocation', { sessionId, lat, lon }),

  // 环境数据库 CRUD
  dbListEnvs: () => ipcRenderer.invoke('ruyi:db-list-envs'),
  dbGetEnv: (id) => ipcRenderer.invoke('ruyi:db-get-env', id),
  dbCreateEnv: (env) => ipcRenderer.invoke('ruyi:db-create-env', env),
  dbUpdateEnv: (id, env) => ipcRenderer.invoke('ruyi:db-update-env', { id, env }),
  dbDeleteEnv: (id) => ipcRenderer.invoke('ruyi:db-delete-env', id),

  // foxprint.exe 下载
  downloadFoxprint: () => ipcRenderer.invoke('ruyi:download-foxprint'),
  foxprintPath: () => ipcRenderer.invoke('ruyi:foxprint-path'),
  openFoxprintFolder: () => ipcRenderer.invoke('ruyi:open-foxprint-folder'),
  onDownloadProgress: (cb) => {
    ipcRenderer.on('ruyi:download-progress', (_e, data) => cb(data))
  },
  offDownloadProgress: () => {
    ipcRenderer.removeAllListeners('ruyi:download-progress')
  },

  // IP 地理信息查询
  queryIp: (ip) => ipcRenderer.invoke('ruyi:query-ip', ip),

  // 屏幕尺寸
  screenSize: () => ipcRenderer.invoke('ruyi:screen-size'),

  // fpfile 预览
  previewFpfile: (env) => ipcRenderer.invoke('ruyi:preview-fpfile', env),
  inspectEnvFiles: (envId) => ipcRenderer.invoke('ruyi:inspect-env-files', envId),

  // 代理连通测试
  testProxy: (opts) => ipcRenderer.invoke('ruyi:test-proxy', opts),
})

