import { defineStore } from 'pinia'
import { ref } from 'vue'
import { generateProjectName } from '@/utils/keywordExtractor'

export interface Project {
  id: string
  name: string
  description: string
  status: 'analyzing' | 'completed' | 'draft'
  createdAt: number
  updatedAt: number
  results?: any[]
  // 保存分析进度状态
  analysisState?: {
    currentState: string
    originalIdea: string
    logs: any[]
    results: any[]
    currentQuestion: any
    questionHistory: any[]
    userResponses: any
    currentStepIndex?: number  // 下一步要执行的步骤索引
    activeTab?: string  // 当前选中的结果tab
  }
}

export const useProjectStore = defineStore('project', () => {
  const projects = ref<Project[]>([
    {
      id: '1',
      name: 'AI面试产品',
      description: '我要做一个AI面试产品，针对应届生，帮助企业更高效地完成初筛和面试评估。',
      status: 'completed',
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 86400000,
      results: [
        {
          id: 'r1',
          order: 1,
          title: '需求分析报告',
          content: '基于您的产品想法，核心需求已识别：\n\n1. **核心痛点**：企业在应届生招聘中面临简历筛选效率低、初筛面试耗时、评估标准不统一等问题。\n\n2. **功能模块拆解**：\n   - 简历解析模块：AI自动提取关键信息\n   - 视频面试模块：支持异步视频回答\n   - 智能评估模块：AI分析候选人表现\n   - 数据报告模块：生成面试分析报告\n\n3. **优先级排序**：简历解析 > 视频面试 > 智能评估 > 数据报告'
        },
        {
          id: 'r2',
          order: 2,
          title: '用户画像与场景分析',
          content: '目标用户分析：\n\n**核心用户群体**：\n- HR招聘专员：需要快速筛选大量简历\n- 业务部门面试官：希望标准化初筛流程\n- 应届生求职者：渴望展示真实能力\n\n**典型使用场景**：\n1. 校招季HR收到数千份简历，需要快速筛选\n2. 面试官无法逐一面谈，需要异步视频初筛\n3. 候选人希望通过标准化视频展示自己\n\n**用户痛点**：传统电话面试效率低、时间难协调、评估主观性强，缺乏可量化的候选人对比数据。'
        },
        {
          id: 'r3',
          order: 3,
          title: '竞品分析与差异化机会',
          content: '主要竞品分析：\n\n** HireVue**：国际领先的视频面试平台，AI评估能力强，但价格昂贵且对国内用户习惯适配不足。\n\n**面试虎**：国内视频面试工具，功能基础，缺乏AI深度分析能力。\n\n**北森**：大厂HR系统，面试功能是附属模块，不够专业。\n\n**差异化机会**：\n1. 专注应届生场景：针对校招特点优化流程\n2. AI本土化：基于国内面试数据训练模型\n3. 价格优势：中小企业友好定价策略\n4. 易用性：简化操作流程，降低学习成本'
        },
        {
          id: 'r4',
          order: 4,
          title: '产品方案与技术架构',
          content: '**产品方案设计**：\n\n1. **智能简历解析**\n   - 支持PDF/Word/图片格式简历\n   - AI提取关键信息（学校、专业、实习等）\n   - 自动标签化候选人特征\n\n2. **异步视频面试**\n   - 企业预设面试问题\n   - 候选人录制视频回答\n   - 支持限时录制和重录\n\n3. **AI智能评估**\n   - 视频语音转文字分析\n   - 表达能力、逻辑思维评分\n   - 情绪稳定性、自信度评估\n\n4. **数据看板**\n   - 候选人排名对比\n   - 面试数据统计分析\n   - 一键生成评估报告\n\n---\n\n**技术架构选型**：\n\n**前端技术栈**：Vue 3 + TypeScript + Vite，视频录制使用 MediaRecorder API。\n\n**后端技术栈**：Python + FastAPI，集成 OpenAI Whisper 语音识别。\n\n**AI模型**：简历解析使用 NLP 模型，视频分析使用多模态评估模型。\n\n**数据存储**：PostgreSQL（用户数据）、OSS（视频存储）、Redis（缓存）。'
        },
        {
          id: 'r5',
          order: 5,
          title: 'MVP 规划与商业模式',
          content: '**分阶段产品路线图**：\n\n**第一阶段 - MVP（2个月）**：简历解析 + 异步视频面试 + 基础评估报告。\n\n**第二阶段（3个月）**：AI深度分析 + 企业定制化评估模板 + 数据看板。\n\n**第三阶段（3个月）**：实时视频面试 + AI面试官 + 开放API。\n\n**发布策略**：先与3-5家中小企业合作试点，验证核心价值，再通过校招旺季推广。\n\n---\n\n**商业模式与定价**：\n\n**免费版**：5个职位/月，基础功能，供小团队试用。\n\n**专业版（¥299/月）**：50个职位/月，完整AI分析功能。\n\n**企业版（¥999/月起）**：无限职位、私有部署、定制开发、专属客服。\n\n**增值服务**：简历数据库查询、候选人背调服务、招聘SaaS集成。\n\n**获客策略**：HR社群运营、校招合作、内容营销（面试技巧分享）。'
        },
        {
          id: 'r6',
          order: 6,
          title: 'PRD 文档结构设计',
          content: '**PRD 文档结构**：\n\n## 1. 产品概述\n### 1.1 产品背景\n应届生招聘市场效率低下，传统面试方式存在时间成本高、评估标准不统一、候选人对比困难等痛点。\n\n### 1.2 产品定位\n面向中小企业的应届生智能面试评估平台，通过 AI 技术实现简历智能解析、异步视频面试和自动化评估，提升招聘效率 80%。\n\n### 1.3 目标用户\n- 主要用户：HR 招聘专员、业务面试官\n- 次要用户：应届生求职者\n- 企业客户：50-500 人规模的中小企业\n\n---\n\n## 2. 核心功能\n### 2.1 功能优先级\nP0（必须有）：简历解析、视频录制、基础评估\nP1（应该有）：智能评分、数据报告\nP2（可以有）：实时面试、AI 面试官\n\n### 2.2 功能依赖关系\n简历解析 → 视频面试 → AI 评估 → 报告生成'
        },
        {
          id: 'r7',
          order: 7,
          title: 'AI 面试产品 PRD 文档',
          content: '# AI 面试产品 PRD\n\n## 1. 产品概述\n\n### 1.1 产品背景\n应届生招聘市场存在显著痛点：企业 HR 面对海量简历筛选效率低下，传统电话面试耗时且评估标准不统一，候选人面试时间难以协调，缺乏可量化的对比数据。\n\n### 1.2 产品定位\n面向中小企业的应届生智能面试评估平台，通过 AI 技术实现全流程自动化，提升招聘效率 80%。\n\n### 1.3 目标用户\n- **HR 招聘专员**：需要快速筛选大量简历，希望标准化初筛流程\n- **业务面试官**：希望获得客观的候选人评估报告，减少无效面试\n- **应届生求职者**：希望展示真实能力，不受时间地点限制\n\n### 1.4 使用场景\n1. 校招季 HR 收到数千份简历，需要快速筛选出合格候选人\n2. 面试官无法逐一面谈，需要异步视频初筛工具\n3. 候选人希望异步展示自己，避免时间冲突\n\n---\n\n## 2. 功能需求\n\n### 2.1 智能简历解析\n**功能描述**：支持上传 PDF/Word/图片格式简历，AI 自动提取关键信息\n\n**核心能力**：\n- 自动识别学校、专业、实习经历等关键信息\n- 智能标签化候选人特征（技能、项目经验等）\n- 简历质量评分和优化建议\n\n### 2.2 异步视频面试\n**功能描述**：企业预设面试问题，候选人录制视频回答\n\n**核心能力**：\n- 支持企业自定义面试问题模板\n- 候选人可限时录制和重录（最多 3 次）\n- 视频上传云端，支持随时随地查看\n\n### 2.3 AI 智能评估\n**功能描述**：AI 分析视频内容，提供多维度评估\n\n**核心能力**：\n- 视频语音转文字，语义分析\n- 表达能力、逻辑思维、情绪稳定性评分\n- 候选人排名对比和推荐\n\n### 2.4 数据报告\n**功能描述**：生成结构化面试分析报告\n\n**核心能力**：\n- 一键生成 PDF 面试报告\n- 候选人能力雷达图\n- 历史数据统计分析\n\n---\n\n## 3. 非功能需求\n\n### 3.1 性能要求\n- 简历解析响应时间 < 3 秒\n- 视频上传支持 100MB 文件\n- AI 评估处理时间 < 30 秒\n\n### 3.2 安全要求\n- 视频数据加密存储\n- 访问权限控制\n- 数据隐私保护\n\n---\n\n## 4. 技术方案\n\n**前端**：Vue 3 + TypeScript + Vite\n**后端**：Python + FastAPI\n**AI**：OpenAI Whisper 语音识别 + 多模态评估模型\n**存储**：PostgreSQL + OSS + Redis'
        }
      ]
    }
  ])

  const currentProject = ref<Project | null>(null)

  // 创建项目
  const createProject = (data: { description: string; exampleTitle?: string }) => {
    const now = Date.now()
    // 如果提供了示例标题，使用它；否则使用关键字提取
    const name = data.exampleTitle ? data.exampleTitle + '项目' : generateProjectName(data.description)

    const newProject: Project = {
      id: String(now),
      name,
      description: data.description,
      status: 'analyzing',
      createdAt: now,
      updatedAt: now
    }
    projects.value.unshift(newProject)
    currentProject.value = newProject
    return newProject
  }

  // 设置当前项目
  const setCurrentProject = (projectId: string) => {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      // 确保从 projects 数组中获取最新的项目数据（包括 analysisState）
      currentProject.value = project
    } else {
      console.error('[ProjectStore] Project not found:', projectId)
    }
  }

  // 更新项目状态
  const updateProjectStatus = (projectId: string, status: Project['status']) => {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      project.status = status
      project.updatedAt = Date.now()
    } else {
      console.error('[ProjectStore] Project not found for status update:', projectId)
    }
  }

  // 删除项目
  const deleteProject = (projectId: string) => {
    const index = projects.value.findIndex(p => p.id === projectId)
    if (index > -1) {
      projects.value.splice(index, 1)
    }
    if (currentProject.value?.id === projectId) {
      currentProject.value = null
    }
  }

  // 获取最近项目
  const getRecentProjects = (limit = 5) => {
    return projects.value.slice(0, limit)
  }

  // 保存分析状态到项目
  const saveAnalysisState = (projectId: string, analysisState: any, currentStepIndex: number = 0) => {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      // 安全地获取 ref 的值（如果存在）
      const getValue = (ref: any) => ref && typeof ref === 'object' && 'value' in ref ? ref.value : ref

      const userResponsesValue = getValue(analysisState.userResponses)

      project.analysisState = {
        currentState: getValue(analysisState.currentState),
        originalIdea: getValue(analysisState.originalIdea),
        logs: getValue(analysisState.logs),
        results: getValue(analysisState.results),
        currentQuestion: getValue(analysisState.currentQuestion),
        questionHistory: getValue(analysisState.questionHistory),
        userResponses: Array.from(userResponsesValue || []),
        currentStepIndex, // 记录当前进行到第几步
        activeTab: getValue(analysisState.activeTab) // 记录当前选中的结果tab
      }
      project.updatedAt = Date.now()
    } else {
      console.error('[ProjectStore] Project not found for id:', projectId)
    }
  }

  // 清除项目的分析状态
  const clearAnalysisState = (projectId: string) => {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      project.analysisState = undefined
    }
  }

  return {
    projects,
    currentProject,
    createProject,
    setCurrentProject,
    updateProjectStatus,
    deleteProject,
    getRecentProjects,
    saveAnalysisState,
    clearAnalysisState
  }
})
