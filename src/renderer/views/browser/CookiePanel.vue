<template>
  <div class="op-card op-card--wide">
    <h3>Cookie 管理</h3>
    <button class="btn" @click="get">获取Cookie</button>
    <div class="op-result" :class="status">{{ result }}</div>
  </div>
</template>

<script setup>
import { useOpResult } from '../../composables/useOpResult'

const props = defineProps({ sessionId: String })
const { result, status, apply } = useOpResult()

async function get() {
  if (!props.sessionId) return alert('请先选择会话')
  apply(await window.ruyi.getCookies(props.sessionId), 'Cookie获取')
}
</script>
