<template>
  <div class="op-card op-card--wide">
    <h3>元素操作</h3>
    <div style="display:flex;gap:8px;align-items:flex-end">
      <label style="flex:1">选择器
        <input v-model="selector" type="text" placeholder="CSS选择器 / XPath" />
      </label>
      <button class="btn" @click="find">查找</button>
      <button class="btn" @click="click">点击</button>
    </div>
    <div style="display:flex;gap:8px;align-items:flex-end">
      <label style="flex:1">输入内容
        <input v-model="inputText" type="text" placeholder="输入文字后点击输入" @keyup.enter="input" />
      </label>
      <button class="btn" @click="input">输入</button>
    </div>
    <div class="op-result" :class="status">{{ result }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useOpResult } from '../../composables/useOpResult'

const props = defineProps({ sessionId: String })
const selector = ref('')
const inputText = ref('')
const { result, status, apply } = useOpResult()

function guard() {
  if (!props.sessionId) { alert('请先选择会话'); return false }
  return true
}

async function find() {
  if (!guard() || !selector.value) return
  apply(await window.ruyi.findElement(props.sessionId, selector.value), '查找元素')
}

async function click() {
  if (!guard() || !selector.value) return
  apply(await window.ruyi.click(props.sessionId, selector.value), '点击')
}

async function input() {
  if (!guard() || !selector.value) return
  apply(await window.ruyi.input(props.sessionId, selector.value, inputText.value), '输入')
}
</script>
