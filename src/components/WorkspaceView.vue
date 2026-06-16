<template>
  <div class="workspace-view">
    <!-- 有项目正在分析时显示工作台内容 -->
    <div v-if="hasActiveProject" class="workspace-content">
      <!-- 左侧：分析流程 + 实时日志 -->
      <div class="left-panel">
        <AnalysisProgress ref="progressRef" />
        <div class="log-section">
          <div class="section-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7894 19.4142 21.4142C19.7894 21.7893 20 20.5304 20 20V8L14 2Z"/>
              <path d="M14 2V8H20"/>
            </svg>
            <span>实时日志</span>
          </div>

          <div ref="logListRef" class="log-list">
            <div
              v-for="log in logs"
              :key="log.id"
              class="log-entry fade-in"
              :class="`log-${log.type}`"
            >
              <span class="log-time">{{ formatTime(log.timestamp) }}</span>
              <span class="log-text">{{ log.message }}</span>
            </div>

            <Transition name="question-fade">
              <ClarifyingQuestionCard
                v-if="currentQuestion"
                :question="currentQuestion"
                :compact="true"
                @answer="handleAnswer"
              />
            </Transition>

            <div v-if="logs.length === 0 && !currentQuestion" class="log-empty">
              <span>等待分析开始...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：分析结果 -->
      <div class="right-panel">
        <AnalysisResultsView />
      </div>
    </div>

    <!-- 无项目时显示欢迎页 -->
    <div v-else class="empty-workspace">
      <div class="empty-content">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <h2>欢迎使用 AI 产品经理助手</h2>
        <p>智能分析你的产品想法，快速生成专业分析报告</p>

        <!-- 功能特性 -->
        <div class="features-section">
          <div class="feature-grid">
            <div class="feature-item">
              <div class="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6V12L16 14"/>
                </svg>
              </div>
              <div class="feature-text">
                <span class="feature-title">智能分析</span>
                <span class="feature-desc">AI 自动分析产品想法</span>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 16V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H19C20.1046 18 21 17.1046 21 16Z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <div class="feature-text">
                <span class="feature-title">深度洞察</span>
                <span class="feature-desc">多维度产品分析</span>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"/>
                  <path d="M8 12H16"/>
                  <path d="M12 8V16"/>
                </svg>
              </div>
              <div class="feature-text">
                <span class="feature-title">交互式</span>
                <span class="feature-desc">智能提问精准分析</span>
              </div>
            </div>
          </div>
        </div>

        <button class="create-btn" @click="handleCreateNew">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          创建新项目
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAnalysisStore } from '@/stores/analysis'
import { useMockAnalysis, submitAnswer, setProgressUpdater } from '@/composables/useMockAnalysis'
import { useAutoScroll } from '@/composables/useAutoScroll'
import { useProjectStore } from '@/stores/project'
import type { Project } from '@/stores/project'
import AnalysisProgress from './AnalysisProgress.vue'
import AnalysisResultsView from './AnalysisResultsView.vue'
import ClarifyingQuestionCard from './ClarifyingQuestionCard.vue'

const router = useRouter()
const route = useRoute()
const analysisStore = useAnalysisStore()
const { logs, currentQuestion, originalIdea, isAnalyzing } = storeToRefs(analysisStore)
const projectStore = useProjectStore()
const { currentProject, projects } = storeToRefs(projectStore)

const progressRef = ref<InstanceType<typeof AnalysisProgress> | null>(null)

// 智能自动滚动 - 实时日志
const { initScrollContainer: initLogScroll, onContentChange: onLogContentChange } = useAutoScroll(80)
const logListRef = ref<HTMLElement | null>(null)

// 监听元素出现
watch(logListRef, (element) => {
  if (element) {
    initLogScroll(element)
  }
})

// 监听 progressRef 出现后，如果已在分析中且是全新分析，激活第一步
watch(progressRef, (ref) => {
  if (ref && isAnalyzing.value) {
    // 检查是否是断点续传：如果有 analysisState 说明是恢复进度，不需要重新激活第一步
    const isResuming = currentProject.value?.analysisState !== undefined
    if (!isResuming) {
      console.log('[WorkspaceView] progressRef ready, fresh analysis - activating first step')
      ref.startAnalysis()
    } else {
      console.log('[WorkspaceView] progressRef ready, resuming from breakpoint - skipping startAnalysis')
    }
  }
})

// 监听日志变化，触发自动滚动
watch(logs, onLogContentChange, { deep: true })

// 从路由参数获取项目ID
const routeProjectId = computed(() => route.params.projectId as string | undefined)

// 根据路由的项目ID设置当前项目
watch(
  () => routeProjectId.value,
  (projectId) => {
    if (projectId) {
      // 有项目ID，设置当前项目
      const project = projects.value.find(p => p.id === projectId)
      if (project && project !== currentProject.value) {
        projectStore.setCurrentProject(projectId)
      }
    } else {
      // 无项目ID，清除当前项目
      if (currentProject.value) {
        projectStore.currentProject = null
      }
    }
  },
  { immediate: true }
)

// 检查是否需要恢复步骤状态（断点续传）
const checkAndRestoreProgress = () => {
  if (currentProject.value?.analysisState && progressRef.value) {
    const currentStepIndex = currentProject.value.analysisState.currentStepIndex || 0
    console.log('[WorkspaceView] checkAndRestoreProgress - currentStepIndex:', currentStepIndex)
    // 如果有未完成的步骤（currentStepIndex < 5），初始化步骤状态
    // currentStepIndex = 0 表示第一步正在进行中，也需要恢复
    if (currentStepIndex < 5) {
      progressRef.value.initFromStep(currentStepIndex)
    }
  }
}

// 是否有活跃项目（必须同时有分析数据和当前项目）
const hasActiveProject = computed(() => {
  // 必须有当前项目关联
  if (!currentProject.value) return false
  // 有分析活动或已完成的分析
  return isAnalyzing.value || originalIdea.value || logs.value.length > 0
})

// 最近项目
const recentProjects = computed(() => {
  return projects.value.slice(0, 3)
})

// 获取状态文本
const getStatusText = (status: Project['status']) => {
  const statusMap = {
    analyzing: '分析中',
    completed: '已完成',
    draft: '草稿'
  }
  return statusMap[status] || status
}

// 格式化时间
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

// 格式化日期
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 设置进度更新器并检查初始状态
onMounted(() => {
  setProgressUpdater((stepId: string, status: 'active' | 'completed', description?: string) => {
    if (progressRef.value) {
      progressRef.value.updateStep(stepId, status, description)
    }
  })

  // 如果已经在分析中，立即激活第一步
  if (isAnalyzing.value && progressRef.value) {
    progressRef.value.startAnalysis()
  }

  // 如果进入工作台但没有当前项目，清除可能存在的旧数据
  if (!currentProject.value && (originalIdea.value || logs.value.length > 0)) {
    analysisStore.reset()
  }

  // 检查是否需要恢复步骤状态（断点续传）
  checkAndRestoreProgress()
})

// 监听路由变化
watch(
  () => route.name,
  (newName, oldName) => {
    // 当从工作台导航到其他页面时，清除分析状态并清除当前项目
    if (oldName === 'workspace' && newName !== 'workspace') {
      analysisStore.reset()
      // 同时清除当前项目，避免返回时显示旧数据
      projectStore.currentProject = null
    }

    // 当进入工作台时，检查是否有有效数据
    if (newName === 'workspace') {
      // 如果没有当前项目，或者没有分析数据，显示空状态
      if (!currentProject.value || (!isAnalyzing.value && !originalIdea.value && logs.value.length === 0)) {
        // 确保数据已清除
        if (originalIdea.value || logs.value.length > 0) {
          analysisStore.reset()
        }
      }
    }
  }
)

// 监听当前项目变化（用于断点续传时恢复进度状态）
watch(
  () => currentProject.value,
  (newProject) => {
    if (newProject && route.name === 'workspace') {
      // 延迟执行，确保 progressRef 已经挂载
      setTimeout(() => {
        checkAndRestoreProgress()
      }, 100)
    }
  }
)

// 启动 mock 分析
useMockAnalysis()

// 离开工作台前清除状态
onBeforeRouteLeave((to, from, next) => {
  // 清除分析状态
  analysisStore.reset()
  // 清除当前项目
  projectStore.currentProject = null
  next()
})

// 组件卸载时的额外保险
onBeforeUnmount(() => {
  // 如果不是导航到项目详情页，清除状态
  if (route.name !== 'project-detail') {
    analysisStore.reset()
    projectStore.currentProject = null
  }
})

const handleAnswer = (answer: string | string[], skipped: boolean) => {
  analysisStore.answerQuestion(answer, skipped)
  submitAnswer(answer, skipped)
}

// 选择项目
const handleSelectProject = (project: Project) => {
  // 导航到工作台并传递项目ID
  router.push({ name: 'workspace', params: { projectId: project.id } })
}

// 导航到新建项目（通过侧边栏按钮）
const handleCreateNew = () => {
  // 通知 MainLayout 打开新建项目弹窗
  window.dispatchEvent(new CustomEvent('open-new-project-modal'))
}

// 清除当前分析，回到空状态
const handleClearAnalysis = () => {
  if (confirm('确定要清除当前分析内容吗？')) {
    analysisStore.reset()
  }
}
</script>

<style lang="less" scoped>
.workspace-view {
  height: 100vh;
  overflow: hidden;
}

// === 工作台内容 ===
.workspace-content {
  display: grid;
//   grid-template-rows: auto 1fr;
  grid-template-columns: 400px 1fr;
  gap: 16px;
  padding: 18px;
  height: 100vh;
}

.workspace-toolbar {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-radius: 10px;
  border: 1px solid #E2E8F0;
}

.toolbar-title {
  font-size: 14px;
  font-weight: 500;
  color: #1E293B;
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #FEE2E2;
  color: #DC2626;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #FECACA;
  }
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  overflow: hidden;
}

.log-section {
  background: white;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #F1F5F9;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #FAFAFA;
  border-bottom: 1px solid #F1F5F9;
  color: #64748B;
  font-size: 13px;
  font-weight: 500;
}

.log-list {
  padding: 12px;
  overflow-y: auto;
  flex: 1;
}

.log-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  margin-bottom: 4px;
  font-size: 12px;

  &.log-success {
    color: #059669;
  }

  &.log-loading {
    color: #1E40AF;
  }

  &.log-info {
    color: #64748B;
  }
}

.log-time {
  flex-shrink: 0;
  font-size: 11px;
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  opacity: 0.7;
  min-width: 60px;
}

.log-text {
  flex: 1;
  word-break: break-word;
}

.log-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: #94A3B8;
  font-size: 12px;
}

.right-panel {
  height: 100%;
  overflow: hidden;
  padding: 0;
}

// === 空状态 ===
.empty-workspace {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.empty-content {
  max-width: 600px;
  text-align: center;
}

.empty-icon {
  margin-bottom: 24px;

  svg {
    color: #E2E8F0;
  }
}

.empty-content h2 {
  margin: 0 0 12px;
  font-size: 28px;
  font-weight: 600;
  color: #1E293B;
}

.empty-content p {
  margin: 0 0 40px;
  font-size: 16px;
  color: #64748B;
}

// === 功能特性 ===
.features-section {
  margin-bottom: 40px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #F1F5F9;
  transition: all 0.2s ease;

  &:hover {
    border-color: #E2E8F0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }
}

.feature-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #F5F3FF, #EDE9FE);
  border-radius: 12px;
  color: #7C3AED;
  flex-shrink: 0;
}

.feature-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.feature-title {
  font-size: 15px;
  font-weight: 600;
  color: #1E293B;
}

.feature-desc {
  font-size: 13px;
  color: #64748B;
}

.create-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 28px;
  background: linear-gradient(135deg, #7C3AED, #4F46E5);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
  }
}

.fade-in {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
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
</style>
