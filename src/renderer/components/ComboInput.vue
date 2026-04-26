<template>
  <div class="combo-wrap" ref="wrapRef">
    <div class="combo-input-row">
      <input
        ref="inputRef"
        v-model="inputVal"
        type="text"
        class="field-input combo-input"
        :placeholder="placeholder"
        @focus="onFocus"
        @input="onInput"
      />
      <button class="combo-arrow" tabindex="-1" @click.stop="toggle">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
    </div>
    <ul v-if="open && filtered.length" class="combo-dropdown">
      <li v-for="item in filtered" :key="item.value" @click.stop="select(item)">{{ item.label }}</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: String,
  options: { type: Array, default: () => [] },
  placeholder: String,
})
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const wrapRef = ref(null)
const inputRef = ref(null)
const inputVal = ref(props.modelValue || '')

watch(() => props.modelValue, v => { inputVal.value = v || '' })
watch(inputVal, v => emit('update:modelValue', v))

const normalizedOptions = computed(() => {
  if (!Array.isArray(props.options)) return []
  return props.options
    .map(item => {
      if (item && typeof item === 'object') {
        const value = String(item.value ?? '').trim()
        const label = String(item.label ?? value).trim()
        if (!value) return null
        return { value, label, searchText: `${value} ${label}`.toLowerCase() }
      }
      const value = String(item ?? '').trim()
      if (!value) return null
      return { value, label: value, searchText: value.toLowerCase() }
    })
    .filter(Boolean)
})

const filtered = computed(() => {
  const q = inputVal.value?.trim().toLowerCase() || ''
  if (!q) return normalizedOptions.value
  const exactMatched = normalizedOptions.value.some(item => item.value.toLowerCase() === q)
  if (exactMatched) return normalizedOptions.value
  const matched = normalizedOptions.value.filter(item => item.searchText.includes(q))
  // 回填数据可能不在预设中，兜底显示全部供用户选择
  return matched.length ? matched : normalizedOptions.value
})

function onFocus() {
  open.value = true
}

function onInput() {
  open.value = true
}

function select(item) {
  inputVal.value = item.value
  emit('update:modelValue', item.value)
  open.value = false
}

function toggle() {
  open.value = !open.value
  if (open.value) inputRef.value?.focus()
}

function onClickOutside(e) {
  if (wrapRef.value && !wrapRef.value.contains(e.target)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside, true))
onUnmounted(() => document.removeEventListener('click', onClickOutside, true))
</script>
