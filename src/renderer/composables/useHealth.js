import { ref, onMounted, onUnmounted } from 'vue'

const online = ref(false)
const sessionCount = ref('—')

async function checkHealth() {
  const res = await window.ruyi.health()
  online.value = res.ok
  if (res.ok) sessionCount.value = res.data?.sessions ?? 0
}

export function useHealth() {
  let timer
  onMounted(() => {
    checkHealth()
    timer = setInterval(checkHealth, 5000)
  })
  onUnmounted(() => clearInterval(timer))
  return { online, sessionCount, checkHealth }
}
