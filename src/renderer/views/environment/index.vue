<template>
  <div class="page-card">
    <div v-if="inspectModal.visible" class="modal" @click.self="closeInspectModal">
      <div class="modal-box" style="width:760px;max-height:82vh">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <h2 style="margin:0">环境文件检查</h2>
          <select v-model="inspectModal.filter" style="width:auto;min-width:170px;font-size:13px">
            <option value="all">全部</option>
            <option value="fpfile">仅 fpfile.txt</option>
            <option value="userjs">仅 user.js</option>
            <option value="profileUserjs">仅 profile/user.js</option>
          </select>
        </div>
        <pre style="font-size:12px;font-family:Consolas,monospace;background:#fafafa;border:1px solid var(--border);border-radius:var(--radius);padding:12px;overflow-y:auto;max-height:58vh;white-space:pre-wrap;word-break:break-all;color:var(--text)">{{ inspectPreview }}</pre>
        <div class="modal-actions">
          <button class="btn" @click="copyInspectText">复制</button>
          <button class="btn btn--primary" @click="closeInspectModal">关闭</button>
        </div>
      </div>
    </div>

    <div class="page-header">
      <span class="page-title">环境管理</span>
      <button class="btn btn--primary" @click="$router.push('/environment/create')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        新建环境
      </button>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>环境名称</th>
          <th>代理</th>
          <th>时区</th>
          <th>创建时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="envList.length === 0">
          <td colspan="5" class="empty-tip">暂无环境，点击「新建环境」创建</td>
        </tr>
        <tr v-for="env in envList" :key="env.id">
          <td><span class="env-name-badge">{{ env.name }}</span></td>
          <td><span class="proxy-tag" :class="env.proxy_type !== 'none' && env.proxy_host ? 'proxy-tag--active' : ''">{{ proxyDisplay(env) }}</span></td>
          <td><span class="meta-chip">{{ env.timezone || '—' }}</span></td>
          <td><span class="meta-chip">{{ env.created_at }}</span></td>
          <td>
            <div class="table-actions">
              <button class="btn btn--success btn--sm" @click="launch(env)">启动</button>
              <button class="btn btn--text btn--sm" @click="inspect(env)">检查</button>
              <button class="btn btn--text btn--sm" @click="router.push(`/environment/edit/${env.id}`)">修改</button>
              <button class="btn btn--danger btn--text btn--sm" @click="del(env.id)">删除</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { addLog } from '../../composables/useLogs'

const router = useRouter()

const envList = ref([])
const inspectModal = ref({
  visible: false,
  filter: 'all',
  files: null,
})

const inspectOrder = ['fpfile', 'userjs', 'profileUserjs']

const inspectPreview = computed(() => {
  const files = inspectModal.value.files || {}
  const selected = inspectModal.value.filter === 'all'
    ? inspectOrder
    : [inspectModal.value.filter]
  const blocks = selected
    .map((key) => files[key])
    .filter(Boolean)
    .map((file) => {
      const head = `# ${file.name}\n路径: ${file.path}\n状态: ${file.exists ? '已存在' : '不存在'}`
      const body = file.exists ? (file.content || '（文件为空）') : '（文件不存在）'
      return `${head}\n\n${body}`
    })
  return blocks.join('\n\n------------------------------\n\n') || '（暂无数据）'
})

async function loadEnvs() {
  envList.value = await window.ruyi.dbListEnvs()
}

function proxyDisplay(env) {
  if (env.proxy_type === 'none' || !env.proxy_host) return '无'
  return `${env.proxy_type.toUpperCase()} ${env.proxy_host}:${env.proxy_port}`
}

async function launch(env) {
  addLog(`正在启动环境: ${env.name}`, 'info')
  try {
    const res = await window.ruyi.launch({ envId: env.id })
    if (res?.ok) {
      addLog(`环境启动成功: ${env.name}`, 'ok')
      return
    }
    const msg = res?.error || '未知错误'
    addLog(`启动失败: ${msg}`, 'err')
    alert(`启动失败：${msg}`)
  } catch (e) {
    const msg = e?.message || '调用失败'
    addLog(`启动失败: ${msg}`, 'err')
    alert(`启动失败：${msg}`)
  }
}

async function del(id) {
  const env = envList.value.find(e => e.id === id)
  await window.ruyi.dbDeleteEnv(id)
  if (env) addLog(`环境已删除: ${env.name}`, 'info')
  await loadEnvs()
}

async function inspect(env) {
  try {
    const res = await window.ruyi.inspectEnvFiles(env.id)
    if (!res?.ok) {
      const msg = res?.error || '读取失败'
      addLog(`检查失败: ${msg}`, 'err')
      alert(`检查失败：${msg}`)
      return
    }
    inspectModal.value.visible = true
    inspectModal.value.filter = 'all'
    inspectModal.value.files = res.files || {}
    addLog(`已打开环境文件检查: ${env.name}`, 'info')
  } catch (e) {
    const msg = e?.message || '检查调用失败'
    addLog(`检查失败: ${msg}`, 'err')
    alert(`检查失败：${msg}`)
  }
}

function closeInspectModal() {
  inspectModal.value.visible = false
  inspectModal.value.files = null
}

async function copyInspectText() {
  const text = inspectPreview.value || ''
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
  } catch (_) {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'absolute'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
}

onMounted(loadEnvs)
</script>
