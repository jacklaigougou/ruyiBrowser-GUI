<template>
  <div class="page-card">
    <div class="page-header">
      <span class="page-title">会话管理</span>
      <button class="btn btn--primary" @click="showLaunch = true">+ 启动浏览器</button>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>会话ID</th>
          <th>当前URL</th>
          <th>页面标题</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="sessions.length === 0">
          <td colspan="4" class="empty-tip">暂无活跃会话</td>
        </tr>
        <tr v-for="s in sessions" :key="s.sessionId">
          <td style="font-family:monospace;font-size:12px;color:var(--text-muted)">{{ s.sessionId }}</td>
          <td>{{ s.url || '—' }}</td>
          <td>{{ s.title || '—' }}</td>
          <td>
            <div class="table-actions">
              <button class="btn btn--danger btn--text" @click="close(s.sessionId)">关闭</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <LaunchModal v-if="showLaunch" @close="showLaunch = false" @launched="load" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { addLog } from '../../composables/useLogs'
import LaunchModal from './LaunchModal.vue'

const sessions = ref([])
const showLaunch = ref(false)

async function load() {
  const res = await window.ruyi.listSessions()
  if (res.ok) sessions.value = res.data?.sessions ?? []
}

async function close(id) {
  const res = await window.ruyi.close(id)
  addLog(res.ok ? `会话已关闭: ${id}` : `关闭失败: ${res.error}`, res.ok ? 'ok' : 'err')
  load()
}

onMounted(load)
</script>
