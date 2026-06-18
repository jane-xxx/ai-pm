/**
 * 静态 Mock API 服务
 * 无需服务器，直接返回模拟数据
 */

import type {
  StartAnalysisRequest,
  StartAnalysisResponse,
  GetResultsRequest,
  GetResultsResponse,
  GetQuestionsRequest,
  GetQuestionsResponse,
  SubmitAnswerRequest
} from '@/api/types'
import type { ClarifyingQuestion, ResultItem } from '@/types'
import { matchTemplate } from './templateMatcher'

// 分析会话存储（内存）
interface AnalysisSession {
  idea: string
  template: {
    questions: Partial<ClarifyingQuestion>[]
    results: Partial<ResultItem>[]
  }
  currentStep: number
  resultIndex: number
  questionIndex: number
  userResponses: Map<string, { answer: string | string[]; skipped: boolean }>
}

const analysisSessions = new Map<string, AnalysisSession>()

// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 步骤结果映射
function getStepResultMap(
  session: AnalysisSession,
  step: number,
  resultIndex: number
): { result: ResultItem; nextAvailable: boolean; stepComplete: boolean; nextStep?: string } | null {
  const results = session.template.results

  // 步骤0: 信息采集 (结果0-2)
  if (step === 0) {
    if (resultIndex < 3) {
      const result = results[resultIndex] as ResultItem
      return {
        result,
        nextAvailable: resultIndex < 2,
        stepComplete: resultIndex === 2,
        nextStep: 'decision-analysis'
      }
    }
  }

  // 步骤1: 决策分析 (结果3-5)
  if (step === 1) {
    if (resultIndex < 3) {
      const result = results[3 + resultIndex] as ResultItem
      return {
        result,
        nextAvailable: resultIndex < 2,
        stepComplete: resultIndex === 2,
        nextStep: 'prd-generation'
      }
    }
  }

  // 步骤2: PRD生成 (结果6)
  if (step === 2) {
    if (resultIndex === 0) {
      return {
        result: results[6] as ResultItem,
        nextAvailable: false,
        stepComplete: true
      }
    }
  }

  return null
}

// 模拟处理延迟
function getDelayForResult(step: number, resultIndex: number): number {
  const delays: number[][] = [
    // 步骤0延迟
    [1200, 800, 1500],
    // 步骤1延迟
    [1000, 800, 800],
    // 步骤2延迟
    [2300]
  ]
  return delays[step]?.[resultIndex] || 500
}

/**
 * 启动分析会话
 */
export async function mockStartAnalysis(params: StartAnalysisRequest): Promise<StartAnalysisResponse> {
  const { idea, startFromStep = 0 } = params
  const analysisId = `analysis-${Date.now()}`

  // 根据输入匹配模板
  const template = matchTemplate(idea)

  analysisSessions.set(analysisId, {
    idea,
    template: {
      questions: template.questions || [],
      results: template.results || []
    },
    currentStep: startFromStep,
    resultIndex: 0,
    questionIndex: 0,
    userResponses: new Map()
  })

  return { analysisId, currentStep: startFromStep }
}

/**
 * 获取分析结果
 */
export async function mockGetResults(params: GetResultsRequest): Promise<GetResultsResponse> {
  const { analysisId, step = 0, resultIndex = 0 } = params

  const session = analysisSessions.get(analysisId)
  if (!session) {
    throw new Error('Analysis not found')
  }

  // 根据步骤和索引返回对应结果
  const resultMap = getStepResultMap(session, step, resultIndex)

  if (resultMap) {
    // 模拟处理延迟
    await delay(getDelayForResult(step, resultIndex))
    return resultMap
  } else {
    // 没有更多结果
    return { nextAvailable: false, stepComplete: true }
  }
}

/**
 * 获取问题列表
 */
export async function mockGetQuestions(params: GetQuestionsRequest): Promise<GetQuestionsResponse> {
  const { analysisId } = params

  const session = analysisSessions.get(analysisId)
  if (!session) {
    throw new Error('Analysis not found')
  }

  // 返回会话中存储的问题
  const questions = session.template.questions

  return { questions }
}

/**
 * 提交问题回答
 */
export async function mockSubmitAnswer(params: SubmitAnswerRequest): Promise<void> {
  const { analysisId, questionId, answer, skipped } = params

  const session = analysisSessions.get(analysisId!)
  if (!session) {
    throw new Error('Analysis not found')
  }

  // 存储用户回答
  session.userResponses.set(questionId!, { answer: answer!, skipped: skipped || false })
}

/**
 * 获取会话的问题（供外部使用）
 */
export function getSessionQuestions(analysisId: string): Partial<ClarifyingQuestion>[] {
  const session = analysisSessions.get(analysisId)
  return session?.template.questions || []
}

/**
 * 获取用户回答
 */
export function getUserResponses(analysisId: string): Map<string, { answer: string | string[]; skipped: boolean }> {
  const session = analysisSessions.get(analysisId)
  return session?.userResponses || new Map()
}
