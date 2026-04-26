<template>
  <aside class="sidebar">
    <div class="logo">ruyiPage</div>
    <nav class="nav">
      <RouterLink class="nav-item" to="/dashboard">控制台</RouterLink>
      <RouterLink class="nav-item" to="/sessions">会话管理</RouterLink>
      <RouterLink class="nav-item" to="/browser">浏览器操作</RouterLink>
      <RouterLink class="nav-item" to="/settings">设置</RouterLink>
    </nav>
    <div class="status-bar">
      <span class="dot" :class="online ? 'dot--on' : 'dot--off'"></span>
      <span>{{ online ? 'Python服务已连接' : 'Python服务未连接' }}</span>
    </div>
  </aside>
</template>

<script setup>
import { useHealthStore } from '../composables/useHealth'
const { online } = useHealthStore()
</script>
