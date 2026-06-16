import { watch, onMounted } from 'vue'
import { useAnalysisStore } from '@/stores/analysis'
import { useProjectStore } from '@/stores/project'
import { mockAnalyzeAnalysis, createQuestionPromise, STEP_IDS } from '@/services/mockAnalysis'
import type { ClarifyingQuestion, ResultItem } from '@/types'
import { LogType } from '@/types'

// 全局变量
let questionResolver: ((value: { answer: string | string[], skipped: boolean }) => void) | null = null
let progressUpdater: ((stepId: string, status: 'active' | 'completed', description?: string) => void) | null = null
let isAnalysisStarted = false // 防止重复启动
let overrideStartStep: number | null = null // 强制从指定步骤开始（用于断点续传）

// 导出函数供外部调用
export function resetAnalysisStartedFlag() {
  isAnalysisStarted = false
}

export function setOverrideStartStep(step: number) {
  overrideStartStep = step
}

export function submitAnswer(answer: string | string[], skipped: boolean) {
  if (questionResolver) {
    questionResolver({ answer, skipped })
    questionResolver = null
  }
}

// 设置进度更新器
export function setProgressUpdater(fn: (stepId: string, status: 'active' | 'completed', description?: string) => void) {
  progressUpdater = fn
}

export function useMockAnalysis() {
  const analysisStore = useAnalysisStore()
  const projectStore = useProjectStore()

  // 组件内状态：防止同一个组件多次启动
  let hasMounted = false

  // 开始模拟分析
  const startMockAnalysis = async (startFromStep: number = 0) => {
    // 防止重复启动（无论从哪里开始，只要已启动就直接返回）
    if (isAnalysisStarted) return
    isAnalysisStarted = true

    const idea = analysisStore.originalIdea
    if (!idea) {
      isAnalysisStarted = false
      return
    }

    console.log('[MockAnalysis] Starting analysis from step:', startFromStep, 'progressUpdater:', !!progressUpdater)

    // 如果是从头开始（startFromStep = 0），立即激活第一步
    if (startFromStep === 0 && progressUpdater) {
      console.log('[MockAnalysis] Activating first step immediately')
      progressUpdater(STEP_IDS.REQUIREMENT, 'active')
    }

    try {
      await mockAnalyzeAnalysis(idea, {
      onLog: (message: string, type?: string) => {
        const logType = (type as LogType) || LogType.INFO
        analysisStore.addLog(message, logType)
      },
      onProgress: (stepId: string, status: 'active' | 'completed', description?: string) => {
        if (progressUpdater) {
          progressUpdater(stepId, status, description)
        }
      },
      onQuestion: async (question: ClarifyingQuestion) => {
        // 创建 Promise 等待用户回答
        const { promise, resolve } = createQuestionPromise()
        questionResolver = resolve

        // 设置问题，触发 PAUSED 状态
        analysisStore.setQuestion(question)

        // 等待用户回答
        return promise
      },
      onResult: (result: ResultItem) => {
        analysisStore.addResult({
          ...result,
          order: analysisStore.results.length + 1
        })
      },
      onComplete: () => {
        analysisStore.completeAnalysis()
        isAnalysisStarted = false // 完成后重置标志
        // 分析完成后，清除项目的分析状态（因为已完成，不需要再续传）
        if (projectStore.currentProject) {
          projectStore.clearAnalysisState(projectStore.currentProject.id)
        }
      },
      onStepComplete: (stepIndex: number) => {
        // 每步完成后，保存分析状态到项目（用于断点续传）
        if (projectStore.currentProject) {
          projectStore.saveAnalysisState(
            projectStore.currentProject.id,
            analysisStore,
            stepIndex // 保存下一步要执行的索引
          )
          console.log('[MockAnalysis] Saved analysis state, currentStepIndex:', stepIndex)
        }
      }
    }, { startFromStep })
    } catch (error) {
      console.error('Mock analysis error:', error)
      isAnalysisStarted = false // 出错时重置标志
    }
  }

  // 检查是否需要开始分析（立即执行，不使用 setTimeout）
  const checkAndStart = () => {
    if (analysisStore.currentState === 'analyzing') {
      // 优先使用 overrideStartStep（断点续传），否则根据结果数量计算
      const startFromStep = overrideStartStep !== null ? overrideStartStep : analysisStore.results.length
      // 清除 override，避免影响下次启动
      overrideStartStep = null
      startMockAnalysis(startFromStep)
    }
  }

  // 组件挂载时检查（处理导航时状态已存在的情况）
  onMounted(() => {
    hasMounted = true
    // 检查是否需要启动分析（包括断点续传情况）
    checkAndStart()
  })

  // 监听状态变化，自动开始分析
  watch(
    () => analysisStore.currentState,
    (newState, oldState) => {
      // 当回到 INPUT 状态时，重置标志（表示分析被重置）
      if (newState === 'input') {
        isAnalysisStarted = false
      }
      // 完成时也重置标志
      if (newState === 'completed') {
        isAnalysisStarted = false
      }
      // 进入 analyzing 状态时启动分析（包括从断点继续）
      if (newState === 'analyzing' && oldState !== 'analyzing') {
        // 如果组件已挂载，直接启动；否则 onMounted 会处理
        if (hasMounted) {
          checkAndStart()
        }
      }
    }
  )
}
