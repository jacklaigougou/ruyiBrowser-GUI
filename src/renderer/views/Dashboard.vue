<template>
  <div>
    <h1>控制台</h1>
    <div class="card-grid">
      <div class="card">
        <div class="card-title">活跃会话</div>
        <div class="card-value">{{ sessionCount }}</div>
      </div>
      <div class="card">
        <div class="card-title">Python服务</div>
        <div class="card-value" :style="{ color: online ? 'var(--success)' : 'var(--error)' }">
          {{ online ? '在线' : '离线' }}
        </div>
      </div>
    </div>
    <div class="log-box">
      <div class="log-header">操作日志</div>
      <div class="log-content" ref="logEl">
        <div v-for="(entry, i) in logs" :key="i" class="log-line" :class="entry.type">
          [{{ entry.time }}] {{ entry.msg }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useLogs } from '../composables/useLogs'
import { useHealth } from '../composables/useHealth'

const { logs } = useLogs()
const { online, sessionCount } = useHealth()
const logEl = ref(null)

const unwatch = logs.watchEffect
onMounted(() => {
  // 日志新增时滚到底部
  const obs = new MutationObserver(() => {
    nextTick(() => { if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight })
  })
  if (logEl.value) obs.observe(logEl.value, { childList: true })
  onUnmounted(() => obs.disconnect())
})
</script>
