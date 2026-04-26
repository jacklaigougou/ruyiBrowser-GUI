import { ref } from 'vue'

const envList = ref([])

export function useEnvStore() {
  function add(env) {
    envList.value.unshift({ ...env, id: Date.now(), createdAt: new Date().toLocaleDateString('zh-CN') })
  }

  function remove(id) {
    const idx = envList.value.findIndex(e => e.id === id)
    if (idx !== -1) envList.value.splice(idx, 1)
  }

  function get(id) {
    return envList.value.find(e => e.id === id)
  }

  return { envList, add, remove, get }
}
