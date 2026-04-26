<template>
  <div>
    <!-- 时区 / 地理位置 / 语言 / 语音 -->
    <div class="form-card">
      <div class="card-collapse-header" @click="collapseGeo = !collapseGeo">
        <span class="card-title">地区与语言</span>
        <div style="display:flex;align-items:center;gap:8px">
          <button class="btn" :disabled="querying" @click.stop="queryIpInfo">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            {{ querying ? '查询中…' : '根据IP设置' }}
          </button>
          <span v-if="queryError" style="font-size:12px;color:var(--danger)">{{ queryError }}</span>
          <svg class="collapse-arrow" :class="{ open: !collapseGeo }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>

      <div style="border-top:1px solid var(--border);margin:0 -20px"></div>

      <div v-show="!collapseGeo">
      <div class="field-row">
        <span class="field-label">时区</span>
        <div class="field-control">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:nowrap">
            <div class="tab-group" style="flex:0 0 230px;flex-wrap:nowrap">
              <button v-for="opt in tzOpts" :key="opt.value" class="tab-opt"
                :class="{ active: form.timezoneMode === opt.value }"
                @click="form.timezoneMode = opt.value">{{ opt.label }}</button>
            </div>
            <ComboInput v-if="form.timezoneMode === 'custom'" v-model="form.timezone"
              :options="tzPresets" placeholder="Asia/Shanghai" style="flex:1;margin-top:0" />
          </div>
        </div>
      </div>

      <div class="field-row">
        <span class="field-label">地理位置</span>
        <div class="field-control">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:nowrap">
            <div class="tab-group" style="flex:0 0 230px;flex-wrap:nowrap">
              <button v-for="opt in geoOpts" :key="opt.value" class="tab-opt"
                :class="{ active: form.geoMode === opt.value }"
                @click="form.geoMode = opt.value">{{ opt.label }}</button>
            </div>
            <template v-if="form.geoMode === 'custom'">
              <input v-model="form.geoLat" type="text" class="field-input" placeholder="纬度 31.2304" />
              <input v-model="form.geoLon" type="text" class="field-input" placeholder="经度 121.4737" />
            </template>
          </div>
        </div>
      </div>

      <div class="field-row">
        <span class="field-label">语言</span>
        <div class="field-control">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:nowrap">
            <div class="tab-group" style="flex:0 0 230px;flex-wrap:nowrap">
              <button v-for="opt in langOpts" :key="opt.value" class="tab-opt"
                :class="{ active: form.languageMode === opt.value }"
                @click="form.languageMode = opt.value">{{ opt.label }}</button>
            </div>
            <ComboInput v-if="form.languageMode === 'custom'" v-model="form.language"
              :options="langPresets" placeholder="zh-CN,zh" style="flex:1;margin-top:0" />
          </div>
        </div>
      </div>

      <div class="field-row">
        <span class="field-label">语音</span>
        <div class="field-control">
          <span style="font-size:13px;color:var(--text-muted);padding-top:8px;display:block">
            {{ speechPreview || '—' }}
          </span>
        </div>
      </div>

      </div><!-- /v-show -->
    </div>

    <!-- 系统字体集 / UA / CPU / 屏幕 / Canvas -->
    <div class="form-card">
      <div class="card-collapse-header" @click="collapseHw = !collapseHw">
        <span class="card-title">硬件与指纹</span>
        <div style="display:flex;align-items:center;gap:8px">
          <button class="btn" @click.stop="autoSetHw">一键设置</button>
          <svg class="collapse-arrow" :class="{ open: !collapseHw }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>

      <div style="border-top:1px solid var(--border);margin:0 -20px"></div>

      <div v-show="!collapseHw">
      <div class="field-row">
        <span class="field-label">系统字体</span>
        <div class="field-control">
          <div style="display:flex;align-items:center;gap:16px;flex-wrap:nowrap">
            <select v-model="form.fontSystem" class="field-input" style="width:auto;min-width:105px">
              <option value="windows">Windows</option>
              <option value="linux">Linux</option>
              <option value="mac">Mac</option>
            </select>
            <span style="font-size:13px;color:var(--accent);white-space:nowrap;flex-shrink:0">CPU 逻辑核心数</span>
            <ComboInput v-model.number="form.cpuCores" :options="cpuPresets" placeholder="留空使用默认" style="flex:1" />
            <span style="font-size:13px;color:var(--accent);white-space:nowrap;flex-shrink:0">Canvas 噪声种子</span>
            <input v-model.number="form.canvasSeed" type="number" class="field-input" placeholder="留空默认" style="flex:1" />
          </div>
        </div>
      </div>
      <div class="field-row">
        <span class="field-label">屏幕宽高</span>
        <div class="field-control">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:nowrap">
            <div style="display:flex;align-items:center;gap:8px;flex:0 0 360px;max-width:360px;min-width:0">
              <ComboInput v-model.number="form.screenW" :options="screenWPresets" placeholder="宽 1920" style="flex:1;min-width:0" />
              <span style="font-size:13px;color:var(--text-muted);flex-shrink:0">×</span>
              <ComboInput v-model.number="form.screenH" :options="screenHPresets" placeholder="高 1080" style="flex:1;min-width:0" />
            </div>
            <span style="font-size:13px;color:var(--accent);white-space:nowrap;flex-shrink:0;margin-left:8px">WebDriver</span>
            <div class="tab-group" style="flex-shrink:0">
              <button class="tab-opt" :class="{ active: form.webdriver === '0' }" @click="form.webdriver = '0'">隐藏</button>
              <button class="tab-opt" :class="{ active: form.webdriver === '1' }" @click="form.webdriver = '1'">暴露</button>
            </div>
          </div>
        </div>
      </div>
      <div class="field-row">
        <span class="field-label">User-Agent</span>
        <div class="field-control">
          <ComboInput v-model="form.userAgent" :options="uaPresets" placeholder="留空使用浏览器默认" />
        </div>
      </div>
      </div><!-- /v-show -->
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ComboInput from '../../../components/ComboInput.vue'

const props = defineProps({ form: Object })

const SPEECH_DEFAULT = {
  'zh-CN': 'Microsoft Huihui Desktop - Chinese (Simplified) · zh-CN',
  'zh-TW': 'Microsoft Hanhan Desktop - Chinese (Traditional, Taiwan) · zh-TW',
  'zh-HK': 'Microsoft Tracy Desktop - Chinese (Traditional, Hong Kong S.A.R.) · zh-HK',
  'en-US': 'Microsoft David Desktop - English (United States) · en-US',
  'en-GB': 'Microsoft Hazel Desktop - English (Great Britain) · en-GB',
  'ja-JP': 'Microsoft Haruka Desktop - Japanese · ja-JP',
  'ko-KR': 'Microsoft Heami Desktop - Korean · ko-KR',
  'fr-FR': 'Microsoft Hortense Desktop - French · fr-FR',
  'de-DE': 'Microsoft Hedda Desktop - German · de-DE',
  'es-ES': 'Microsoft Helena Desktop - Spanish (Spain) · es-ES',
  'es-MX': 'Microsoft Sabina Desktop - Spanish (Mexico) · es-MX',
  'pt-BR': 'Microsoft Maria Desktop - Portuguese (Brazil) · pt-BR',
  'pt-PT': 'Microsoft Helia Desktop - Portuguese (Portugal) · pt-PT',
  'ru-RU': 'Microsoft Irina Desktop - Russian · ru-RU',
  'ar-SA': 'Microsoft Naayf Desktop - Arabic (Saudi Arabia) · ar-SA',
  'th-TH': 'Microsoft Pattara Desktop - Thai · th-TH',
  'vi-VN': 'Microsoft An Desktop - Vietnamese (Vietnam) · vi-VN',
  'id-ID': 'Microsoft Andika Desktop - Indonesian · id-ID',
  'it-IT': 'Microsoft Elsa Desktop - Italian (Italy) · it-IT',
  'nl-NL': 'Microsoft Frank Desktop - Dutch (Netherlands) · nl-NL',
  'pl-PL': 'Microsoft Paulina Desktop - Polish · pl-PL',
  'tr-TR': 'Microsoft Tolga Desktop - Turkish · tr-TR',
}

const speechPreview = computed(() => {
  const lang = (props.form.language || '').split(',')[0].trim()
  return SPEECH_DEFAULT[lang] || null
})

const collapseGeo = ref(false)
const collapseHw = ref(false)

async function autoSetHw() {
  const pick = arr => arr[Math.floor(Math.random() * arr.length)]
  props.form.cpuCores = Number(pick(cpuPresets))
  props.form.canvasSeed = Math.floor(Math.random() * 101)
  props.form.userAgent = pick(uaPresets)
  const { width, height } = await window.ruyi.screenSize()
  props.form.screenW = width
  props.form.screenH = height
}
const querying = ref(false)
const queryError = ref('')

async function queryIpInfo() {
  querying.value = true
  queryError.value = ''
  try {
    const result = await window.ruyi.queryIp()
    if (result.timezone) {
      props.form.timezoneMode = 'custom'
      props.form.timezone = result.timezone
    }
    if (result.countryCode) {
      const langMap = { CN: 'zh-CN', US: 'en-US', JP: 'ja-JP', KR: 'ko-KR', TW: 'zh-TW', HK: 'zh-HK' }
      const lang = langMap[result.countryCode] || result.countryCode.toLowerCase()
      props.form.languageMode = 'custom'
      props.form.language = lang
    }
    if (result.lat && result.lon) {
      props.form.geoMode = 'custom'
      props.form.geoLat = String(result.lat)
      props.form.geoLon = String(result.lon)
    }
  } catch (e) {
    queryError.value = e.message || '查询失败'
  } finally {
    querying.value = false
  }
}

const tzOpts = [
  { value: 'ip',     label: '基于 IP' },
  { value: 'real',   label: '真实' },
  { value: 'custom', label: '自定义' },
]

const tzPresets = [
  'Asia/Shanghai', 'Asia/Tokyo', 'Asia/Seoul', 'Asia/Singapore',
  'Asia/Hong_Kong', 'Asia/Taipei', 'Europe/London', 'Europe/Paris',
  'Europe/Berlin', 'America/New_York', 'America/Los_Angeles',
  'America/Chicago', 'Australia/Sydney', 'Pacific/Auckland',
]

const geoOpts = [
  { value: 'ip',       label: '基于 IP' },
  { value: 'custom',   label: '自定义' },
  { value: 'disabled', label: '禁止' },
]

const langOpts = [
  { value: 'ip',     label: '基于 IP' },
  { value: 'custom', label: '自定义' },
]

const langPresets = [
  { value: 'zh-CN,zh', label: 'zh-CN,zh（中文简体）' },
  { value: 'zh-TW,zh', label: 'zh-TW,zh（中文繁体）' },
  { value: 'zh-HK,zh', label: 'zh-HK,zh（中文香港）' },
  { value: 'en-US,en', label: 'en-US,en（英语-美国）' },
  { value: 'en-GB,en', label: 'en-GB,en（英语-英国）' },
  { value: 'ja-JP,ja', label: 'ja-JP,ja（日语）' },
  { value: 'ko-KR,ko', label: 'ko-KR,ko（韩语）' },
  { value: 'fr-FR,fr', label: 'fr-FR,fr（法语）' },
  { value: 'de-DE,de', label: 'de-DE,de（德语）' },
  { value: 'es-ES,es', label: 'es-ES,es（西班牙语）' },
  { value: 'pt-BR,pt', label: 'pt-BR,pt（葡萄牙语-巴西）' },
  { value: 'ru-RU,ru', label: 'ru-RU,ru（俄语）' },
]

const resolutionModeOpts = [
  { value: 'random', label: '随机' },
  { value: 'preset', label: '预定义' },
  { value: 'custom', label: '自定义' },
]

const uaPresets = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.4; rv:124.0) Gecko/20100101 Firefox/124.0',
  'Mozilla/5.0 (X11; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0',
]

const cpuPresets = ['2', '4', '6', '8', '12', '16', '32']

const screenWPresets = ['1280', '1366', '1440', '1600', '1920', '2560', '3840']
const screenHPresets = ['720', '768', '900', '1024', '1080', '1440', '2160']
</script>
