<template>
  <div class="create-page">
    <!-- fpfile 预览弹窗 -->
    <div v-if="fpfileLines" class="modal" @click.self="fpfileLines = null">
      <div class="modal-box" style="width:620px;max-height:80vh">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <h2 style="margin:0">fpfile 预览</h2>
          <select v-model="previewFilter" style="width:auto;min-width:130px;font-size:13px">
            <option value="all">全部</option>
            <option value="region">地区与语言</option>
            <option value="webgl">WebGL</option>
            <option value="hardware">指纹与硬件</option>
            <option value="proxy">代理认证</option>
            <option value="proxyNetwork">代理地址端口</option>
            <option value="speech">语音</option>
            <option value="webrtc">WebRTC</option>
          </select>
        </div>
        <pre style="font-size:12px;font-family:Consolas,monospace;background:#fafafa;border:1px solid var(--border);border-radius:var(--radius);padding:12px;overflow-y:auto;max-height:55vh;white-space:pre-wrap;word-break:break-all;color:var(--text)">{{ filteredPreview }}</pre>
        <div class="modal-actions">
          <button class="btn" @click="copyPreview">复制</button>
          <button class="btn btn--primary" @click="fpfileLines = null">关闭</button>
        </div>
      </div>
    </div>
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
        <button class="btn" @click="previewFpfile">查看</button>
      </div>
    </div>

    <!-- Tab 导航 -->
    <div class="tab-nav">
      <button v-for="tab in tabs" :key="tab.key" class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key">
        {{ tab.label }}
      </button>
    </div>

    <!-- 主体：左表单 + 右概要 -->
    <div class="create-body">
      <div class="create-form">
        <TabBasic      v-show="activeTab === 'basic'"       :form="form" />
        <TabProxy      v-show="activeTab === 'proxy'"       :form="form" />
        <TabFingerprint v-show="activeTab === 'fingerprint'" :form="form" />
        <TabAdvanced   v-show="activeTab === 'advanced'"    :form="form" />
      </div>

      <!-- 右侧概要面板 -->
      <div class="summary-panel">
        <div class="summary-header"><span>概要</span></div>
        <div class="summary-body">
          <SummaryRow label="foxprint"   :value="form.name ? form.name : '未命名'" />
          <SummaryRow label="WebRTC IP"  :value="form.publicIpv4 || '—'" />
          <SummaryRow label="时区"       :value="tzLabel" />
          <SummaryRow label="语言"       :value="langLabel" />
          <SummaryRow label="分辨率"     :value="resolutionLabel" />
          <SummaryRow label="字体"       :value="form.fontSystem" />
          <SummaryRow label="User-Agent" :value="form.userAgent || '默认'" />
          <SummaryRow label="Canvas"     :value="form.canvasSeed != null ? `种子 [${form.canvasSeed}]` : '默认'" />
          <SummaryRow label="WebGL"      :value="form.webglVendor || '默认'" />
          <SummaryRow label="CPU核心"    :value="form.cpuCores ? String(form.cpuCores) : '默认'" />
          <SummaryRow label="代理"       :value="proxyLabel" />
          <SummaryRow label="WebDriver"  :value="form.webdriver === '0' ? '隐藏' : '暴露'" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { addLog } from '../../../composables/useLogs'
import SummaryRow from './SummaryRow.vue'
import TabBasic from './TabBasic.vue'
import TabProxy from './TabProxy.vue'
import TabFingerprint from './TabFingerprint.vue'
import TabAdvanced from './TabAdvanced.vue'

const router = useRouter()
const fpfileLines = ref(null)
const previewFilter = ref('all')

const FILTER_PREFIXES = {
  region:   ['timezone:', 'language:', 'speech.'],
  webgl:    ['webgl.'],
  hardware: ['canvas:', 'hardwareConcurrency:', 'width:', 'height:', 'font_system:', 'useragent:', 'webdriver:'],
  proxy:    ['httpauth.'],
  proxyNetwork: ['user_pref("network.proxy.'],
  speech:   ['speech.'],
  webrtc:   ['webrtcPolicy:', 'local_webrtc_ipv4:', 'local_webrtc_ipv6:', 'public_webrtc_ipv4:', 'public_webrtc_ipv6:', 'webdriver:'],
}

const filteredPreview = computed(() => {
  if (!fpfileLines.value) return ''
  if (previewFilter.value === 'all') return fpfileLines.value.join('\n')
  const prefixes = FILTER_PREFIXES[previewFilter.value] || []
  return fpfileLines.value
    .filter(line => prefixes.some(p => line.startsWith(p)))
    .join('\n') || '（无匹配参数）'
})

const tabs = [
  { key: 'basic',       label: '基础设置' },
  { key: 'proxy',       label: '代理信息' },
  { key: 'fingerprint', label: '指纹配置' },
  { key: 'advanced',    label: 'WebGL 设置' },
]
const activeTab = ref('basic')

const form = ref({
  // 基础
  name: '', remark: '',
  // 代理
  proxyType: 'none', proxyHost: '', proxyPort: '', proxyUser: '', proxyPass: '',
  // WebRTC（在代理信息 Tab）
  webrtcMode: 'proxy', localIpv4: '', localIpv6: '', publicIpv4: '', publicIpv6: '',
  // 时区
  timezoneMode: 'ip', timezone: '',
  // 地理位置
  geoMode: 'ip', geoLat: '', geoLon: '', geoPermission: 'ask',
  // 语言
  languageMode: 'ip', language: '',
  // 界面语言
  uiLangMode: 'language', uiLang: '',
  // 分辨率
  resolutionMode: 'random', resolutionPreset: '', screenW: null, screenH: null,
  // 字体
  fontSystem: 'windows',
  // User-Agent / Canvas / WebGL
  userAgent: '',
  canvasSeed: null,
  webglVendor: '', webglRenderer: '', webglVersion: '', webglGlslVersion: '',
  webglUnmaskedVendor: '', webglUnmaskedRenderer: '',
  webglMaxTexture: null, webglMaxCubeMapTextureSize: null,
  webglMaxTextureImageUnits: null, webglMaxVertexAttribs: null,
  webglAliasedPointSizeMax: null, webglMaxViewportDim: null,
  // 硬件噪音
  noiseCanvas: false, noiseWebgl: false,
  noiseAudio: true, noiseMedia: true, noiseClientRects: true, noiseSpeech: true,
  // 高级
  cpuCores: null, webdriver: '0',
})

const proxyLabel = computed(() => {
  if (form.value.proxyType === 'none') return '本地直连'
  return form.value.proxyHost
    ? `${form.value.proxyType.toUpperCase()} ${form.value.proxyHost}:${form.value.proxyPort}`
    : '未配置'
})

const tzLabel = computed(() => {
  if (form.value.timezoneMode === 'ip') return '基于IP'
  if (form.value.timezoneMode === 'real') return '真实'
  return form.value.timezone || '自定义'
})

const langLabel = computed(() => {
  if (form.value.languageMode === 'ip') return '基于IP'
  return form.value.language || '自定义'
})

const resolutionLabel = computed(() => {
  if (form.value.resolutionMode === 'random') return '随机'
  if (form.value.resolutionMode === 'preset') return form.value.resolutionPreset || '基于UA'
  if (form.value.screenW && form.value.screenH) return `${form.value.screenW} × ${form.value.screenH}`
  return '自定义'
})

function buildEnv() {
  let screenW = form.value.screenW
  let screenH = form.value.screenH
  if (form.value.resolutionMode === 'preset' && form.value.resolutionPreset) {
    const [w, h] = form.value.resolutionPreset.split('x').map(Number)
    screenW = w; screenH = h
  }
  const localIpv4 = form.value.localIpv4 || (form.value.webrtcMode === 'proxy' ? form.value.proxyHost : '')
  const publicIpv4 = form.value.publicIpv4 || (form.value.webrtcMode === 'proxy' ? form.value.proxyHost : '')

  return {
    name: form.value.name,
    remark: form.value.remark,
    proxyType: form.value.proxyType,
    proxyHost: form.value.proxyHost,
    proxyPort: form.value.proxyPort,
    proxyUser: form.value.proxyUser,
    proxyPass: form.value.proxyPass,
    webrtcMode: form.value.webrtcMode,
    localIpv4,
    localIpv6:  form.value.localIpv6 || '',
    publicIpv4,
    publicIpv6: form.value.publicIpv6 || '',
    timezone: form.value.timezoneMode === 'custom' ? form.value.timezone : form.value.timezoneMode,
    language: form.value.languageMode === 'custom' ? form.value.language : form.value.languageMode,
    fontSystem: form.value.fontSystem,
    userAgent: form.value.userAgent,
    canvasSeed: form.value.canvasSeed ?? null,
    webglVendor: form.value.webglVendor,
    webglRenderer: form.value.webglRenderer,
    webglVersion: form.value.webglVersion,
    webglGlslVersion: form.value.webglGlslVersion,
    webglUnmaskedVendor: form.value.webglUnmaskedVendor,
    webglUnmaskedRenderer: form.value.webglUnmaskedRenderer,
    webglMaxTexture: form.value.webglMaxTexture ?? null,
    webglMaxCubeMapTextureSize: form.value.webglMaxCubeMapTextureSize ?? null,
    webglMaxTextureImageUnits: form.value.webglMaxTextureImageUnits ?? null,
    webglMaxVertexAttribs: form.value.webglMaxVertexAttribs ?? null,
    webglAliasedPointSizeMax: form.value.webglAliasedPointSizeMax ?? null,
    webglMaxViewportDim: form.value.webglMaxViewportDim ?? null,
    cpuCores: form.value.cpuCores ?? null,
    screenW: screenW ?? null,
    screenH: screenH ?? null,
    webdriver: form.value.webdriver,
  }
}

async function previewFpfile() {
  const env = buildEnv()
  const text = await window.ruyi.previewFpfile(env)
  const lines = text.split('\n').filter(l => l.trim())
  if (env.proxyType !== 'none' && env.proxyHost && env.proxyPort) {
    const proxyPort = Number(env.proxyPort)
    if (Number.isFinite(proxyPort)) {
      lines.push(`user_pref("network.proxy.http", "${env.proxyHost}");`)
      lines.push(`user_pref("network.proxy.http_port", ${proxyPort});`)
      lines.push(`user_pref("network.proxy.ssl", "${env.proxyHost}");`)
      lines.push(`user_pref("network.proxy.ssl_port", ${proxyPort});`)
    }
  }
  fpfileLines.value = lines
  previewFilter.value = 'all'
}

async function copyPreview() {
  const text = filteredPreview.value || ''
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
  } catch (_) {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'absolute'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
}

async function save() {
  if (!form.value.name.trim()) { activeTab.value = 'basic'; return alert('请填写环境名称') }

  const env = buildEnv()
  const result = await window.ruyi.dbCreateEnv(env)
  if (result.ok) {
    addLog(`环境已创建: ${form.value.name}`, 'ok')
    router.push('/environment')
  } else {
    alert('保存失败')
  }
}
</script>
