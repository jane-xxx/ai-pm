<template>
  <div class="project-management-view">
    <div class="page-header">
      <h1>项目管理</h1>
      <button class="create-btn" @click="handleCreateNew">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        新建项目
      </button>
    </div>

    <!-- 项目统计 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ projectCount }}</span>
          <span class="stat-label">总项目数</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ completedCount }}</span>
          <span class="stat-label">已完成</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ analyzingCount }}</span>
          <span class="stat-label">分析中</span>
        </div>
      </div>
    </div>

    <!-- 项目列表 -->
    <div class="projects-section">
      <div class="section-header">
        <h2>所有项目</h2>
        <div class="filter-tabs">
          <button
            v-for="tab in filterTabs"
            :key="tab.value"
            :class="['filter-tab', { active: activeFilter === tab.value }]"
            @click="activeFilter = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <div class="project-grid">
        <div
          v-for="project in filteredProjects"
          :key="project.id"
          class="project-card"
          @click="handleSelectProject(project)"
        >
          <div class="card-header">
            <h3>{{ project.name }}</h3>
            <span :class="['status-badge', `status-${project.status}`]">
              {{ getStatusText(project.status) }}
            </span>
          </div>
          <p class="card-description">{{ project.description }}</p>
          <div class="card-footer">
            <span class="card-time">{{ formatDate(project.createdAt) }}</span>
            <div class="card-actions">
              <button class="action-btn danger" @click.stop="handleDelete(project)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredProjects.length === 0" class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
          </svg>
          <p>{{ getEmptyText() }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useProjectStore } from '@/stores/project'
import { useAnalysisStore } from '@/stores/analysis'
import type { Project } from '@/stores/project'

const router = useRouter()
const projectStore = useProjectStore()
const { projects, currentProject } = storeToRefs(projectStore)
const analysisStore = useAnalysisStore()

const activeFilter = ref('all')

const filterTabs = [
  { label: '全部', value: 'all' },
  { label: '已完成', value: 'completed' },
  { label: '分析中', value: 'analyzing' },
  { label: '草稿', value: 'draft' }
]

// 统计数据
const projectCount = computed(() => projects.value.length)
const completedCount = computed(() => projects.value.filter(p => p.status === 'completed').length)
const analyzingCount = computed(() => projects.value.filter(p => p.status === 'analyzing').length)

// 过滤项目
const filteredProjects = computed(() => {
  if (activeFilter.value === 'all') {
    return projects.value
  }
  return projects.value.filter(p => p.status === activeFilter.value)
})

// 获取状态文本
const getStatusText = (status: Project['status']) => {
  const statusMap = {
    analyzing: '分析中',
    completed: '已完成',
    draft: '草稿'
  }
  return statusMap[status]
}

// 格式化日期
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      return '刚刚'
    }
    return `${hours}小时前`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
}

// 获取空状态文本
const getEmptyText = () => {
  const textMap = {
    all: '还没有创建任何项目',
    completed: '还没有已完成的项目',
    analyzing: '没有正在分析的项目',
    draft: '还没有草稿项目'
  }
  return textMap[activeFilter.value]
}

// 选择项目 - 跳转到详情页面
const handleSelectProject = (project: Project) => {
  router.push({ name: 'project-detail', params: { id: project.id } })
}

// 新建项目 - 通知 MainLayout 打开弹窗
const handleCreateNew = () => {
  window.dispatchEvent(new CustomEvent('open-new-project-modal'))
}


// 删除项目
const handleDelete = (project: Project) => {
  if (confirm(`确定要删除项目"${project.name}"吗？`)) {
    projectStore.deleteProject(project.id)
  }
}
</script>

<style lang="less" scoped>
.project-management-view {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1E293B;
}

.create-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
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

// === 统计卡片 ===
.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;

  &.blue {
    background: #EFF6FF;
    color: #3B82F6;
  }

  &.green {
    background: #F0FDF4;
    color: #10B981;
  }

  &.orange {
    background: #FFF7ED;
    color: #F97316;
  }
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1E293B;
}

.stat-label {
  font-size: 13px;
  color: #64748B;
}

// === 项目列表 ===
.projects-section {
  background: white;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #F1F5F9;
}

.section-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1E293B;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
  padding: 8px 16px;
  background: none;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  color: #64748B;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: #7C3AED;
  }

  &.active {
    background: #F5F3FF;
    color: #7C3AED;
    font-weight: 500;
  }
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 24px;
}

.project-card {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #A78BFA;
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.15);
    transform: translateY(-2px);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.card-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #1E293B;
}

.status-badge {
  padding: 4px 10px;
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

.card-description {
  margin: 0 0 16px;
  font-size: 13px;
  color: #64748B;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-time {
  font-size: 12px;
  color: #94A3B8;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  cursor: pointer;
  color: #64748B;
  transition: all 0.2s ease;

  &:hover {
    border-color: #CBD5E1;
    color: #1E293B;
  }

  &.danger:hover {
    border-color: #FECACA;
    color: #EF4444;
  }
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #94A3B8;

  svg {
    margin-bottom: 16px;
    opacity: 0.4;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
}

</style>
