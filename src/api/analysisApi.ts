import { apiClient } from './axiosInstance'
import type {
  ApiResponse,
  StartAnalysisRequest,
  StartAnalysisResponse,
  GetResultsRequest,
  GetResultsResponse,
  GetQuestionsRequest,
  GetQuestionsResponse,
  SubmitAnswerRequest
} from './types'

export class AnalysisApi {
  /**
   * 启动分析会话
   */
  async startAnalysis(params: StartAnalysisRequest): Promise<StartAnalysisResponse> {
    const res = await apiClient.post<ApiResponse<StartAnalysisResponse>>(
      '/analysis/start',
      params
    )
    // 响应拦截器已返回 response.data，所以 res.data 直接是 StartAnalysisResponse
    return res.data as any
  }

  /**
   * 获取分析结果
   */
  async getResults(params: GetResultsRequest): Promise<GetResultsResponse> {
    const res = await apiClient.get<ApiResponse<GetResultsResponse>>(
      '/analysis/results',
      { params }
    )
    // 响应拦截器已返回 response.data
    return res.data as any
  }

  /**
   * 获取问题列表
   */
  async getQuestions(params: GetQuestionsRequest): Promise<GetQuestionsResponse> {
    const res = await apiClient.get<ApiResponse<GetQuestionsResponse>>(
      '/analysis/questions',
      { params }
    )
    // 响应拦截器已返回 response.data
    return res.data as any
  }

  /**
   * 提交问题回答
   */
  async submitAnswer(params: SubmitAnswerRequest): Promise<void> {
    await apiClient.post('/analysis/answer', params)
  }
}

export const analysisApi = new AnalysisApi()
