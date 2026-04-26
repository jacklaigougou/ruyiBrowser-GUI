<template>
  <div class="page-card">
    <div class="page-header">
      <span class="page-title">环境管理</span>
      <button class="btn btn--primary" @click="showCreate = true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        新建环境
      </button>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>环境名称</th>
          <th>浏览器路径</th>
          <th>代理</th>
          <th>创建时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="envList.length === 0">
          <td colspan="5" class="empty-tip">暂无环境，点击「新建环境」创建</td>
        </tr>
        <tr v-for="env in envList" :key="env.id">
          <td>{{ env.name }}</td>
          <td style="font-size:12px;color:var(--text-muted)">{{ env.browserPath || '默认' }}</td>
          <td style="font-size:12px;color:var(--text-muted)">{{ env.proxy || '无' }}</td>
          <td style="font-size:12px;color:var(--text-muted)">{{ env.createdAt }}</td>
          <td>
            <div class="table-actions">
              <button class="btn btn--text" @click="launch(env)">启动</button>
              <button class="btn btn--danger btn--text" @click="remove(env.id)">删除</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 新建环境 Modal -->
    <div v-if="showCreate" class="modal" @click.self="showCreate = false">
      <div class="modal-box">
        <h2>新建环境</h2>
        <label>环境名称 <span style="color:var(--danger)">*</span>
          <input v-model="form.name" type="text" placeholder="例：账号A" />
        </label>
        <label>Firefox 路径
          <input v-model="form.browserPath" type="text" placeholder="留空使用默认" />
        </label>
        <label>用户数据目录
          <input v-model="form.userDir" type="text" placeholder="留空使用默认" />
        </label>
        <label>代理
          <input v-model="form.proxy" type="text" placeholder="http://127.0.0.1:7890" />
        </label>
        <label>人类轨迹算法
          <select v-model="form.algorithm">
            <option value="">默认</option>
            <option value="bezier">bezier</option>
            <option value="windmouse">windmouse</option>
          </select>
        </label>
        <label class="checkbox-label">
          <input v-model="form.headless" type="checkbox" /> 无头模式
        </label>
        <div class="modal-actions">
          <button class="btn" @click="showCreate = false">取消</button>
          <button class="btn btn--primary" @click="create">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { addLog } from '../../composables/useLogs'

const envList = ref([])
const showCreate = ref(false)
const form = ref({ name: '', browserPath: '', userDir: '', proxy: '', algorithm: '', headless: false })

function create() {
  if (!form.value.name.trim()) return alert('请填写环境名称')
  const env = {
    id: Date.now(),
    name: form.value.name.trim(),
    browserPath: form.value.browserPath.trim(),
    userDir: form.value.userDir.trim(),
    proxy: form.value.proxy.trim(),
    algorithm: form.value.algorithm,
    headless: form.value.headless,
    createdAt: new Date().toLocaleDateString('zh-CN'),
  }
  envList.value.unshift(env)
  addLog(`环境已创建: ${env.name}`, 'ok')
  showCreate.value = false
  form.value = { name: '', browserPath: '', userDir: '', proxy: '', algorithm: '', headless: false }
}

async function launch(env) {
  addLog(`正在启动环境: ${env.name}`, 'info')
  const opts = {
    ...(env.browserPath && { browser_path: env.browserPath }),
    ...(env.userDir     && { user_dir: env.userDir }),
    ...(env.proxy       && { proxy: env.proxy }),
    ...(env.algorithm   && { human_algorithm: env.algorithm }),
    headless: env.headless,
  }
  const res = await window.ruyi.launch(opts)
  addLog(res.ok ? `环境启动成功: ${env.name}` : `启动失败: ${res.error}`, res.ok ? 'ok' : 'err')
}

function remove(id) {
  const env = envList.value.find(e => e.id === id)
  envList.value = envList.value.filter(e => e.id !== id)
  if (env) addLog(`环境已删除: ${env.name}`, 'info')
}
</script>
