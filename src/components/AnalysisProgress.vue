<template>
  <div class="timeline-stepper">
    <!-- 头部 -->
    <div class="stepper-header">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 12l2 2 4-4"/>
        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c.78 0 1.53.1 2.25.28"/>
        <path d="M22 5l-9 9-4-4"/>
      </svg>
      <span class="header-title">分析流程</span>
      <span class="header-badge">{{ completedCount }}/{{ steps.length }}</span>
    </div>

    <!-- 时间轴步骤列表 -->
    <div class="timeline-list">
      <div
        v-for="(step, index) in steps"
        :key="step.id"
        class="timeline-step"
      >
        <!-- 左侧状态指示器 -->
        <div class="step-indicator">
          <!-- 圆点图标 -->
          <div class="step-dot" :class="`dot-${step.status}`">
            <!-- 已完成：绿色对勾 -->
            <svg v-if="step.status === 'completed'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <path d="M20 6L9 17L4 12"/>
            </svg>
            <!-- 进行中：蓝色旋转动画 -->
            <div v-else-if="step.status === 'active'" class="spinner"></div>
            <!-- 未开始：无内容（空心圆） -->
          </div>

          <!-- 连接线 -->
          <div v-if="index < steps.length - 1" class="step-connector" :class="`connector-${step.status}`"></div>
          <!-- 最后一步的延伸线 -->
          <div v-else class="step-connector connector-end" :class="`connector-${step.status}`"></div>
        </div>

        <!-- 右侧内容卡片 -->
        <div class="step-card" :class="`card-${step.status}`">
          <div class="card-title">{{ step.title }}</div>
          <div class="card-subtitle">{{ step.subtitle }}</div>
          <div class="card-desc">{{ step.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

interface Step {
  id: string
  title: string
  subtitle: string
  description: string
  status: 'pending' | 'active' | 'completed'
}

const steps = ref<Step[]>([
  {
    id: 'info-collection',
    title: '信息采集',
    subtitle: '并行执行3个子Agent',
    description: '同时执行需求分析、用户研究、竞品分析，全面收集产品信息',
    status: 'pending'
  },
  {
    id: 'decision-analysis',
    title: '决策分析',
    subtitle: '顺序执行3个子Agent',
    description: '依次执行信息融合、产品决策、PRD输出结构，确定产品方案',
    status: 'pending'
  },
  {
    id: 'prd-generation',
    title: 'PRD生成',
    subtitle: '按PRD结构生成文档',
    description: '基于PRD输出结构，生成完整的产品需求文档（PRD）',
    status: 'pending'
  }
])

const completedCount = computed(() =>
  steps.value.filter(s => s.status === 'completed').length
)

// 更新步骤状态
const updateStep = (id: string, status: 'pending' | 'active' | 'completed') => {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, -1)
  const beforeState = steps.value.map(s => ({ id: s.id, status: s.status }))
  console.log(`[AnalysisProgress ${timestamp}] updateStep START:`, { id, status, beforeState })

  // 特殊处理重置信号
  if (id === '__reset__') {
    console.log('[AnalysisProgress] Reset signal received, resetting all steps to pending')
    reset()
    // 重要：重置后等待 Vue 更新完成，确保 UI 渲染 'pending' 状态
    nextTick(() => {
      console.log('[AnalysisProgress] Reset complete, UI updated to pending')
    })
    return
  }

  const stepIndex = steps.value.findIndex(s => s.id === id)
  if (stepIndex === -1) {
    // 子步骤ID（如 requirement, user-research 等），不处理
    console.log(`[AnalysisProgress] Skipping sub-step: ${id}`)
    return
  }

  const step = steps.value[stepIndex]
  const oldStatus = step.status
  step.status = status
  console.log(`[AnalysisProgress] Step ${id} status changed: ${oldStatus} -> ${status}`)
  console.log(`[AnalysisProgress] After update:`, steps.value.map(s => ({ id: s.id, status: s.status })))
}

// 重置所有步骤
const reset = () => {
  console.log('[AnalysisProgress] reset() called, setting all steps to pending')
  steps.value.forEach((s) => {
    s.status = 'pending'
  })
  console.log('[AnalysisProgress] reset() complete, all steps:', steps.value.map(s => ({ id: s.id, status: s.status })))
}

// 启动分析（激活第一步）
const startAnalysis = () => {
  console.log('[AnalysisProgress] startAnalysis() called, activating first step')
  steps.value[0].status = 'active'
}

// 根据当前步骤索引初始化状态（用于断点续传）
const initFromStep = (currentStepIndex: number) => {
  // currentStepIndex 是下一个要执行的步骤索引（0-based）
  // 例如 currentStepIndex = 1 表示步骤 0 已完成，步骤 1 进行中
  console.log('[AnalysisProgress] initFromStep called with currentStepIndex:', currentStepIndex)

  // 边界检查：如果 currentStepIndex 超出范围，说明分析已完成
  if (currentStepIndex >= steps.value.length) {
    console.log('[AnalysisProgress] currentStepIndex out of bounds, marking all steps as completed')
    steps.value.forEach((s) => {
      s.status = 'completed'
    })
    return
  }

  steps.value.forEach((s, i) => {
    const oldStatus = s.status
    if (i < currentStepIndex) {
      s.status = 'completed'
    } else if (i === currentStepIndex) {
      s.status = 'active'
    } else {
      s.status = 'pending'
    }
    if (oldStatus !== s.status) {
      console.log(`  Step ${i} (${s.id}): ${oldStatus} -> ${s.status}`)
    }
  })
}

// 暴露方法供外部调用
defineExpose({
  updateStep,
  reset,
  startAnalysis,
  initFromStep
})
</script>

<style lang="less" scoped>
.timeline-stepper {
  background: white;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #F1F5F9;
  overflow: hidden;
}

// ========== 头部 ==========
.stepper-header {
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

.header-title {
  flex: 1;
}

.header-badge {
  padding: 4px 12px;
  background: #F5F3FF;
  color: #7C3AED;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

// ========== 时间轴列表 ==========
.timeline-list {
  padding: 14px;
}

.timeline-step {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  align-items: stretch;

  &:last-child {
    margin-bottom: 0;
  }
}

// ========== 左侧状态指示器 ==========
.step-indicator {
  position: relative;
  flex-shrink: 0;
  width: 20px;
}

.step-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  z-index: 1;

  // 已完成：绿色实心圆点
  &.dot-completed {
    background: #10B981;
    border: 2px solid #10B981;
    color: white;
  }

  // 进行中：紫色空心圆点
  &.dot-active {
    background: white;
    border: 2px solid #7C3AED;
  }

  // 未开始：灰色空心圆点
  &.dot-pending {
    background: white;
    border: 2px solid #E2E8F0;
  }
}

.spinner {
  width: 12px;
  height: 12px;
  border: 2px solid #E2E8F0;
  border-top-color: #7C3AED;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.step-connector {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: calc(100% + 16px);
  background: #E2E8F0;

  // 进行中：紫色实线
  &.connector-active {
    background: #7C3AED;
  }

  // 已完成：绿色实线
  &.connector-completed {
    background: #10B981;
  }
  &.connector-end {
    height: 100%;
  }
}

// ========== 右侧内容卡片 ==========
.step-card {
  flex: 1;
  padding: 8px 12px;
  background: white;
  border-radius: 10px;
  border: 1px solid #F1F5F9;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;

  // 进行中：紫色边框
  &.card-active {
    border-color: #7C3AED;
    // background: #F0F9FF;
  }

  // 已完成：绿色边框
  &.card-completed {
    border-color: #10B981;
  }
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #1E293B;
}

.card-subtitle {
  font-size: 13px;
  font-weight: 500;
  color: #1E293B;
//   margin-bottom: 8px;
}

.card-desc {
  font-size: 13px;
  color: #64748B;
  line-height: 1.6;
}
</style>
