import type { ClarifyingQuestion, ResultItem } from '@/types'

// 步骤 ID 映射 - 对应 5 个 Agent
export const STEP_IDS = {
  REQUIREMENT: 'requirement',
  USER_RESEARCH: 'user-research',
  COMPETITOR: 'competitor',
  SOLUTION: 'solution',
  PRD: 'prd'
}

// Mock 断点问题库
export const mockQuestions: Partial<ClarifyingQuestion>[] = [
  {
    id: 'q1',
    question: '你的目标用户是？',
    inputType: 'select',
    options: ['独立自由设计师', '中小型设计团队 (5-20人)', '大型企业设计部门 (20+人)'],
    allowSkip: true,
    defaultAssumption: '通用设计师'
  },
  {
    id: 'q2',
    question: '你的预算范围是？',
    inputType: 'select',
    options: ['< 5万', '5-20万', '> 20万'],
    allowSkip: true,
    defaultAssumption: '中等预算 (5-20万)'
  },
  {
    id: 'q3',
    question: '你希望优先实现哪些功能？',
    inputType: 'select',
    options: ['版本控制', '团队协作', '自动标注', '设计规范管理'],
    allowSkip: true,
    defaultAssumption: '核心功能全覆盖'
  }
]

// Mock 分析结果 - 5 个 Agent，每个对应 1 个结果
export const mockResults: Partial<ResultItem>[] = [
  // Requirement Agent - 需求分析
  {
    id: 'r1',
    title: '需求分析报告',
    content: '基于您的产品想法，核心需求已识别：\n\n1. **核心痛点**：设计团队在协作过程中面临版本管理混乱、沟通效率低下、重复劳动严重等问题。\n\n2. **功能模块拆解**：\n   - 版本管理模块：自动追踪设计稿变更历史\n   - 实时协作模块：支持多人同时编辑和评论\n   - 智能标注模块：AI 自动生成设计标注\n   - 规范管理模块：统一设计系统和组件库\n\n3. **优先级排序**：版本管理 > 实时协作 > 智能标注 > 规范管理'
  },
  // User Research Agent - 用户研究
  {
    id: 'r2',
    title: '用户画像与场景分析',
    content: '目标用户分析：\n\n**核心用户群体**：\n- 独立设计师：需要简洁的版本管理，预算有限\n- 中小型设计团队（5-20人）：协作效率是核心需求\n- 大型企业设计部门：需要权限管理和合规性\n\n**典型使用场景**：\n1. 设计师完成初稿后，需要与团队分享并收集反馈\n2. 多人同时修改同一个设计文件，需要实时同步\n3. 客户需要查看设计历史，了解每个版本的迭代过程\n\n**用户痛点**：现有工具要么协作功能弱，要么学习成本高，缺乏针对国内用户的设计习惯优化。'
  },
  // Competitor Agent - 竞品分析
  {
    id: 'r3',
    title: '竞品分析与差异化机会',
    content: '主要竞品分析：\n\n**Figma**：优势在于强大的实时协作和云端编辑，但国内网络访问不稳定，且价格较高。\n\n**蓝湖**：专注设计标注功能，界面简洁，但缺乏版本管理和深度协作能力。\n\n**Abstract**：版本管理功能强大，但主要面向开发者，设计协作体验不佳。\n\n**差异化机会**：\n1. 本土化体验：符合国内设计师习惯的交互设计\n2. 智能版本追踪：AI 辅助识别关键变更点\n3. 灵活权限体系：支持细粒度的团队协作权限\n4. 性能优化：针对国内网络环境优化访问速度'
  },
  // Solution Agent - 方案设计（合并产品方案 + 技术架构）
  {
    id: 'r4',
    title: '产品方案与技术架构',
    content: '**产品方案设计**：\n\n1. **智能版本管理**\n   - 自动记录每次修改，生成版本时间线\n   - 支持版本对比和一键回滚\n   - AI 提炼版本变更摘要\n\n2. **实时协作系统**\n   - WebSocket 实现多人同时编辑\n   - 评论和标注实时同步\n   - 冲突检测与智能合并\n\n3. **AI 辅助功能**\n   - 自动标注设计元素（尺寸、颜色、字体）\n   - 设计规范一致性检查\n   - 智能命名和分组建议\n\n4. **设计规范管理**\n   - 组件库统一管理\n   - 设计token系统\n   - 跨项目规范复用\n\n---\n\n**技术架构选型**：\n\n**前端技术栈**：React 18 + TypeScript + Vite，使用 Canvas/WebGL 实现高性能设计画布渲染。\n\n**后端技术栈**：Node.js + NestJS + GraphQL，模块化架构易于维护。\n\n**数据存储**：PostgreSQL（用户数据）、MongoDB（版本历史）、Redis（协作状态缓存）。\n\n**基础设施**：WebSocket 实时通信、CDN+OSS 文件存储、消息队列处理异步任务。'
  },
  // PRD Agent - PRD生成（合并 MVP规划 + 商业模式）
  {
    id: 'r5',
    title: 'MVP 规划与商业模式',
    content: '**分阶段产品路线图**：\n\n**第一阶段 - MVP（3个月）**：核心版本管理 + 基础实时协作 + 简单标注功能 + 基础权限管理。\n\n**第二阶段（3个月）**：AI 自动标注 + 设计规范管理 + 高级协作功能。\n\n**第三阶段（3个月）**：AI 高级功能 + 企业级功能 + 开放平台 API。\n\n**发布策略**：先从独立设计师和小团队切入，快速迭代验证核心价值，再逐步拓展中大型企业客户。\n\n---\n\n**商业模式与定价**：\n\n**免费版**：3个项目、5人团队，基础功能，降低试用门槛。\n\n**专业版（¥99/人/月）**：无限项目和人数，完整协作功能 + AI标注。\n\n**企业版（定制报价）**：私有化部署、SSO登录、审计日志、专属客户成功经理。\n\n**增值服务**：设计资源商城、企业培训咨询、API调用计费。\n\n**获客策略**：内容营销、SEO优化、设计师KOL合作、设计社区运营。'
  }
]

// 步骤执行函数 - 封装每个 Agent 的逻辑
async function executeStep1(
  callbacks: any,
  sleep: (ms: number) => Promise<void>
) {
  const { onLog, onProgress, onResult } = callbacks
  onProgress(STEP_IDS.REQUIREMENT, 'active')
  onLog('Requirement Agent: 开始分析产品需求...', 'loading')
  await sleep(1200)
  onResult(mockResults[0] as ResultItem)
  onProgress(STEP_IDS.REQUIREMENT, 'completed')
  onLog('Requirement Agent: 需求分析完成 ✔️', 'success')
  await sleep(500)
}

async function executeStep2(
  callbacks: any,
  sleep: (ms: number) => Promise<void>
) {
  const { onLog, onProgress, onQuestion, onResult } = callbacks
  onProgress(STEP_IDS.USER_RESEARCH, 'active')
  onLog('User Research Agent: 开始分析目标用户...', 'loading')
  await sleep(800)
  const q1Response = await onQuestion(mockQuestions[0] as ClarifyingQuestion)
  await sleep(500)
  onResult(mockResults[1] as ResultItem)
  onProgress(STEP_IDS.USER_RESEARCH, 'completed')
  onLog(q1Response.skipped
    ? `User Research Agent: 目标用户 [假设: ${mockQuestions[0].defaultAssumption}] ✔️`
    : `User Research Agent: 目标用户确认 ✔️`,
    'success'
  )
  await sleep(500)
}

async function executeStep3(
  callbacks: any,
  sleep: (ms: number) => Promise<void>
) {
  const { onLog, onProgress, onResult } = callbacks
  onProgress(STEP_IDS.COMPETITOR, 'active')
  onLog('Competitor Agent: 开始竞品分析...', 'loading')
  await sleep(1500)
  onResult(mockResults[2] as ResultItem)
  onProgress(STEP_IDS.COMPETITOR, 'completed')
  onLog('Competitor Agent: 竞品分析完成 ✔️', 'success')
  await sleep(500)
}

async function executeStep4(
  callbacks: any,
  sleep: (ms: number) => Promise<void>
) {
  const { onLog, onProgress, onQuestion, onResult } = callbacks
  onProgress(STEP_IDS.SOLUTION, 'active')
  onLog('Solution Agent: 开始设计产品方案...', 'loading')
  await sleep(800)
  const q2Response = await onQuestion(mockQuestions[1] as ClarifyingQuestion)
  await sleep(500)
  onLog('Solution Agent: 功能规划中...', 'loading')
  await sleep(800)
  onResult(mockResults[3] as ResultItem)
  onProgress(STEP_IDS.SOLUTION, 'completed')
  onLog('Solution Agent: 产品方案设计完成 ✔️', 'success')
  await sleep(500)
}

async function executeStep5(
  callbacks: any,
  sleep: (ms: number) => Promise<void>
) {
  const { onLog, onProgress, onQuestion, onResult } = callbacks
  onProgress(STEP_IDS.PRD, 'active')
  onLog('PRD Agent: 开始生成PRD文档...', 'loading')
  await sleep(800)
  const q3Response = await onQuestion(mockQuestions[2] as ClarifyingQuestion)
  await sleep(500)
  onLog('PRD Agent: 生成PRD文档中...', 'loading')
  await sleep(1200)
  onResult(mockResults[4] as ResultItem)
  onProgress(STEP_IDS.PRD, 'completed')
  onLog('PRD Agent: PRD文档生成完成 ✔️', 'success')
  await sleep(500)
}

// 模拟分析流程 - 顺序执行，每个 Agent 完成后立即输出结果
export async function mockAnalyzeAnalysis(
  idea: string,
  callbacks: {
    onLog: (message: string, type?: string) => void
    onProgress: (stepId: string, status: 'active' | 'completed', description?: string) => void
    onQuestion: (question: ClarifyingQuestion) => Promise<{ answer: string | string[], skipped: boolean }>
    onResult: (result: ResultItem) => void
    onComplete: () => void
    onStepComplete?: (stepIndex: number) => void // 每步完成后的回调，用于保存断点
  },
  options: { startFromStep?: number } = {}
) {
  const { onLog, onProgress, onComplete, onQuestion, onResult, onStepComplete } = callbacks
  const { startFromStep = 0 } = options

  // 辅助函数：延迟
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  // 定义所有步骤
  const steps = [
    { id: 1, name: '需求分析', execute: () => executeStep1(callbacks, sleep) },
    { id: 2, name: '用户研究', execute: () => executeStep2(callbacks, sleep) },
    { id: 3, name: '竞品分析', execute: () => executeStep3(callbacks, sleep) },
    { id: 4, name: '方案设计', execute: () => executeStep4(callbacks, sleep) },
    { id: 5, name: 'PRD生成', execute: () => executeStep5(callbacks, sleep) }
  ]

  try {
    // 从指定步骤开始执行（0-based index，所以从 startFromStep 开始）
    for (let i = startFromStep; i < steps.length; i++) {
      await steps[i].execute()
      // 每步完成后，通知外部保存状态（stepIndex 是下一步的索引）
      if (onStepComplete && i < steps.length - 1) {
        onStepComplete(i + 1) // 保存下一步要执行的索引
      }
    }

    // 完成
    onLog('所有分析已完成！', 'success')
    onComplete()
  } catch (error) {
    console.error('Mock analysis error:', error)
    throw error
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
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
