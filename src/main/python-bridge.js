/**
 * python-bridge.js
 *
 * 负责与Python HTTP服务通信。所有ruyipage调用都经过这里。
 * Python端需要运行一个简单的HTTP服务（见 python/server.py）。
 */

let config = {
  baseUrl: 'http://127.0.0.1:7788',
  timeout: 30000,
}

async function call(method, params) {
  const url = `${config.baseUrl}/api/${method}`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), config.timeout)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: controller.signal,
    })

    clearTimeout(timer)

    const data = await response.json()

    if (!response.ok) {
      return { ok: false, error: data.error || `HTTP ${response.status}` }
    }

    return { ok: true, data }
  } catch (err) {
    clearTimeout(timer)
    if (err.name === 'AbortError') {
      return { ok: false, error: 'Request timeout' }
    }
    return { ok: false, error: err.message }
  }
}

async function health() {
  try {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 3000)
    const response = await fetch(`${config.baseUrl}/health`, { signal: controller.signal })
    const data = await response.json()
    return { ok: true, data }
  } catch {
    return { ok: false, error: 'Python service unreachable' }
  }
}

function updateConfig(newConfig) {
  if (newConfig.baseUrl) config.baseUrl = newConfig.baseUrl
  if (newConfig.timeout) config.timeout = newConfig.timeout
}

module.exports = { call, health, updateConfig }
