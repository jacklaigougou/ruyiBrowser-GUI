<template>
  <div>
    <!-- 时区 / 地理位置 / 语言 / 界面语言 -->
    <div class="form-card">
      <div class="field-row">
        <span class="field-label">时区</span>
        <div class="field-control">
          <div class="tab-group">
            <button v-for="opt in tzOpts" :key="opt.value" class="tab-opt"
              :class="{ active: form.timezoneMode === opt.value }"
              @click="form.timezoneMode = opt.value">{{ opt.label }}</button>
          </div>
          <input v-if="form.timezoneMode === 'custom'" v-model="form.timezone"
            type="text" class="field-input" style="margin-top:8px" placeholder="Asia/Shanghai" />
        </div>
      </div>

      <div class="field-row">
        <span class="field-label">地理位置</span>
        <div class="field-control">
          <div class="tab-group">
            <button v-for="opt in geoOpts" :key="opt.value" class="tab-opt"
              :class="{ active: form.geoMode === opt.value }"
              @click="form.geoMode = opt.value">{{ opt.label }}</button>
          </div>
          <template v-if="form.geoMode === 'custom'">
            <div style="display:flex;gap:8px;margin-top:8px">
              <input v-model="form.geoLat" type="text" class="field-input" placeholder="纬度 31.2304" />
              <input v-model="form.geoLon" type="text" class="field-input" placeholder="经度 121.4737" />
            </div>
          </template>
          <div v-if="form.geoMode !== 'disabled'" style="display:flex;gap:16px;margin-top:8px">
            <label class="toggle-wrap">
              <span class="toggle">
                <input type="checkbox" :checked="form.geoPermission === 'ask'" @change="form.geoPermission = $event.target.checked ? 'ask' : 'allow'" />
                <span class="toggle-slider"></span>
              </span>
              每次询问
            </label>
            <label class="toggle-wrap">
              <span class="toggle">
                <input type="checkbox" :checked="form.geoPermission === 'allow'" @change="form.geoPermission = $event.target.checked ? 'allow' : 'ask'" />
                <span class="toggle-slider"></span>
              </span>
              始终允许
            </label>
          </div>
        </div>
      </div>

      <div class="field-row">
        <span class="field-label">语言</span>
        <div class="field-control">
          <div class="tab-group">
            <button v-for="opt in langOpts" :key="opt.value" class="tab-opt"
              :class="{ active: form.languageMode === opt.value }"
              @click="form.languageMode = opt.value">{{ opt.label }}</button>
          </div>
          <input v-if="form.languageMode === 'custom'" v-model="form.language"
            type="text" class="field-input" style="margin-top:8px" placeholder="zh-CN,zh" />
        </div>
      </div>

      <div class="field-row">
        <span class="field-label">界面语言</span>
        <div class="field-control">
          <div class="tab-group">
            <button v-for="opt in uiLangOpts" :key="opt.value" class="tab-opt"
              :class="{ active: form.uiLangMode === opt.value }"
              @click="form.uiLangMode = opt.value">{{ opt.label }}</button>
          </div>
          <input v-if="form.uiLangMode === 'custom'" v-model="form.uiLang"
            type="text" class="field-input" style="margin-top:8px" placeholder="zh-CN" />
        </div>
      </div>

      <div class="field-row">
        <span class="field-label">分辨率</span>
        <div class="field-control">
          <div class="tab-group">
            <button v-for="opt in resolutionModeOpts" :key="opt.value" class="tab-opt"
              :class="{ active: form.resolutionMode === opt.value }"
              @click="form.resolutionMode = opt.value">{{ opt.label }}</button>
          </div>
          <template v-if="form.resolutionMode === 'preset'">
            <select v-model="form.resolutionPreset" class="field-input" style="margin-top:8px">
              <option value="">基于 User-Agent</option>
              <option value="1920x1080">1920 × 1080</option>
              <option value="1440x900">1440 × 900</option>
              <option value="1366x768">1366 × 768</option>
              <option value="2560x1440">2560 × 1440</option>
            </select>
          </template>
          <template v-if="form.resolutionMode === 'custom'">
            <div style="display:flex;gap:8px;margin-top:8px">
              <input v-model.number="form.screenW" type="number" class="field-input" placeholder="宽 1920" />
              <span style="line-height:34px;color:var(--text-muted)">×</span>
              <input v-model.number="form.screenH" type="number" class="field-input" placeholder="高 1080" />
            </div>
          </template>
        </div>
      </div>

      <div class="field-row">
        <span class="field-label">字体</span>
        <div class="field-control">
          <div class="tab-group">
            <button class="tab-opt" :class="{ active: form.fontMode === 'default' }" @click="form.fontMode = 'default'">默认</button>
            <button class="tab-opt" :class="{ active: form.fontMode === 'custom' }" @click="form.fontMode = 'custom'">自定义</button>
          </div>
          <select v-if="form.fontMode === 'custom'" v-model="form.fontSystem" class="field-input" style="margin-top:8px">
            <option value="windows">Windows</option>
            <option value="linux">Linux</option>
            <option value="mac">Mac</option>
          </select>
        </div>
      </div>
    </div>

    <!-- User-Agent / Canvas / WebGL -->
    <div class="form-card">
      <div class="field-row">
        <span class="field-label">User-Agent</span>
        <div class="field-control">
          <input v-model="form.userAgent" type="text" class="field-input" placeholder="留空使用浏览器默认" />
        </div>
      </div>
      <div class="field-row">
        <span class="field-label">Canvas 种子</span>
        <div class="field-control">
          <input v-model.number="form.canvasSeed" type="number" class="field-input" placeholder="随机整数" />
        </div>
      </div>
      <div class="field-row">
        <span class="field-label">WebGL Vendor</span>
        <div class="field-control">
          <input v-model="form.webglVendor" type="text" class="field-input" placeholder="Intel Inc." />
        </div>
      </div>
      <div class="field-row">
        <span class="field-label">WebGL Renderer</span>
        <div class="field-control">
          <input v-model="form.webglRenderer" type="text" class="field-input" placeholder="Intel Iris OpenGL Engine" />
        </div>
      </div>
      <div class="field-row">
        <span class="field-label">Unmasked Vendor</span>
        <div class="field-control">
          <input v-model="form.webglUnmaskedVendor" type="text" class="field-input" placeholder="Intel Inc." />
        </div>
      </div>
      <div class="field-row">
        <span class="field-label">Unmasked Renderer</span>
        <div class="field-control">
          <input v-model="form.webglUnmaskedRenderer" type="text" class="field-input" placeholder="ANGLE ..." />
        </div>
      </div>
      <div class="field-row">
        <span class="field-label">最大纹理尺寸</span>
        <div class="field-control">
          <input v-model.number="form.webglMaxTexture" type="number" class="field-input" placeholder="16384" />
        </div>
      </div>
    </div>

    <!-- 硬件噪音 -->
    <div class="form-card">
      <div class="field-row">
        <span class="field-label">硬件噪音</span>
        <div class="field-control">
          <div class="noise-row">
            <label class="toggle-wrap">
              <span class="toggle"><input type="checkbox" v-model="form.noiseCanvas" /><span class="toggle-slider"></span></span>
              Canvas
            </label>
            <label class="toggle-wrap">
              <span class="toggle"><input type="checkbox" v-model="form.noiseWebgl" /><span class="toggle-slider"></span></span>
              WebGL图像
            </label>
            <label class="toggle-wrap">
              <span class="toggle"><input type="checkbox" v-model="form.noiseAudio" /><span class="toggle-slider"></span></span>
              AudioContext
            </label>
            <label class="toggle-wrap">
              <span class="toggle"><input type="checkbox" v-model="form.noiseMedia" /><span class="toggle-slider"></span></span>
              媒体设备
            </label>
            <label class="toggle-wrap">
              <span class="toggle"><input type="checkbox" v-model="form.noiseClientRects" /><span class="toggle-slider"></span></span>
              ClientRects
            </label>
            <label class="toggle-wrap">
              <span class="toggle"><input type="checkbox" v-model="form.noiseSpeech" /><span class="toggle-slider"></span></span>
              SpeechVoices
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ form: Object })

const tzOpts = [
  { value: 'ip',     label: '基于 IP' },
  { value: 'real',   label: '真实' },
  { value: 'custom', label: '自定义' },
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

const uiLangOpts = [
  { value: 'language', label: '基于语言' },
  { value: 'real',     label: '真实' },
  { value: 'custom',   label: '自定义' },
]

const resolutionModeOpts = [
  { value: 'random', label: '随机' },
  { value: 'preset', label: '预定义' },
  { value: 'custom', label: '自定义' },
]
</script>
