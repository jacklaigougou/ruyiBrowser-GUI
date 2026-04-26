<template>
  <div>
    <h1>会话管理</h1>
    <div class="toolbar">
      <button class="btn btn--primary" @click="showLaunch = true">启动新浏览器</button>
      <button class="btn" @click="load">刷新</button>
    </div>

    <div class="sessions-list">
      <div v-if="sessions.length === 0" class="empty-tip">暂无活跃会话</div>
      <div v-for="s in sessions" :key="s.sessionId" class="session-item">
        <span class="session-id">{{ s.sessionId }}</span>
        <span class="session-url">{{ s.url || '—' }}</span>
        <span class="session-meta">{{ s.title || '—' }}</span>
        <button class="btn btn--danger" @click="close(s.sessionId)">关闭</button>
      </div>
    </div>

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
