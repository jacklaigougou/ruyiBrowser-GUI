<template>
  <div>
    <h1>浏览器操作</h1>
    <div class="toolbar">
      <label>当前会话
        <select v-model="sessionId" @click="refreshSessions">
          <option value="">-- 选择会话 --</option>
          <option v-for="s in sessions" :key="s.sessionId" :value="s.sessionId">
            {{ s.sessionId.slice(0, 8) }}… {{ s.title || s.url || '' }}
          </option>
        </select>
      </label>
      <button class="btn" @click="refreshSessions">刷新会话</button>
    </div>

    <div class="ops-grid">
      <!-- 导航 -->
      <div class="op-card">
        <h3>导航</h3>
        <input v-model="nav.url" type="text" placeholder="https://example.com" @keyup.enter="navigate" />
        <button class="btn btn--primary" @click="navigate">前往</button>
        <div class="op-result" :class="nav.status">{{ nav.result }}</div>
      </div>

      <!-- 查找元素 -->
      <div class="op-card">
        <h3>查找元素</h3>
        <input v-model="find.selector" type="text" placeholder="CSS选择器 / XPath" @keyup.enter="findElement" />
        <button class="btn" @click="findElement">查找</button>
        <div class="op-result" :class="find.status">{{ find.result }}</div>
      </div>

      <!-- 点击 -->
      <div class="op-card">
        <h3>点击元素</h3>
        <input v-model="click.selector" type="text" placeholder="CSS选择器 / XPath" @keyup.enter="clickEl" />
        <button class="btn" @click="clickEl">点击</button>
        <div class="op-result" :class="click.status">{{ click.result }}</div>
      </div>

      <!-- 输入 -->
      <div class="op-card">
        <h3>输入文字</h3>
        <input v-model="inp.selector" type="text" placeholder="CSS选择器" />
        <input v-model="inp.text" type="text" placeholder="输入内容" @keyup.enter="inputText" />
        <button class="btn" @click="inputText">输入</button>
        <div class="op-result" :class="inp.status">{{ inp.result }}</div>
      </div>

      <!-- 截图 -->
      <div class="op-card op-card--wide">
        <h3>截图</h3>
        <button class="btn" @click="screenshot">截图</button>
        <div class="screenshot-preview">
          <img v-if="screenshotSrc" :src="screenshotSrc" />
        </div>
      </div>

      <!-- 执行JS -->
      <div class="op-card op-card--wide">
        <h3>执行JavaScript</h3>
        <textarea v-model="script.code" rows="4" placeholder="document.title"></textarea>
        <button class="btn" @click="runScript">执行</button>
        <div class="op-result" :class="script.status">{{ script.result }}</div>
      </div>

      <!-- Cookie -->
      <div class="op-card op-card--wide">
        <h3>Cookie管理</h3>
        <button class="btn" @click="getCookies">获取Cookie</button>
        <div class="op-result" :class="cookie.status">{{ cookie.result }}</div>
      </div>

      <!-- 页面信息 -->
      <div class="op-card">
        <h3>页面信息</h3>
        <button class="btn" @click="pageInfo">获取信息</button>
        <div class="op-result" :class="info.status">{{ info.result }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { addLog } from '../composables/useLogs'

const sessionId = ref('')
const sessions = ref([])
const screenshotSrc = ref('')

const nav    = ref({ url: '', result: '', status: '' })
const find   = ref({ selector: '', result: '', status: '' })
const click  = ref({ selector: '', result: '', status: '' })
const inp    = ref({ selector: '', text: '', result: '', status: '' })
const script = ref({ code: '', result: '', status: '' })
const cookie = ref({ result: '', status: '' })
const info   = ref({ result: '', status: '' })

function applyResult(state, res, label) {
  if (res.ok) {
    state.result = JSON.stringify(res.data ?? 'OK', null, 2)
    state.status = 'ok'
    addLog(label + ' 成功', 'ok')
  } else {
    state.result = res.error
    state.status = 'err'
    addLog(label + ' 失败: ' + res.error, 'err')
  }
}

function guard() {
  if (!sessionId.value) { alert('请先选择会话'); return false }
  return true
}

async function refreshSessions() {
  const res = await window.ruyi.listSessions()
  if (res.ok) sessions.value = res.data?.sessions ?? []
}

async function navigate() {
  if (!guard() || !nav.value.url) return
  const res = await window.ruyi.navigate(sessionId.value, nav.value.url)
  applyResult(nav.value, res, '导航')
}

async function findElement() {
  if (!guard() || !find.value.selector) return
  const res = await window.ruyi.findElement(sessionId.value, find.value.selector)
  applyResult(find.value, res, '查找元素')
}

async function clickEl() {
  if (!guard() || !click.value.selector) return
  const res = await window.ruyi.click(sessionId.value, click.value.selector)
  applyResult(click.value, res, '点击')
}

async function inputText() {
  if (!guard() || !inp.value.selector) return
  const res = await window.ruyi.input(sessionId.value, inp.value.selector, inp.value.text)
  applyResult(inp.value, res, '输入')
}

async function screenshot() {
  if (!guard()) return
  const res = await window.ruyi.screenshot(sessionId.value)
  if (res.ok && res.data?.image) {
    screenshotSrc.value = `data:image/png;base64,${res.data.image}`
    addLog('截图成功', 'ok')
  } else {
    addLog('截图失败: ' + res.error, 'err')
  }
}

async function runScript() {
  if (!guard() || !script.value.code) return
  const res = await window.ruyi.executeScript(sessionId.value, script.value.code)
  applyResult(script.value, res, 'JS执行')
}

async function getCookies() {
  if (!guard()) return
  const res = await window.ruyi.getCookies(sessionId.value)
  applyResult(cookie.value, res, 'Cookie获取')
}

async function pageInfo() {
  if (!guard()) return
  const res = await window.ruyi.pageInfo(sessionId.value)
  applyResult(info.value, res, '页面信息')
}

onMounted(refreshSessions)
</script>
