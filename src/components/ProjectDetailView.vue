<template>
  <div class="project-detail-view">
    <!-- 项目信息头部 -->
    <div class="detail-header">
      <button class="back-btn" @click="handleBack">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1 class="project-title">{{ project?.name || '项目详情' }}</h1>
      <div class="header-meta">
        <span :class="['status-badge', `status-${project?.status}`]">
          {{ getStatusText(project?.status) }}
        </span>
        <span class="create-time">{{ formatDate(project?.createdAt) }}</span>
      </div>
      <div class="header-actions">
        <template v-if="project?.status === 'analyzing'">
          <button class="action-btn" @click="handleContinueAnalysis">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 3l14 9-14 9V3z"/>
            </svg>
            <span>继续分析</span>
          </button>
          <button class="action-btn" @click="handleReanalyze">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 4V10H7"/>
              <path d="M23 20V14H17"/>
              <path d="M20.49 9C20.1561 7.66357 19.4879 6.43121 18.5416 5.41104C17.5953 4.39087 16.3982 3.61499 15.0655 3.15751C13.7329 2.70002 12.3074 2.57511 10.9128 2.79412C9.51824 3.01314 8.19764 3.56905 7.06687 4.4102C5.9361 5.25135 5.03106 6.35125 4.43191 7.60821C3.83275 8.86518 3.55883 10.2429 3.63551 11.6243C3.71219 13.0057 4.13684 14.3478 4.87139 15.5294C5.60594 16.7109 6.62757 17.6956 7.84533 18.4062C9.0631 19.1168 10.4337 19.5295 11.8394 19.6054C13.2451 19.6813 14.6532 19.4182 15.9414 18.8445L20.49 20.49"/>
            </svg>
            <span>重新分析</span>
          </button>
        </template>
        <button class="action-btn danger" @click="handleDelete">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          <span>删除</span>
        </button>
      </div>
    </div>

    <!-- 分析结果 -->
    <div v-if="hasResults" class="results-section">
      <h3>分析结果</h3>
      <div class="results-list">
        <div
          v-for="item in displayResults"
          :key="item.id"
          class="result-item"
        >
          <div class="result-number">{{ item.order }}</div>
          <div class="result-content">
            <h4>{{ item.title }}</h4>
            <p>{{ item.content }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 无结果状态 -->
    <div v-else class="no-results">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M9 17H5C4.46957 17 3.96086 16.7893 3.58579 16.4142C3.21071 16.0391 3 15.5304 3 15V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7894 3.96086 21 4.46957 21 5V15C21 15.5304 20.7894 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H15"/>
        <path d="M9 21H15"/>
        <path d="M12 17V21"/>
      </svg>
      <p>该项目还没有分析结果</p>
      <button class="start-btn" @click="handleReanalyze">开始分析</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProjectStore } from '@/stores/project'
import { useAnalysisStore } from '@/stores/analysis'
import { resetAnalysisStartedFlag, setOverrideStartStep } from '@/composables/useMockAnalysis'
import type { Project } from '@/stores/project'

const router = useRouter()
const route = useRoute()
const projectStore = useProjectStore()
const analysisStore = useAnalysisStore()

// 获取当前项目
const project = computed(() => {
  const projectId = route.params.id as string
  return projectStore.projects.find(p => p.id === projectId)
})

// 获取显示的结果（已完成或分析中的结果）
const displayResults = computed(() => {
  if (!project.value) return []
  // 优先使用已完成的结果，否则使用分析状态中的结果
  return (project.value.results && project.value.results.length > 0)
    ? project.value.results
    : (project.value.analysisState?.results || [])
})

// 是否有结果显示
const hasResults = computed(() => {
  return displayResults.value.length > 0
})

// 获取状态文本
const getStatusText = (status?: Project['status']) => {
  if (!status) return ''
  const statusMap = {
    analyzing: '分析中',
    completed: '已完成',
    draft: '草稿'
  }
  return statusMap[status] || status
}

// 格式化日期
const formatDate = (timestamp?: number) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 返回项目管理页面
const handleBack = () => {
  router.push({ name: 'projects' })
}

// 重新分析
const handleReanalyze = () => {
  if (project.value) {
    // 设置为当前项目
    projectStore.setCurrentProject(project.value.id)
    // 重新开始分析（不恢复状态）
    analysisStore.startAnalysis(project.value.description)
    // 导航到工作台并传递项目ID
    router.push({ name: 'workspace', params: { projectId: project.value.id } })
  }
}

// 继续分析
const handleContinueAnalysis = () => {
  if (project.value?.analysisState) {
    // 重置分析启动标志，允许从断点继续
    resetAnalysisStartedFlag()

    // 设置为当前项目
    projectStore.setCurrentProject(project.value.id)

    // 恢复分析状态
    const state = project.value.analysisState
    const startFromStep = state.currentStepIndex || 0

    // 设置覆盖的起始步骤（用于断点续传）
    setOverrideStartStep(startFromStep)

    // 使用 $patch 来批量更新 store 状态
    analysisStore.$patch({
      currentState: 'analyzing', // 确保状态是 analyzing，这样分析会继续
      originalIdea: state.originalIdea,
      logs: state.logs,
      results: state.results,
      currentQuestion: state.currentQuestion,
      questionHistory: state.questionHistory,
      userResponses: new Map(Object.entries(state.userResponses))
    })

    // 导航到工作台并传递项目ID（useMockAnalysis 会从 startFromStep 继续执行）
    router.push({ name: 'workspace', params: { projectId: project.value.id } })
  }
}

// 删除项目
const handleDelete = () => {
  if (project.value && confirm(`确定要删除项目"${project.value.name}"吗？`)) {
    projectStore.deleteProject(project.value.id)
    router.push({ name: 'projects' })
  }
}
</script>

<style lang="less" scoped>
.project-detail-view {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

// === 头部 - 单行紧凑布局 ===
.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  margin-bottom: 16px;
  background: white;
  border-radius: 10px;
  border: 1px solid #E2E8F0;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #F8FAFC;
  border: none;
  border-radius: 8px;
  color: #64748B;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: #F1F5F9;
    color: #7C3AED;
  }
}

.project-title {
  flex: 1;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1E293B;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.status-badge {
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;

  &.status-completed {
    background: #F0FDF4;
    color: #10B981;
  }

  &.status-analyzing {
    background: #EFF6FF;
    color: #3B82F6;
  }

  &.status-draft {
    background: #F1F5F9;
    color: #64748B;
  }
}

.create-time {
  font-size: 12px;
  color: #94A3B8;
}

.header-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 12px;
  height: 32px;
  background: #F8FAFC;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #64748B;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #F1F5F9;
    color: #7C3AED;
  }

  &.danger:hover {
    background: #FEF2F2;
    color: #EF4444;
  }
}

// === 分析结果 ===
.results-section {
  h3 {
    margin: 0 0 16px;
    font-size: 15px;
    font-weight: 600;
    color: #1E293B;
  }
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-item {
  display: flex;
  gap: 16px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #E2E8F0;
  transition: all 0.2s ease;

  &:hover {
    border-color: #A78BFA;
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.1);
  }
}

.result-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #7C3AED, #4F46E5);
  color: white;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.result-content {
  flex: 1;

  h4 {
    margin: 0 0 8px;
    font-size: 15px;
    font-weight: 600;
    color: #1E293B;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: #64748B;
    line-height: 1.6;
  }
}

// === 无结果状态 ===
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  color: #94A3B8;

  svg {
    margin-bottom: 16px;
    opacity: 0.3;
  }

  p {
    margin: 0 0 24px;
    font-size: 14px;
  }

  .start-btn {
    padding: 12px 24px;
    background: linear-gradient(135deg, #7C3AED, #4F46E5);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
    }
  }
}
</style>
