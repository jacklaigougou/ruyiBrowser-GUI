<template>
  <div class="op-card op-card--wide">
    <h3>截图</h3>
    <button class="btn" @click="take">截图</button>
    <div class="screenshot-preview">
      <img v-if="src" :src="src" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { addLog } from '../../composables/useLogs'

const props = defineProps({ sessionId: String })
const src = ref('')

async function take() {
  if (!props.sessionId) return alert('请先选择会话')
  const res = await window.ruyi.screenshot(props.sessionId)
  if (res.ok && res.data?.image) {
    src.value = `data:image/png;base64,${res.data.image}`
    addLog('截图成功', 'ok')
  } else {
    addLog(`截图失败: ${res.error}`, 'err')
  }
}
</script>
