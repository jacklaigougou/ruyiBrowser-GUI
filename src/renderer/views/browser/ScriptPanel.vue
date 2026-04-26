<template>
  <div class="op-card op-card--wide">
    <h3>执行 JavaScript</h3>
    <textarea v-model="code" rows="4" placeholder="document.title"></textarea>
    <button class="btn" @click="run">执行</button>
    <div class="op-result" :class="status">{{ result }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useOpResult } from '../../composables/useOpResult'

const props = defineProps({ sessionId: String })
const code = ref('')
const { result, status, apply } = useOpResult()

async function run() {
  if (!props.sessionId) return alert('请先选择会话')
  if (!code.value) return
  apply(await window.ruyi.executeScript(props.sessionId, code.value), 'JS执行')
}
</script>
