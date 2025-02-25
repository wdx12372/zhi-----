<template>
  <div class="settings-container">
    <div class="settings-header">
      <h2>设置</h2>
    </div>

    <div class="settings-content">
      <!-- 用户信息部分 -->
      <div class="settings-section">
        <h3>用户信息</h3>
        <div class="user-info">
          <div class="avatar">
            <i class="fas fa-user"></i>
          </div>
          <div class="user-details">
            <div class="info-item">
              <label>用户名</label>
              <span>{{ userStore.userInfo?.username }}</span>
            </div>
            <div class="info-item">
              <label>角色</label>
              <span>{{ userStore.userInfo?.role }}</span>
            </div>
            <div class="info-item">
              <label>部门</label>
              <span>{{ userStore.userInfo?.department }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 退出登录按钮 -->
      <div class="settings-section">
        <button class="logout-btn" @click="handleLogout">
          <i class="fas fa-sign-out-alt"></i>
          退出登录
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.settings-container {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.settings-header {
  margin-bottom: 32px;
}

.settings-header h2 {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.settings-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.settings-section h3 {
  font-size: 18px;
  color: #333;
  margin: 0 0 20px 0;
}

.user-info {
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

.avatar {
  width: 80px;
  height: 80px;
  background: #f0f2f5;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #0066FF;
}

.user-details {
  flex: 1;
}

.info-item {
  margin-bottom: 16px;
}

.info-item label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.info-item span {
  font-size: 16px;
  color: #333;
}

.logout-btn {
  width: 100%;
  padding: 12px;
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background-color: #ff7875;
  transform: translateY(-1px);
}

.logout-btn i {
  font-size: 18px;
}
</style> 