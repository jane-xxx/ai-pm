import type { Connect } from 'vite'
import type { StartAnalysisRequest, SubmitAnswerRequest } from '@/api/types'
import { matchTemplate } from './templateMatcher'
import type { ResultItem } from '@/types'

// 分析会话存储 (开发环境)
interface AnalysisSession {
  idea: string
  template: {
    questions: any[]
    results: any[]
  }
  currentStep: number
  resultIndex: number
  questionIndex: number
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

// 解析请求体
async function getRequestBody<T>(req: Connect.IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = ''
    ;(req as any).on('data', (chunk: any) => body += chunk)
    ;(req as any).on('end', () => {
      try {
        resolve(JSON.parse(body))
      } catch (e) {
        reject(e)
      }
    })
    ;(req as any).on('error', reject)
  })
}

// 设置 Mock 中间件
export function setupMockMiddleware() {
  return async (req: Connect.IncomingMessage, res: any, next: Connect.NextFunction) => {
    const url = (req as any).url
    const method = (req as any).method

    if (url?.startsWith('/api/')) {
      // CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

      if (method === 'OPTIONS') {
        res.statusCode = 200
        res.end()
        return
      }

      try {
        // POST /api/analysis/start
        if (url === '/api/analysis/start' && method === 'POST') {
          const body = await getRequestBody<StartAnalysisRequest>(req)
          const analysisId = `analysis-${Date.now()}`

          // 根据输入匹配模板
          const template = matchTemplate(body.idea)

          analysisSessions.set(analysisId, {
            idea: body.idea,
            template: {
              questions: template.questions,
              results: template.results
            },
            currentStep: body.startFromStep || 0,
            resultIndex: 0,
            questionIndex: 0
          })

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            code: 0,
            data: { analysisId, currentStep: body.startFromStep || 0 }
          }))
          return
        }

        // GET /api/analysis/results
        if (url.startsWith('/api/analysis/results') && method === 'GET') {
          const parsedUrl = new URL(url, 'http://localhost')
          const analysisId = parsedUrl.searchParams.get('analysisId')!
          const step = parseInt(parsedUrl.searchParams.get('step') || '0')
          const resultIndex = parseInt(parsedUrl.searchParams.get('resultIndex') || '0')

          const session = analysisSessions.get(analysisId)
          if (!session) {
            res.statusCode = 404
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ code: 404, message: 'Analysis not found' }))
            return
          }

          // 根据步骤和索引返回对应结果
          const resultMap = getStepResultMap(session, step, resultIndex)

          if (resultMap) {
            // 模拟处理延迟
            await delay(getDelayForResult(step, resultIndex))

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({
              code: 0,
              data: resultMap
            }))
          } else {
            // 没有更多结果
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({
              code: 0,
              data: { nextAvailable: false, stepComplete: true }
            }))
          }
          return
        }

        // POST /api/analysis/answer
        if (url === '/api/analysis/answer' && method === 'POST') {
          await getRequestBody<SubmitAnswerRequest>(req)

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            code: 0,
            data: { confirmed: true }
          }))
          return
        }

        // GET /api/analysis/questions
        if (url.startsWith('/api/analysis/questions') && method === 'GET') {
          const parsedUrl = new URL(url, 'http://localhost')
          const analysisId = parsedUrl.searchParams.get('analysisId')!

          const session = analysisSessions.get(analysisId)
          if (!session) {
            res.statusCode = 404
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ code: 404, message: 'Analysis not found' }))
            return
          }

          // 返回会话中存储的问题（去除 internalOnly 字段）
          const questions = session.template.questions.map(q => {
            const { internalOnly, ...publicFields } = q
            return publicFields
          })

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            code: 0,
            data: { questions }
          }))
          return
        }

        // 其他 API 请求
        next()
      } catch (error) {
        console.error('[Mock] Error:', error)
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ code: 500, message: 'Mock server error' }))
      }
    } else {
      next()
    }
  }
}

// 获取会话的问题（供外部使用）
export function getSessionQuestions(analysisId: string): any[] {
  const session = analysisSessions.get(analysisId)
  return session?.template.questions || []
}
