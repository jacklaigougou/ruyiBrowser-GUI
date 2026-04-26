<template>
  <div class="titlebar">
    <span class="titlebar-title">ruyiPage GUI</span>
    <div class="titlebar-actions">
      <button class="titlebar-btn" title="打开 DevTools" @click="window.ruyi.devtools()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <polyline points="16 18 22 12 16 6"/>
          <polyline points="8 6 2 12 8 18"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
// 纯展示 + DevTools触发，无其他逻辑
</script>
