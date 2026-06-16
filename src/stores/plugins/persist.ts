import type { PiniaPluginContext } from 'pinia'

// 不需要持久化的 store 列表
const EXCLUDED_STORES = ['analysis']

// 持久化插件 - 将 store 数据保存到 localStorage
export const persistPlugin = ({ store }: PiniaPluginContext) => {
  // 排除不需要持久化的 store
  if (EXCLUDED_STORES.includes(store.$id)) {
    return
  }

  // 从 localStorage 恢复数据
  const saved = localStorage.getItem(`pinia-${store.$id}`)
  if (saved) {
    try {
      store.$patch(JSON.parse(saved))
    } catch (e) {
      console.error(`Failed to restore ${store.$id}:`, e)
    }
  }

  // 监听变化，保存到 localStorage
  store.$subscribe((_mutation, state) => {
    localStorage.setItem(`pinia-${store.$id}`, JSON.stringify(state))
  })
}
