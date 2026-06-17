import type { ProductTemplate, TemplateMatch } from './templateTypes'
import { ecommerceTemplate } from './templates/ecommerce'
import { socialTemplate } from './templates/social'
import { toolTemplate } from './templates/tool'
import { educationTemplate } from './templates/education'
import { habitTemplate } from './templates/habit'
import { freelanceTemplate } from './templates/freelance'
import { fitnessTemplate } from './templates/fitness'
import { defaultTemplate } from './templates/default'

// 所有模板列表
const templates: ProductTemplate[] = [
  ecommerceTemplate,
  socialTemplate,
  toolTemplate,
  educationTemplate,
  habitTemplate,
  freelanceTemplate,
  fitnessTemplate,
  defaultTemplate  // 默认模板放最后，作为兜底
]

/**
 * 根据输入的产品想法匹配最合适的模板
 * @param idea 用户输入的产品想法
 * @returns 匹配的模板
 */
export function matchTemplate(idea: string): ProductTemplate {
  if (!idea) {
    return defaultTemplate
  }

  const normalizedIdea = idea.toLowerCase()

  console.log('🔍 [模板匹配] 用户输入:', idea)
  console.log('🔍 [模板匹配] 输入长度:', normalizedIdea.length)

  // 计算每个模板的匹配分数
  const matches: TemplateMatch[] = templates
    .filter(t => t !== defaultTemplate)  // 排除默认模板
    .map(template => {
      const score = calculateMatchScore(normalizedIdea, template.keywords)
      console.log(`  📊 ${template.name.padEnd(15)} 关键词: [${template.keywords.slice(0, 5).join(', ')}...] → 分数: ${(score * 100).toFixed(1)}%`)
      return { template, confidence: score }
    })
    .filter(m => m.confidence > 0)  // 过滤掉没有匹配的
    .sort((a, b) => b.confidence - a.confidence)  // 按置信度排序

  console.log('🏆 [模板匹配] 匹配结果:')
  matches.forEach((m, i) => {
    console.log(`  ${i + 1}. ${m.template.name} - ${(m.confidence * 100).toFixed(1)}%`)
  })

  // 返回置信度最高的模板，如果没有匹配则返回默认模板
  const selected = matches.length > 0 ? matches[0].template : defaultTemplate
  console.log('✅ [模板匹配] 最终选择:', selected.name)
  console.log('')

  return selected
}

/**
 * 计算匹配分数
 * @param idea 用户输入（已转小写）
 * @param keywords 模板关键词列表
 * @returns 匹配分数 0-1
 */
function calculateMatchScore(idea: string, keywords: string[]): number {
  if (!keywords || keywords.length === 0) {
    return 0
  }

  let matchCount = 0
  let totalWeight = 0
  const matchedKeywords: string[] = []

  for (const keyword of keywords) {
    const weight = getKeywordWeight(keyword)
    totalWeight += weight

    if (idea.includes(keyword.toLowerCase())) {
      matchCount += weight
      matchedKeywords.push(keyword)
    }
  }

  if (matchedKeywords.length > 0) {
    console.log(`    ✓ 匹配到的关键词: [${matchedKeywords.join(', ')}]`)
  }

  return totalWeight > 0 ? matchCount / totalWeight : 0
}

/**
 * 获取关键词权重（越具体的关键词权重越高）
 */
function getKeywordWeight(keyword: string): number {
  // 多字关键词权重更高
  if (keyword.length >= 4) return 2
  if (keyword.length >= 3) return 1.5
  return 1
}
