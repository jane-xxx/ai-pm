import axios, { type AxiosAdapter } from 'axios'
import type {
  StartAnalysisRequest,
  GetResultsRequest,
  GetQuestionsRequest,
  SubmitAnswerRequest
} from './types'
import {
  mockStartAnalysis,
  mockGetResults,
  mockGetQuestions,
  mockSubmitAnswer
} from '@/mock/mockApiService'

// 创建 Mock Axios Adapter - 在请求发送前直接返回数据
const mockAdapter: AxiosAdapter = async (config) => {
  // 移除前导斜杠和可能的 /api 前缀
  const url = config.url?.replace(/^\/+/, '').replace(/^api\//, '')
  const method = config.method?.toLowerCase()

  try {
    // POST /api/analysis/start
    if (url === 'analysis/start' && method === 'post') {
      let params = config.data as StartAnalysisRequest
      if (typeof params === 'string') {
        params = JSON.parse(params)
      }
      const response = await mockStartAnalysis(params)
      return {
        data: { code: 0, data: response },
        status: 200,
        statusText: 'OK',
        headers: {},
        config
      }
    }

    // GET /api/analysis/results
    if (url?.startsWith('analysis/results') && method === 'get') {
      const params = config.params as GetResultsRequest
      const response = await mockGetResults(params)
      return {
        data: { code: 0, data: response },
        status: 200,
        statusText: 'OK',
        headers: {},
        config
      }
    }

    // GET /api/analysis/questions
    if (url?.startsWith('analysis/questions') && method === 'get') {
      const params = config.params as GetQuestionsRequest
      const response = await mockGetQuestions(params)
      return {
        data: { code: 0, data: response },
        status: 200,
        statusText: 'OK',
        headers: {},
        config
      }
    }

    // POST /api/analysis/answer
    if (url === 'analysis/answer' && method === 'post') {
      let params = config.data as SubmitAnswerRequest
      if (typeof params === 'string') {
        params = JSON.parse(params)
      }
      await mockSubmitAnswer(params)
      return {
        data: { code: 0, data: { confirmed: true } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config
      }
    }

    // 不匹配的请求，返回 404
    return {
      data: { code: 404, message: 'API endpoint not found in mock' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config
    }
  } catch (error) {
    return {
      data: { code: 500, message: 'Mock server error' },
      status: 500,
      statusText: 'Internal Server Error',
      headers: {},
      config
    }
  }
}

// 创建 axios 实例，使用 mock adapter
export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  },
  adapter: mockAdapter  // 使用自定义 adapter，不发送真实 HTTP 请求
})

// 响应拦截器 - 提取 response.data
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('[API] Response error:', error)
    return Promise.reject(error)
  }
)
