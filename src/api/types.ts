import type { ResultItem, ClarifyingQuestion } from '@/types'

// 统一 API 响应格式
export interface ApiResponse<T = any> {
  code: number
  data: T
  message?: string
}

// ========== 启动分析 ==========
export interface StartAnalysisRequest {
  idea: string
  startFromStep?: number
}

export interface StartAnalysisResponse {
  analysisId: string
  currentStep: number
}

// ========== 获取结果 ==========
export interface GetResultsRequest {
  analysisId: string
  step: number
  resultIndex: number
}

export interface GetResultsResponse {
  result?: ResultItem
  nextAvailable: boolean
  stepComplete: boolean
  nextStep?: string
}

// ========== 获取问题 ==========
export interface GetQuestionsRequest {
  analysisId: string
}

export interface GetQuestionsResponse {
  questions: Partial<ClarifyingQuestion>[]
}

// ========== 提交答案 ==========
export interface SubmitAnswerRequest {
  analysisId: string
  questionId: string
  answer: string | string[]
  skipped: boolean
}

export interface SubmitAnswerResponse {
  confirmed: boolean
}
