<template>
  <aside class="sidebar">
    <div class="sidebar-title">导航</div>

    <nav class="nav">
      <RouterLink class="nav-item" to="/environment">
        <span class="nav-icon">◈</span>
        环境管理
      </RouterLink>
      <RouterLink class="nav-item" to="/settings">
        <span class="nav-icon">⚙</span>
        系统设置
      </RouterLink>
    </nav>

    <div class="status-bar">
      <span class="dot" :class="online ? 'dot--on' : 'dot--off'"></span>
      <span>{{ online ? 'Python服务已连接' : '服务未连接' }}</span>
    </div>
  </aside>
</template>

<script setup>
import { useHealthStore } from '../composables/useHealth'
const { online } = useHealthStore()
</script>
