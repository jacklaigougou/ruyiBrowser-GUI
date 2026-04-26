<template>
  <div>
    <h1>浏览器操作</h1>
    <div class="toolbar">
      <label>当前会话
        <select v-model="sessionId" @click="refreshSessions">
          <option value="">-- 选择会话 --</option>
          <option v-for="s in sessions" :key="s.sessionId" :value="s.sessionId">
            {{ s.sessionId.slice(0, 8) }}… {{ s.title || s.url || '' }}
          </option>
        </select>
      </label>
      <button class="btn" @click="refreshSessions">刷新会话</button>
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
import { ref, onMounted, provide } from 'vue'
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
