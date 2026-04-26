import { ref } from 'vue'
import { addLog } from './useLogs'

export function useOpResult() {
  const result = ref('')
  const status = ref('')

  function apply(res, label) {
    if (res.ok) {
      result.value = JSON.stringify(res.data ?? 'OK', null, 2)
      status.value = 'ok'
      addLog(`${label} 成功`, 'ok')
    } else {
      result.value = res.error
      status.value = 'err'
      addLog(`${label} 失败: ${res.error}`, 'err')
    }
  }

  return { result, status, apply }
}
