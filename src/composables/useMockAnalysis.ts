import { watch, onMounted, nextTick } from 'vue'
import { useAnalysisStore } from '@/stores/analysis'
import { useProjectStore } from '@/stores/project'
import { mockAnalyzeAnalysis, createQuestionPromise } from '@/services/mockAnalysis'
import type { ClarifyingQuestion, ResultItem } from '@/types'
import { LogType } from '@/types'

// 全局变量
let questionResolver: ((value: { answer: string | string[], skipped: boolean }) => void) | null = null
let progressUpdater: ((stepId: string, status: 'active' | 'completed', description?: string) => void) | null = null
let isAnalysisStarted = false // 防止重复启动
let pendingStartStep: number | null = null // 待执行的起始步骤（不会被自动清除）
let checkAndStartCallCount = 0 // 防止 checkAndStart 被多次调用

// 导出函数供外部调用
export function resetAnalysisStartedFlag() {
  console.log('[useMockAnalysis] resetAnalysisStartedFlag called')
  isAnalysisStarted = false
}

export function setOverrideStartStep(step: number) {
  console.log('[useMockAnalysis] setOverrideStartStep called with:', step)
  pendingStartStep = step
  console.log('[useMockAnalysis] pendingStartStep is now:', pendingStartStep)
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
    console.log('[startMockAnalysis] Called with startFromStep:', startFromStep, 'isAnalysisStarted:', isAnalysisStarted)
    // 防止重复启动（无论从哪里开始，只要已启动就直接返回）
    if (isAnalysisStarted) {
      console.log('[startMockAnalysis] Already started, returning')
      return
    }
    isAnalysisStarted = true
    console.log('[startMockAnalysis] Set isAnalysisStarted to true')

    const idea = analysisStore.originalIdea
    if (!idea) {
      isAnalysisStarted = false
      return
    }

    console.log('[MockAnalysis] Starting analysis from step:', startFromStep, 'progressUpdater:', !!progressUpdater)

    try {
      await mockAnalyzeAnalysis(idea, {
      onLog: (message: string, type?: string) => {
        const logType = (type as LogType) || LogType.INFO
        analysisStore.addLog(message, logType)
      },
      onProgress: (stepId: string, status: 'active' | 'completed', description?: string) => {
        console.log('[useMockAnalysis] onProgress called:', stepId, status, 'progressUpdater:', !!progressUpdater)
        if (progressUpdater) {
          console.log('[useMockAnalysis] Calling progressUpdater with:', stepId, status, description)
          progressUpdater(stepId, status, description)
        } else {
          console.warn('[useMockAnalysis] progressUpdater is null, cannot update step status!')
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

        // 更新所有步骤为已完成状态
        if (progressUpdater) {
          const allSteps = ['info-collection', 'decision-analysis', 'prd-generation']
          allSteps.forEach(stepId => {
            progressUpdater(stepId, 'completed')
          })
          console.log('[MockAnalysis] All steps marked as completed')
        }

        // 分析完成后，更新项目状态为已完成，并清除分析状态
        if (projectStore.currentProject) {
          projectStore.updateProjectStatus(projectStore.currentProject.id, 'completed')
          projectStore.clearAnalysisState(projectStore.currentProject.id)
          console.log('[MockAnalysis] Analysis completed, project status updated to completed')
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
  const checkAndStart = async () => {
    console.log('[useMockAnalysis] checkAndStart called (call #' + (++checkAndStartCallCount) + '), currentState:', analysisStore.currentState, 'isAnalysisStarted:', isAnalysisStarted, 'results.length:', analysisStore.results.length, 'progressUpdater:', !!progressUpdater, 'pendingStartStep:', pendingStartStep)

    if (analysisStore.currentState === 'analyzing') {
      // 如果分析已经启动，不再重复启动
      if (isAnalysisStarted) {
        console.log('[useMockAnalysis] Analysis already started, skipping checkAndStart')
        return
      }

      console.log('[useMockAnalysis] About to wait for progressUpdater...')
      // 等待 progressUpdater 被设置（如果还没有的话）
      let waitCount = 0
      while (!progressUpdater && waitCount < 50) {
        console.log('[useMockAnalysis] Waiting for progressUpdater to be set...', waitCount)
        await new Promise(resolve => setTimeout(resolve, 10))
        waitCount++
      }

      if (!progressUpdater) {
        console.error('[useMockAnalysis] progressUpdater not set after waiting, cannot start analysis!')
        return
      }

      console.log('[useMockAnalysis] progressUpdater is ready, starting analysis')

      // 如果是全新分析（没有结果），强制重置启动标志
      // 这处理了在工作台页面创建新项目的情况
      let needsReset = false
      if (analysisStore.results.length === 0) {
        if (isAnalysisStarted) {
          console.log('[useMockAnalysis] Fresh analysis detected, resetting isAnalysisStarted flag')
          isAnalysisStarted = false
        }
        // 重置 progressUpdater 中的步骤状态（通过通知 progressRef 重置）
        if (progressUpdater) {
          // 发送重置信号
          progressUpdater('__reset__', 'pending' as any)
          needsReset = true
        }
      } else {
        // 有结果，说明是继续分析或断点续传
        // 等待 Vue 更新，确保 WorkspaceView 的 watch 先运行并恢复步骤状态
        console.log('[useMockAnalysis] Continuing analysis - waiting for step state restoration')
        await nextTick()
        await nextTick() // 双重 nextTick 确保所有 watch 都运行完成
      }

      // 如果发生了重置，等待 Vue 更新完成，确保 UI 渲染 'pending' 状态
      if (needsReset) {
        await nextTick()
        console.log('[useMockAnalysis] UI updated after reset, now starting analysis')
      }

      // 优先使用 pendingStartStep（断点续传），否则根据结果数量计算
      const startFromStep = pendingStartStep !== null ? pendingStartStep : analysisStore.results.length
      // 清除 override，避免影响下次启动
      pendingStartStep = null

      console.log('[useMockAnalysis] Starting mock analysis from step:', startFromStep)
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
      console.log('[useMockAnalysis] currentState changed:', oldState, '->', newState, 'hasMounted:', hasMounted)

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
        console.log('[useMockAnalysis] Entering analyzing state, hasMounted:', hasMounted)
        // 如果组件已挂载，直接启动；否则 onMounted 会处理
        if (hasMounted) {
          checkAndStart()
        }
      }
    }
  )
}
