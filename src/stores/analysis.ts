import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AnalysisState, LogType, type LogEntry, type ClarifyingQuestion, type ResultItem } from '@/types'

export const useAnalysisStore = defineStore('analysis', () => {
  // 状态
  const currentState = ref<AnalysisState>(AnalysisState.INPUT)
  const originalIdea = ref('')
  const logs = ref<LogEntry[]>([])
  const results = ref<ResultItem[]>([])
  const currentQuestion = ref<ClarifyingQuestion | null>(null)
  const questionHistory = ref<ClarifyingQuestion[]>([])
  const userResponses = ref<Map<string, string | string[]>>(new Map())
  const activeStep = ref<string | null>(null)

  // 计算属性
  const isInput = computed(() => currentState.value === AnalysisState.INPUT)
  const isAnalyzing = computed(() => currentState.value === AnalysisState.ANALYZING)
  const isPaused = computed(() => currentState.value === AnalysisState.PAUSED)
  const isCompleted = computed(() => currentState.value === AnalysisState.COMPLETED)

  // 添加日志
  const addLog = (message: string, type: LogType = LogType.INFO) => {
    const log: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      type,
      message,
      timestamp: Date.now()
    }
    logs.value.push(log)
    return log.id
  }

  // 更新最后一条日志
  const updateLastLog = (type: LogType, message?: string) => {
    if (logs.value.length > 0) {
      const lastLog = logs.value[logs.value.length - 1]
      lastLog.type = type
      if (message) {
        lastLog.message = message
      }
    }
  }

  // 设置断点问题
  const setQuestion = (question: ClarifyingQuestion) => {
    currentQuestion.value = question
    currentState.value = AnalysisState.PAUSED
    updateLastLog(LogType.PAUSED, '等待更多信息...')
  }

  // 回答问题
  const answerQuestion = (answer: string | string[], skipped: boolean = false) => {
    if (!currentQuestion.value) return

    const questionId = currentQuestion.value.id
    // 兼容 Map 和普通对象
    if (typeof userResponses.value.set === 'function') {
      userResponses.value.set(questionId, answer)
    } else {
      userResponses.value[questionId] = answer
    }

    // 记录问题到历史
    questionHistory.value.push({
      ...currentQuestion.value,
      selectedAnswer: answer,
      skipped
    })

    // 添加日志
    if (skipped) {
      addLog(`${currentQuestion.value.question}: [假设: ${currentQuestion.value.defaultAssumption}]`, LogType.SUCCESS)
    } else {
      addLog(`${currentQuestion.value.question}: ${answer}`, LogType.SUCCESS)
    }

    // 清除当前问题，继续分析
    currentQuestion.value = null
    currentState.value = AnalysisState.ANALYZING
    currentState.value = AnalysisState.ANALYZING
  }

  // 添加结果
  const addResult = (item: ResultItem) => {
    results.value.push(item)
  }

  // 开始分析
  const startAnalysis = (idea: string) => {
    console.log('[AnalysisStore] startAnalysis called with idea:', idea)
    originalIdea.value = idea
    logs.value = []
    results.value = []
    questionHistory.value = []
    // userResponses 可能是 Map（首次）或普通对象（从 localStorage 恢复）
    if (typeof userResponses.value.clear === 'function') {
      userResponses.value.clear()
    } else {
      userResponses.value = new Map()
    }
    currentState.value = AnalysisState.ANALYZING
    console.log('[AnalysisStore] currentState set to ANALYZING')
  }

  // 完成分析
  const completeAnalysis = () => {
    currentState.value = AnalysisState.COMPLETED
    updateLastLog(LogType.SUCCESS, '分析完成！')
  }

  // 设置当前执行步骤
  const setActiveStep = (stepId: string | null) => {
    activeStep.value = stepId
  }

  // 重置
  const reset = () => {
    currentState.value = AnalysisState.INPUT
    originalIdea.value = ''
    logs.value = []
    results.value = []
    currentQuestion.value = null
    questionHistory.value = []
    // userResponses 可能是 Map（首次）或普通对象（从 localStorage 恢复）
    if (typeof userResponses.value.clear === 'function') {
      userResponses.value.clear()
    } else {
      userResponses.value = new Map()
    }
  }

  return {
    // 状态
    currentState,
    originalIdea,
    logs,
    results,
    currentQuestion,
    questionHistory,
    userResponses,
    activeStep,
    // 计算属性
    isInput,
    isAnalyzing,
    isPaused,
    isCompleted,
    // 方法
    addLog,
    updateLastLog,
    setQuestion,
    answerQuestion,
    addResult,
    startAnalysis,
    completeAnalysis,
    setActiveStep,
    reset
  }
})
