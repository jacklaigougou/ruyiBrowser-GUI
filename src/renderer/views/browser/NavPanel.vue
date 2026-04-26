<template>
  <div class="op-card op-card--wide">
    <h3>导航 &amp; 页面信息</h3>
    <div style="display:flex;gap:8px">
      <input v-model="url" type="text" placeholder="https://example.com" style="flex:1" @keyup.enter="navigate" />
      <button class="btn btn--primary" @click="navigate">前往</button>
      <button class="btn" @click="getPageInfo">页面信息</button>
    </div>
    <div class="op-result" :class="status">{{ result }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useOpResult } from '../../composables/useOpResult'

const props = defineProps({ sessionId: String })
const url = ref('')
const { result, status, apply } = useOpResult()

async function navigate() {
  if (!props.sessionId) return alert('请先选择会话')
  if (!url.value) return
  apply(await window.ruyi.navigate(props.sessionId, url.value), '导航')
}

async function getPageInfo() {
  if (!props.sessionId) return alert('请先选择会话')
  apply(await window.ruyi.pageInfo(props.sessionId), '页面信息')
}
</script>
