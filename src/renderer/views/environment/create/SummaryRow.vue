<template>
  <div class="summary-row">
    <span class="summary-label">{{ label }}</span>
    <span class="summary-value">{{ value }}</span>
  </div>
</template>

<script setup>
defineProps({ label: String, value: String })
</script>
