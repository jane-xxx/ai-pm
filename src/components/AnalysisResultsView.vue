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
    <div v-else class="results-content">
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
      <div ref="resultsContentRef" class="analysis-results">
        <div
          v-for="(result, index) in filteredResults"
          :key="`${result.id}-${index}`"
          class="result-item fade-in"
        >
          <div class="result-header" v-if="result.title">
            <h4 class="result-title">{{ result.title }}</h4>
          </div>
          <div class="result-content">
            <StreamingMarkdown
              :content="result.content"
              :enabled="result.isStreaming ?? false"
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
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useAnalysisStore } from '@/stores/analysis'
import { useAutoScroll } from '@/composables/useAutoScroll'
import StreamingMarkdown from './StreamingMarkdown.vue'
import MarkdownIt from 'markdown-it'

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
    initResultsScroll(element)
  }
})

// 是否显示 loading 状态
const showLoading = computed(() => {
  return results.value.length === 0
})

// PRD 结果（用于导出）
const prdResult = computed(() => {
  return results.value.find(r => r.id === 'r7')
})

// 导出 PRD 文档为 PDF
const exportPRD = async () => {
  const prd = prdResult.value
  if (!prd) return

  // 动态导入 html2pdf
  const html2pdf = (await import('html2pdf.js')).default

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

// 获取指定 tab 的结果
const getTabResults = (tabKey: string) => {
  const tab = tabs.find(t => t.key === tabKey)
  if (!tab) return []

  const allIds = [...tab.infoCollectionIds, ...tab.decisionAnalysisIds, ...tab.prdIds]
  return results.value.filter(r => allIds.includes(r.id))
}

// 获取指定 tab 的结果数量
const getTabCount = (tabKey: string) => {
  const tabResults = getTabResults(tabKey)
  const tab = tabs.find(t => t.key === tabKey)
  if (!tab) return 0

  const totalCount = tab.infoCollectionIds.length + tab.decisionAnalysisIds.length + tab.prdIds.length
  return `${tabResults.length}/${totalCount}`
}

// 判断指定 tab 是否已完成
const isTabCompleted = (tabKey: string) => {
  const tab = tabs.find(t => t.key === tabKey)
  if (!tab) return false

  const allIds = [...tab.infoCollectionIds, ...tab.decisionAnalysisIds, ...tab.prdIds]
  const tabResults = results.value.filter(r => allIds.includes(r.id))
  return tabResults.length === allIds.length
}

// 当前 tab 的过滤结果
const filteredResults = computed(() => {
  return getTabResults(activeTab.value)
})

// 监听结果长度变化，当结果被清空时（新建项目）重置 tab
watch(() => results.value.length, (newLength, oldLength) => {
  // 如果从有结果变为无结果，说明是新建项目，重置 tab
  if (oldLength > 0 && newLength === 0) {
    activeTab.value = 'info-collection'
  }
})

// 监听结果变化，自动切换到下一个 tab
watch(results, (newResults) => {
  // 检查信息采集是否完成（r1, r2, r3 都有了）
  const infoCollectionIds = ['r1', 'r2', 'r3']
  const hasInfoCollection = newResults.some(r => infoCollectionIds.includes(r.id))
  const infoCollectionComplete = infoCollectionIds.every(id =>
    newResults.some(r => r.id === id)
  )

  // 如果信息采集已完成且当前还在信息采集tab，切换到决策分析
  if (infoCollectionComplete && activeTab.value === 'info-collection') {
    activeTab.value = 'decision-analysis'
  }

  // 检查决策分析是否完成（r4, r5, r6 都有了）
  const decisionAnalysisIds = ['r4', 'r5', 'r6']
  const hasDecisionAnalysis = newResults.some(r => decisionAnalysisIds.includes(r.id))
  const decisionAnalysisComplete = decisionAnalysisIds.every(id =>
    newResults.some(r => r.id === id)
  )

  // 如果决策分析已完成且当前还在决策分析tab，切换到PRD生成
  if (decisionAnalysisComplete && activeTab.value === 'decision-analysis') {
    activeTab.value = 'prd-generation'
  }
}, { deep: true })
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
  padding: 8px 16px;
  background: linear-gradient(135deg, #7C3AED, #4F46E5);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.2);
  position: relative;
  top: -6px;

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
  font-size: 15px;
  font-weight: 600;
  color: #1E293B;
}

.result-content {
  margin: 0;
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
</style>
