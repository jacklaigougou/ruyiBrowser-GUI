<template>
  <div class="layout">
    <TitleBar />
    <div class="layout-body">
      <AppSidebar />
      <div class="main-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import TitleBar from './TitleBar.vue'
import AppSidebar from './AppSidebar.vue'
</script>
