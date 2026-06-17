<template>
  <span ref="textRef">{{ displayText }}</span>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

interface Props {
  text: string
  speed?: number // 每个字符的延迟时间（毫秒）
  enabled?: boolean // 是否启用打字机效果
  streaming?: boolean // 是否启用流式输出（逐字符追加）
}

const props = withDefaults(defineProps<Props>(), {
  speed: 10,
  enabled: true,
  streaming: false
})

const displayText = ref('')
const textRef = ref<HTMLElement | null>(null)
let timer: number | null = null
let currentIndex = 0

// 打字机效果
const startTypewriter = () => {
  if (!props.enabled) {
    displayText.value = props.text
    return
  }

  displayText.value = ''
  currentIndex = 0

  const type = () => {
    if (currentIndex < props.text.length) {
      displayText.value += props.text.charAt(currentIndex)
      currentIndex++
      timer = window.setTimeout(type, props.speed)
    }
  }

  type()
}

// 流式输出（用于 SSE/流式响应）
const updateStreamingText = (newText: string) => {
  displayText.value = newText
}

// 清理定时器
const clearTimer = () => {
  if (timer !== null) {
    clearTimeout(timer)
    timer = null
  }
}

// 监听文本变化
watch(() => props.text, (newText, oldText) => {
  clearTimer()

  if (props.streaming) {
    // 流式模式：直接更新文本
    displayText.value = newText
  } else if (newText !== oldText) {
    // 打字机模式：重新开始打字
    startTypewriter()
  }
})

onMounted(() => {
  if (props.text && !props.streaming) {
    startTypewriter()
  }
})

onBeforeUnmount(() => {
  clearTimer()
})

// 暴露方法供外部调用
defineExpose({
  updateStreamingText,
  startTypewriter,
  clearTimer
})
</script>
