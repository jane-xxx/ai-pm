<template>
  <div class="sidebar">
    <!-- Logo区 -->
    <div class="logo-section" @click="handleLogoClick">
      <div class="logo-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="logo-text">
        <span class="logo-title">AI PM</span>
        <span class="logo-subtitle">产品经理助手</span>
      </div>
    </div>

    <!-- 导航菜单 -->
    <nav class="nav-menu">
      <button
        class="nav-item nav-item-primary"
        @click="handleClick('new-project')"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        <span>新建项目</span>
      </button>

      <button
        :class="['nav-item', { active: currentView === 'workspace' }]"
        @click="handleClick('workspace')"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span>工作台</span>
      </button>

      <button
        :class="['nav-item', { active: currentView === 'projects' || currentView === 'project-detail' }]"
        @click="handleClick('projects')"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <line x1="9" y1="3" x2="9" y2="21"/>
        </svg>
        <span>项目管理</span>
      </button>
    </nav>

    <!-- 底部用户信息 -->
    <div class="user-section">
      <div class="user-avatar">
        <span>PM</span>
      </div>
      <div class="user-info">
        <span class="user-name">产品经理</span>
        <span class="user-role">Pro</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Props {
  currentView: string
}

interface Emits {
  (e: 'viewChange', view: string): void
}

defineProps<Props>()

const emit = defineEmits<Emits>()
const router = useRouter()

const handleClick = (view: string) => {
  emit('viewChange', view)
}

// 点击 Logo 返回首页
const handleLogoClick = () => {
  router.push({ name: 'input' })
}
</script>

<style lang="less" scoped>
.sidebar {
  width: 240px;
  background: white;
  border-right: 1px solid #E2E8F0;
  display: flex;
  flex-direction: column;
  padding: 20px 16px;
}

// === Logo区 ===
.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin-bottom: 24px;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
}

.logo-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #7C3AED, #4F46E5);
  border-radius: 12px;
  color: white;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-title {
  font-size: 16px;
  font-weight: 700;
  color: #1E293B;
  letter-spacing: -0.5px;
}

.logo-subtitle {
  font-size: 11px;
  color: #94A3B8;
}

// === 导航菜单 ===
.nav-menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  color: #64748B;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    background: #F1F5F9;
    color: #1E293B;
  }

  &.active {
    background: linear-gradient(135deg, #F5F3FF, #EDE9FE);
    color: #7C3AED;
    font-weight: 500;
  }

  &.nav-item-primary {
    background: linear-gradient(135deg, #7C3AED, #4F46E5);
    color: white;
    font-weight: 500;
    margin: 8px 0;
    justify-content: center;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
    }
  }
}

// === 用户信息 ===
.user-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin-top: auto;
  background: #F8FAFC;
  border-radius: 10px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #A78BFA, #7C3AED);
  color: white;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: #1E293B;
}

.user-role {
  font-size: 11px;
  color: #94A3B8;
}
</style>
