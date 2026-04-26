<template>
  <div class="page-card">
    <div class="page-header">
      <span class="page-title">控制台</span>
    </div>

    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-card-label">活跃会话</div>
        <div class="stat-card-value">{{ sessionCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">Python服务</div>
        <div class="stat-card-value" :style="{ color: online ? 'var(--success)' : 'var(--danger)', fontSize: '14px', paddingTop: '6px' }">
          {{ online ? '● 在线' : '● 离线' }}
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
