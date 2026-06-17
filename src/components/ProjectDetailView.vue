<template>
  <div class="project-detail-view">
    <!-- 项目信息头部 -->
    <div class="detail-header">
      <button class="back-btn" @click="handleBack">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <h2 class="project-title">{{ project?.name || '项目详情' }}</h2>
      <div class="header-meta">
        <span :class="['status-badge', `status-${project?.status}`]">
          {{ getStatusText(project?.status) }}
        </span>
        <span class="create-time">{{ formatDate(project?.createdAt) }}</span>
      </div>
      <div class="header-actions">
        <!-- 只有在有结果的情况下才显示右上角的操作按钮 -->
        <!-- 如果没有结果但有 analysisState，按钮会在主内容区域显示，避免重复 -->
        <template v-if="project?.status === 'analyzing' && hasResults">
          <button class="action-btn" @click="handleContinueAnalysis">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 3l14 9-14 9V3z"/>
            </svg>
            <span>继续分析</span>
          </button>
          <button class="action-btn" @click="handleReanalyze">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 2v6h-6"></path>
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
              <path d="M3 22v-6h6"></path>
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
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
    <div v-if="hasResults" class="analysis-results-view">
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

      <!-- 内容区域 -->
      <div class="results-content">
        <!-- Tab 切换 -->
        <div class="results-tabs">
          <div class="tabs-left">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              class="tab-button"
              :class="{ active: activeTab === tab.key }"
              @click="activeTab = tab.key"
            >
              {{ tab.title }}
            </button>
          </div>
          <button
            v-if="prdResult"
            class="export-button"
            @click="exportPRD"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>导出PRD</span>
          </button>
        </div>

        <!-- 分析结果列表 -->
        <div class="analysis-results">
          <div
            v-for="item in filteredResults"
            :key="item.id"
            class="result-item fade-in"
          >
            <div class="result-header" v-if="item.title">
              <h4 class="result-title">{{ item.title }}</h4>
            </div>
            <div class="result-content">
              <StreamingMarkdown
                :content="item.content"
                :enabled="false"
                :speed="5"
                :delay="20"
              />
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="filteredResults.length === 0" class="empty-state">
            <div class="empty-icon">
              <div class="pulse-dot"></div>
              <div class="pulse-dot"></div>
              <div class="pulse-dot"></div>
            </div>
            <p>该阶段的分析结果即将呈现...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 无结果状态 -->
    <div v-else class="no-results">
      <template v-if="project?.analysisState">
        <!-- 分析进行中但还没结果 -->
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
        <p>分析进行中，已回答 {{ getAnsweredQuestionCount() }} 个问题</p>
        <div class="no-results-actions">
          <button class="action-btn primary" @click="handleContinueAnalysis">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 3l14 9-14 9V3z"/>
            </svg>
            继续分析
          </button>
	          <button class="action-btn" @click="handleReanalyze">
	            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
	              <path d="M21 2v6h-6"></path>
	              <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
	              <path d="M3 22v-6h6"></path>
	              <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
	            </svg>
	            重新分析
	          </button>
        </div>
      </template>
      <template v-else>
        <!-- 完全没有开始分析 -->
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 17H5C4.46957 17 3.96086 16.7893 3.58579 16.4142C3.21071 17 3 15.5304 3 15V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7894 3.96086 21 4.46957 21 5V15C21 15.5304 20.7894 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H15"/>
          <path d="M9 21H15"/>
          <path d="M12 17V21"/>
        </svg>
        <p>该项目还没有分析结果</p>
        <button class="start-btn" @click="handleReanalyze">开始分析</button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProjectStore } from '@/stores/project'
import { useAnalysisStore } from '@/stores/analysis'
import { resetAnalysisStartedFlag, setOverrideStartStep } from '@/composables/useMockAnalysis'
import StreamingMarkdown from './StreamingMarkdown.vue'
import html2pdf from 'html2pdf.js'
import MarkdownIt from 'markdown-it'
import type { Project } from '@/stores/project'

const router = useRouter()
const route = useRoute()
const projectStore = useProjectStore()
const analysisStore = useAnalysisStore()

// Tab 定义
interface Tab {
  key: string
  title: string
  // 信息采集阶段的结果ID
  infoCollectionIds: string[]
  // 决策分析阶段的结果ID
  decisionAnalysisIds: string[]
  // PRD生成阶段的结果ID
  prdIds: string[]
}

const tabs: Tab[] = [
  {
    key: 'info-collection',
    title: '信息采集',
    infoCollectionIds: ['r1', 'r2', 'r3'],
    decisionAnalysisIds: [],
    prdIds: []
  },
  {
    key: 'decision-analysis',
    title: '决策分析',
    infoCollectionIds: [],
    decisionAnalysisIds: ['r4', 'r5', 'r6'],
    prdIds: []
  },
  {
    key: 'prd-generation',
    title: 'PRD生成',
    infoCollectionIds: [],
    decisionAnalysisIds: [],
    prdIds: ['r7']
  }
]

// 当前激活的 tab
const activeTab = ref<string>('info-collection')

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

// 获取指定 tab 的结果
const getTabResults = (tabKey: string) => {
  const tab = tabs.find(t => t.key === tabKey)
  if (!tab) return []

  const allIds = [...tab.infoCollectionIds, ...tab.decisionAnalysisIds, ...tab.prdIds]
  return displayResults.value.filter(r => allIds.includes(r.id))
}

// 当前 tab 的过滤结果
const filteredResults = computed(() => {
  return getTabResults(activeTab.value)
})

// 是否有结果显示
const hasResults = computed(() => {
  return displayResults.value.length > 0
})

// PRD 结果（用于导出）
const prdResult = computed(() => {
  return displayResults.value.find(r => r.id === 'r7')
})

// 导出 PRD 文档为 PDF
const exportPRD = () => {
  const prd = prdResult.value
  if (!prd) return

  // 配置 markdown-it
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
  })

  // 创建完整的 Markdown 内容（添加标题）
  const fullMarkdown = prd.title ? `# ${prd.title}\n\n${prd.content}` : prd.content

  // 转换 Markdown 为 HTML
  const htmlContent = md.render(fullMarkdown)

  // 包装样式
  const styledHtml = `
    <div style="font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; line-height: 1.8; color: #1E293B;">
      <style>
        h1 { font-size: 24px; font-weight: 600; color: #1E293B; margin-top: 0; margin-bottom: 20px; border-bottom: 3px solid #7C3AED; padding-bottom: 12px; }
        h2 { font-size: 20px; font-weight: 600; color: #1E293B; margin-top: 28px; margin-bottom: 14px; }
        h3 { font-size: 18px; font-weight: 600; color: #334155; margin-top: 22px; margin-bottom: 12px; }
        h4 { font-size: 16px; font-weight: 600; color: #475569; margin-top: 18px; margin-bottom: 10px; }
        h5, h6 { font-size: 14px; font-weight: 600; color: #64748B; margin-top: 16px; margin-bottom: 8px; }
        p { margin: 8px 0; font-size: 14px; }
        ul, ol { margin: 12px 0; padding-left: 24px; }
        li { margin: 6px 0; font-size: 14px; }
        strong { font-weight: 600; color: #1E293B; }
        em { font-style: italic; color: #64748B; }
        code { background: #F3F4F6; color: #E11D48; padding: 2px 6px; border-radius: 4px; font-family: 'Monaco', 'Menlo', monospace; font-size: 13px; }
        pre { background: #282C34; color: #ABB2BF; padding: 16px; border-radius: 8px; margin: 16px 0; overflow-x: auto; }
        pre code { background: transparent; color: inherit; padding: 0; }
        blockquote { margin: 16px 0; padding: 12px 16px; background: #F3F4F6; border-left: 4px solid #7C3AED; color: #64748B; }
        blockquote p { margin: 0; }
        hr { border: none; border-top: 2px solid #E2E8F0; margin: 24px 0; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
        th, td { padding: 8px 12px; border: 1px solid #E2E8F0; text-align: left; }
        th { background: #F9FAFB; font-weight: 600; color: #374151; }
        tr:nth-child(even) { background: #F9FAFB; }
        a { color: #7C3AED; text-decoration: none; }
      </style>
      ${htmlContent}
    </div>
  `

  // PDF 配置
  const opt = {
    margin: [15, 15, 15, 15],
    filename: `PRD文档_${new Date().toISOString().slice(0, 10)}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }

  // 生成并下载 PDF
  html2pdf().set(opt).from(styledHtml).save()
}

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

// 获取已回答问题数量
const getAnsweredQuestionCount = () => {
  if (!project.value?.analysisState?.userResponses) return 0
  // userResponses 是一个数组 [[key, value], ...]
  return project.value.analysisState.userResponses.length
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

    // 计算正确的起始步骤：
    // - 如果有results，说明之前的步骤已经完成，应该从下一步开始
    // - 例如：3个结果说明步骤0（信息采集）已完成，应该从步骤1（决策分析）开始
    // - currentStepIndex 可能不准确（由于之前的bug），所以优先使用结果数量来判断
    const resultsCount = state.results?.length || 0
    let startFromStep = 0

    // 每个步骤产生3个结果，所以根据结果数量推断已完成步骤数
    // 3个结果 = 步骤0完成，从步骤1开始
    // 6个结果 = 步骤0和1完成，从步骤2开始
    const completedSteps = Math.floor(resultsCount / 3)
    startFromStep = completedSteps

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
      // userResponses 在保存时是 Array.from(Map)，恢复时直接用数组构造Map
      userResponses: new Map(state.userResponses || [])
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
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
  height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  align-items: center;

  .action-btn {
    display: inline-flex;
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
    white-space: nowrap;

    svg {
      flex-shrink: 0;
    }

    span {
      line-height: normal;
    }

    &:hover {
      background: #F1F5F9;
      color: #7C3AED;
    }

    &.danger:hover {
      background: #FEF2F2;
      color: #EF4444;
    }
  }
}

// === 分析结果 ===
.analysis-results-view {
  background: white;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #F1F5F9;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

// === 头部 ===
.results-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #FAFAFA;
  border-bottom: 1px solid #F1F5F9;
  color: #1E293B;
  font-size: 16px;
  font-weight: 600;

  svg {
    width: 20px;
    height: 20px;
  }
}

// === 内容区域 ===
.results-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// === Tab 切换 ===
.results-tabs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 0;
  background: white;
  border-bottom: 1px solid #F1F5F9;
  margin-bottom: 4px;
}

.tabs-left {
  display: flex;
  gap: 32px;
}

.tab-button {
  position: relative;
  padding: 0 0 12px;
  background: transparent;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: #94A3B8;
  cursor: pointer;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    color: #7C3AED;
  }

  &.active {
    color: #7C3AED;

    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background: #7C3AED;
      border-radius: 2px 2px 0 0;
    }
  }
}

.export-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: linear-gradient(135deg, #7C3AED, #4F46E5);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.2);
  margin-left: auto;
  align-self: flex-end;
  position: relative;
  top: -8px;

  &:hover {
    background: linear-gradient(135deg, #6D28D9, #4338CA);
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
  }
}

// === 分析结果列表 ===
.analysis-results {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  // 修复 markdown-renderer 下第一个 h1 的 margin-top
  :deep(.markdown-renderer) h1:first-child {
    margin-top: 0;
  }
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
  margin-bottom: 12px;
}

.result-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1E293B;
}

.result-content {
  margin: 0;
  font-size: 15px;
  color: #475569;
  line-height: 1.7;

  :deep(p) {
    font-size: 15px;
    color: #475569;
    line-height: 1.7;
  }
}

// === 空状态 ===
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9CA3AF;
  padding: 60px 20px;
}

.empty-icon {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.pulse-dot {
  width: 12px;
  height: 12px;
  background: #7C3AED;
  border-radius: 50%;
  animation: pulseDot 1.4s ease-in-out infinite;

  &:nth-child(1) {
    animation-delay: 0s;
  }

  &:nth-child(2) {
    animation-delay: 0.2s;
  }

  &:nth-child(3) {
    animation-delay: 0.4s;
  }
}

@keyframes pulseDot {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.empty-state p {
  margin: 0;
  font-size: 14px;
  animation: fadeInText 2s ease-in-out infinite;

  @keyframes fadeInText {
    0%, 100% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
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

  // 只针对装饰性的大 SVG 图标
  > svg {
    width: 64px;
    height: 64px;
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

  .no-results-actions {
    display: flex;
    gap: 12px;
    margin-top: 20px;
    justify-content: center;

    .action-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 0 24px;
      height: 40px;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      color: #64748B;
      cursor: pointer;
      transition: all 0.2s ease;

      svg {
        flex-shrink: 0;
      }

      span {
        line-height: 1;
      }

      &:hover {
        border-color: #A78BFA;
        color: #7C3AED;
        transform: translateY(-1px);
      }

      &.primary {
        background: linear-gradient(135deg, #7C3AED, #4F46E5);
        border-color: transparent;
        color: white;

        &:hover {
          border-color: transparent;
          color: white;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }
      }
    }
  }
}
</style>
