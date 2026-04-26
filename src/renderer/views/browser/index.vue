<template>
  <div class="page-card">
    <div class="page-header">
      <span class="page-title">浏览器操作</span>
      <div style="display:flex;gap:8px;align-items:center">
        <select v-model="sessionId" style="width:260px" @click="refreshSessions">
          <option value="">— 选择会话 —</option>
          <option v-for="s in sessions" :key="s.sessionId" :value="s.sessionId">
            {{ s.sessionId.slice(0, 8) }}… {{ s.title || s.url || '' }}
          </option>
        </select>
        <button class="btn" @click="refreshSessions">刷新</button>
      </div>
    </div>

    <div class="ops-grid">
      <NavPanel :session-id="sessionId" />
      <ElementPanel :session-id="sessionId" />
      <ScriptPanel :session-id="sessionId" />
      <CookiePanel :session-id="sessionId" />
      <ScreenshotPanel :session-id="sessionId" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import NavPanel from './NavPanel.vue'
import ElementPanel from './ElementPanel.vue'
import ScriptPanel from './ScriptPanel.vue'
import CookiePanel from './CookiePanel.vue'
import ScreenshotPanel from './ScreenshotPanel.vue'

const sessionId = ref('')
const sessions = ref([])

async function refreshSessions() {
  const res = await window.ruyi.listSessions()
  if (res.ok) sessions.value = res.data?.sessions ?? []
}

onMounted(refreshSessions)
</script>
