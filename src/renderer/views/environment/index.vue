<template>
  <div class="page-card">
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { addLog } from '../../composables/useLogs'

const router = useRouter()

const envList = ref([])

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

onMounted(loadEnvs)
</script>
