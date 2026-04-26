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
    <LogPanel />
  </div>
</template>

<script setup>
import { useHealthStore } from '../../composables/useHealth'
import LogPanel from './LogPanel.vue'

const { online, sessionCount } = useHealthStore()
</script>
