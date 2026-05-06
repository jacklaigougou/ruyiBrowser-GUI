<template>
  <AppLayout>
    <RouterView />
  </AppLayout>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import AppLayout from './components/AppLayout.vue'
import { refreshHealth } from './composables/useHealth'

let timer
onMounted(() => {
  refreshHealth()
  timer = setInterval(refreshHealth, 5000)
})
onUnmounted(() => clearInterval(timer))
</script>
