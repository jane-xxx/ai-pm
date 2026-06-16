import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
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
