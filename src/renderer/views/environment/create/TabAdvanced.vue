<template>
  <div>
    <div class="form-card">
      <div class="field-row">
        <span class="field-label">CPU 核心数</span>
        <div class="field-control">
          <input v-model.number="form.cpuCores" type="number" class="field-input" placeholder="8" min="1" max="128" />
        </div>
      </div>

      <div class="field-row">
        <span class="field-label">WebDriver 标记</span>
        <div class="field-control">
          <div class="tab-group">
            <button class="tab-opt" :class="{ active: form.webdriver === '0' }" @click="form.webdriver = '0'">隐藏</button>
            <button class="tab-opt" :class="{ active: form.webdriver === '1' }" @click="form.webdriver = '1'">暴露</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ form: Object })
</script>
