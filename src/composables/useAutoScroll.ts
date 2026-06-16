import { ref, onBeforeUnmount, nextTick } from 'vue'

/**
 * 智能自动滚动 Composable - 简化版
 *
 * 核心逻辑：
 * 1. 默认自动滚动到底部
 * 2. 如果用户主动向上滚动（scrollTop 从底部位置变小），则停止自动滚动
 * 3. 只有当用户重新滚动到底部附近时，才恢复自动滚动
 */
export function useAutoScroll(threshold = 100) {
  const scrollContainer = ref<HTMLElement | null>(null)
  let autoScrollEnabled = true // 默认开启自动滚动
  let isProgrammaticScroll = false
  let maxScrollTopSeen = 0 // 记录用户看到过的最大 scrollTop（用于判断是否滚动了）

  // 滚动到底部
  const scrollToBottom = () => {
    if (!scrollContainer.value) return

    isProgrammaticScroll = true
    const container = scrollContainer.value
    const targetScroll = Math.max(0, container.scrollHeight - container.clientHeight)
    container.scrollTop = targetScroll

    setTimeout(() => {
      isProgrammaticScroll = false
      // 滚动完成后，记录这个位置
      maxScrollTopSeen = container.scrollTop
    }, 50)
  }

  // 处理滚动事件
  const handleScroll = () => {
    if (!scrollContainer.value || isProgrammaticScroll) return

    const container = scrollContainer.value
    const currentScrollTop = container.scrollTop
    const distanceToBottom = container.scrollHeight - currentScrollTop - container.clientHeight

    // 如果距离底部超过阈值，说明用户向上滚动了
    if (distanceToBottom > threshold) {
      autoScrollEnabled = false
    } else {
      // 回到底部附近，恢复自动滚动
      autoScrollEnabled = true
      maxScrollTopSeen = currentScrollTop
    }
  }

  // 当内容变化时触发自动滚动
  const onContentChange = async () => {
    await nextTick()
    await new Promise(resolve => requestAnimationFrame(resolve))
    await new Promise(resolve => setTimeout(resolve, 100))

    if (scrollContainer.value && autoScrollEnabled) {
      scrollToBottom()
    }
  }

  // 初始化滚动容器
  const initScrollContainer = (element: HTMLElement | null) => {
    if (scrollContainer.value) {
      scrollContainer.value.removeEventListener('scroll', handleScroll)
    }

    scrollContainer.value = element

    if (element) {
      element.addEventListener('scroll', handleScroll, { passive: true })
      // 初始滚动到底部
      requestAnimationFrame(() => setTimeout(() => scrollToBottom(), 100))
    }
  }

  // 检查并滚动到底部（初始化用）
  const checkAndScrollToBottom = async () => {
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))
    if (scrollContainer.value) {
      scrollToBottom()
    }
  }

  // 手动控制
  const setAutoScroll = (enabled: boolean) => {
    autoScrollEnabled = enabled
    if (enabled) {
      scrollToBottom()
    }
  }

  onBeforeUnmount(() => {
    if (scrollContainer.value) {
      scrollContainer.value.removeEventListener('scroll', handleScroll)
    }
  })

  return {
    scrollContainer,
    initScrollContainer,
    scrollToBottom,
    setAutoScroll,
    onContentChange,
    checkAndScrollToBottom
  }
}
