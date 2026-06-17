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
    return res.data.data
  }

  /**
   * 获取分析结果
   */
  async getResults(params: GetResultsRequest): Promise<GetResultsResponse> {
    const res = await apiClient.get<ApiResponse<GetResultsResponse>>(
      '/analysis/results',
      { params }
    )
    return res.data.data
  }

  /**
   * 获取问题列表
   */
  async getQuestions(params: GetQuestionsRequest): Promise<GetQuestionsResponse> {
    const res = await apiClient.get<ApiResponse<GetQuestionsResponse>>(
      '/analysis/questions',
      { params }
    )
    return res.data.data
  }

  /**
   * 提交问题回答
   */
  async submitAnswer(params: SubmitAnswerRequest): Promise<void> {
    await apiClient.post('/analysis/answer', params)
  }
}

export const analysisApi = new AnalysisApi()
