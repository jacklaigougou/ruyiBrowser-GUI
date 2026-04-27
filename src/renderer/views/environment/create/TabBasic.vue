<template>
  <div>
    <!-- 安装说明弹窗 -->
    <div v-if="showGuide" class="modal" @click.self="showGuide = false">
      <div class="modal-box" style="width:420px">
        <h2 style="margin:0 0 16px">浏览器安装说明</h2>
        <ol style="padding-left:20px;line-height:2;font-size:14px;color:var(--text)">
          <li>🌐 浏览器需要从 GitHub 下载，请确保网络可以访问 GitHub（需科学上网）。下载完成后请<strong>手动运行安装包</strong>完成安装。</li>
          <li>📁 安装时请使用<strong>默认路径</strong>，不要自定义安装目录，否则程序无法自动找到浏览器。</li>
          <li>🗑️ 如果下载安装后仍无法启动，请先<strong>卸载并删除</strong>本机已有的 Firefox / foxprint 浏览器，文件路径冲突会导致识别失败。</li>
        </ol>
        <div class="modal-actions">
          <button class="btn btn--primary" @click="showGuide = false">我知道了</button>
        </div>
      </div>
    </div>

    <div class="form-card">
      <div class="field-row">
        <span class="field-label">名称 <span style="color:var(--danger)">*</span></span>
        <div class="field-control">
          <input v-model="form.name" type="text" class="field-input" placeholder="请填写环境名称" maxlength="100" />
        </div>
      </div>

      <div class="field-row">
        <span class="field-label">浏览器</span>
        <div class="field-control">
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
            <div class="foxprint-status" :class="foxprintExists ? 'foxprint-ok' : 'foxprint-warn'">
              <svg v-if="foxprintExists" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{{ foxprintExists ? 'foxprint.exe 已就绪' : '未检测到 foxprint.exe，请下载' }}</span>
            </div>
            <button v-if="!downloading" class="btn" :class="foxprintExists ? '' : 'btn--primary'" style="flex-shrink:0" @click="downloadFoxprint">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              {{ foxprintExists ? '重新下载最新版本' : '下载最新版本' }}
            </button>
            <button v-if="!downloading" class="btn" style="flex-shrink:0" @click="openFolder">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              打开文件夹
            </button>
            <button v-if="!downloading" class="btn" style="flex-shrink:0" @click="showGuide = true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              说明
            </button>
          </div>
          <div v-if="downloading" class="download-progress" style="margin-top:8px">
            <div class="download-bar">
              <div class="download-bar-fill" :style="{ width: downloadProgress + '%' }"></div>
            </div>
            <span class="download-pct">{{ downloadProgress }}%</span>
          </div>
        </div>
      </div>

      <div class="field-row">
        <span class="field-label">备注</span>
        <div class="field-control">
          <textarea v-model="form.remark" class="field-input field-textarea" placeholder="请输入备注" maxlength="1500" rows="3"></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { addLog } from '../../../composables/useLogs'

const props = defineProps({ form: Object })

const foxprintExists = ref(false)
const downloading = ref(false)
const downloadProgress = ref(0)
const showGuide = ref(false)

async function checkFoxprint() {
  foxprintExists.value = !!(await window.ruyi.foxprintPath())
}

function openFolder() {
  window.ruyi.openFoxprintFolder()
}

async function downloadFoxprint() {
  downloading.value = true
  downloadProgress.value = 0
  window.ruyi.onDownloadProgress(({ progress }) => {
    downloadProgress.value = progress
  })
  try {
    await window.ruyi.downloadFoxprint()
    foxprintExists.value = true
    addLog('foxprint.exe 下载完成', 'ok')
  } catch (e) {
    addLog(`下载失败: ${e.message}`, 'err')
    alert(`下载失败: ${e.message}`)
  } finally {
    window.ruyi.offDownloadProgress()
    downloading.value = false
  }
}

onMounted(checkFoxprint)
onUnmounted(() => window.ruyi.offDownloadProgress())
</script>
