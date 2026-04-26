<template>
  <div class="layout">
    <AppSidebar />
    <main class="main">
      <slot />
    </main>
  </div>
</template>

<script setup>
import AppSidebar from './AppSidebar.vue'
</script>
