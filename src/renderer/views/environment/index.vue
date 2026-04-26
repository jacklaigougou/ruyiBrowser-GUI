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
          <th>浏览器可执行文件</th>
          <th>代理</th>
          <th>时区</th>
          <th>创建时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="envList.length === 0">
          <td colspan="6" class="empty-tip">暂无环境，点击「新建环境」创建</td>
        </tr>
        <tr v-for="env in envList" :key="env.id">
          <td style="font-weight:500">{{ env.name }}</td>
          <td style="font-size:12px;color:var(--text-muted)">{{ env.exePath || '默认' }}</td>
          <td style="font-size:12px;color:var(--text-muted)">{{ proxyDisplay(env) }}</td>
          <td style="font-size:12px;color:var(--text-muted)">{{ env.timezone || '—' }}</td>
          <td style="font-size:12px;color:var(--text-muted)">{{ env.createdAt }}</td>
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
import { useEnvStore } from '../../composables/useEnvStore'
import { addLog } from '../../composables/useLogs'

const { envList, remove } = useEnvStore()

function proxyDisplay(env) {
  if (!env.proxyHost) return '无'
  return `${env.proxyHost}:${env.proxyPort}`
}

async function launch(env) {
  addLog(`正在启动环境: ${env.name}`, 'info')
  const res = await window.ruyi.launch({
    exe_path:  env.exePath  || undefined,
    profile:   env.profileDir || undefined,
    fpfile:    env.fpfilePath || undefined,
  })
  addLog(res.ok ? `环境启动成功: ${env.name}` : `启动失败: ${res.error}`, res.ok ? 'ok' : 'err')
}

function del(id) {
  const env = envList.value.find(e => e.id === id)
  remove(id)
  if (env) addLog(`环境已删除: ${env.name}`, 'info')
}
</script>
