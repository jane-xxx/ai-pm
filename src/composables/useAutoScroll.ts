import { ref, onBeforeUnmount, nextTick } from 'vue'

/**
 * 智能自动滚动 Composable - 改进版
 *
 * 核心逻辑：
 * 1. 默认自动滚动到底部
 * 2. 如果用户主动向上滚动（scrollTop 从底部位置变小），则停止自动滚动
 * 3. 只有当用户重新滚动到底部附近时，才恢复自动滚动
 *
 * 改进：
 * - 使用 scroll 事件检测滚动完成，避免固定超时
 * - 使用计数器处理重叠的内容变化调用
 * - 确保滚动状态不被竞态条件破坏
 */
export function useAutoScroll(threshold = 100) {
  const scrollContainer = ref<HTMLElement | null>(null)
  let autoScrollEnabled = true // 默认开启自动滚动
  let isProgrammaticScroll = false
  let pendingScrolls = 0 // 待执行的滚动数量（处理重叠调用）
  let scrollCheckTimer: number | null = null // 滚动完成检测定时器

  // 检查滚动是否完成
  const checkScrollComplete = () => {
    if (!scrollContainer.value || !isProgrammaticScroll) return

    const container = scrollContainer.value
    const targetScroll = Math.max(0, container.scrollHeight - container.clientHeight)
    const currentScroll = container.scrollTop

    // 如果已滚动到目标位置（或非常接近），认为滚动完成
    if (Math.abs(currentScroll - targetScroll) < 2) {
      isProgrammaticScroll = false
      pendingScrolls = Math.max(0, pendingScrolls - 1)

      // 清除定时器
      if (scrollCheckTimer !== null) {
        clearTimeout(scrollCheckTimer)
        scrollCheckTimer = null
      }
    } else {
      // 继续检查
      scrollCheckTimer = window.setTimeout(checkScrollComplete, 16)
    }
  }

  // 滚动到底部
  const scrollToBottom = () => {
    if (!scrollContainer.value) return

    const container = scrollContainer.value
    const targetScroll = Math.max(0, container.scrollHeight - container.clientHeight)

    // 如果已经在底部，不需要滚动
    if (Math.abs(container.scrollTop - targetScroll) < 2) {
      return
    }

    isProgrammaticScroll = true
    pendingScrolls++
    container.scrollTop = targetScroll

    // 使用 scroll 事件监听器检测完成，而不是固定超时
    // 在下一个事件循环开始检查
    scrollCheckTimer = window.setTimeout(checkScrollComplete, 16)
  }

  // 处理滚动事件
  const handleScroll = () => {
    if (!scrollContainer.value) return

    // 如果正在进行程序化滚动，让 checkScrollComplete 处理
    if (isProgrammaticScroll && pendingScrolls > 0) {
      // 触发滚动完成检查
      checkScrollComplete()
      return
    }

    const container = scrollContainer.value
    const currentScrollTop = container.scrollTop
    const distanceToBottom = container.scrollHeight - currentScrollTop - container.clientHeight

    // 如果距离底部超过阈值，说明用户向上滚动了
    if (distanceToBottom > threshold) {
      autoScrollEnabled = false
    } else {
      // 回到底部附近，恢复自动滚动
      autoScrollEnabled = true
    }
  }

  // 当内容变化时触发自动滚动
  const onContentChange = async () => {
    // 等待 Vue DOM 更新
    await nextTick()

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
      requestAnimationFrame(() => {
        requestAnimationFrame(() => scrollToBottom())
      })
    }
  }

  // 检查并滚动到底部（初始化用）
  const checkAndScrollToBottom = async () => {
    await nextTick()
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
    if (scrollCheckTimer !== null) {
      clearTimeout(scrollCheckTimer)
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
