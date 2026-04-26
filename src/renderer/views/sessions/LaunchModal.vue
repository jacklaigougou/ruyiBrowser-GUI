<template>
  <div class="modal" @click.self="$emit('close')">
    <div class="modal-box">
      <h2>启动浏览器</h2>
      <label>Firefox路径
        <input v-model="form.browser_path" type="text" placeholder="留空使用默认" />
      </label>
      <label>用户数据目录
        <input v-model="form.user_dir" type="text" placeholder="留空使用默认" />
      </label>
      <label>代理
        <input v-model="form.proxy" type="text" placeholder="http://127.0.0.1:7890" />
      </label>
      <label>人类轨迹算法
        <select v-model="form.human_algorithm">
          <option value="">默认</option>
          <option value="bezier">bezier</option>
          <option value="windmouse">windmouse</option>
        </select>
      </label>
      <label class="checkbox-label">
        <input v-model="form.headless" type="checkbox" />
        无头模式
      </label>
      <div class="modal-actions">
        <button class="btn btn--primary" :disabled="loading" @click="launch">
          {{ loading ? '启动中...' : '启动' }}
        </button>
        <button class="btn" @click="$emit('close')">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { addLog } from '../../composables/useLogs'

const emit = defineEmits(['close', 'launched'])
const loading = ref(false)
const form = ref({ browser_path: '', user_dir: '', proxy: '', human_algorithm: '', headless: false })

async function launch() {
  loading.value = true
  const opts = Object.fromEntries(
    Object.entries(form.value).filter(([, v]) => v !== '' && v !== false)
  )
  const res = await window.ruyi.launch(opts)
  loading.value = false
  if (res.ok) {
    addLog(`浏览器已启动，会话ID: ${res.data.sessionId}`, 'ok')
    emit('launched')
    emit('close')
  } else {
    addLog(`启动失败: ${res.error}`, 'err')
  }
}
</script>
