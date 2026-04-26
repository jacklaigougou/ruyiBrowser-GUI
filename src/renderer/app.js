// renderer进程只做UI逻辑，所有ruyi.*调用都经由preload→main进程→Python

const api = window.ruyi

// ─── 工具 ──────────────────────────────────────────────────────────────────────

function log(msg, type = 'info') {
  const box = document.getElementById('log-output')
  const line = document.createElement('div')
  line.className = `log-line ${type}`
  const time = new Date().toLocaleTimeString()
  line.textContent = `[${time}] ${msg}`
  box.appendChild(line)
  box.scrollTop = box.scrollHeight
}

function setResult(el, res) {
  if (!el) return
  if (res.ok) {
    el.className = 'op-result ok'
    el.textContent = JSON.stringify(res.data ?? 'OK', null, 2)
  } else {
    el.className = 'op-result err'
    el.textContent = res.error
  }
}

function currentSession() {
  return document.getElementById('op-session-select').value
}

// ─── 导航 ──────────────────────────────────────────────────────────────────────

const navItems = document.querySelectorAll('.nav-item')
const pages = document.querySelectorAll('.page')

navItems.forEach(btn => {
  btn.addEventListener('click', () => {
    navItems.forEach(b => b.classList.remove('active'))
    pages.forEach(p => p.classList.remove('active'))
    btn.classList.add('active')
    document.getElementById(`page-${btn.dataset.page}`).classList.add('active')
    if (btn.dataset.page === 'browser') refreshSessionSelect()
  })
})

// ─── 服务健康检测 ─────────────────────────────────────────────────────────────

async function checkHealth() {
  const res = await api.health()
  const dot = document.getElementById('service-dot')
  const label = document.getElementById('service-label')
  const stat = document.getElementById('stat-service')

  if (res.ok) {
    dot.className = 'dot dot--on'
    label.textContent = 'Python服务已连接'
    stat.textContent = '在线'
    document.getElementById('stat-sessions').textContent = res.data?.sessions ?? '—'
  } else {
    dot.className = 'dot dot--off'
    label.textContent = 'Python服务未连接'
    stat.textContent = '离线'
  }
}

setInterval(checkHealth, 5000)
checkHealth()

// ─── 会话管理 ─────────────────────────────────────────────────────────────────

async function loadSessions() {
  const res = await api.listSessions()
  const container = document.getElementById('sessions-list')
  container.innerHTML = ''

  if (!res.ok) {
    container.innerHTML = `<div style="color:var(--error)">${res.error}</div>`
    return
  }

  const sessions = res.data?.sessions ?? []
  if (sessions.length === 0) {
    container.innerHTML = '<div style="color:var(--text-muted)">暂无活跃会话</div>'
    return
  }

  sessions.forEach(s => {
    const item = document.createElement('div')
    item.className = 'session-item'
    item.innerHTML = `
      <span class="session-id">${s.sessionId}</span>
      <span class="session-url">${s.url || '—'}</span>
      <span class="session-title">${s.title || '—'}</span>
      <button class="btn btn--danger" data-id="${s.sessionId}">关闭</button>
    `
    item.querySelector('button').addEventListener('click', async () => {
      const r = await api.close(s.sessionId)
      log(r.ok ? `会话已关闭: ${s.sessionId}` : `关闭失败: ${r.error}`, r.ok ? 'ok' : 'err')
      loadSessions()
    })
    container.appendChild(item)
  })
}

document.getElementById('btn-refresh-sessions').addEventListener('click', loadSessions)

// 启动浏览器 modal
const launchForm = document.getElementById('launch-form')
document.getElementById('btn-launch').addEventListener('click', () => {
  launchForm.classList.remove('hidden')
})
document.getElementById('btn-launch-cancel').addEventListener('click', () => {
  launchForm.classList.add('hidden')
})

document.getElementById('btn-launch-confirm').addEventListener('click', async () => {
  const options = {
    browser_path: document.getElementById('launch-browser-path').value.trim() || undefined,
    user_dir: document.getElementById('launch-user-dir').value.trim() || undefined,
    proxy: document.getElementById('launch-proxy').value.trim() || undefined,
    human_algorithm: document.getElementById('launch-algo').value || undefined,
    headless: document.getElementById('launch-headless').checked,
  }
  launchForm.classList.add('hidden')
  log('正在启动浏览器...', 'info')
  const res = await api.launch(options)
  if (res.ok) {
    log(`浏览器已启动，会话ID: ${res.data.sessionId}`, 'ok')
    loadSessions()
  } else {
    log(`启动失败: ${res.error}`, 'err')
  }
})

// ─── 会话下拉刷新 ─────────────────────────────────────────────────────────────

async function refreshSessionSelect() {
  const sel = document.getElementById('op-session-select')
  const res = await api.listSessions()
  const prev = sel.value
  sel.innerHTML = '<option value="">-- 选择会话 --</option>'
  if (res.ok) {
    (res.data?.sessions ?? []).forEach(s => {
      const opt = document.createElement('option')
      opt.value = s.sessionId
      opt.textContent = `${s.sessionId.slice(0, 8)}… ${s.title || s.url || ''}`
      sel.appendChild(opt)
    })
  }
  if (prev) sel.value = prev
}

// ─── 浏览器操作 ───────────────────────────────────────────────────────────────

document.getElementById('btn-navigate').addEventListener('click', async () => {
  const sid = currentSession(); if (!sid) return alert('请先选择会话')
  const url = document.getElementById('op-url').value.trim(); if (!url) return
  const res = await api.navigate(sid, url)
  log(res.ok ? `导航到: ${url}` : `导航失败: ${res.error}`, res.ok ? 'ok' : 'err')
  setResult(document.getElementById('result-navigate'), res)
})

document.getElementById('btn-find').addEventListener('click', async () => {
  const sid = currentSession(); if (!sid) return alert('请先选择会话')
  const sel = document.getElementById('op-selector').value.trim(); if (!sel) return
  const res = await api.findElement(sid, sel)
  log(res.ok ? `找到元素: ${sel}` : `未找到: ${res.error}`, res.ok ? 'ok' : 'err')
  setResult(document.getElementById('result-find'), res)
})

document.getElementById('btn-click').addEventListener('click', async () => {
  const sid = currentSession(); if (!sid) return alert('请先选择会话')
  const sel = document.getElementById('op-click-selector').value.trim(); if (!sel) return
  const res = await api.click(sid, sel)
  log(res.ok ? `点击成功: ${sel}` : `点击失败: ${res.error}`, res.ok ? 'ok' : 'err')
  setResult(document.getElementById('result-click'), res)
})

document.getElementById('btn-input').addEventListener('click', async () => {
  const sid = currentSession(); if (!sid) return alert('请先选择会话')
  const sel = document.getElementById('op-input-selector').value.trim()
  const text = document.getElementById('op-input-text').value
  if (!sel) return
  const res = await api.input(sid, sel, text)
  log(res.ok ? `输入成功` : `输入失败: ${res.error}`, res.ok ? 'ok' : 'err')
  setResult(document.getElementById('result-input'), res)
})

document.getElementById('btn-screenshot').addEventListener('click', async () => {
  const sid = currentSession(); if (!sid) return alert('请先选择会话')
  const res = await api.screenshot(sid)
  const preview = document.getElementById('screenshot-preview')
  if (res.ok && res.data?.image) {
    preview.innerHTML = `<img src="data:image/png;base64,${res.data.image}" />`
    log('截图成功', 'ok')
  } else {
    preview.innerHTML = ''
    log(`截图失败: ${res.error}`, 'err')
  }
})

document.getElementById('btn-script').addEventListener('click', async () => {
  const sid = currentSession(); if (!sid) return alert('请先选择会话')
  const script = document.getElementById('op-script').value.trim(); if (!script) return
  const res = await api.executeScript(sid, script)
  log(res.ok ? 'JS执行成功' : `JS失败: ${res.error}`, res.ok ? 'ok' : 'err')
  setResult(document.getElementById('result-script'), res)
})

document.getElementById('btn-get-cookies').addEventListener('click', async () => {
  const sid = currentSession(); if (!sid) return alert('请先选择会话')
  const res = await api.getCookies(sid)
  log(res.ok ? `获取Cookie成功` : `失败: ${res.error}`, res.ok ? 'ok' : 'err')
  setResult(document.getElementById('result-cookies'), res)
})

document.getElementById('btn-page-info').addEventListener('click', async () => {
  const sid = currentSession(); if (!sid) return alert('请先选择会话')
  const res = await api.pageInfo(sid)
  log(res.ok ? `页面: ${res.data?.title}` : `失败: ${res.error}`, res.ok ? 'ok' : 'err')
  setResult(document.getElementById('result-page-info'), res)
})

// ─── 设置 ─────────────────────────────────────────────────────────────────────

document.getElementById('btn-save-config').addEventListener('click', async () => {
  const baseUrl = document.getElementById('cfg-base-url').value.trim()
  const timeout = parseInt(document.getElementById('cfg-timeout').value)
  const res = await api.config({ baseUrl, timeout })
  const el = document.getElementById('config-result')
  setResult(el, res)
  log(res.ok ? '配置已保存' : `保存失败: ${res.error}`, res.ok ? 'ok' : 'err')
  if (res.ok) checkHealth()
})
