<template>
  <div class="main-layout">
    <!-- 左侧导航栏 -->
    <Sidebar :current-view="currentView" @view-change="handleViewChange" />

    <!-- 主内容区 -->
    <div class="main-content">
      <router-view></router-view>
    </div>

    <!-- 新建项目弹窗 -->
    <NewProjectModal
      :show="showNewProjectModal"
      @close="showNewProjectModal = false"
      @created="handleProjectCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAnalysisStore } from '@/stores/analysis'
import { useProjectStore } from '@/stores/project'
import { LogType } from '@/types'
import Sidebar from '@/components/Sidebar.vue'
import NewProjectModal from '@/components/NewProjectModal.vue'

const router = useRouter()
const route = useRoute()
const analysisStore = useAnalysisStore()
const projectStore = useProjectStore()

const showNewProjectModal = ref(false)

// 当前分析步骤索引（用于断点续传）
const currentStepIndex = ref(0)

// 当前视图根据路由计算
const currentView = computed(() => route.name as string)

// 监听自定义事件打开弹窗
const handleOpenModal = () => {
  showNewProjectModal.value = true
}

onMounted(() => {
  window.addEventListener('open-new-project-modal', handleOpenModal)
})

onUnmounted(() => {
  window.removeEventListener('open-new-project-modal', handleOpenModal)
})

// 监听来自侧边栏的事件
const handleViewChange = (view: string) => {
  if (view === 'new-project') {
    showNewProjectModal.value = true
  } else if (view === 'workspace') {
    // 点击工作台导航时不传递项目ID（空白工作台）
    router.push({ name: 'workspace' })
  } else {
    router.push({ name: view })
  }
}

// 项目创建后跳转到工作台并开始分析
const handleProjectCreated = (data: { description: string }) => {
  // 在 projectStore 中创建项目
  const newProject = projectStore.createProject(data)
  // 在 analysisStore 中启动分析
  analysisStore.startAnalysis(data.description)
  // 切换到工作台视图并传递项目ID
  router.push({ name: 'workspace', params: { projectId: newProject.id } })
  showNewProjectModal.value = false
}

// 监听分析状态，提供即时反馈
watch(
  () => analysisStore.currentState,
  (newState) => {
    // 进入 analyzing 状态且没有日志时，立即添加反馈
    if (newState === 'analyzing' && analysisStore.logs.length === 0) {
      analysisStore.addLog('开始分析产品想法...', LogType.INFO)
    }

    // 分析进行中时，保存分析状态到项目
    if (newState === 'analyzing' && projectStore.currentProject) {
      // 当前步骤索引 = 已完成的结果数量
      currentStepIndex.value = analysisStore.results.length
      projectStore.saveAnalysisState(projectStore.currentProject.id, analysisStore, currentStepIndex.value)
    }

    // 分析完成时，更新项目状态并保存结果
    if (newState === 'completed' && projectStore.currentProject) {
      const currentProject = projectStore.currentProject

      // 更新项目状态为已完成
      projectStore.updateProjectStatus(currentProject.id, 'completed')

      // 保存分析结果到项目
      currentProject.results = analysisStore.results.map(r => ({
        id: r.id,
        title: r.title,
        content: r.content,
        order: r.order
      }))

      // 清除分析状态（已完成无需恢复）
      projectStore.clearAnalysisState(currentProject.id)

      // 重置步骤索引
      currentStepIndex.value = 0

      // 更新项目时间戳
      currentProject.updatedAt = Date.now()
    }
  }
)

// 深度监听分析状态变化，自动保存进度
watch(
  () => analysisStore,
  () => {
    // 只在分析进行中且有当前项目时保存
    if (analysisStore.currentState === 'analyzing' && projectStore.currentProject) {
      currentStepIndex.value = analysisStore.results.length
      projectStore.saveAnalysisState(projectStore.currentProject.id, analysisStore, currentStepIndex.value)
    }
  },
  { deep: true }
)
</script>

<style lang="less" scoped>
.main-layout {
  display: flex;
  min-height: 100vh;
  position: relative;
}

// 左侧导航栏固定
.main-layout :deep(.sidebar) {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 10;
}

// 主内容区域添加左边距（侧边栏宽度）并允许横向滚动
.main-content {
  flex: 1;
  margin-left: 240px; /* 侧边栏宽度 */
  background: #F8FAFC;
  overflow-x: auto;
  overflow-y: hidden;
  min-width: calc(1350px - 240px); /* 最小内容宽度 */

  // 隐藏横向滚动条
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */

  &::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
  }
}
</style>
