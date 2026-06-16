<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click="handleClose">
      <div class="modal-container" @click.stop>
        <!-- 标题栏 -->
        <div class="modal-header">
          <h2>新建分析项目</h2>
          <button class="close-btn" @click="handleClose">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- 内容区 -->
        <div class="modal-content">
          <div class="form-group">
            <label>描述你的产品想法</label>
            <div class="input-hint">可以包括目标用户、核心功能、解决的问题等</div>
            <textarea
              v-model="formData.description"
              class="textarea-field"
              placeholder="例如：我想做一个帮助设计师管理设计稿的工具..."
              rows="8"
              maxlength="500"
            ></textarea>
            <span class="char-count">{{ formData.description.length }}/500</span>
          </div>

          <div class="tips">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
            <span>提示：描述越详细，分析结果越精准</span>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="handleClose">取消</button>
          <button
            class="btn btn-primary"
            :disabled="!formData.description.trim()"
            @click="handleConfirm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            开始分析
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

interface Props {
  show: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'created', data: { description: string }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formData = reactive({
  description: ''
})

// 监听显示状态变化，重置表单
watch(() => props.show, (newVal) => {
  if (!newVal) {
    formData.description = ''
  }
})

const handleClose = () => {
  emit('close')
}

const handleConfirm = () => {
  if (!formData.description.trim()) return

  emit('created', {
    description: formData.description.trim()
  })

  // 重置表单
  formData.description = ''
}
</script>

<style lang="less" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 550px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #F1F5F9;

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #1E293B;
  }
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F1F5F9;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #64748B;
  transition: all 0.2s ease;

  &:hover {
    background: #E2E8F0;
    color: #1E293B;
  }
}

.modal-content {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #1E293B;
  margin-bottom: 4px;
}

.input-hint {
  font-size: 13px;
  color: #94A3B8;
  margin-bottom: 8px;
}

.textarea-field {
  width: 100%;
  padding: 16px;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  font-size: 15px;
  line-height: 1.7;
  font-family: inherit;
  transition: all 0.2s ease;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #A78BFA;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
  }

  &::placeholder {
    color: #CBD5E1;
  }
}

.char-count {
  display: block;
  text-align: right;
  font-size: 12px;
  color: #94A3B8;
  margin-top: 8px;
}

.tips {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px;
  background: #F5F3FF;
  border-radius: 8px;
  color: #7C3AED;
  font-size: 13px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #F1F5F9;
  background: #FAFAFA;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  &.btn-secondary {
    background: white;
    color: #64748B;
    border: 1px solid #E2E8F0;

    &:hover {
      border-color: #CBD5E1;
      background: #F8FAFC;
    }
  }

  &.btn-primary {
    background: linear-gradient(135deg, #7C3AED, #4F46E5);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

// === 动画 ===
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .modal-container {
    transform: scale(0.95);
  }
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;

  .modal-container {
    transform: scale(1);
  }
}
</style>
