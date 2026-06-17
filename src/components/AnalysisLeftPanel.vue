<template>
  <div class="left-panel">
    <!-- 项目选择器 -->
    <div class="project-selector">
      <div class="selector-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span>当前项目</span>
      </div>
      <select v-model="selectedProjectId" class="project-select" @change="handleProjectChange">
        <option v-for="project in projects" :key="project.id" :value="project.id">
          {{ project.name }}
        </option>
      </select>
      <button class="new-project-btn" @click="showNewProjectPanel = true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        新建项目
      </button>
    </div>

    <!-- 当前项目内容 -->
    <div class="current-project-content">
      <div class="project-label">项目描述</div>
      <div class="project-text">{{ currentProject?.description || '暂无描述' }}</div>
    </div>

    <!-- 分析流程 -->
    <AnalysisProgress ref="progressRef" />

    <!-- 实时日志 -->
    <div class="log-section">
      <div class="section-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7894 19.4142 21.4142C19.7894 21.7893 20 20.5304 20 20V8L14 2Z"/>
          <path d="M14 2V8H20"/>
        </svg>
        <span>实时日志</span>
      </div>

      <div class="log-list">
        <div
          v-for="log in logs"
          :key="log.id"
          class="log-entry fade-in"
          :class="`log-${log.type}`"
        >
          <span class="log-time">{{ formatTime(log.timestamp) }}</span>
          <span class="log-text">{{ log.message }}</span>
        </div>

        <!-- 断点问题 -->
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
          <span>等待分析开始...</span>
        </div>
      </div>
    </div>

    <!-- 新建项目侧滑面板 -->
    <Transition name="slide-panel">
      <div v-if="showNewProjectPanel" class="new-project-panel">
        <div class="panel-header">
          <h3>新建分析项目</h3>
          <button class="close-btn" @click="showNewProjectPanel = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="panel-content">
          <div class="input-group">
            <label>项目名称</label>
            <input v-model="newProjectName" type="text" placeholder="给项目起个名字" class="input-field" />
          </div>

          <div class="input-group">
            <label>产品想法描述</label>
            <textarea v-model="newProjectIdea" class="textarea-field" placeholder="描述你的产品想法..." rows="5"></textarea>
            <div class="char-count">{{ newProjectIdea.length }} 字符</div>
          </div>

          <button
            class="start-analysis-btn"
            :disabled="!newProjectName.trim() || !newProjectIdea.trim()"
            @click="handleStartAnalysis"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            开始分析
          </button>
        </div>
      </div>
    </Transition>

    <!-- 遮罩层 -->
    <Transition name="fade">
      <div v-if="showNewProjectPanel" class="overlay" @click="showNewProjectPanel = false"></div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAnalysisStore } from '@/stores/analysis'
import { useProjectStore } from '@/stores/project'
import { useMockAnalysis, submitAnswer, setProgressUpdater } from '@/composables/useMockAnalysis'
import AnalysisProgress from './AnalysisProgress.vue'
import ClarifyingQuestionCard from './ClarifyingQuestionCard.vue'

interface Project {
  id: string
  name: string
  description: string
  createdAt: number
}

const analysisStore = useAnalysisStore()
const projectStore = useProjectStore()
const { logs, currentQuestion, originalIdea } = storeToRefs(analysisStore)

// 项目管理
const projects = ref<Project[]>([
  { id: '1', name: 'AI面试产品', description: '我要做一个AI面试产品，针对应届生，帮助企业更高效地完成初筛和面试评估。', createdAt: Date.now() }
])
const selectedProjectId = ref('1')
const showNewProjectPanel = ref(false)
const newProjectName = ref('')
const newProjectIdea = ref('')

const progressRef = ref<InstanceType<typeof AnalysisProgress> | null>(null)

// 当前项目
const currentProject = computed(() => {
  return projects.value.find(p => p.id === selectedProjectId.value)
})

// 监听当前项目描述变化
watch(() => originalIdea.value, (newValue) => {
  if (newValue && selectedProjectId.value) {
    const project = projects.value.find(p => p.id === selectedProjectId.value)
    if (project) {
      project.description = newValue
    }
  }
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

  // 回答问题后立即保存状态（用于断点续传）
  const currentProject = projectStore.currentProject
  if (currentProject) {
    projectStore.saveAnalysisState(
      currentProject.id,
      analysisStore,
      0 // 信息采集阶段的步骤索引
    )
  }
}

// 切换项目
const handleProjectChange = () => {
  const project = currentProject.value
  if (project) {
    // 这里可以加载该项目的历史分析结果
  }
}

// 开始新分析
const handleStartAnalysis = () => {
  if (!newProjectName.value.trim() || !newProjectIdea.value.trim()) return

  // 创建新项目
  const newProject: Project = {
    id: String(Date.now()),
    name: newProjectName.value.trim(),
    description: newProjectIdea.value.trim(),
    createdAt: Date.now()
  }

  projects.value.unshift(newProject)
  selectedProjectId.value = newProject.id

  // 重置表单
  newProjectName.value = ''
  newProjectIdea.value = ''
  showNewProjectPanel.value = false

  // 开始分析
  analysisStore.startAnalysis(newProject.description)
}
</script>

<style lang="less" scoped>
.left-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  height: 100vh;
  overflow-y: auto;
  position: relative;
}

// === 项目选择器 ===
.project-selector {
  background: white;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #E2E8F0;
}

.selector-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  color: #64748B;
  font-size: 12px;
  font-weight: 500;
}

.project-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 13px;
  color: #1E293B;
  background: white;
  cursor: pointer;
  margin-bottom: 8px;

  &:focus {
    outline: none;
    border-color: #A78BFA;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
  }
}

.new-project-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 8px 12px;
  background: linear-gradient(135deg, #7C3AED, #4F46E5);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3);
  }
}

// === 当前项目内容 ===
.current-project-content {
  background: white;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #E2E8F0;
}

.project-label {
  font-size: 12px;
  color: #94A3B8;
  margin-bottom: 8px;
}

.project-text {
  font-size: 13px;
  color: #64748B;
  line-height: 1.6;
}

// === 实时日志 ===
.log-section {
  background: white;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #E2E8F0;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 200px;
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

// === 新建项目侧滑面板 ===
.new-project-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 420px;
  height: 100vh;
  background: white;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #F1F5F9;

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #1E293B;
    margin: 0;
  }
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F1F5F9;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #64748B;
  transition: all 0.2s ease;

  &:hover {
    background: #E2E8F0;
    color: #1E293B;
  }
}

.panel-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #1E293B;
  margin-bottom: 8px;
}

.input-field,
.textarea-field {
  width: 100%;
  padding: 12px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #A78BFA;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
  }

  &::placeholder {
    color: #CBD5E1;
  }
}

.textarea-field {
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #94A3B8;
  margin-top: 6px;
}

.start-analysis-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: linear-gradient(135deg, #7C3AED, #4F46E5);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

// === 遮罩层 ===
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 99;
}

// === 动画 ===
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

.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: transform 0.3s ease;
}

.slide-panel-enter-from {
  transform: translateX(100%);
}

.slide-panel-leave-to {
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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
