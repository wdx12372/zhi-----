import { defineStore } from 'pinia'
import { chatAPI } from '../services/api'
import axios from 'axios'

// 模拟用户数据库
const MOCK_USERS = [
  {
    id: 'user-001',
    username: 'admin',
    password: 'admin123',
    role: '管理员',
    department: '系统管理部'
  },
  {
    id: 'user-002', 
    username: 'police',
    password: 'police123',
    role: '警官',
    department: '刑侦科'
  }
]

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: 'abc-123', // 默认用户ID
    userInfo: null, // 用户信息
    error: null,
    settings: {
      theme: 'light',
      fontSize: 'medium',
      notifications: true,
      sound: true,
      autoSave: true
    },
    favorites: [],
    history: []
  }),

  getters: {
    isLoggedIn: (state) => {
      // 确保正确判断登录状态
      return !!state.userInfo
    },
    getFavorites: (state) => state.favorites,
    getHistory: (state) => state.history,
    getUserId: (state) => state.userId,
  },

  actions: {
    // 注册新用户
    async register(credentials) {
      try {
        // 检查用户是否已存在
        const existingUser = MOCK_USERS.find(u => u.username === credentials.username)
        if (existingUser) {
          console.error('用户已存在')
          return false
        }

        // 创建新用户
        const newUser = {
          id: `user-${MOCK_USERS.length + 1}`,
          username: credentials.username,
          password: credentials.password,
          role: '普通用户',
          department: '默认部门'
        }

        // 模拟异步操作
        return new Promise((resolve) => {
          setTimeout(() => {
            MOCK_USERS.push(newUser)
            this.userId = newUser.id
            this.userInfo = newUser
            this.saveToLocalStorage()
            resolve(true)
          }, 500)
        })
      } catch (error) {
        console.error('注册失败:', error)
        return false
      }
    },

    // 登录方法
    async login(credentials) {
      try {
        // 模拟登录验证
        const user = MOCK_USERS.find(
          u => u.username === credentials.username && u.password === credentials.password
        )

        // 模拟异步操作
        return new Promise((resolve) => {
          setTimeout(() => {
            if (user) {
              this.userId = user.id
              this.userInfo = user
              this.saveToLocalStorage()
              resolve(true)
            } else {
              console.error('用户名或密码错误')
              resolve(false)
            }
          }, 500)
        })
      } catch (error) {
        console.error('登录失败:', error)
        return false
      }
    },

    // 退出登录
    logout() {
      this.userInfo = null
      this.userId = null
      localStorage.removeItem('userInfo')
    },

    // 获取用户信息
    async fetchUserInfo() {
      try {
        const response = await chatAPI.getAppInfo()
        this.userInfo = response.data // 更新用户信息
      } catch (error) {
        this.error = error.message
        console.error('获取用户信息失败:', error)
      }
    },

    // 更新用户信息
    async updateUserInfo(newInfo) {
      try {
        // 假设有一个API可以更新用户信息
        const response = await chatAPI.updateUserInfo(this.userId, newInfo)
        this.userInfo = response.data // 更新用户信息
      } catch (error) {
        this.error = error.message
        console.error('更新用户信息失败:', error)
      }
    },

    // 获取应用参数
    async fetchAppParameters() {
      try {
        const response = await chatAPI.getAppParameters()
        console.log('应用参数:', response.data)
        return response.data // 返回应用参数
      } catch (error) {
        this.error = error.message
        console.error('获取应用参数失败:', error)
      }
    },

    // 获取应用信息
    async fetchAppMeta() {
      try {
        const response = await chatAPI.getAppMeta()
        console.log('应用信息:', response.data)
        return response.data // 返回应用信息
      } catch (error) {
        this.error = error.message
        console.error('获取应用信息失败:', error)
      }
    },

    setUserInfo(info) {
      this.userInfo = { ...this.userInfo, ...info }
    },

    updateSettings(newSettings) {
      this.settings = { ...this.settings, ...newSettings }
      this.saveToLocalStorage()
    },

    addToFavorites(item) {
      if (!this.favorites.find(f => f.id === item.id)) {
        this.favorites.push(item)
        this.saveToLocalStorage()
      }
    },

    removeFromFavorites(itemId) {
      this.favorites = this.favorites.filter(f => f.id !== itemId)
      this.saveToLocalStorage()
    },

    addToHistory(item) {
      // 避免重复添加
      const existingIndex = this.history.findIndex(h => h.id === item.id)
      if (existingIndex !== -1) {
        this.history.splice(existingIndex, 1)
      }
      
      // 添加到历史记录开头
      this.history.unshift(item)
      
      // 限制历史记录数量
      if (this.history.length > 100) {
        this.history.pop()
      }
      
      this.saveToLocalStorage()
    },

    clearHistory() {
      this.history = []
      this.saveToLocalStorage()
    },

    saveToLocalStorage() {
      localStorage.setItem('userSettings', JSON.stringify(this.settings))
      localStorage.setItem('userFavorites', JSON.stringify(this.favorites))
      localStorage.setItem('userHistory', JSON.stringify(this.history))
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
    },

    loadFromLocalStorage() {
      try {
        const userInfo = localStorage.getItem('userInfo')
        if (userInfo) {
          this.userInfo = JSON.parse(userInfo)
        }
      } catch (error) {
        console.error('加载用户信息失败:', error)
      }
    },
  }
})