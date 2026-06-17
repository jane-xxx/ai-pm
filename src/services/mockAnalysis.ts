import type { ClarifyingQuestion, ResultItem } from '@/types'
import { analysisApi } from '@/api/analysisApi'
import { useAnalysisStore } from '@/stores/analysis'

// 步骤 ID 映射 - 对应 3 个主要流程阶段
export const STEP_IDS = {
  INFO_COLLECTION: 'info-collection',
  DECISION_ANALYSIS: 'decision-analysis',
  PRD_GENERATION: 'prd-generation'
}

// 子步骤 ID 映射 - 信息采集阶段的子步骤
export const SUB_STEP_IDS = {
  REQUIREMENT: 'requirement',
  USER_RESEARCH: 'user-research',
  COMPETITOR: 'competitor'
}

// 决策分析阶段的子步骤 ID 映射
export const DECISION_SUB_STEP_IDS = {
  INFO_FUSION: 'info-fusion',
  PRODUCT_DECISION: 'product-decision',
  PRD_STRUCTURE: 'prd-structure'
}

// 辅助函数：延迟
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 模拟分析流程 - 3个主要阶段
export async function mockAnalyzeAnalysis(
  idea: string,
  callbacks: {
    onLog: (message: string, type?: string) => void
    onProgress: (stepId: string, status: 'active' | 'completed', description?: string) => void
    onQuestion: (question: ClarifyingQuestion) => Promise<{ answer: string | string[], skipped: boolean }>
    onResult: (result: ResultItem) => void
    onComplete: () => void
    onStepComplete?: (stepIndex: number) => void
  },
  options: { startFromStep?: number } = {}
) {
  const { onLog, onProgress, onComplete, onQuestion: _onQuestion, onResult: _onResult, onStepComplete } = callbacks
  const { startFromStep = 0 } = options

  try {
    // 1. 启动分析会话
    const { analysisId } = await analysisApi.startAnalysis({
      idea,
      startFromStep
    })

    onLog('分析会话已启动', 'loading')

    // 2. 定义步骤执行器
    const steps = [
      { id: 1, name: '信息采集', execute: () => executeInfoCollection(analysisId, callbacks) },
      { id: 2, name: '决策分析', execute: () => executeDecisionAnalysis(analysisId, callbacks) },
      { id: 3, name: 'PRD生成', execute: () => executePRDGeneration(analysisId, callbacks) }
    ]

    // 3. 从指定步骤开始执行
    for (let i = startFromStep; i < steps.length; i++) {
      const stepId = ['info-collection', 'decision-analysis', 'prd-generation'][i]
      onProgress(stepId, 'active')

      // 步骤激活时保存当前步骤索引
      if (onStepComplete) {
        onStepComplete(i)
      }

      // 执行步骤
      await steps[i].execute()

      // 步骤完成后，保存下一步索引
      if (onStepComplete) {
        const nextStepIndex = i + 1
        onStepComplete(nextStepIndex)
      }

      onProgress(stepId, 'completed')
    }

    // 完成
    onLog('所有分析已完成！', 'success')
    onComplete()
  } catch (error) {
    console.error('Mock analysis error:', error)
    throw error
  }
}

// 执行信息采集阶段（先问问题，再并行执行3个子步骤）
async function executeInfoCollection(
  analysisId: string,
  callbacks: any
) {
  const { onLog, onProgress, onQuestion } = callbacks

  onLog('信息采集阶段：准备分析产品需求、目标用户和竞品情况...', 'loading')
  await sleep(800)

  // 先向用户提问确认关键信息（阻塞主循环）
  onLog('需要进一步确认信息...', 'loading')
  const { questions } = await analysisApi.getQuestions({ analysisId })

  // 获取已回答的问题ID（用于断点续传）
  const analysisStore = useAnalysisStore()
  const answeredQuestionIds = new Set(analysisStore.userResponses.keys())

  // 过滤出未回答的问题
  const unansweredQuestions = questions.filter(q => !answeredQuestionIds.has(q.id!))

  // 检查是否所有问题都已回答
  if (unansweredQuestions.length === 0) {
    onLog('所有确认问题已回答，跳过提问环节...', 'success')
  } else if (unansweredQuestions.length < questions.length) {
    onLog(`检测到 ${questions.length - unansweredQuestions.length} 个问题已回答，继续询问剩余 ${unansweredQuestions.length} 个问题...`, 'loading')
  }

  // 依次向用户提问（只问未回答的）
  for (const question of unansweredQuestions) {
    const response = await onQuestion(question as ClarifyingQuestion)
    await analysisApi.submitAnswer({
      analysisId,
      questionId: question.id!,
      ...response
    })
    await sleep(300)
  }

  onLog('信息确认完成，开始并行分析...', 'success')
  await sleep(500)

  onLog('信息采集阶段：并行执行需求分析、用户研究、竞品分析...', 'loading')

  // 并行执行3个子步骤
  await Promise.all([
    fetchResultWithProgress(analysisId, 0, 0, SUB_STEP_IDS.REQUIREMENT, callbacks),
    fetchResultWithProgress(analysisId, 0, 1, SUB_STEP_IDS.USER_RESEARCH, callbacks),
    fetchResultWithProgress(analysisId, 0, 2, SUB_STEP_IDS.COMPETITOR, callbacks)
  ])

  onProgress(STEP_IDS.INFO_COLLECTION, 'completed')
  onLog('信息采集阶段完成：需求分析、用户研究、竞品分析已全部完成', 'success')
  await sleep(500)

  // 激活下一步（决策分析）为 active
  onProgress(STEP_IDS.DECISION_ANALYSIS, 'active')
  onLog('决策分析阶段已启动...', 'loading')
}

// 执行决策分析阶段（顺序执行3个子步骤）
async function executeDecisionAnalysis(
  analysisId: string,
  callbacks: any
) {
  const { onLog, onProgress } = callbacks

  onLog('决策分析阶段：开始分析...', 'loading')

  // 子步骤1：信息融合
  await fetchResultWithProgress(analysisId, 1, 0, DECISION_SUB_STEP_IDS.INFO_FUSION, callbacks)

  // 子步骤2：产品决策
  await fetchResultWithProgress(analysisId, 1, 1, DECISION_SUB_STEP_IDS.PRODUCT_DECISION, callbacks)

  // 子步骤3：PRD输出结构
  await fetchResultWithProgress(analysisId, 1, 2, DECISION_SUB_STEP_IDS.PRD_STRUCTURE, callbacks)

  onProgress(STEP_IDS.DECISION_ANALYSIS, 'completed')
  onLog('决策分析阶段完成：信息融合、产品决策、PRD结构已全部确定', 'success')
  await sleep(500)
}

// 执行PRD生成阶段（按PRD输出结构生成文档）
async function executePRDGeneration(
  analysisId: string,
  callbacks: any
) {
  const { onLog, onProgress, onResult } = callbacks
  onLog('PRD生成阶段：按照PRD输出结构生成完整PRD文档...', 'loading')
  await sleep(800)
  onLog('PRD生成阶段：正在撰写PRD文档内容...', 'loading')
  await sleep(1500)

  // 输出完整PRD文档（索引6，即第7个结果）
  const { result } = await analysisApi.getResults({
    analysisId,
    step: 2,
    resultIndex: 0
  })
  onResult(result)

  onProgress(STEP_IDS.PRD_GENERATION, 'completed')
  onLog('PRD生成阶段：完整PRD文档生成完成', 'success')
  await sleep(500)
}

// 获取单个结果并更新进度
async function fetchResultWithProgress(
  analysisId: string,
  step: number,
  resultIndex: number,
  subStepId: string,
  callbacks: any
) {
  const { onLog, onProgress, onResult } = callbacks

  // 每个步骤的日志消息
  const stepLogMessages: Record<number, string[]> = {
    0: [
      '需求分析Agent: 分析产品需求...',
      '用户研究Agent: 分析目标用户...',
      '竞品分析Agent: 竞品分析中...'
    ],
    1: [
      '信息融合Agent: 综合分析信息采集结果...',
      '产品决策Agent: 制定产品方案决策...',
      'PRD结构Agent: 设计PRD文档结构...'
    ],
    2: [
      'PRD生成Agent: 撰写PRD文档...'
    ]
  }

  const messages = stepLogMessages[step] || []
  const logMessage = messages[resultIndex] || '处理中...'

  onProgress(subStepId, 'active')
  onLog(`  → ${logMessage}`, 'loading')

  const { result } = await analysisApi.getResults({
    analysisId,
    step,
    resultIndex
  })

  onResult(result)
  onProgress(subStepId, 'completed')
  onLog(`  → 完成`, 'success')
  await sleep(300)
}

// 暂停等待用户回答的 Promise
export function createQuestionPromise(): {
  promise: Promise<{ answer: string | string[], skipped: boolean }>
  resolve: (value: { answer: string | string[], skipped: boolean }) => void
} {
  let resolveFn: (value: { answer: string | string[], skipped: boolean }) => void

  const promise = new Promise<{ answer: string | string[], skipped: boolean }>((resolve) => {
    resolveFn = resolve
  })

  return {
    promise,
    resolve: resolveFn!
  }
}
