<template>
  <div class="layout">
    <AppSidebar />
    <div class="main-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
import AppSidebar from './AppSidebar.vue'
</script>
