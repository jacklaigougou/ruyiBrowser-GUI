<template>
  <div class="log-box">
    <div class="log-header">操作日志</div>
    <div class="log-content" ref="logEl">
      <div v-for="(entry, i) in logs" :key="i" class="log-line" :class="entry.type">
        [{{ entry.time }}] {{ entry.msg }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useLogs } from '../../composables/useLogs'

const { logs } = useLogs()
const logEl = ref(null)

watch(
  () => logs.value.length,
  () => nextTick(() => { if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight })
)
</script>
