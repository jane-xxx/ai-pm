<template>
  <div class="streaming-markdown">
    <MarkdownRenderer :content="displayText" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import MarkdownRenderer from './MarkdownRenderer.vue'

interface Props {
  content: string
  speed?: number // 每次添加的字符数
  delay?: number // 延迟间隔（毫秒）
  enabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  speed: 3,
  delay: 30,
  enabled: true
})

const displayText = ref('')
const targetText = ref(props.content)
let timer: number | null = null
let currentIndex = 0

const startStreaming = () => {
  if (!props.enabled || !props.content) {
    displayText.value = props.content
    return
  }

  displayText.value = ''
  currentIndex = 0
  targetText.value = props.content

  const stream = () => {
    if (currentIndex < targetText.value.length) {
      // 每次添加 speed 个字符
      const nextIndex = Math.min(currentIndex + props.speed, targetText.value.length)
      displayText.value = targetText.value.slice(0, nextIndex)
      currentIndex = nextIndex
      timer = window.setTimeout(stream, props.delay)
    }
  }

  stream()
}

const clearTimer = () => {
  if (timer !== null) {
    clearTimeout(timer)
    timer = null
  }
}

// 监听内容变化
watch(() => props.content, (newContent) => {
  clearTimer()
  targetText.value = newContent

  if (props.enabled && newContent) {
    // 如果新内容更长，继续流式输出
    if (newContent.length > displayText.value.length) {
      currentIndex = displayText.value.length
      const stream = () => {
        if (currentIndex < targetText.value.length) {
          const nextIndex = Math.min(currentIndex + props.speed, targetText.value.length)
          displayText.value = targetText.value.slice(0, nextIndex)
          currentIndex = nextIndex
          timer = window.setTimeout(stream, props.delay)
        }
      }
      stream()
    } else {
      // 新内容更短或相同，直接更新
      displayText.value = newContent
    }
  } else {
    displayText.value = newContent
  }
})

onMounted(() => {
  if (props.content) {
    startStreaming()
  }
})

onBeforeUnmount(() => {
  clearTimer()
})
</script>
