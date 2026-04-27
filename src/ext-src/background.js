// 从 localStorage 读取代理配置（由 main 进程通过 preferences 写入）
// 使用 browser.proxy.onRequest 拦截所有请求，返回 SOCKS5 代理
browser.storage.local.get(['proxyHost', 'proxyPort', 'proxyUser', 'proxyPass'], (cfg) => {
  if (!cfg.proxyHost || !cfg.proxyPort) return

  browser.proxy.onRequest.addListener(
    (requestInfo) => {
      return {
        type: 'socks',
        host: cfg.proxyHost,
        port: Number(cfg.proxyPort),
        username: cfg.proxyUser || '',
        password: cfg.proxyPass || '',
        proxyDNS: true,
      }
    },
    { urls: ['<all_urls>'] }
  )
})
