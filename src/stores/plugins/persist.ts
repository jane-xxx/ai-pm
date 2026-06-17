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
      const parsed = JSON.parse(saved)

      // 对于 project store，特殊处理 currentProject
      if (store.$id === 'project') {
        const currentProjectId = parsed.currentProject?.id

        // 只恢复 projects 数组，不恢复 currentProject 对象
        store.$patch({ projects: parsed.projects })

        // 如果有 currentProjectId，从 projects 数组中找到并设置
        if (currentProjectId) {
          const project = parsed.projects.find((p: any) => p.id === currentProjectId)
          if (project) {
            store.currentProject = project
          }
        }
      } else {
        store.$patch(parsed)
      }
    } catch (e) {
      console.error(`Failed to restore ${store.$id}:`, e)
    }
  }

  // 监听变化，保存到 localStorage
  store.$subscribe((_mutation, state) => {
    localStorage.setItem(`pinia-${store.$id}`, JSON.stringify(state))
  })
}
