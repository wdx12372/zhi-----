import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  base: '/', // 确保这里是正确的路径
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    // 代理配置仅在开发环境有效
    proxy: {
      '/api': {
        target: 'http://bot.michaeltan.org/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/chat': {
        target: 'http://bot.michaeltan.org/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/chat/, '')
      }
    }
  }
})