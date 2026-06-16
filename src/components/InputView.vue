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
            <span class="char-count">{{ inputValue.length }} 字符</span>
            <button
              class="btn btn-primary"
              :disabled="!inputValue.trim()"
              @click="handleStart"
            >
              <span>开始分析</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6 3L11 8L6 13V3Z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 特性展示 -->
      <div class="features-section">
        <div class="feature-grid">
          <div class="feature-item">
            <div class="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6V12L16 14"/>
              </svg>
            </div>
            <div class="feature-text">
              <span class="feature-title">智能分析</span>
              <span class="feature-desc">AI 自动分析产品想法</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 16V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H19C20.1046 18 21 17.1046 21 16Z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <div class="feature-text">
              <span class="feature-title">深度洞察</span>
              <span class="feature-desc">多维度产品分析</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"/>
                <path d="M8 12H16"/>
                <path d="M12 8V16"/>
              </svg>
            </div>
            <div class="feature-text">
              <span class="feature-title">交互式</span>
              <span class="feature-desc">智能提问精准分析</span>
            </div>
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

const updateInput = () => {
  // 可以在这里添加输入验证
}

const handleStart = () => {
  if (inputValue.value.trim()) {
    // 先创建项目
    const newProject = projectStore.createProject({ description: inputValue.value })
    // 设置为当前项目
    projectStore.setCurrentProject(newProject.id)
    // 启动分析
    analysisStore.startAnalysis(inputValue.value)
    // 导航到工作台（新建项目不需要传递项目ID）
    router.push({ name: 'workspace' })
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
}

.input-card {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05),
              0 20px 40px rgba(124, 58, 237, 0.08);
  border: 1px solid #F1F5F9;
  animation: fadeIn 0.6s ease 0.1s backwards;
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
  min-height: 180px;
  padding: 16px;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  font-size: 15px;
  line-height: 1.7;
  resize: vertical;
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
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #F1F5F9;
}

.char-count {
  font-size: 13px;
  color: #94A3B8;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  outline: none;

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

  &.btn-primary {
    background: linear-gradient(135deg, #7C3AED, #4F46E5);
    color: white;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.features-section {
  animation: fadeIn 0.6s ease 0.2s backwards;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid #F1F5F9;
  transition: all 0.2s ease;

  &:hover {
    border-color: #E2E8F0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }
}

.feature-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #F5F3FF, #EDE9FE);
  border-radius: 10px;
  color: #7C3AED;
  flex-shrink: 0;
}

.feature-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.feature-title {
  font-size: 14px;
  font-weight: 600;
  color: #1E293B;
}

.feature-desc {
  font-size: 13px;
  color: #64748B;
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

// 响应式
@media (max-width: 768px) {
  .title {
    font-size: 32px;
  }

  .subtitle {
    font-size: 16px;
  }

  .input-card {
    padding: 24px;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }

  .feature-item {
    padding: 12px;
  }
}
</style>
