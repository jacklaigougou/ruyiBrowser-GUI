<template>
  <div>
    <h1>设置</h1>
    <div class="settings-form">
      <label>Python服务地址
        <input v-model="baseUrl" type="text" />
      </label>
      <label>请求超时 (ms)
        <input v-model.number="timeout" type="number" />
      </label>
      <button class="btn btn--primary" @click="save">保存</button>
      <div v-if="result" class="op-result" :class="resultStatus">{{ result }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { addLog } from '../composables/useLogs'

const baseUrl = ref('http://127.0.0.1:7788')
const timeout = ref(30000)
const result = ref('')
const resultStatus = ref('')

async function save() {
  const res = await window.ruyi.config({ baseUrl: baseUrl.value, timeout: timeout.value })
  if (res.ok) {
    result.value = '配置已保存'
    resultStatus.value = 'ok'
    addLog('配置已保存', 'ok')
  } else {
    result.value = res.error
    resultStatus.value = 'err'
    addLog('保存失败: ' + res.error, 'err')
  }
}
</script>
