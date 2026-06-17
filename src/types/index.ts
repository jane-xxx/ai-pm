// 分析状态枚举
export enum AnalysisState {
  INPUT = 'input',           // 初始输入态
  ANALYZING = 'analyzing',   // 分析中（无断点）
  PAUSED = 'paused',         // 断点暂停，等待用户回答
  COMPLETED = 'completed'    // 分析完成
}

// 日志条目类型
export enum LogType {
  SUCCESS = 'success',
  LOADING = 'loading',
  PAUSED = 'paused',
  INFO = 'info'
}

// 日志条目
export interface LogEntry {
  id: string
  type: LogType
  message: string
  timestamp: number
}

// 断点问题
export interface ClarifyingQuestion {
  id: string
  question: string
  options?: string[]
  allowSkip: boolean
  defaultAssumption: string
  inputType?: 'select' | 'input' | 'multi-select'
  selectedAnswer?: string | string[]
  skipped?: boolean
}

// 分析结果项
export interface ResultItem {
  id: string
  title: string
  content: string
  order: number
  isStreaming?: boolean // 是否启用流式输出效果
}

// 完整分析结果
export interface AnalysisResult {
  id: string
  title: string
  items: ResultItem[]
}
