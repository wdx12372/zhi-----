<template>
    <div class="login-container">
      <div class="login-wrapper">
        <div class="login-illustration">
          <img src="../assets/智侦云谋.png" alt="Login Illustration">
        </div>
        <div class="login-box">
          <div class="login-header">
            <h2>{{ isLoginMode ? '用户登录' : '用户注册' }}</h2>
            <p>{{ isLoginMode ? '欢迎回来，请登录您的账号' : '创建一个新的账号' }}</p>
          </div>
          <form @submit.prevent="handleSubmit" class="login-form">
            <div class="form-group">
              <label>
                <i class="fas fa-user"></i>
                用户名
              </label>
              <input 
                type="text" 
                v-model="username" 
                placeholder="测试账号: admin 或 police" 
                required
              />
            </div>
            <div class="form-group">
              <label>
                <i class="fas fa-lock"></i>
                密码
              </label>
              <input 
                type="password" 
                v-model="password" 
                placeholder="测试密码: admin123 或 police123" 
                required
              />
            </div>
            <div v-if="!isLoginMode" class="form-group">
              <label>
                <i class="fas fa-lock"></i>
                确认密码
              </label>
              <input 
                type="password" 
                v-model="confirmPassword" 
                placeholder="请再次输入密码" 
                required
              />
            </div>
            <button 
              type="submit" 
              :disabled="loading" 
              class="login-button"
            >
              {{ loading ? (isLoginMode ? '登录中...' : '注册中...') : (isLoginMode ? '登录' : '注册') }}
            </button>
            
            <p v-if="error" class="error-message">{{ error }}</p>
            
            <div class="form-footer">
              <p class="test-tips">
                测试账号：admin/admin123 或 police/police123
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useUserStore } from '@/stores/user'
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  const userStore = useUserStore()
  
  const username = ref('')
  const password = ref('')
  const confirmPassword = ref('')
  const loading = ref(false)
  const error = ref('')
  const isLoginMode = ref(true)
  
  const handleSubmit = async () => {
    loading.value = true
    error.value = ''
  
    try {
      const success = await userStore.login({
        username: username.value,
        password: password.value
      })
  
      if (success) {
        router.push('/home')
      } else {
        error.value = '登录失败，请检查用户名和密码'
      }
    } catch (err) {
      error.value = err.message || '发生错误'
    } finally {
      loading.value = false
    }
  }
  
  const toggleMode = () => {
    isLoginMode.value = !isLoginMode.value
  }
  </script>
  
  <style scoped>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
    font-family: 'Arial', sans-serif;
  }
  
  .login-wrapper {
    display: flex;
    width: 900px;
    height: 600px;
    background-color: white;
    border-radius: 15px;
    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
  
  .login-illustration {
    flex: 1;
    background-color: #f4f4f4;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
  }
  
  .login-illustration img {
    max-width: 85%;
    max-height: 85%;
    object-fit: contain;
  }
  
  .login-box {
    flex: 1;
    padding: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  .login-header {
    text-align: center;
    margin-bottom: 30px;
  }
  
  .login-header h2 {
    color: #333;
    margin-bottom: 10px;
    font-size: 24px;
  }
  
  .login-header p {
    color: #666;
    font-size: 14px;
  }
  
  .login-form {
    display: flex;
    flex-direction: column;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 8px;
    color: #333;
    font-weight: 600;
  }
  
  .form-group label i {
    margin-right: 10px;
    color: #2575fc;
  }
  
  .form-group input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    transition: border-color 0.3s;
  }
  
  .form-group input:focus {
    outline: none;
    border-color: #2575fc;
  }
  
  .login-button {
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: transform 0.2s;
  }
  
  .login-button:hover {
    transform: translateY(-2px);
  }
  
  .login-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .error-message {
    color: #ff4d4f;
    text-align: center;
    margin-top: 15px;
  }
  
  .form-footer {
    text-align: center;
    margin-top: 20px;
  }
  
  .toggle-mode {
    margin-bottom: 10px;
  }
  
  .toggle-mode a {
    color: #2575fc;
    cursor: pointer;
    text-decoration: underline;
  }
  
  .test-tips {
    color: #666;
    font-size: 12px;
  }
  </style>