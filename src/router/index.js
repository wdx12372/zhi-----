import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    redirect: '/login'  // 默认重定向到登录页
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/home',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue')
      },
      {
        path: '/tianwen', // 使用完整路径
        name: 'Tianwen',
        component: () => import('@/views/TianwenTracker.vue')
      },
      {
        path: '/strategy', // 使用完整路径
        name: 'Strategy',
        component: () => import('@/views/Strategy.vue')
      },
      {
        path: '/general', // 使用完整路径
        name: 'general',
        component: () => import('@/views/GeneralChat.vue')
      },
      {
        path: '/favorites', // 使用完整路径
        name: 'favorites',
        component: () => import('@/views/Favorites.vue')
      },
      {
        path: '/settings',
        name: 'Settings',
        component: () => import('@/views/Settings.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  console.log('路由跳转:', to.path)
  console.log('登录状态:', userStore.isLoggedIn)

  // 如果未登录且访问需要认证的页面，重定向到登录页
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
    return
  }
  
  // 如果已登录且访问登录页，重定向到首页
  if (to.path === '/login' && userStore.isLoggedIn) {
    next('/home')
    return
  }

  next()
})

export default router 