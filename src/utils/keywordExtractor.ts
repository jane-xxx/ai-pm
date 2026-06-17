/**
 * 浏览器兼容的中文关键字提取工具
 * 基于 Trie 树的最大匹配算法
 */

// 停用词列表
const STOP_WORDS = new Set([
  '的', '了', '和', '与', '或', '及', '以', '用', '由', '从', '为',
  '我', '你', '他', '她', '它', '我们', '你们', '他们',
  '是', '有', '在', '要', '想', '做', '能', '可以', '会', '让',
  '一个', '这个', '那个', '这样', '那样', '一些', '某个',
  '帮助', '提供', '支持', '包含', '通过', '基于', '根据', '用于',
  '开发', '打造', '创建', '建立', '构建', '制作', '实现',
  '款', '项', '套', '个', '种', '类',
  '等', '等等', '之类', '以及', '关于', '针对'
])

// 核心词典
const CORE_DICT = [
  // 行业/领域
  '教育', '医疗', '健康', '健身', '运动', '美食', '旅游', '出行',
  '金融', '支付', '电商', '购物', '社交', '娱乐', '游戏', '音乐',
  '视频', '直播', '内容', '资讯', '新闻', '办公', '协作', '效率',
  '设计', '创意', '营销', '广告', '客服', '招聘', '求职', '面试',
  '房产', '汽车', '物流', '配送', '家政', '维修', '美容', '美妆',
  '宠物', '母婴', '少儿', '校园', '职场', '创业', '投资', '理财',
  // 技术/产品类型
  'AI', '人工智能', '智能', '数据', '云计算', 'SaaS', 'API',
  '网站', '网页', '小程序', 'APP', '应用', '软件', '系统', '平台',
  '数据库', '服务器', '前端', '后端', '全栈', '测试', 'Demo',
  // 功能
  '推荐', '搜索', '匹配', '筛选', '分析', '统计', '监控', '管理',
  '推送', '通知', '预约', '下单', '客服', '社区', '论坛',
  '版本控制', '团队协作', '设计评审', '习惯养成', '游戏化',
  // 用户群体
  '应届生', '设计师', '开发者', '创业者', '白领', '学生', '教师',
  '医生', '律师', '工程师', '产品经理', '面试官', '候选人',
  // 对象/目标
  '设计稿', '简历', '用户', '客户', '企业', '团队', '项目', '任务',
  // 常见词汇
  '管理', '工具', '平台', '系统', '服务', '功能', '模块', '流程'
]

// 构建 Trie 树
class TrieNode {
  children: Record<string, TrieNode> = {}
  isWord = false
}

function buildTrie(words: string[]): TrieNode {
  const root = new TrieNode()
  for (const word of words) {
    let node = root
    for (const char of word) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode()
      }
      node = node.children[char]
    }
    node.isWord = true
  }
  return root
}

const CORE_TRIE = buildTrie(CORE_DICT)

/**
 * 最大正向匹配分词
 */
function segment(text: string): string[] {
  const tokens: string[] = []
  let i = 0
  const maxWordLength = 6 // 最长词可能是6个字

  while (i < text.length) {
    const char = text[i]

    // 跳过标点和空格
    if (/[，。！？、,.\s!?]/.test(char)) {
      i++
      continue
    }

    // 英文单词提取
    if (/[a-zA-Z]/.test(char)) {
      let word = ''
      while (i < text.length && /[a-zA-Z0-9]/.test(text[i])) {
        word += text[i]
        i++
      }
      if (word.length >= 2) {
        tokens.push(word)
      }
      continue
    }

    // 中文最大匹配
    let matched = false
    let node = CORE_TRIE

    // 尝试匹配最长词
    for (let len = 1; len <= maxWordLength && i + len <= text.length; len++) {
      const char = text[i + len - 1]
      if (node.children[char]) {
        node = node.children[char]
        if (node.isWord) {
          matched = true
        }
      } else {
        break
      }
    }

    if (matched) {
      // 回到找到最长匹配的位置
      let wordEnd = i
      node = CORE_TRIE
      for (let len = 1; len <= maxWordLength && i + len <= text.length; len++) {
        const char = text[i + len - 1]
        if (node.children[char]) {
          node = node.children[char]
          if (node.isWord) {
            wordEnd = i + len
          }
        } else {
          break
        }
      }
      const word = text.slice(i, wordEnd)
      if (word.length >= 2) {
        tokens.push(word)
      }
      i = wordEnd
    } else {
      // 没匹配到，跳过这个字符
      i++
    }
  }

  return tokens
}

/**
 * 提取关键字
 */
function extractKeywordsFromText(text: string, maxCount = 5): string[] {
  // 分词
  const words = segment(text)

  // 过滤停用词和短词，统计词频
  const frequency: Record<string, number> = {}
  const seen = new Set<string>()

  words.forEach(word => {
    const trimmed = word.trim()

    // 跳过空字符串、停用词、单字、标点
    if (!trimmed ||
        trimmed.length < 2 ||
        STOP_WORDS.has(trimmed) ||
        /^[，。！？、,.\s!?]+$/.test(trimmed)) {
      return
    }

    frequency[trimmed] = (frequency[trimmed] || 0) + 1
    seen.add(trimmed)
  })

  // 核心词优先，然后按词频排序
  const isCoreWord = (word: string) => CORE_DICT.includes(word)

  const sorted = Array.from(seen)
    .map(word => ({
      word,
      score: frequency[word] + (isCoreWord(word) ? 3 : 0)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxCount)
    .map(({ word }) => word)

  return sorted
}

/**
 * 生成项目名称
 */
export function generateProjectName(description: string): string {
  if (!description || description.trim().length === 0) {
    return '未命名项目'
  }

  const keywords = extractKeywordsFromText(description, 3)

  if (keywords.length > 0) {
    const joined = keywords.join('')
    if (joined.length > 15) {
      return keywords[0] + '项目'
    }
    return joined + '项目'
  }

  // 降级：截取前15个字
  const cleaned = description.trim()
    .replace(/[，。！？、,.\s!?]+$/, '')
    .slice(0, 15)

  return cleaned + (cleaned.length < description.trim().length ? '...' : '') + '项目'
}

/**
 * 提取项目标签
 */
export function extractProjectTags(description: string, maxCount = 3): string[] {
  const keywords = extractKeywordsFromText(description, 10)

  // 优先返回领域关键词
  const coreTags = keywords.filter(k => CORE_DICT.includes(k))
  const otherTags = keywords.filter(k => !CORE_DICT.includes(k))

  return [...coreTags, ...otherTags].slice(0, maxCount)
}
