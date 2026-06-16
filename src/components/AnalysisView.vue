<template>
  <div class="analysis-view">
    <!-- 右侧分析区域：三个模块垂直堆叠 -->
    <div class="analysis-sections">
      <!-- 1. 分析流程（顶部） -->
      <div class="section analysis-flow-section">
        <AnalysisProgress ref="progressRef" />
      </div>

      <!-- 2. 实时日志（中间） -->
      <div class="section log-section">
        <div class="section-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7894 19.4142 21.4142C19.7894 21.7893 20 20.5304 20 20V8L14 2Z"/>
            <path d="M14 2V8H20"/>
            <path d="M16 13H8"/>
            <path d="M16 17H8"/>
            <path d="M10 9H9H8"/>
          </svg>
          <span>实时日志</span>
        </div>

        <div class="log-list">
          <!-- 日志条目 -->
          <div
            v-for="log in logs"
            :key="log.id"
            class="log-entry fade-in"
            :class="`log-${log.type}`"
          >
            <span class="log-time">{{ formatTime(log.timestamp) }}</span>
            <div class="log-icon">
              <svg v-if="log.type === 'success'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 6L9 17L4 12"/>
              </svg>
              <svg v-else-if="log.type === 'loading'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2V4M12 20V22M4 12H2M6.34 6.34L4.93 4.93M17.66 17.66L19.07 19.07M22 12H20M17.66 6.34L19.07 4.93M6.34 17.66L4.93 19.07"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16V12"/>
                <path d="M12 8H12.01"/>
              </svg>
            </div>
            <span class="log-text">{{ log.message }}</span>
          </div>

          <!-- 断点问题（在日志中） -->
          <Transition name="question-fade">
            <ClarifyingQuestionCard
              v-if="currentQuestion"
              :question="currentQuestion"
              :compact="true"
              @answer="handleAnswer"
            />
          </Transition>

          <!-- 空状态 -->
          <div v-if="logs.length === 0 && !currentQuestion" class="log-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7894 19.4142 21.4142C19.7894 21.7893 20 20.5304 20 20V8L14 2Z"/>
              <path d="M14 2V8H20"/>
            </svg>
            <span>等待分析开始...</span>
          </div>
        </div>
      </div>

      <!-- 3. 分析结果（底部） -->
      <div class="section result-section">
        <div class="section-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H19C20.1046 18 21 17.1046 21 16Z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <span>分析结果</span>
        </div>

        <div class="result-content">
          <div class="result-list">
            <div
              v-for="item in results"
              :key="item.id"
              class="result-item fade-in"
            >
              <div class="result-number">{{ item.order }}</div>
              <div class="result-content-inner">
                <h4 class="result-title">{{ item.title }}</h4>
                <p class="result-text">{{ item.content }}</p>
              </div>
            </div>

            <!-- 加载中 -->
            <div v-if="isAnalyzing && results.length === 0" class="result-loading">
              <div class="loading-bars">
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
              </div>
              <p>正在生成分析结果...</p>
            </div>

            <!-- 空状态 -->
            <div v-else-if="results.length === 0" class="result-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <path d="M9 17H5C4.46957 17 3.96086 16.7893 3.58579 16.4142C3.21071 16.0391 3 15.5304 3 15V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7894 3.96086 21 4.46957 21 5V15C21 15.5304 20.7894 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H15"/>
                <path d="M9 21H15"/>
                <path d="M12 17V21"/>
              </svg>
              <span>分析完成后结果将显示在这里</span>
            </div>

            <!-- 完成后的操作 -->
            <div v-if="isCompleted" class="result-actions">
              <button class="btn btn-secondary" @click="handleRestart">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 4V10H7"/>
                  <path d="M23 20V14H17"/>
                  <path d="M20.49 9C20.1561 7.66357 19.4879 6.43121 18.5416 5.41104C17.5953 4.39087 16.3982 3.61499 15.0655 3.15751C13.7329 2.70002 12.3074 2.57511 10.9128 2.79412C9.51824 3.01314 8.19764 3.56905 7.06687 4.4102C5.9361 5.25135 5.03106 6.35125 4.43191 7.60821C3.83275 8.86518 3.55883 10.2429 3.63551 11.6243C3.71219 13.0057 4.13684 14.3478 4.87139 15.5294C5.60594 16.7109 6.62757 17.6956 7.84533 18.4062C9.0631 19.1168 10.4337 19.5295 11.8394 19.6054C13.2451 19.6813 14.6532 19.4182 15.9414 18.8445L20.49 20.49"/>
                </svg>
                重新分析
              </button>
              <button class="btn btn-primary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"/>
                  <path d="M7 10L12 15L17 10"/>
                  <path d="M12 15V3"/>
                </svg>
                导出报告
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAnalysisStore } from '@/stores/analysis'
import { useMockAnalysis, submitAnswer, setProgressUpdater } from '@/composables/useMockAnalysis'
import AnalysisProgress from './AnalysisProgress.vue'
import ClarifyingQuestionCard from './ClarifyingQuestionCard.vue'

const analysisStore = useAnalysisStore()
const { logs, results, currentQuestion, isAnalyzing, isPaused, isCompleted } = storeToRefs(analysisStore)

// 分析进度组件引用
const progressRef = ref<InstanceType<typeof AnalysisProgress> | null>(null)

// 暴露给外部使用
defineExpose({
  progressRef
})

// 格式化时间戳
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

// 设置进度更新器
onMounted(() => {
  setProgressUpdater((stepId: string, status: 'active' | 'completed', description?: string) => {
    if (progressRef.value) {
      progressRef.value.updateStep(stepId, status, description)
    }
  })
})

// 启动 mock 分析
useMockAnalysis()

const handleAnswer = (answer: string | string[], skipped: boolean) => {
  analysisStore.answerQuestion(answer, skipped)
  submitAnswer(answer, skipped)
}

const handleRestart = () => {
  analysisStore.reset()
}
</script>

<style lang="less" scoped>
.analysis-view {
  min-height: 100vh;
  padding: 24px;
  background: #F8FAFC;
}

.analysis-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1000px;
  margin: 0 auto;
}

// === 通用 Section 样式 ===
.section {
  background: white;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #E2E8F0;
  overflow: hidden;
  animation: fadeIn 0.4s ease;
}

.section-header {
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

// === 1. 分析流程 Section ===
.analysis-flow-section {
  // 使用 AnalysisProgress 组件的内部样式
}

// === 2. 实时日志 Section ===
.log-section {
  min-height: 200px;
  max-height: 280px;
  display: flex;
  flex-direction: column;
}

.log-list {
  padding: 12px;
  overflow-y: auto;
  flex: 1;
}

.log-entry {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  margin-bottom: 6px;
  font-size: 13px;

  &.log-success {
    background: #F0FDF4;
    color: #166534;
  }

  &.log-loading {
    background: #EFF6FF;
    color: #1E40AF;
  }

  &.log-info {
    background: #F8FAFC;
    color: #64748B;
  }
}

.log-time {
  flex-shrink: 0;
  font-size: 11px;
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  opacity: 0.7;
  min-width: 68px;
}

.log-icon {
  flex-shrink: 0;
  color: currentColor;
}

.log-text {
  flex: 1;
  word-break: break-word;
}

.log-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  color: #94A3B8;
  font-size: 13px;

  svg {
    margin-bottom: 10px;
    opacity: 0.4;
  }
}

// === 3. 分析结果 Section ===
.result-section {
  min-height: 360px;
  display: flex;
  flex-direction: column;
}

.result-content {
  flex: 1;
  overflow: hidden;
}

.result-list {
  padding: 16px;
  overflow-y: auto;
  max-height: 500px;
}

.result-item {
  display: flex;
  gap: 12px;
  padding: 14px;
  background: #F8FAFC;
  border-radius: 10px;
  margin-bottom: 12px;
  border: 1px solid #F1F5F9;
  transition: all 0.2s ease;

  &:hover {
    border-color: #E2E8F0;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  }
}

.result-number {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #7C3AED, #4F46E5);
  color: white;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.result-content-inner {
  flex: 1;
}

.result-title {
  font-size: 14px;
  font-weight: 600;
  color: #1E293B;
  margin-bottom: 6px;
}

.result-text {
  font-size: 13px;
  color: #64748B;
  line-height: 1.6;
}

.result-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #94A3B8;
  font-size: 13px;
}

.loading-bars {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}

.bar {
  width: 6px;
  height: 32px;
  background: linear-gradient(180deg, #7C3AED, #A78BFA);
  border-radius: 3px;
  animation: pulse 1.2s ease-in-out infinite;

  &:nth-child(2) {
    animation-delay: 0.2s;
  }

  &:nth-child(3) {
    animation-delay: 0.4s;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scaleY(0.5);
    opacity: 0.5;
  }
  50% {
    transform: scaleY(1);
    opacity: 1;
  }
}

.result-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  color: #94A3B8;
  text-align: center;

  svg {
    margin-bottom: 12px;
    opacity: 0.3;
  }

  span {
    font-size: 13px;
  }
}

.result-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #F1F5F9;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  outline: none;
  flex: 1;

  &:hover {
    transform: translateY(-1px);
  }

  &.btn-primary {
    background: linear-gradient(135deg, #7C3AED, #4F46E5);
    color: white;
  }

  &.btn-secondary {
    background: white;
    color: #64748B;
    border: 1px solid #E2E8F0;

    &:hover {
      border-color: #A78BFA;
      color: #7C3AED;
    }
  }
}

// === 动画 ===
.fade-in {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.question-fade-enter-active,
.question-fade-leave-active {
  transition: all 0.3s ease;
}

.question-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.question-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

// === 响应式 ===
@media (max-width: 1024px) {
  .analysis-view {
    padding: 16px;
  }

  .log-section {
    max-height: 240px;
  }

  .result-list {
    max-height: 400px;
  }
}
</style>
