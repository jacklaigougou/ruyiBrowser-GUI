import { ref } from 'vue'

// 模块单例，整个应用共享同一份状态
const online = ref(false)
const sessionCount = ref('—')

export function useHealthStore() {
  return { online, sessionCount }
}

export async function refreshHealth() {
  const res = await window.ruyi.health()
  online.value = res.ok
  if (res.ok) sessionCount.value = res.data?.sessions ?? 0
}
