<template>
  <div class="new-chat">
    <div class="header">
      <div class="title-section">
        <div class="icon">
          <i class="fas fa-comments"></i>
        </div>
        <span class="title">新对话</span>
      </div>
      <div class="actions">
        <button class="action-btn" title="分享">
          <i class="fas fa-share-alt"></i>
        </button>
        <button class="action-btn" title="收藏">
          <i class="fas fa-star"></i>
        </button>
      </div>
    </div>

    <div class="chat-interface">
      <div class="messages-container">
        <div class="welcome-message">
          <h2>选择一个模式开始对话</h2>
          <div class="mode-buttons">
            <button class="mode-btn" @click="selectMode('tianwen')">
              <i class="fas fa-search-location"></i>
              天网追缉
            </button>
            <button class="mode-btn" @click="selectMode('strategy')">
              <i class="fas fa-book"></i>
              侦查谋略
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'NewChat',
  setup() {
    const router = useRouter()

    const selectMode = (mode) => {
      router.push({ name: mode === 'tianwen' ? 'Tianwen' : 'Strategy' })
    }

    return {
      selectMode
    }
  }
}
</script>

<style scoped>
.new-chat {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f5f7f9;
  border-bottom: 1px solid #eee;
}

.welcome-message {
  text-align: center;
  padding: 40px;
}

.mode-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 24px;
}

.mode-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: white;
  color: #333;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mode-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.mode-btn i {
  font-size: 20px;
  color: #0084ff;
}
</style> 