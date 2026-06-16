<template>
  <div class="analysis-results-view">
    <!-- 头部 -->
    <div class="results-header">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7894 19.4142 21.4142C19.7894 21.7893 20 20.5304 20 20V8L14 2Z"/>
        <path d="M14 2V8H20"/>
        <path d="M9 15C9 15 9 15 9 15"/>
        <path d="M13 11L9 13"/>
        <path d="M11 13L13 15"/>
      </svg>
      <span>分析结果</span>
    </div>

    <!-- Loading 状态 -->
    <div v-if="showLoading" class="results-loading">
      <div class="loading-animation">
        <div class="loading-ring ring-1"></div>
        <div class="loading-ring ring-2"></div>
        <div class="loading-ring ring-3"></div>
        <div class="loading-core">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L12 6"/>
            <path d="M12 18L12 22"/>
            <path d="M4.93 4.93L7.76 7.76"/>
            <path d="M16.24 16.24L19.07 19.07"/>
            <path d="M2 12L6 12"/>
            <path d="M18 12L22 12"/>
            <path d="M4.93 19.07L7.76 16.24"/>
            <path d="M16.24 7.76L19.07 4.93"/>
          </svg>
        </div>
      </div>
      <p>AI 正在深度分析中...</p>
      <span class="loading-hint">正在调用多个专业 Agent 为你生成产品分析报告</span>
    </div>

    <!-- 内容区域 -->
    <div ref="resultsContentRef" v-else class="results-content">
      <!-- 分析结果列表 - 直接显示完整内容，使用淡入动画 -->
      <div class="analysis-results">
        <div
          v-for="result in results"
          :key="result.id"
          class="result-item fade-in"
        >
          <div class="result-header">
            <span class="result-order">{{ result.order }}</span>
            <h4 class="result-title">{{ result.title }}</h4>
          </div>
          <div class="result-content">
            {{ result.content }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useAnalysisStore } from '@/stores/analysis'
import { useAutoScroll } from '@/composables/useAutoScroll'

// 获取分析状态
const analysisStore = useAnalysisStore()
const { results } = storeToRefs(analysisStore)

// 智能自动滚动 - 分析结果
const { initScrollContainer: initResultsScroll, onContentChange: onResultsContentChange } = useAutoScroll(100)
const resultsContentRef = ref<HTMLElement | null>(null)

// 监听结果变化，触发自动滚动（使用深度监听）
watch(results, onResultsContentChange, { deep: true })

// 监听元素出现（从 loading 状态切换到内容状态）
watch(resultsContentRef, (element) => {
  if (element) {
    // 元素出现时，初始化滚动
    initResultsScroll(element)
  }
})

// 是否显示 loading 状态
const showLoading = computed(() => {
  return results.value.length === 0
})
</script>

<style lang="less" scoped>
.analysis-results-view {
  background: white;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #F1F5F9;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

// === 头部 ===
.results-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #FAFAFA;
  border-bottom: 1px solid #F1F5F9;
  color: #64748B;
  font-size: 13px;
  font-weight: 500;
}

// === Loading 状态 ===
.results-loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.loading-animation {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
}

.loading-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid transparent;
}

.ring-1 {
  width: 100%;
  height: 100%;
  border-top-color: #7C3AED;
  border-right-color: #4F46E5;
  animation: rotate 2s linear infinite;
  opacity: 0.8;
}

.ring-2 {
  width: 75%;
  height: 75%;
  border-bottom-color: #EC4899;
  border-left-color: #8B5CF6;
  animation: rotate 1.5s linear infinite reverse;
  opacity: 0.6;
}

.ring-3 {
  width: 50%;
  height: 50%;
  border-top-color: #06B6D4;
  border-right-color: #10B981;
  animation: rotate 1s linear infinite;
  opacity: 0.4;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-core {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #7C3AED, #4F46E5);
  border-radius: 12px;
  color: white;
  animation: pulse 1.5s ease-in-out infinite;
  box-shadow: 0 8px 24px rgba(124, 58, 237, 0.3);
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 8px 24px rgba(124, 58, 237, 0.3);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 12px 32px rgba(124, 58, 237, 0.5);
  }
}

.loading-core svg {
  animation: spin-slow 3s linear infinite;
}

@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.results-loading p {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1E293B;
  background: linear-gradient(135deg, #7C3AED, #4F46E5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.loading-hint {
  font-size: 13px;
  color: #64748B;
  display: flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    background: #10B981;
    border-radius: 50%;
    animation: blink 1.5s ease-in-out infinite;
  }
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
    transform: scale(0.8);
  }
}

// === 内容区域 ===
.results-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

// === 分析结果列表 ===
.analysis-results {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-item {
  background: #F9FAFB;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #E5E7EB;
  transition: all 0.3s ease;

  &.fade-in {
    animation: fadeIn 0.5s ease;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.result-order {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #7C3AED, #4F46E5);
  color: white;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.result-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #1E293B;
}

.result-content {
  margin: 0;
  font-size: 14px;
  color: #4B5563;
  line-height: 1.7;
  white-space: pre-wrap;
}

.typing-cursor {
  display: inline-block;
  width: 2px;
  height: 16px;
  background: #7C3AED;
  margin-left: 2px;
  vertical-align: middle;
  animation: cursorBlink 0.8s infinite;
}

@keyframes cursorBlink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}
</style>
