import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/user'
import { useChatStore } from './stores/chat'
import './styles/main.css'
import '@fortawesome/fontawesome-free/css/all.css'
import ToastPlugin from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-bootstrap.css'

// 创建应用实例和 pinia
const app = createApp(App)
const pinia = createPinia()

// 先安装 pinia
app.use(pinia)

// 初始化 store
const userStore = useUserStore()
userStore.loadFromLocalStorage() // 加载用户状态

// 再安装路由，这样路由守卫可以正确访问到 store
app.use(router)
app.use(ToastPlugin)

// 挂载应用
app.mount('#app')

// 错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('应用错误:', err)
  console.error('错误信息:', info)
}

app.config.warnHandler = (msg, vm, trace) => {
  console.warn('应用警告:', msg)
  console.warn('警告追踪:', trace)
}

if (process.env.NODE_ENV === 'development') {
  app.config.performance = true
} 