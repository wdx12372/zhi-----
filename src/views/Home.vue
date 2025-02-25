<template>
  <div class="home">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <h1>你好，这里是智侦云谋</h1>
      <p>我可以如何帮到你？</p>
    </div>

    <!-- 功能卡片区域 -->
    <div class="chat-cards">
      <!-- 天网追缉卡片 -->
      <div class="chat-card animate-in" @click="navigateToMode('tianwen')">
        <div class="card-icon">
          <i class="fas fa-search-location"></i>
        </div>
        <div class="card-content">
          <h3>天网追缉</h3>
          <p>聚合通勤信息、通话记录、资金流通、住宿信息、同随人员、涉案评估、资产信息等，协助警方快速锁定嫌疑人行踪</p>
        </div>
      </div>

      <!-- 侦查谋略卡片 -->
      <div class="chat-card animate-in" @click="navigateToMode('strategy')">
        <div class="card-icon">
          <i class="fas fa-book"></i>
        </div>
        <div class="card-content">
          <h3>侦查谋略</h3>
          <p>提供法律法规检索、类案检索、案情分析及合规性审查服务，辅助办案人员制定更为科学合理的侦查策略，同时确保办案过程合法合规</p>
        </div>
      </div>
    </div>

    <!-- 底部输入区域 -->
    <div class="bottom-section">
      <div class="mode-selector">
        <button class="mode-btn animate-in" @click="navigateToMode('tianwen')">
          <i class="fas fa-search-location"></i>
          天网追缉
        </button>
        <button class="mode-btn animate-in" @click="navigateToMode('strategy')">
          <i class="fas fa-book"></i>
          侦查谋略
        </button>
      </div>
      <InputWrapper @send-message="startChat" ></InputWrapper>

    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import InputWrapper from '@/components/InputWrapper.vue'

export default {
  name: 'Home',
  components: {
    InputWrapper
  },
  setup() {
    const router = useRouter()
    const chatStore = useChatStore()
    const inputMessage = ref('')

    // 导航到指定模式
    const navigateToMode = (mode) => {
      router.push({ name: mode === 'tianwen' ? 'Tianwen' : 'Strategy' })
    }

    // 开始新对话
    const startChat = async (e) => {
      // if (!inputMessage.value.trim()) return
      
      try {
        // 创建一个通用对话
        // const conversation = await chatStore.createConversation('general')

        // console.log('创建对话成功:', conversation);
        
        // 保存用户输入的消息
        // chatStore.setInitialMessage(e)
        // 修改路由名称为 general
        router.push({ 
          name: 'general',
          query: { message: JSON.stringify(e) } // 传递用户输入的消息
        })
      } catch (error) {
        console.error('创建对话失败:', error)
      }
    }

    return {
      inputMessage,
      navigateToMode,
      startChat
    }
  }
}
</script>

<style scoped>
.home {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 40px 40px 0 40px;
  background: #f5f7f9;
}

.welcome-section {
  text-align: center;
  margin-bottom: 40px;
}

.welcome-section h1 {
  font-size: 28px;
  color: #333;
  margin-bottom: 12px;
}

.welcome-section p {
  color: #666;
  font-size: 16px;
}

.chat-cards {
  display: flex;
  gap: 24px;
  margin-bottom: 40px;
  padding: 0 40px;
}

.chat-card {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #eee;
}

.chat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #0084ff;
}

.card-icon {
  width: 48px;
  height: 48px;
  background: #0084ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  margin-bottom: 16px;
}

.card-content h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 8px;
}

.card-content p {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

.bottom-section {
  margin-top: auto;
  padding: 20px 40px;
  background: white;
  border-top: 1px solid #eee;
}

.mode-selector {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.mode-btn {
  padding: 8px 16px;
  border: 1px solid #eee;
  background: white;
  border-radius: 8px;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.mode-btn:hover {
  border-color: #0084ff;
  color: #0084ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 132, 255, 0.1);
}

.mode-btn i {
  font-size: 16px;
}

/* .input-wrapper {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.input-wrapper:focus-within {
  border-color: #0084ff;
  box-shadow: 0 4px 12px rgba(0, 132, 255, 0.1);
  transform: translateY(-1px);
}

.input-wrapper input {
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: #f5f7f9;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  outline: none;
  transition: all 0.3s ease;
}

.input-wrapper input:focus {
  background: white;
} */

.input-tools {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px;
}

.tool-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: #666;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.tool-btn:hover {
  background: #f5f7f9;
  color: #0084ff;
}

.divider {
  width: 1px;
  height: 24px;
  background: #eee;
  margin: 0 4px;
}

.send-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: #0084ff;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.send-btn:hover:not(:disabled) {
  background: #0073e6;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 132, 255, 0.2);
}

.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.send-btn:active:not(:disabled) {
  transform: scale(0.95);
}

/* 添加工具提示 */
.tool-btn {
  position: relative;
}

.tool-btn::after {
  content: attr(title);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-8px);
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 12px;
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
}

.tool-btn:hover::after {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(-4px);
}

/* 元素进入动画 */
.animate-in {
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
}

.chat-cards .chat-card:nth-child(1) {
  animation-delay: 0.2s;
}

.chat-cards .chat-card:nth-child(2) {
  animation-delay: 0.4s;
}

.mode-selector .mode-btn:nth-child(1) {
  animation-delay: 0.6s;
}

.mode-selector .mode-btn:nth-child(2) {
  animation-delay: 0.7s;
}

.input-wrapper {
  animation-delay: 0.8s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 卡片悬浮动画 */
.chat-card {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.chat-card:hover {
  transform: translateY(-8px);
}

/* 卡片光效 */
.chat-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transform: rotate(45deg);
  transition: all 0.3s ease;
  opacity: 0;
}

.chat-card:hover::before {
  animation: lightSweep 1s ease-out;
}

@keyframes lightSweep {
  0% {
    transform: rotate(45deg) translateY(-100%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: rotate(45deg) translateY(100%);
    opacity: 0;
  }
}

/* 图标动画 */
.card-icon {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.chat-card:hover .card-icon {
  transform: scale(1.1) rotate(5deg);
}

.card-icon i {
  transition: all 0.3s ease;
}

.chat-card:hover .card-icon i {
  animation: bounce 0.5s ease;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

/* 输入框动画 */
.input-wrapper {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-wrapper:focus-within {
  transform: translateY(-2px);
}

.input-wrapper input::placeholder {
  transition: all 0.3s ease;
}

.input-wrapper input:focus::placeholder {
  opacity: 0.7;
  transform: translateX(5px);
}

/* 按钮动画 */
.tool-btn, .send-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.tool-btn::after, .send-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%);
  transform-origin: 50% 50%;
}

.tool-btn:active::after, .send-btn:active::after {
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0, 0);
    opacity: 0.5;
  }
  100% {
    transform: scale(40, 40);
    opacity: 0;
  }
}

/* 模式按钮动画 */
.mode-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.mode-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.7s ease;
}

.mode-btn:hover::before {
  left: 100%;
}
</style> 