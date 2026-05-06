<template>
  <div>
    <!-- 测试结果弹窗 -->
    <div v-if="testResult" class="modal" @click.self="testResult = null">
      <div class="modal-box" style="width:340px">
        <h2 :style="{ color: testResult.ok ? 'var(--success)' : 'var(--danger)' }">
          {{ testResult.ok ? '连接成功' : '连接失败' }}
        </h2>
        <p style="font-size:13px;color:var(--text-secondary)">{{ testResult.msg }}</p>
        <div class="modal-actions">
          <button class="btn btn--primary" @click="testResult = null">确定</button>
        </div>
      </div>
    </div>

    <!-- 代理设置 -->
    <div class="form-card">
      <div class="card-collapse-header" @click="collapseProxy = !collapseProxy">
        <span class="card-title">代理设置</span>
        <svg class="collapse-arrow" :class="{ open: !collapseProxy }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
      </div>

      <div style="border-top:1px solid var(--border);margin:0 -20px"></div>

      <div v-show="!collapseProxy">
        <div class="field-row">
          <span class="field-label">代理类型</span>
          <div class="field-control">
            <div class="tab-group">
              <button v-for="opt in proxyTypeOpts" :key="opt.value" class="tab-opt"
                :class="{ active: form.proxyType === opt.value }"
                @click="form.proxyType = opt.value">{{ opt.label }}</button>
            </div>
          </div>
        </div>

        <template v-if="form.proxyType !== 'none'">
          <div class="field-row">
            <span class="field-label">一次性输入</span>
            <div class="field-control">
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:nowrap">
                <input v-model="quickInput" type="text" class="field-input" placeholder="ip|port|user|pass 或 ip:port:user:pass" style="flex:1" @keydown.enter="parseQuickInput" />
                <button class="btn" @click="parseQuickInput" style="flex-shrink:0">填入</button>
              </div>
            </div>
          </div>
          <div class="field-row">
            <span class="field-label">用户名</span>
            <div class="field-control">
              <div style="display:flex;align-items:center;gap:16px;flex-wrap:nowrap">
                <input v-model="form.proxyUser" type="text" class="field-input" placeholder="可选" style="width:200px;flex-shrink:0" />
                <span style="font-size:13px;color:var(--accent);white-space:nowrap;flex-shrink:0">密码</span>
                <input v-model="form.proxyPass" type="password" class="field-input" placeholder="可选" style="width:200px;flex-shrink:0" />
              </div>
            </div>
          </div>
          <div class="field-row">
            <span class="field-label">Host</span>
            <div class="field-control">
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:nowrap">
                <input v-model="form.proxyHost" type="text" class="field-input" placeholder="127.0.0.1" style="width:200px;flex-shrink:0" />
                <span style="font-size:13px;color:var(--text-muted);flex-shrink:0">:</span>
                <input v-model="form.proxyPort" type="text" class="field-input" placeholder="7890" style="width:80px;flex-shrink:0" />
                <button class="btn" :disabled="testing" @click="testProxy" style="flex-shrink:0">
                  {{ testing ? '测试中…' : '测试连通' }}
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- WebRTC -->
    <div class="form-card">
      <div class="card-collapse-header" @click="collapseWebrtc = !collapseWebrtc">
        <span class="card-title">WebRTC</span>
        <svg class="collapse-arrow" :class="{ open: !collapseWebrtc }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
      </div>

      <div style="border-top:1px solid var(--border);margin:0 -20px"></div>

      <div v-show="!collapseWebrtc">
        <div class="field-row">
          <span class="field-label">模式</span>
          <div class="field-control">
            <div class="tab-group">
              <button v-for="opt in webrtcOpts" :key="opt.value" class="tab-opt"
                :class="{ active: form.webrtcMode === opt.value }"
                @click="form.webrtcMode = opt.value">{{ opt.label }}</button>
            </div>
            <span v-if="form.webrtcMode === 'proxy'" style="font-size:12px;color:var(--text-muted);margin-top:6px;display:block">
              将自动使用代理 IP 配置 WebRTC 公网地址
              <template v-if="form.proxyHost">
                — 当前代理 IP：<span style="color:var(--accent);font-weight:600">{{ form.proxyHost }}</span>
              </template>
              <span v-else style="color:var(--danger)">（代理页未填写 Host）</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({ form: Object })

const collapseProxy = ref(false)
const collapseWebrtc = ref(false)
const testing = ref(false)
const testResult = ref(null)
const quickInput = ref('')

function parseQuickInput() {
  const str = quickInput.value.trim()
  if (!str) return
  const sep = str.includes('|') ? '|' : ':'
  const parts = str.split(sep)
  if (parts.length >= 2) props.form.proxyHost = parts[0]
  if (parts.length >= 2) props.form.proxyPort = parts[1]
  if (parts.length >= 3) props.form.proxyUser = parts[2]
  if (parts.length >= 4) props.form.proxyPass = parts[3]
}

async function testProxy() {
  testing.value = true
  testResult.value = null
  try {
    testResult.value = await window.ruyi.testProxy({
      type: props.form.proxyType,
      host: props.form.proxyHost,
      port: props.form.proxyPort,
      user: props.form.proxyUser,
      pass: props.form.proxyPass,
    })
  } catch (e) {
    testResult.value = { ok: false, msg: e.message }
  } finally {
    testing.value = false
  }
}

const proxyTypeOpts = [
  { value: 'none',   label: '直连' },
  { value: 'http',   label: 'HTTP' },
  { value: 'socks5', label: 'SOCKS5' },
]

const webrtcOpts = [
  { value: 'disabled', label: '禁用' },
  { value: 'real',     label: '真实' },
  { value: 'proxy',    label: '使用代理' },
]
</script>
