<template>
  <div class="markdown-renderer" v-html="renderedHtml"></div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, ref } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import cpp from 'highlight.js/lib/languages/cpp'
import css from 'highlight.js/lib/languages/css'
import html from 'highlight.js/lib/languages/xml'
import json from 'highlight.js/lib/languages/json'
import yaml from 'highlight.js/lib/languages/yaml'
import bash from 'highlight.js/lib/languages/bash'
import sql from 'highlight.js/lib/languages/sql'
import markdown from 'highlight.js/lib/languages/markdown'
import DOMPurify from 'dompurify'

// 注册常用语言
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('py', python)
hljs.registerLanguage('java', java)
hljs.registerLanguage('go', go)
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('c++', cpp)
hljs.registerLanguage('css', css)
hljs.registerLanguage('html', html)
hljs.registerLanguage('xml', html)
hljs.registerLanguage('json', json)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('yml', yaml)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sh', bash)
hljs.registerLanguage('shell', bash)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('md', markdown)

interface Props {
  content: string
  typewriter?: boolean
  typewriterSpeed?: number
}

const props = withDefaults(defineProps<Props>(), {
  typewriter: false,
  typewriterSpeed: 5
})

const currentContent = ref(props.content)

// 配置 markdown-it
const md = new MarkdownIt({
  html: true,        // 允许 HTML 标签
  linkify: true,     // 自动转换 URL 为链接
  typographer: true, // 启用一些语言中立的替换 + 引号美化
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(code, { language: lang }).value}</code></pre>`
      } catch (e) {
        // 如果高亮失败，返回原始代码
      }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(code)}</code></pre>`
  }
})

// 渲染 Markdown 为 HTML
const renderedHtml = computed(() => {
  if (!currentContent.value) return ''
  const html = md.render(currentContent.value)
  // 使用 DOMPurify 清理 HTML，防止 XSS
  return DOMPurify.sanitize(html)
})

// 监听内容变化
watch(() => props.content, (newContent) => {
  if (props.typewriter) {
    // 打字机效果由 TypewriterText 组件处理
    currentContent.value = newContent
  } else {
    currentContent.value = newContent
  }
})

onMounted(() => {
  currentContent.value = props.content
})
</script>

<style lang="less">
// 导入 highlight.js 主题样式（使用 atom-one-dark 主题）
@import 'highlight.js/styles/atom-one-dark.css';

.markdown-renderer {
  font-size: 14px;
  color: #4B5563;
  line-height: 1.7;
  word-wrap: break-word;

  // 标题样式
  h1, h2, h3, h4, h5, h6 {
    color: #1E293B;
    font-weight: 600;
    margin-top: 16px;
    margin-bottom: 8px;
    line-height: 1.4;
  }

  h1 {
    font-size: 24px;
    border-bottom: 2px solid #E2E8F0;
    padding-bottom: 8px;
  }

  h2 {
    font-size: 20px;
    border-bottom: 1px solid #E2E8F0;
    padding-bottom: 6px;
  }

  h3 {
    font-size: 18px;
  }

  h4 {
    font-size: 16px;
  }

  h5, h6 {
    font-size: 14px;
  }

  // 段落
  p {
    margin: 8px 0;
  }

  // 列表
  ul, ol {
    margin: 8px 0;
    padding-left: 20px;
  }

  li {
    margin: 4px 0;
  }

  // 引用
  blockquote {
    margin: 12px 0;
    padding: 8px 12px;
    background: #F3F4F6;
    border-left: 4px solid #7C3AED;
    color: #64748B;
  }

  blockquote p {
    margin: 0;
  }

  // 代码块
  pre {
    margin: 12px 0;
    border-radius: 8px;
    overflow-x: auto;
    background: #282C34 !important;

    code {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
      font-size: 13px;
      line-height: 1.5;
    }
  }

  // 行内代码
  code:not(pre code) {
    background: #F3F4F6;
    color: #E11D48;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
    font-size: 13px;
  }

  // 表格
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 13px;
  }

  th, td {
    padding: 8px 12px;
    border: 1px solid #E2E8F0;
    text-align: left;
  }

  th {
    background: #F9FAFB;
    font-weight: 600;
    color: #374151;
  }

  tr:nth-child(even) {
    background: #F9FAFB;
  }

  // 链接
  a {
    color: #7C3AED;
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: #6D28D9;
      text-decoration: underline;
    }
  }

  // 水平线
  hr {
    border: none;
    border-top: 2px solid #E2E8F0;
    margin: 16px 0;
  }

  // 图片
  img {
    max-width: 100%;
    border-radius: 8px;
    margin: 8px 0;
  }

  // 强调
  strong {
    font-weight: 600;
    color: #1E293B;
  }

  em {
    font-style: italic;
    color: #64748B;
  }

  // 删除线
  del {
    color: #9CA3AF;
  }

  // 任务列表
  input[type="checkbox"] {
    margin-right: 8px;
    accent-color: #7C3AED;
  }
}
</style>
