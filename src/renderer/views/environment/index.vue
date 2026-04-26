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
          <td style="font-weight:500">{{ env.name }}</td>
          <td style="font-size:12px;color:var(--text-muted)">{{ proxyDisplay(env) }}</td>
          <td style="font-size:12px;color:var(--text-muted)">{{ env.timezone || '—' }}</td>
          <td style="font-size:12px;color:var(--text-muted)">{{ env.created_at }}</td>
          <td>
            <div class="table-actions">
              <button class="btn btn--text" @click="launch(env)">启动</button>
              <button class="btn btn--danger btn--text" @click="del(env.id)">删除</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { addLog } from '../../composables/useLogs'

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
  const res = await window.ruyi.launch({ envId: env.id })
  addLog(res.ok ? `环境启动成功: ${env.name}` : `启动失败: ${res.error}`, res.ok ? 'ok' : 'err')
}

async function del(id) {
  const env = envList.value.find(e => e.id === id)
  await window.ruyi.dbDeleteEnv(id)
  if (env) addLog(`环境已删除: ${env.name}`, 'info')
  await loadEnvs()
}

onMounted(loadEnvs)
</script>
