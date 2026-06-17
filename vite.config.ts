import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { setupMockMiddleware } from './src/mock/handlers'

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'vite-plugin-mock-api',
      configureServer(server) {
        // 在开发服务器中添加mock中间件
        server.middlewares.use(setupMockMiddleware())
      }
    }
  ],
  base: '/ai-pm/', // GitHub Pages base path
  server: {
    open: true
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
