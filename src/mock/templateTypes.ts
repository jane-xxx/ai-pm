import type { ClarifyingQuestion, ResultItem } from '@/types'

// 产品场景模板
export interface ProductTemplate {
  name: string                    // 模板名称
  description: string             // 模板描述
  keywords: string[]              // 匹配关键词
  questions: Partial<ClarifyingQuestion>[]   // 澄清问题
  results: Partial<ResultItem>[]  // 分析结果（7个）
}

// 模板匹配结果
export interface TemplateMatch {
  template: ProductTemplate
  confidence: number  // 匹配置信度 0-1
}
