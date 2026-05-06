<template>
  <div>
    <div class="form-card">
      <div class="card-collapse-header" @click="collapse = !collapse">
        <span class="card-title">WebGL 参数</span>
        <div style="display:flex;align-items:center;gap:8px">
          <button class="btn" @click.stop="autoSetWebgl">一键设置</button>
          <svg class="collapse-arrow" :class="{ open: !collapse }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>

      <div style="border-top:1px solid var(--border);margin:0 -20px"></div>

      <div v-show="!collapse">
        <div class="field-row">
          <span class="field-label">厂商信息</span>
          <div class="field-control">
            <ComboInput v-model="form.webglVendor" :options="vendorPresets" placeholder="如 Google Inc. (AMD)" />
          </div>
        </div>
        <div class="field-row">
          <span class="field-label">渲染器信息</span>
          <div class="field-control">
            <ComboInput v-model="form.webglRenderer" :options="rendererPresets" placeholder="如 ANGLE (AMD, ...)" />
          </div>
        </div>
        <div class="field-row">
          <span class="field-label">WebGL 版本</span>
          <div class="field-control">
            <ComboInput v-model="form.webglVersion" :options="versionPresets" placeholder="如 WebGL 1.0 (OpenGL ES 2.0 Chromium)" />
          </div>
        </div>
        <div class="field-row">
          <span class="field-label">GLSL 版本</span>
          <div class="field-control">
            <ComboInput v-model="form.webglGlslVersion" :options="glslPresets" placeholder="如 WebGL GLSL ES 1.0 (...)" />
          </div>
        </div>
        <div class="field-row">
          <span class="field-label">真实厂商</span>
          <div class="field-control">
            <ComboInput v-model="form.webglUnmaskedVendor" :options="unmaskedVendorPresets" placeholder="自定义字符串" />
          </div>
        </div>
        <div class="field-row">
          <span class="field-label">真实渲染器</span>
          <div class="field-control">
            <ComboInput v-model="form.webglUnmaskedRenderer" :options="unmaskedRendererPresets" placeholder="自定义字符串" />
          </div>
        </div>
        <div class="field-row">
          <span class="field-label">最大纹理尺寸</span>
          <div class="field-control">
            <div style="display:flex;align-items:center;gap:16px;flex-wrap:nowrap">
              <ComboInput v-model.number="form.webglMaxTexture" :options="['16384','8192','4096']" placeholder="如 16384" style="width:140px;flex-shrink:0" />
              <span style="font-size:13px;color:var(--accent);white-space:nowrap;flex-shrink:0">最大立方体贴图尺寸</span>
              <ComboInput v-model.number="form.webglMaxCubeMapTextureSize" :options="['16384','8192','4096']" placeholder="如 16384" style="width:140px;flex-shrink:0" />
            </div>
          </div>
        </div>
        <div class="field-row">
          <span class="field-label">最大纹理单元数</span>
          <div class="field-control">
            <div style="display:flex;align-items:center;gap:16px;flex-wrap:nowrap">
              <ComboInput v-model.number="form.webglMaxTextureImageUnits" :options="['32','16']" placeholder="如 32" style="width:140px;flex-shrink:0" />
              <span style="font-size:13px;color:var(--accent);white-space:nowrap;flex-shrink:0">最大顶点属性数</span>
              <ComboInput v-model.number="form.webglMaxVertexAttribs" :options="['16','32']" placeholder="如 16" style="width:140px;flex-shrink:0" />
            </div>
          </div>
        </div>
        <div class="field-row">
          <span class="field-label">最大点大小</span>
          <div class="field-control">
            <div style="display:flex;align-items:center;gap:16px;flex-wrap:nowrap">
              <ComboInput v-model.number="form.webglAliasedPointSizeMax" :options="['1024','2048','512']" placeholder="如 1024" style="width:140px;flex-shrink:0" />
              <span style="font-size:13px;color:var(--accent);white-space:nowrap;flex-shrink:0">最大视口尺寸</span>
              <ComboInput v-model.number="form.webglMaxViewportDim" :options="['16384','32768','8192']" placeholder="如 16384" style="width:140px;flex-shrink:0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ComboInput from '../../../components/ComboInput.vue'

const props = defineProps({ form: Object })
const collapse = ref(false)

// 预设 GPU 套装（厂商+渲染器配对）
const GPU_PRESETS = [
  {
    vendor: 'Google Inc. (AMD)',
    renderer: 'ANGLE (AMD, AMD Radeon RX 580 Series Direct3D11 vs_5_0 ps_5_0)',
    unmaskedVendor: 'Google Inc. (AMD)',
    unmaskedRenderer: 'ANGLE (AMD, AMD Radeon RX 580 Series Direct3D11 vs_5_0 ps_5_0)',
  },
  {
    vendor: 'Google Inc. (AMD)',
    renderer: 'ANGLE (AMD, AMD Radeon RX 6600 XT Direct3D11 vs_5_0 ps_5_0)',
    unmaskedVendor: 'Google Inc. (AMD)',
    unmaskedRenderer: 'ANGLE (AMD, AMD Radeon RX 6600 XT Direct3D11 vs_5_0 ps_5_0)',
  },
  {
    vendor: 'Google Inc. (NVIDIA)',
    renderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0)',
    unmaskedVendor: 'Google Inc. (NVIDIA)',
    unmaskedRenderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0)',
  },
  {
    vendor: 'Google Inc. (NVIDIA)',
    renderer: 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1080 Ti Direct3D11 vs_5_0 ps_5_0)',
    unmaskedVendor: 'Google Inc. (NVIDIA)',
    unmaskedRenderer: 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1080 Ti Direct3D11 vs_5_0 ps_5_0)',
  },
  {
    vendor: 'Google Inc. (Intel)',
    renderer: 'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0)',
    unmaskedVendor: 'Google Inc. (Intel)',
    unmaskedRenderer: 'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0)',
  },
  {
    vendor: 'Google Inc. (Intel)',
    renderer: 'ANGLE (Intel, Intel(R) Iris(R) Xe Graphics Direct3D11 vs_5_0 ps_5_0)',
    unmaskedVendor: 'Google Inc. (Intel)',
    unmaskedRenderer: 'ANGLE (Intel, Intel(R) Iris(R) Xe Graphics Direct3D11 vs_5_0 ps_5_0)',
  },
]

function autoSetWebgl() {
  const gpu = GPU_PRESETS[Math.floor(Math.random() * GPU_PRESETS.length)]
  props.form.webglVendor = gpu.vendor
  props.form.webglRenderer = gpu.renderer
  props.form.webglUnmaskedVendor = gpu.unmaskedVendor
  props.form.webglUnmaskedRenderer = gpu.unmaskedRenderer
  props.form.webglVersion = 'WebGL 1.0 (OpenGL ES 2.0 Chromium)'
  props.form.webglGlslVersion = 'WebGL GLSL ES 1.0 (OpenGL ES GLSL ES 1.0 Chromium)'
  props.form.webglMaxTexture = 16384
  props.form.webglMaxCubeMapTextureSize = 16384
  props.form.webglMaxTextureImageUnits = 32
  props.form.webglMaxVertexAttribs = 16
  props.form.webglAliasedPointSizeMax = 1024
  props.form.webglMaxViewportDim = 16384
}

const vendorPresets = [
  'Google Inc. (AMD)',
  'Google Inc. (NVIDIA)',
  'Google Inc. (Intel)',
  'Google Inc.',
  'Mozilla',
]

const rendererPresets = [
  'ANGLE (AMD, AMD Radeon RX 580 Series Direct3D11 vs_5_0 ps_5_0)',
  'ANGLE (AMD, AMD Radeon RX 6600 XT Direct3D11 vs_5_0 ps_5_0)',
  'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0)',
  'ANGLE (NVIDIA, NVIDIA GeForce GTX 1080 Ti Direct3D11 vs_5_0 ps_5_0)',
  'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0)',
  'ANGLE (Intel, Intel(R) Iris(R) Xe Graphics Direct3D11 vs_5_0 ps_5_0)',
  'ANGLE (Intel, Intel(R) HD Graphics 620 Direct3D11 vs_5_0 ps_5_0)',
]

const versionPresets = [
  'WebGL 1.0 (OpenGL ES 2.0 Chromium)',
  'WebGL 2.0 (OpenGL ES 3.0 Chromium)',
]

const glslPresets = [
  'WebGL GLSL ES 1.0 (OpenGL ES GLSL ES 1.0 Chromium)',
  'WebGL GLSL ES 3.00 (OpenGL ES GLSL ES 3.0 Chromium)',
]

const unmaskedVendorPresets = [
  'Google Inc. (AMD)',
  'Google Inc. (NVIDIA)',
  'Google Inc. (Intel)',
  'AMD',
  'NVIDIA Corporation',
  'Intel Inc.',
]

const unmaskedRendererPresets = [
  'ANGLE (AMD, AMD Radeon RX 580 Series Direct3D11 vs_5_0 ps_5_0)',
  'ANGLE (AMD, AMD Radeon RX 6600 XT Direct3D11 vs_5_0 ps_5_0)',
  'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0)',
  'ANGLE (NVIDIA, NVIDIA GeForce GTX 1080 Ti Direct3D11 vs_5_0 ps_5_0)',
  'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0)',
  'ANGLE (Intel, Intel(R) Iris(R) Xe Graphics Direct3D11 vs_5_0 ps_5_0)',
]
</script>
