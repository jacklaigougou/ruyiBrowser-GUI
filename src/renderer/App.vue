<template>
  <div class="layout">
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
    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const online = ref(false)

async function checkHealth() {
  const res = await window.ruyi.health()
  online.value = res.ok
}

let timer
onMounted(() => {
  checkHealth()
  timer = setInterval(checkHealth, 5000)
})
onUnmounted(() => clearInterval(timer))
</script>
