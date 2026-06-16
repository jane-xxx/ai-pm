import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'input',
    component: () => import('@/components/InputView.vue')
  },
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: 'workspace/:projectId?',
        name: 'workspace',
        component: () => import('@/components/WorkspaceView.vue')
      },
      {
        path: 'projects',
        name: 'projects',
        component: () => import('@/components/ProjectManagementView.vue')
      },
      {
        path: 'projects/:id',
        name: 'project-detail',
        component: () => import('@/components/ProjectDetailView.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
