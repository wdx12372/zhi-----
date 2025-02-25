import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
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