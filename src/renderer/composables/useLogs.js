import { ref } from 'vue'

const logs = ref([])

export function useLogs() {
  return { logs }
}

export function addLog(msg, type = 'info') {
  const time = new Date().toLocaleTimeString()
  logs.value.push({ msg, type, time })
  if (logs.value.length > 500) logs.value.shift()
}
