<template>
  <div>
    <h1>会话管理</h1>
    <div class="toolbar">
      <button class="btn btn--primary" @click="showForm = true">启动新浏览器</button>
      <button class="btn" @click="loadSessions">刷新</button>
    </div>

    <div class="sessions-list">
      <div v-if="sessions.length === 0" class="empty-tip">暂无活跃会话</div>
      <div v-for="s in sessions" :key="s.sessionId" class="session-item">
        <span class="session-id">{{ s.sessionId }}</span>
        <span class="session-url">{{ s.url || '—' }}</span>
        <span class="session-meta">{{ s.title || '—' }}</span>
        <button class="btn btn--danger" @click="closeSession(s.sessionId)">关闭</button>
      </div>
    </div>

    <!-- 启动Modal -->
    <div v-if="showForm" class="modal" @click.self="showForm = false">
      <div class="modal-box">
        <h2>启动浏览器</h2>
        <label>Firefox路径
          <input v-model="form.browser_path" type="text" placeholder="留空使用默认" />
        </label>
        <label>用户数据目录
          <input v-model="form.user_dir" type="text" placeholder="留空使用默认" />
        </label>
        <label>代理
          <input v-model="form.proxy" type="text" placeholder="http://127.0.0.1:7890" />
        </label>
        <label>人类轨迹算法
          <select v-model="form.human_algorithm">
            <option value="">默认</option>
            <option value="bezier">bezier</option>
            <option value="windmouse">windmouse</option>
          </select>
        </label>
        <label class="checkbox-label">
          <input v-model="form.headless" type="checkbox" />
          无头模式
        </label>
        <div class="modal-actions">
          <button class="btn btn--primary" :disabled="launching" @click="launchBrowser">
            {{ launching ? '启动中...' : '启动' }}
          </button>
          <button class="btn" @click="showForm = false">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { addLog } from '../composables/useLogs'

const sessions = ref([])
const showForm = ref(false)
const launching = ref(false)
const form = ref({ browser_path: '', user_dir: '', proxy: '', human_algorithm: '', headless: false })

async function loadSessions() {
  const res = await window.ruyi.listSessions()
  if (res.ok) sessions.value = res.data?.sessions ?? []
}

async function closeSession(id) {
  const res = await window.ruyi.close(id)
  addLog(res.ok ? `会话已关闭: ${id}` : `关闭失败: ${res.error}`, res.ok ? 'ok' : 'err')
  loadSessions()
}

async function launchBrowser() {
  launching.value = true
  const opts = Object.fromEntries(
    Object.entries(form.value).filter(([, v]) => v !== '' && v !== false)
  )
  const res = await window.ruyi.launch(opts)
  launching.value = false
  if (res.ok) {
    addLog(`浏览器已启动，会话ID: ${res.data.sessionId}`, 'ok')
    showForm.value = false
    form.value = { browser_path: '', user_dir: '', proxy: '', human_algorithm: '', headless: false }
    loadSessions()
  } else {
    addLog(`启动失败: ${res.error}`, 'err')
  }
}

onMounted(loadSessions)
</script>
