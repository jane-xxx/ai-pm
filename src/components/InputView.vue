<template>
  <div class="input-view">
    <div class="input-container">
      <!-- 标题区域 -->
      <div class="header-section">
        <div class="logo-badge">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          </svg>
          <span>AI分析</span>
        </div>
        <h1 class="title">智能分析你的产品想法</h1>
        <p class="subtitle">输入你的产品描述，AI将为你生成全面的产品分析报告</p>
      </div>

      <!-- 输入区域 -->
      <div class="input-section">
        <div class="input-card">
          <div class="input-header">
            <span class="input-label">描述你的产品想法</span>
            <span class="input-hint">可以包括目标用户、核心功能、解决的问题等</span>
          </div>
          <textarea
            v-model="inputValue"
            class="idea-input"
            placeholder="例如：我想做一个帮助设计师管理设计稿的工具..."
            @input="updateInput"
          ></textarea>
          <div class="input-footer">
            <button
              class="btn-analyze"
              :disabled="!inputValue.trim()"
              @click="handleStart"
            >
              <span>开始分析</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6 3L11 8L6 13V3Z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 示例选择 -->
        <div class="examples-section">
          <p class="examples-label">选择示例</p>
          <div class="examples-grid">
            <button
              v-for="example in examples"
              :key="example.id"
              class="example-item"
              @click="selectExample(example.text, example.title)"
            >
              {{ example.title }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAnalysisStore } from '@/stores/analysis'
import { useProjectStore } from '@/stores/project'

const router = useRouter()
const analysisStore = useAnalysisStore()
const projectStore = useProjectStore()
const inputValue = ref('')
const selectedExampleTitle = ref('')

const examples = [
  { id: 1, title: '设计师协作工具', text: '我想做一个帮助设计师管理设计稿的工具，支持版本控制、团队协作和设计评审功能，主要面向中小型设计团队。' },
  { id: 2, title: '习惯养成APP', text: '开发一款习惯养成类APP，通过游戏化机制帮助用户建立和坚持好习惯，包含打卡、好友PK、成就系统等功能。' },
  { id: 3, title: '自由工作平台', text: '打造一个连接自由职业者和客户的平台，提供项目匹配、合同管理、支付托管等一站式服务，专注于创意行业。' },
  { id: 4, title: '智能健身助手', text: '基于AI的智能健身应用，根据用户身体数据、运动习惯和目标，自动生成个性化训练计划，并通过动作识别提供实时反馈。' }
]

const updateInput = () => {
  selectedExampleTitle.value = ''
}

const selectExample = (text: string, title: string) => {
  inputValue.value = text
  selectedExampleTitle.value = title
}

const goToProjects = () => {
  router.push({ name: 'projects' })
}

const handleStart = () => {
  if (inputValue.value.trim()) {
    const newProject = projectStore.createProject({
      description: inputValue.value,
      exampleTitle: selectedExampleTitle.value
    })
    projectStore.setCurrentProject(newProject.id)
    analysisStore.startAnalysis(inputValue.value)
    router.push({ name: 'workspace', params: { projectId: newProject.id } })
  }
}
</script>

<style lang="less" scoped>
.input-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #F5F3FF 0%, #F8FAFC 50%, #F0F9FF 100%);
}

.input-container {
  width: 100%;
  max-width: 800px;
}

.header-section {
  text-align: center;
  margin-bottom: 40px;
  animation: fadeIn 0.5s ease;
}

.logo-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #7C3AED, #4F46E5);
  color: white;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
}

.title {
  font-size: 42px;
  font-weight: 700;
  color: #1E293B;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 18px;
  color: #64748B;
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.6;
}

.input-section {
  margin-bottom: 48px;
  animation: fadeIn 0.6s ease 0.1s backwards;
}

.input-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05),
              0 20px 40px rgba(124, 58, 237, 0.08);
  border: 1px solid #F1F5F9;
  margin-bottom: 24px;
}

.input-header {
  margin-bottom: 16px;
}

.input-label {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #1E293B;
  margin-bottom: 4px;
}

.input-hint {
  font-size: 14px;
  color: #94A3B8;
}

.idea-input {
  width: 100%;
  height: 140px;
  padding: 16px;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  font-size: 15px;
  line-height: 1.7;
  resize: none;
  outline: none;
  transition: all 0.2s ease;
  font-family: inherit;

  &:focus {
    border-color: #A78BFA;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
  }

  &::placeholder {
    color: #CBD5E1;
  }
}

.input-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.btn-analyze {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #7C3AED, #4F46E5);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  svg {
    transition: transform 0.2s ease;
  }

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);

    svg {
      transform: translateX(2px);
    }
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.examples-section {
  animation: fadeIn 0.6s ease 0.2s backwards;
}

.examples-label {
  font-size: 14px;
  color: #64748B;
  margin-bottom: 12px;
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.example-item {
  padding: 12px 16px;
  background: white;
  border: 1px solid #F1F5F9;
  border-radius: 12px;
  font-size: 13px;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;

  &:hover {
    border-color: #A78BFA;
    color: #7C3AED;
    box-shadow: 0 2px 8px rgba(124, 58, 237, 0.1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .title {
    font-size: 32px;
  }

  .subtitle {
    font-size: 16px;
  }

  .input-card {
    padding: 20px;
  }

  .examples-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
