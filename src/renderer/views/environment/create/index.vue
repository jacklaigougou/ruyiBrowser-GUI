<template>
  <div class="create-page">
    <!-- 页头 -->
    <div class="create-header">
      <div class="create-header-left">
        <button class="btn-back" @click="$router.back()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span class="create-title">新建环境</span>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn" @click="$router.back()">取消</button>
        <button class="btn btn--primary" @click="save">保存</button>
      </div>
    </div>

    <!-- Tab 导航 -->
    <div class="tab-nav">
      <button v-for="tab in tabs" :key="tab.key" class="tab-item" :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">
        {{ tab.label }}
      </button>
    </div>

    <!-- 主体：左表单 + 右概要 -->
    <div class="create-body">
      <div class="create-form">

        <!-- ── 基础设置 ── -->
        <template v-if="activeTab === 'basic'">
          <div class="field-row">
            <label class="field-label">名称 <span class="required">*</span></label>
            <div class="field-control">
              <input v-model="form.name" type="text" class="field-input" placeholder="请填写环境名称" maxlength="100" />
              <span class="char-count">{{ form.name.length }} / 100</span>
            </div>
          </div>

          <div class="field-row">
            <label class="field-label">foxprint.exe <span class="required">*</span></label>
            <div class="field-control">
              <input v-model="form.exePath" type="text" class="field-input" placeholder="C:\foxprint\foxprint.exe" />
            </div>
          </div>

          <div class="field-row">
            <label class="field-label">Profile 目录</label>
            <div class="field-control">
              <input v-model="form.profileDir" type="text" class="field-input" placeholder="C:\profiles\user1（留空自动分配）" />
            </div>
          </div>

          <div class="field-row">
            <label class="field-label">fpfile 路径</label>
            <div class="field-control">
              <input v-model="form.fpfilePath" type="text" class="field-input" placeholder="留空则根据指纹配置自动生成" />
            </div>
          </div>

          <div class="field-row">
            <label class="field-label">备注</label>
            <div class="field-control">
              <textarea v-model="form.remark" class="field-input field-textarea" placeholder="请输入备注" maxlength="1500" rows="3"></textarea>
              <span class="char-count">{{ form.remark.length }} / 1500</span>
            </div>
          </div>
        </template>

        <!-- ── 代理信息 ── -->
        <template v-if="activeTab === 'proxy'">
          <div class="field-row">
            <label class="field-label">代理类型</label>
            <div class="field-control">
              <select v-model="form.proxyType" class="field-input">
                <option value="none">No Proxy（本地直连）</option>
                <option value="http">HTTP</option>
                <option value="socks5">SOCKS5</option>
              </select>
            </div>
          </div>

          <template v-if="form.proxyType !== 'none'">
            <div class="field-row">
              <label class="field-label">代理 Host</label>
              <div class="field-control">
                <input v-model="form.proxyHost" type="text" class="field-input" placeholder="127.0.0.1" />
              </div>
            </div>
            <div class="field-row">
              <label class="field-label">代理端口</label>
              <div class="field-control">
                <input v-model="form.proxyPort" type="text" class="field-input" placeholder="7890" />
              </div>
            </div>
            <div class="field-row">
              <label class="field-label">用户名</label>
              <div class="field-control">
                <input v-model="form.proxyUser" type="text" class="field-input" placeholder="可选（httpauth.username）" />
              </div>
            </div>
            <div class="field-row">
              <label class="field-label">密码</label>
              <div class="field-control">
                <input v-model="form.proxyPass" type="password" class="field-input" placeholder="可选（httpauth.password）" />
              </div>
            </div>
          </template>

          <div class="section-divider">WebRTC</div>

          <div class="field-row">
            <label class="field-label">WebRTC 策略</label>
            <div class="field-control tab-group">
              <button v-for="opt in webrtcOpts" :key="opt.value" class="tab-opt" :class="{ active: form.webrtcMode === opt.value }" @click="form.webrtcMode = opt.value">{{ opt.label }}</button>
            </div>
          </div>

          <template v-if="form.webrtcMode === 'custom'">
            <div class="field-row">
              <label class="field-label">本地 IPv4</label>
              <div class="field-control">
                <input v-model="form.localIpv4" type="text" class="field-input" placeholder="192.168.1.100" />
              </div>
            </div>
            <div class="field-row">
              <label class="field-label">本地 IPv6</label>
              <div class="field-control">
                <input v-model="form.localIpv6" type="text" class="field-input" placeholder="可选" />
              </div>
            </div>
            <div class="field-row">
              <label class="field-label">公网 IPv4</label>
              <div class="field-control">
                <input v-model="form.publicIpv4" type="text" class="field-input" placeholder="与代理出口一致" />
              </div>
            </div>
            <div class="field-row">
              <label class="field-label">公网 IPv6</label>
              <div class="field-control">
                <input v-model="form.publicIpv6" type="text" class="field-input" placeholder="可选" />
              </div>
            </div>
          </template>
        </template>

        <!-- ── 指纹配置 ── -->
        <template v-if="activeTab === 'fingerprint'">
          <div class="section-divider">语言 / 地区</div>

          <div class="field-row">
            <label class="field-label">时区</label>
            <div class="field-control">
              <input v-model="form.timezone" type="text" class="field-input" placeholder="Asia/Shanghai" />
            </div>
          </div>
          <div class="field-row">
            <label class="field-label">语言</label>
            <div class="field-control">
              <input v-model="form.language" type="text" class="field-input" placeholder="zh-CN,zh" />
            </div>
          </div>
          <div class="field-row">
            <label class="field-label">系统字体集</label>
            <div class="field-control">
              <select v-model="form.fontSystem" class="field-input">
                <option value="">默认</option>
                <option value="windows">Windows</option>
                <option value="linux">Linux</option>
                <option value="mac">Mac</option>
              </select>
            </div>
          </div>

          <div class="section-divider">User-Agent</div>

          <div class="field-row">
            <label class="field-label">User-Agent</label>
            <div class="field-control">
              <input v-model="form.userAgent" type="text" class="field-input" placeholder="留空使用浏览器默认" />
            </div>
          </div>

          <div class="section-divider">Canvas / WebGL</div>

          <div class="field-row">
            <label class="field-label">Canvas 种子</label>
            <div class="field-control">
              <input v-model.number="form.canvasSeed" type="number" class="field-input" placeholder="随机整数" />
            </div>
          </div>
          <div class="field-row">
            <label class="field-label">WebGL Vendor</label>
            <div class="field-control">
              <input v-model="form.webglVendor" type="text" class="field-input" placeholder="Intel Inc." />
            </div>
          </div>
          <div class="field-row">
            <label class="field-label">WebGL Renderer</label>
            <div class="field-control">
              <input v-model="form.webglRenderer" type="text" class="field-input" placeholder="Intel Iris OpenGL Engine" />
            </div>
          </div>
          <div class="field-row">
            <label class="field-label">Unmasked Vendor</label>
            <div class="field-control">
              <input v-model="form.webglUnmaskedVendor" type="text" class="field-input" placeholder="Intel Inc." />
            </div>
          </div>
          <div class="field-row">
            <label class="field-label">Unmasked Renderer</label>
            <div class="field-control">
              <input v-model="form.webglUnmaskedRenderer" type="text" class="field-input" placeholder="ANGLE ..." />
            </div>
          </div>
          <div class="field-row">
            <label class="field-label">最大纹理尺寸</label>
            <div class="field-control">
              <input v-model.number="form.webglMaxTexture" type="number" class="field-input" placeholder="16384" />
            </div>
          </div>
        </template>

        <!-- ── 高级设置 ── -->
        <template v-if="activeTab === 'advanced'">
          <div class="field-row">
            <label class="field-label">CPU 核心数</label>
            <div class="field-control">
              <input v-model.number="form.cpuCores" type="number" class="field-input" placeholder="8" min="1" max="128" />
            </div>
          </div>
          <div class="field-row">
            <label class="field-label">屏幕分辨率</label>
            <div class="field-control" style="display:flex;gap:8px">
              <input v-model.number="form.screenW" type="number" class="field-input" placeholder="宽 1920" />
              <span style="line-height:36px;color:var(--text-muted)">×</span>
              <input v-model.number="form.screenH" type="number" class="field-input" placeholder="高 1080" />
            </div>
          </div>
          <div class="field-row">
            <label class="field-label">WebDriver 标记</label>
            <div class="field-control tab-group">
              <button class="tab-opt" :class="{ active: form.webdriver === '0' }" @click="form.webdriver = '0'">隐藏</button>
              <button class="tab-opt" :class="{ active: form.webdriver === '1' }" @click="form.webdriver = '1'">暴露</button>
            </div>
          </div>
        </template>

      </div>

      <!-- 右侧概要面板 -->
      <div class="summary-panel">
        <div class="summary-header">
          <span>概要</span>
        </div>
        <div class="summary-body">
          <SummaryRow label="浏览器" :value="form.exePath || '未设置'" />
          <SummaryRow label="User-Agent" :value="form.userAgent || '默认'" />
          <SummaryRow label="WebRTC" :value="webrtcLabel" />
          <SummaryRow label="时区" :value="form.timezone || '默认'" />
          <SummaryRow label="语言" :value="form.language || '默认'" />
          <SummaryRow label="分辨率" :value="resolutionLabel" />
          <SummaryRow label="字体" :value="form.fontSystem || '默认'" />
          <SummaryRow label="Canvas" :value="form.canvasSeed != null ? `种子 [${form.canvasSeed}]` : '默认'" />
          <SummaryRow label="WebGL" :value="form.webglVendor || '默认'" />
          <SummaryRow label="CPU核心" :value="form.cpuCores ? String(form.cpuCores) : '默认'" />
          <SummaryRow label="代理" :value="proxyLabel" />
          <SummaryRow label="WebDriver" :value="form.webdriver === '0' ? '隐藏' : '暴露'" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useEnvStore } from '../../../composables/useEnvStore'
import { addLog } from '../../../composables/useLogs'
import SummaryRow from './SummaryRow.vue'

const router = useRouter()
const { add } = useEnvStore()

const tabs = [
  { key: 'basic',       label: '基础设置' },
  { key: 'proxy',       label: '代理信息' },
  { key: 'fingerprint', label: '指纹配置' },
  { key: 'advanced',    label: '高级设置' },
]
const activeTab = ref('basic')

const webrtcOpts = [
  { value: 'disabled', label: '禁用' },
  { value: 'real',     label: '真实' },
  { value: 'custom',   label: '自定义' },
]

const form = ref({
  name: '', exePath: '', profileDir: '', fpfilePath: '', remark: '',
  proxyType: 'none', proxyHost: '', proxyPort: '', proxyUser: '', proxyPass: '',
  webrtcMode: 'disabled', localIpv4: '', localIpv6: '', publicIpv4: '', publicIpv6: '',
  timezone: '', language: '', fontSystem: '', userAgent: '',
  canvasSeed: null, webglVendor: '', webglRenderer: '',
  webglUnmaskedVendor: '', webglUnmaskedRenderer: '', webglMaxTexture: null,
  cpuCores: null, screenW: null, screenH: null, webdriver: '0',
})

const proxyLabel = computed(() => {
  if (form.value.proxyType === 'none') return '本地直连'
  return form.value.proxyHost ? `${form.value.proxyType.toUpperCase()} ${form.value.proxyHost}:${form.value.proxyPort}` : '未配置'
})

const webrtcLabel = computed(() => {
  const m = { disabled: '禁用', real: '真实', custom: '自定义' }
  return m[form.value.webrtcMode] ?? '禁用'
})

const resolutionLabel = computed(() => {
  if (form.value.screenW && form.value.screenH) return `${form.value.screenW} × ${form.value.screenH}`
  return '默认'
})

function save() {
  if (!form.value.name.trim()) { activeTab.value = 'basic'; return alert('请填写环境名称') }
  if (!form.value.exePath.trim()) { activeTab.value = 'basic'; return alert('请填写 foxprint.exe 路径') }
  add({ ...form.value })
  addLog(`环境已创建: ${form.value.name}`, 'ok')
  router.push('/environment')
}
</script>
