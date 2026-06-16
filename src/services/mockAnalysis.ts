import type { ClarifyingQuestion, ResultItem } from '@/types'

// 步骤 ID 映射 - 对应 3 个主要流程阶段
export const STEP_IDS = {
  INFO_COLLECTION: 'info-collection',  // 信息采集（包含需求分析、用户研究、竞品分析）
  DECISION_ANALYSIS: 'decision-analysis',  // 决策分析（方案设计）
  PRD_GENERATION: 'prd-generation'  // PRD生成
}

// 子步骤 ID 映射 - 信息采集阶段的子步骤
export const SUB_STEP_IDS = {
  REQUIREMENT: 'requirement',
  USER_RESEARCH: 'user-research',
  COMPETITOR: 'competitor'
}

// 决策分析阶段的子步骤 ID 映射
export const DECISION_SUB_STEP_IDS = {
  INFO_FUSION: 'info-fusion',      // 信息融合
  PRODUCT_DECISION: 'product-decision',  // 产品决策
  PRD_STRUCTURE: 'prd-structure'   // PRD输出结构
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

// Mock 分析结果 - 7 个 Agent 输出
export const mockResults: Partial<ResultItem>[] = [
  // ========== 信息采集阶段 (3个) ==========
  // Requirement Agent - 需求分析
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
  // ========== 决策分析阶段 (3个) ==========
  // Info Fusion Agent - 信息融合
  {
    id: 'r4',
    title: '信息融合报告',
    content: '**信息融合总结**：\n\n综合需求分析、用户研究和竞品分析的结果，提炼出以下关键洞察：\n\n**核心需求确认**：\n- 设计协作工具的核心价值在于提升团队协作效率\n- 版本管理是最高优先级功能（用户痛点最强烈）\n- 本土化体验是差异化关键\n\n**用户画像聚焦**：\n- 核心目标用户：中小型设计团队（5-20人）\n- 次要用户：独立设计师、大型企业设计部门\n\n**竞品差异化定位**：\n- 与Figma差异化：本土化+更优的版本管理\n- 与蓝湖差异化：更强的协作能力\n- 与Abstract差异化：面向设计师的友好体验'
  },
  // Product Decision Agent - 产品决策
  {
    id: 'r5',
    title: '产品决策方案',
    content: '**产品核心决策**：\n\n**定位**：面向国内设计团队的协作平台，以版本管理为核心竞争力。\n\n**核心功能**：\n1. 智能版本管理（MUST HAVE）\n   - 自动追踪设计稿变更历史\n   - 版本对比和一键回滚\n   - AI提炼版本变更摘要\n\n2. 实时协作系统（MUST HAVE）\n   - 多人同时编辑\n   - 评论和标注同步\n   - 冲突智能合并\n\n3. 设计规范管理（NICE TO HAVE）\n   - 组件库统一管理\n   - 设计token系统\n\n**技术选型决策**：\n- 前端：React + TypeScript + Canvas（高性能渲染）\n- 后端：Node.js + NestJS（模块化架构）\n- 存储：PostgreSQL + MongoDB + Redis'
  },
  // PRD Structure Agent - PRD输出结构
  {
    id: 'r6',
    title: 'PRD文档结构',
    content: '**PRD文档标准结构**：\n\n1. **产品概述**\n   - 产品定位与目标\n   - 核心价值主张\n   - 目标用户群体\n\n2. **功能需求**\n   - 核心功能列表\n   - 功能优先级排序\n   - 功能详细说明\n\n3. **用户体验设计**\n   - 用户旅程图\n   - 关键交互流程\n   - UI/UX规范\n\n4. **技术实现方案**\n   - 技术架构选型\n   - 数据结构设计\n   - API接口设计\n\n5. **产品路线图**\n   - MVP阶段规划\n   - 迭代计划\n   - 里程碑设定\n\n6. **商业模式**\n   - 定价策略\n   - 获客渠道\n   - 增长策略'
  },
  // ========== PRD生成阶段 (1个) ==========
  // PRD Output Agent - PRD文档输出（按PRD输出结构生成完整PRD）
  {
    id: 'r7',
    title: '完整PRD文档',
    content: '# 产品需求文档（PRD）\n\n## 1. 产品概述\n\n### 产品定位\n面向国内设计团队的智能协作平台，以版本管理为核心竞争力，提供实时协作、智能标注等核心功能。\n\n### 核心价值主张\n- **更懂中国设计师**：本土化体验设计\n- **版本管理专家**：AI辅助的智能版本追踪\n- **无缝协作**：多人实时编辑，冲突智能合并\n\n### 目标用户群体\n- 核心用户：中小型设计团队（5-20人）\n- 次要用户：独立设计师、大型企业设计部门\n\n---\n\n## 2. 功能需求\n\n### 核心功能列表\n1. 智能版本管理（P0）\n2. 实时协作系统（P0）\n3. AI自动标注（P1）\n4. 设计规范管理（P2）\n\n### 功能详细说明\n\n#### 2.1 智能版本管理\n- 自动记录每次修改，生成版本时间线\n- 支持版本对比（可视化diff）\n- 一键回滚到任意历史版本\n- AI提炼版本变更摘要\n\n#### 2.2 实时协作系统\n- WebSocket实现多人同时编辑\n- 评论和标注实时同步\n- 冲突检测与智能合并\n\n#### 2.3 AI自动标注\n- 自动识别设计元素尺寸、颜色、字体\n- 智能生成设计标注\n- 一键导出标注文档\n\n#### 2.4 设计规范管理\n- 组件库统一管理\n- 设计token系统\n- 跨项目规范复用\n\n---\n\n## 3. 用户体验设计\n\n### 关键交互流程\n1. 设计师上传设计稿 → 系统自动创建版本\n2. 多人同时编辑 → 实时同步显示光标位置\n3. 版本冲突 → AI智能合并建议\n\n### UI/UX规范\n- 遵循国内设计习惯（左侧工具栏、右键菜单等）\n- 支持快捷键操作\n- 暗色模式支持\n\n---\n\n## 4. 技术实现方案\n\n### 技术架构选型\n- **前端**：React 18 + TypeScript + Vite + Canvas/WebGL\n- **后端**：Node.js + NestJS + GraphQL\n- **数据存储**：PostgreSQL（用户数据）+ MongoDB（版本历史）+ Redis（协作状态缓存）\n- **实时通信**：WebSocket\n- **文件存储**：CDN + OSS\n\n### API接口设计\n- GraphQL API提供灵活的数据查询\n- RESTful API处理文件上传下载\n- WebSocket推送实时协作事件\n\n---\n\n## 5. 产品路线图\n\n### MVP阶段（3个月）\n- 核心版本管理功能\n- 基础实时协作（最多10人）\n- 简单标注功能\n- 基础权限管理\n\n### 迭代计划\n- **第2阶段**（3个月）：AI自动标注 + 设计规范管理\n- **第3阶段**（3个月）：企业级功能 + 开放API\n\n### 里程碑设定\n- M1：内测版本发布（MVP完成后1个月）\n- M2：正式版上线（MVP完成后3个月）\n- M3：企业版推出（MVP完成后6个月）\n\n---\n\n## 6. 商业模式\n\n### 定价策略\n- **免费版**：3个项目、5人团队\n- **专业版**：¥99/人/月，无限项目和人数\n- **企业版**：定制报价，私有化部署\n\n### 获客渠道\n- 内容营销（设计教程、案例分享）\n- SEO优化\n- 设计师KOL合作\n- 设计社区运营\n\n### 增长策略\n- 免费版降低试用门槛\n- 团队邀请机制\n- 设计资源商城引流'
  }
]

// 模拟分析流程 - 3个主要阶段，信息采集阶段并行执行3个子步骤
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
    { id: 1, name: '信息采集', execute: () => executeInfoCollection(callbacks, sleep) },
    { id: 2, name: '决策分析', execute: () => executeDecisionAnalysis(callbacks, sleep) },
    { id: 3, name: 'PRD生成', execute: () => executePRDGeneration(callbacks, sleep) }
  ]

  // 执行信息采集阶段（并行执行3个子步骤）
  async function executeInfoCollection(callbacks: any, sleep: (ms: number) => Promise<void>) {
    const { onLog, onProgress, onQuestion, onResult } = callbacks

    onLog('信息采集阶段：开始并行分析产品需求、目标用户和竞品情况...', 'loading')

    // 并行执行3个子步骤
    await Promise.all([
      executeSubStepRequirement(callbacks, sleep),
      executeSubStepUserResearch(callbacks, sleep),
      executeSubStepCompetitor(callbacks, sleep)
    ])

    onProgress(STEP_IDS.INFO_COLLECTION, 'completed')
    onLog('信息采集阶段完成：需求分析、用户研究、竞品分析已全部完成 ✔️', 'success')
    await sleep(500)

    // 激活下一步（决策分析）为 active，这样在等待用户回答问题时可以看到下一步正在执行
    onProgress(STEP_IDS.DECISION_ANALYSIS, 'active')
    onLog('决策分析阶段已启动，等待用户确认信息...', 'loading')

    // 信息采集完成后，向用户提问（阻塞主循环）
    onLog('需要进一步确认信息...', 'loading')
    const q1Response = await onQuestion(mockQuestions[0] as ClarifyingQuestion)
    await sleep(300)
    const q2Response = await onQuestion(mockQuestions[1] as ClarifyingQuestion)
    await sleep(300)
    onLog('信息确认完成，继续执行后续分析...', 'success')
  }

  // 执行决策分析阶段（顺序执行3个子步骤）
  async function executeDecisionAnalysis(callbacks: any, sleep: (ms: number) => Promise<void>) {
    const { onLog, onProgress, onQuestion, onResult } = callbacks

    onLog('决策分析阶段：开始分析...', 'loading')

    // 子步骤1：信息融合
    await executeDecisionSubStepInfoFusion(callbacks, sleep)

    // 子步骤2：产品决策
    await executeDecisionSubStepProductDecision(callbacks, sleep)

    // 子步骤3：PRD输出结构
    await executeDecisionSubStepPRDStructure(callbacks, sleep)

    onProgress(STEP_IDS.DECISION_ANALYSIS, 'completed')
    onLog('决策分析阶段完成：信息融合、产品决策、PRD结构已全部确定 ✔️', 'success')
    await sleep(500)
  }

  // 执行PRD生成阶段（按PRD输出结构生成文档）
  async function executePRDGeneration(callbacks: any, sleep: (ms: number) => Promise<void>) {
    const { onLog, onProgress, onResult } = callbacks
    onLog('PRD生成阶段：按照PRD输出结构生成完整PRD文档...', 'loading')
    await sleep(800)
    onLog('PRD生成阶段：正在撰写PRD文档内容...', 'loading')
    await sleep(1500)
    // 输出完整PRD文档（索引6，即第7个结果）
    onResult(mockResults[6] as ResultItem)
    onProgress(STEP_IDS.PRD_GENERATION, 'completed')
    onLog('PRD生成阶段：完整PRD文档生成完成 ✔️', 'success')
    await sleep(500)
  }

  // ========== 决策分析子步骤 ==========

  // 子步骤：信息融合
  async function executeDecisionSubStepInfoFusion(callbacks: any, sleep: (ms: number) => Promise<void>) {
    const { onLog, onProgress, onResult } = callbacks
    onProgress(DECISION_SUB_STEP_IDS.INFO_FUSION, 'active')
    onLog('  → 信息融合Agent: 综合分析信息采集结果...', 'loading')
    await sleep(1000)
    onResult(mockResults[3] as ResultItem)
    onProgress(DECISION_SUB_STEP_IDS.INFO_FUSION, 'completed')
    onLog('  → 信息融合Agent: 完成 ✔️', 'success')
    await sleep(300)
  }

  // 子步骤：产品决策
  async function executeDecisionSubStepProductDecision(callbacks: any, sleep: (ms: number) => Promise<void>) {
    const { onLog, onProgress, onResult } = callbacks
    onProgress(DECISION_SUB_STEP_IDS.PRODUCT_DECISION, 'active')
    onLog('  → 产品决策Agent: 制定产品方案决策...', 'loading')
    await sleep(800)
    onResult(mockResults[4] as ResultItem)
    onProgress(DECISION_SUB_STEP_IDS.PRODUCT_DECISION, 'completed')
    onLog('  → 产品决策Agent: 完成 ✔️', 'success')
    await sleep(300)
  }

  // 子步骤：PRD输出结构
  async function executeDecisionSubStepPRDStructure(callbacks: any, sleep: (ms: number) => Promise<void>) {
    const { onLog, onProgress, onResult } = callbacks
    onProgress(DECISION_SUB_STEP_IDS.PRD_STRUCTURE, 'active')
    onLog('  → PRD结构Agent: 设计PRD文档结构...', 'loading')
    await sleep(800)
    onResult(mockResults[5] as ResultItem)
    onProgress(DECISION_SUB_STEP_IDS.PRD_STRUCTURE, 'completed')
    onLog('  → PRD结构Agent: PRD文档结构已确定 ✔️', 'success')
    await sleep(300)
  }

  // 子步骤：需求分析
  async function executeSubStepRequirement(callbacks: any, sleep: (ms: number) => Promise<void>) {
    const { onLog, onProgress, onResult } = callbacks
    onProgress(SUB_STEP_IDS.REQUIREMENT, 'active')
    onLog('  → 需求分析Agent: 分析产品需求...', 'loading')
    await sleep(1200)
    onResult(mockResults[0] as ResultItem)
    onProgress(SUB_STEP_IDS.REQUIREMENT, 'completed')
    onLog('  → 需求分析Agent: 完成 ✔️', 'success')
  }

  // 子步骤：用户研究（不包含问题）
  async function executeSubStepUserResearch(callbacks: any, sleep: (ms: number) => Promise<void>) {
    const { onLog, onProgress, onResult } = callbacks
    onProgress(SUB_STEP_IDS.USER_RESEARCH, 'active')
    onLog('  → 用户研究Agent: 分析目标用户...', 'loading')
    await sleep(800)
    onResult(mockResults[1] as ResultItem)
    onProgress(SUB_STEP_IDS.USER_RESEARCH, 'completed')
    onLog('  → 用户研究Agent: 目标用户确认 ✔️', 'success')
  }

  // 子步骤：竞品分析
  async function executeSubStepCompetitor(callbacks: any, sleep: (ms: number) => Promise<void>) {
    const { onLog, onProgress, onResult } = callbacks
    onProgress(SUB_STEP_IDS.COMPETITOR, 'active')
    onLog('  → 竞品分析Agent: 竞品分析中...', 'loading')
    await sleep(1500)
    onResult(mockResults[2] as ResultItem)
    onProgress(SUB_STEP_IDS.COMPETITOR, 'completed')
    onLog('  → 竞品分析Agent: 完成 ✔️', 'success')
  }

  try {
    console.log('[MockAnalysis] Main loop starting, startFromStep:', startFromStep)

    // 从指定步骤开始执行（0-based index，所以从 startFromStep 开始）
    for (let i = startFromStep; i < steps.length; i++) {
      // 激活当前步骤
      const stepId = ['info-collection', 'decision-analysis', 'prd-generation'][i]
      console.log('[MockAnalysis] Activating step:', stepId, '(index', i, ')')
      onProgress(stepId, 'active')

      // 步骤激活时保存当前步骤索引（确保中断时状态不丢失）
      if (onStepComplete) {
        onStepComplete(i)
        console.log('[MockAnalysis] Step', i, 'activated, saved currentStepIndex:', i)
      }

      // 执行步骤
      await steps[i].execute()

      // 步骤完成后，保存下一步索引（用于断点续传）
      if (onStepComplete) {
        const nextStepIndex = i + 1
        onStepComplete(nextStepIndex)
        console.log('[MockAnalysis] Step', i, 'completed, saved nextStepIndex:', nextStepIndex)
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
