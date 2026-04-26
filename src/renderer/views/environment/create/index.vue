<template>
  <div class="page-card create-env-page">
    <!-- 页头 -->
    <div class="page-header">
      <div style="display:flex;align-items:center;gap:10px">
        <button class="btn btn--text" style="padding:4px 8px" @click="$router.back()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span class="page-title">新建环境</span>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn" @click="$router.back()">取消</button>
        <button class="btn btn--primary" @click="save">保存</button>
      </div>
    </div>

    <div class="form-sections">

      <!-- ① 基础信息 -->
      <section class="form-section">
        <div class="section-title">基础信息</div>
        <div class="form-grid">
          <div class="form-item form-item--full">
            <label>环境名称 <span class="required">*</span></label>
            <input v-model="form.name" type="text" placeholder="例：账号A" />
          </div>
          <div class="form-item form-item--full">
            <label>foxprint.exe 路径 <span class="required">*</span></label>
            <input v-model="form.exePath" type="text" placeholder="C:\foxprint\foxprint.exe" />
          </div>
          <div class="form-item form-item--full">
            <label>Profile 目录（--profile）</label>
            <input v-model="form.profileDir" type="text" placeholder="C:\profiles\user1" />
          </div>
          <div class="form-item form-item--full">
            <label>fpfile 路径（--fpfile，留空则自动生成）</label>
            <input v-model="form.fpfilePath" type="text" placeholder="C:\fingerprints\profile1.txt" />
          </div>
        </div>
      </section>

      <!-- ② 网络 / WebRTC -->
      <section class="form-section">
        <div class="section-title">网络 / WebRTC</div>
        <div class="form-grid">
          <div class="form-item">
            <label>代理 IP / Host</label>
            <input v-model="form.proxyHost" type="text" placeholder="127.0.0.1" />
          </div>
          <div class="form-item">
            <label>代理端口</label>
            <input v-model="form.proxyPort" type="text" placeholder="7890" />
          </div>
          <div class="form-item">
            <label>代理用户名（httpauth.username）</label>
            <input v-model="form.proxyUser" type="text" placeholder="可选" />
          </div>
          <div class="form-item">
            <label>代理密码（httpauth.password）</label>
            <input v-model="form.proxyPass" type="password" placeholder="可选" />
          </div>
          <div class="form-item">
            <label>WebRTC 本地 IPv4（local_webrtc_ipv4）</label>
            <input v-model="form.localIpv4" type="text" placeholder="192.168.1.100" />
          </div>
          <div class="form-item">
            <label>WebRTC 本地 IPv6（local_webrtc_ipv6）</label>
            <input v-model="form.localIpv6" type="text" placeholder="可选" />
          </div>
          <div class="form-item">
            <label>WebRTC 公网 IPv4（public_webrtc_ipv4）</label>
            <input v-model="form.publicIpv4" type="text" placeholder="与代理出口一致" />
          </div>
          <div class="form-item">
            <label>WebRTC 公网 IPv6（public_webrtc_ipv6）</label>
            <input v-model="form.publicIpv6" type="text" placeholder="可选" />
          </div>
        </div>
      </section>

      <!-- ③ 语言 / 地区 -->
      <section class="form-section">
        <div class="section-title">语言 / 地区</div>
        <div class="form-grid">
          <div class="form-item">
            <label>时区（timezone）</label>
            <input v-model="form.timezone" type="text" placeholder="Asia/Shanghai" />
          </div>
          <div class="form-item">
            <label>语言（language）</label>
            <input v-model="form.language" type="text" placeholder="zh-CN,zh" />
          </div>
          <div class="form-item">
            <label>系统字体集（font_system）</label>
            <select v-model="form.fontSystem">
              <option value="">默认</option>
              <option value="windows">windows</option>
              <option value="linux">linux</option>
              <option value="mac">mac</option>
            </select>
          </div>
          <div class="form-item">
            <label>User-Agent（useragent）</label>
            <input v-model="form.userAgent" type="text" placeholder="留空使用浏览器默认" />
          </div>
        </div>
      </section>

      <!-- ④ 硬件指纹 -->
      <section class="form-section">
        <div class="section-title">硬件指纹</div>
        <div class="form-grid">
          <div class="form-item">
            <label>CPU 核心数（hardwareConcurrency）</label>
            <input v-model.number="form.cpuCores" type="number" placeholder="8" min="1" max="128" />
          </div>
          <div class="form-item">
            <label>Canvas 噪声种子（canvas）</label>
            <input v-model.number="form.canvasSeed" type="number" placeholder="随机整数" />
          </div>
          <div class="form-item">
            <label>屏幕宽度（width）</label>
            <input v-model.number="form.screenW" type="number" placeholder="1920" />
          </div>
          <div class="form-item">
            <label>屏幕高度（height）</label>
            <input v-model.number="form.screenH" type="number" placeholder="1080" />
          </div>
          <div class="form-item">
            <label>WebGL Vendor（webgl.vendor）</label>
            <input v-model="form.webglVendor" type="text" placeholder="Intel Inc." />
          </div>
          <div class="form-item">
            <label>WebGL Renderer（webgl.renderer）</label>
            <input v-model="form.webglRenderer" type="text" placeholder="Intel Iris OpenGL Engine" />
          </div>
          <div class="form-item">
            <label>WebGL Unmasked Vendor（webgl.unmasked_vendor）</label>
            <input v-model="form.webglUnmaskedVendor" type="text" placeholder="Intel Inc." />
          </div>
          <div class="form-item">
            <label>WebGL Unmasked Renderer（webgl.unmasked_renderer）</label>
            <input v-model="form.webglUnmaskedRenderer" type="text" placeholder="ANGLE ..." />
          </div>
          <div class="form-item">
            <label>最大纹理尺寸（webgl.max_texture_size）</label>
            <input v-model.number="form.webglMaxTexture" type="number" placeholder="16384" />
          </div>
          <div class="form-item">
            <label>是否隐藏 WebDriver（webdriver）</label>
            <select v-model="form.webdriver">
              <option value="0">隐藏（0）</option>
              <option value="1">暴露（1）</option>
            </select>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useEnvStore } from '../../../composables/useEnvStore'
import { addLog } from '../../../composables/useLogs'

const router = useRouter()
const { add } = useEnvStore()

const form = ref({
  name: '',
  exePath: '',
  profileDir: '',
  fpfilePath: '',
  // 网络
  proxyHost: '',
  proxyPort: '',
  proxyUser: '',
  proxyPass: '',
  localIpv4: '',
  localIpv6: '',
  publicIpv4: '',
  publicIpv6: '',
  // 语言地区
  timezone: '',
  language: '',
  fontSystem: '',
  userAgent: '',
  // 硬件
  cpuCores: null,
  canvasSeed: null,
  screenW: null,
  screenH: null,
  webglVendor: '',
  webglRenderer: '',
  webglUnmaskedVendor: '',
  webglUnmaskedRenderer: '',
  webglMaxTexture: null,
  webdriver: '0',
})

function save() {
  if (!form.value.name.trim()) return alert('请填写环境名称')
  if (!form.value.exePath.trim()) return alert('请填写 foxprint.exe 路径')
  add({ ...form.value })
  addLog(`环境已创建: ${form.value.name}`, 'ok')
  router.push('/environment')
}
</script>
