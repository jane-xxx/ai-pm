<template>
  <div class="question-card" :class="{ compact: compact }">
    <div class="question-header">
      <div class="question-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13"/>
          <path d="M12 17H12.01"/>
        </svg>
      </div>
      <div class="question-title">
        <h3>需要更多信息</h3>
        <p v-if="!compact">为了给出更精准的分析，请回答以下问题</p>
      </div>
    </div>

    <div class="question-content">
      <div class="question-text">{{ question.question }}</div>

      <!-- 选择题 -->
      <div v-if="question.inputType === 'select'" class="options-list">
        <label
          v-for="(option, index) in question.options"
          :key="index"
          class="option-item"
          :class="{ active: selectedAnswer === option }"
        >
          <input
            type="radio"
            :name="`question-${question.id}`"
            :value="option"
            v-model="selectedAnswer"
          />
          <span class="option-label">{{ option }}</span>
        </label>
      </div>

      <!-- 输入框 -->
      <div v-else class="input-wrapper">
        <textarea
          v-model="inputAnswer"
          class="question-input"
          :placeholder="compact ? '请输入...' : '请输入你的回答...'"
          :rows="compact ? 2 : 3"
        ></textarea>
      </div>
    </div>

    <div class="question-footer">
      <div v-if="question.allowSkip && !compact" class="skip-hint">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 16V12"/>
          <path d="M12 8H12.01"/>
        </svg>
        跳过后将基于"{{ question.defaultAssumption }}"假设继续分析
      </div>
      <div class="action-buttons">
        <button
          v-if="question.allowSkip"
          class="btn btn-secondary"
          @click="handleSkip"
        >
          {{ compact ? '跳过' : '跳过此问题' }}
        </button>
        <button
          class="btn btn-primary"
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          {{ compact ? '提交' : '提交并继续' }}
          <svg v-if="!compact" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6 3L11 8L6 13V3Z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ClarifyingQuestion } from '@/types'

interface Props {
  question: ClarifyingQuestion
  compact?: boolean
}

interface Emits {
  (e: 'answer', answer: string | string[], skipped: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  compact: false
})

const emit = defineEmits<Emits>()

const selectedAnswer = ref<string>('')
const inputAnswer = ref('')

const canSubmit = computed(() => {
  if (props.question.inputType === 'select') {
    return selectedAnswer.value !== ''
  }
  return inputAnswer.value.trim().length > 0
})

const handleSubmit = () => {
  const answer = props.question.inputType === 'select'
    ? selectedAnswer.value
    : inputAnswer.value.trim()

  if (answer) {
    emit('answer', answer, false)
  }
}

const handleSkip = () => {
  emit('answer', props.question.defaultAssumption, true)
}

// 重置状态
const reset = () => {
  selectedAnswer.value = ''
  inputAnswer.value = ''
}

// 监听问题变化，重置状态
watch(() => props.question.id, reset)
</script>

<script lang="ts">
import { watch } from 'vue'
export default {
  name: 'ClarifyingQuestionCard'
}
</script>

<style lang="less" scoped>
.question-card {
  background: linear-gradient(135deg, #F5F3FF, #FEFAFF);
  border-radius: 12px;
  border: 1px solid #E9D5FF;
  overflow: hidden;
  margin: 8px 0;

  &.compact {
    margin: 6px 0;
  }
}

.question-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #E9D5FF;

  .compact & {
    padding: 10px 12px;
    gap: 8px;
  }
}

.question-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 10px;
  color: #7C3AED;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(124, 58, 237, 0.12);

  .compact & {
    width: 28px;
    height: 28px;

    svg {
      width: 16px;
      height: 16px;
    }
  }
}

.question-title {
  flex: 1;

  h3 {
    font-size: 14px;
    font-weight: 600;
    color: #5B21B6;
    margin: 0 0 2px 0;

    .compact & {
      font-size: 13px;
    }
  }

  p {
    font-size: 12px;
    color: #7C3AED;
    margin: 0;
  }
}

.question-content {
  padding: 16px;

  .compact & {
    padding: 12px;
  }
}

.question-text {
  font-size: 14px;
  font-weight: 500;
  color: #1E293B;
  margin-bottom: 16px;
  line-height: 1.5;

  .compact & {
    font-size: 13px;
    margin-bottom: 12px;
  }
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .compact & {
    gap: 6px;
  }
}

.option-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  .compact & {
    padding: 8px 10px;
  }

  &:hover {
    border-color: #A78BFA;
  }

  &.active {
    border-color: #7C3AED;
    background: linear-gradient(135deg, #F5F3FF, #EDE9FE);

    .option-label {
      color: #5B21B6;
    }
  }

  input[type="radio"] {
    display: none;
  }
}

.option-label {
  margin-left: 10px;
  font-size: 13px;
  color: #475569;
  font-weight: 500;

  .compact & {
    font-size: 12px;
    margin-left: 8px;
  }
}

.option-item::before {
  content: '';
  width: 16px;
  height: 16px;
  border: 2px solid #CBD5E1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;

  .compact & {
    width: 14px;
    height: 14px;
  }
}

.option-item.active::before {
  border-color: #7C3AED;
  background: #7C3AED;
  box-shadow: inset 0 0 0 3px white;
}

.input-wrapper {
  position: relative;
}

.question-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.5;
  resize: vertical;
  outline: none;
  transition: all 0.2s ease;
  font-family: inherit;

  .compact & {
    font-size: 12px;
    padding: 8px 10px;
  }

  &:focus {
    border-color: #A78BFA;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
  }

  &::placeholder {
    color: #94A3B8;
  }
}

.question-footer {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.5);
  border-top: 1px solid #E9D5FF;

  .compact & {
    padding: 10px 12px;
  }
}

.skip-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #94A3B8;
  margin-bottom: 10px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;

  .compact & {
    gap: 6px;
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  outline: none;

  .compact & {
    padding: 6px 12px;
    font-size: 12px;
  }

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &.btn-primary {
    background: linear-gradient(135deg, #7C3AED, #4F46E5);
    color: white;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
  }

  &.btn-secondary {
    background: white;
    color: #64748B;
    border: 1px solid #E2E8F0;

    &:hover {
      border-color: #A78BFA;
      color: #7C3AED;
    }
  }
}
</style>
