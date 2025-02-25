<template>
  <div class="chat-container">
    <div class="header">
      <div class="title-section">
        <div class="icon">
          <i class="fas fa-comments"></i>
        </div>
        <span class="title">智能助手</span>
      </div>
      <div class="actions">
        <!-- <button class="action-btn" title="分享">
          <i class="fas fa-share-alt"></i>
          <div class="btn-hover-bg"></div>
        </button> -->
        <button class="action-btn" title="收藏">
          <i class="fas fa-star"></i>
          <div class="btn-hover-bg"></div>
        </button>
      </div>
    </div>

    <div class="chat-interface">
      <div class="messages-container" ref="messagesContainer">
        <!-- AI 初始消息 -->
        <div class="message ai">
          <div class="avatar">
            <i class="fas fa-robot"></i>
          </div>
          <div class="message-wrapper">
            <div class="message-content">你好，我是智能助手，请问有什么可以帮你？</div>
            <div class="message-time">{{ formatTime(new Date()) }}</div>
          </div>
        </div>

        <!-- 对话消息 -->
        <div v-for="(message, index) in messages" 
             :key="message.id" 
             :class="['message', message.type]">
          <template v-if="message.type === 'ai'">

            <template v-if="status && messages.length - 1 === index">
              <!-- 正在输出 -->
              <div class="avatar">
              <i class="fas fa-robot"></i>
              </div>
              <div class="message-wrapper">
                <div class="message-content" v-html="chatStore.getMessage"></div>
                <div class="message-footer">
                  <div class="message-time"></div>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="avatar">
              <i class="fas fa-robot"></i>
            </div>
            <div class="message-wrapper">
              <div class="message-content" v-html="message.content"></div>
              <div class="message-footer">
                <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                <div class="message-actions">
                  <button class="action-icon" @click="copyMessage(message.content)" title="复制">
                    <i class="fas fa-copy"></i>
                  </button>
                  <!-- <button class="action-icon" @click="shareMessage(message)" title="分享">
                    <i class="fas fa-share-alt"></i>
                  </button> -->
                  <button class="action-icon" @click="favoriteMessage(message)" title="收藏">
                    <i class="fas fa-star"></i>
                  </button>
                </div>
              </div>
            </div>
            </template>
          </template>
          <template v-else>
            <div class="message-wrapper">
              <div class="message-content">
                <i class="fas fa-paperclip" :title="message.files && message.files[0].type" v-if="message.files && message.files.length"></i>
                {{ message.content }}</div>
              <div class="message-footer">
                <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                <div class="message-actions">
                  <button class="action-icon" @click="copyMessage(message.content)" title="复制">
                    <i class="fas fa-copy"></i>
                  </button>
                  <button class="action-icon" @click="deleteMessage(message)" title="删除">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="avatar user-avatar">
              <i class="fas fa-user"></i>
            </div>
          </template>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-section">
        <div class="mode-selector">
          <button class="mode-btn" @click="router.push({ name: 'Tianwen' })">
            <i class="fas fa-search-location"></i>
            天网追缉
          </button>
          <button class="mode-btn" @click="router.push({ name: 'Strategy' })">
            <i class="fas fa-book"></i>
            侦查谋略
          </button>
        </div>
        <InputWrapper @send-message="sendMessage" ></InputWrapper>
      </div>
    </div>

    <!-- 交互按钮 -->

    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import InputWrapper from '@/components/InputWrapper.vue'
import { useToast } from 'vue-toast-notification'

const $toast = useToast()
const route = useRoute()
const router = useRouter()
const chatStore = useChatStore()
const userStore = useUserStore()

const messages = computed(() => chatStore.getCurrentMessages)
const messagesContainer = ref(null)
const appInfo = ref(null)
const appParameters = ref(null)
const appMeta = ref(null)
const error = ref(null)

const status = computed(() => chatStore.getStatus)

// 格式化时间的函数
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 初始化消息
onMounted(async () => {
  const conversationId = route.query.id
  const initialMessage = route.query.message
  chatStore.createdEmptyConversation()

  if (conversationId) {
    const conversation = chatStore.restoreConversation(conversationId)
    if (conversation) {
      nextTick(() => {
        scrollToBottom()
      })
    }
  } else if(initialMessage) {
    if (initialMessage) {
      await chatStore.sendMessage(JSON.parse(initialMessage), 'general')
      scrollToBottom()
    }
  } else {
    console.log('没有对话ID')
    chatStore.createdEmptyConversation()
  }
})

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    nextTick(() => {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    })
  }
}

// 发送消息
const sendMessage = async (e) => {
  await chatStore.sendMessage(e, 'general')
  scrollToBottom()
}

// 复制消息
const copyMessage = async (content) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(content)
      $toast.success('已复制到剪切板！')
    } else {
      const textArea = document.createElement('textarea')
      textArea.value = content
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      $toast.success('已复制到剪切板！')

      return new Promise((res, rej) => {
        document.execCommand('copy') ? res() : rej()
        textArea.remove()
      })
    }
  } catch (err) {
    console.error('复制失败:', err)
    $toast.error('复制失败：'+err)
  }
}

// 其他方法
const shareMessage = (message) => {
  console.log('分享消息:', message)
}

const favoriteMessage = (message) => {
  console.log('收藏消息:', message)
}

const deleteMessage = (message) => {
  const index = messages.value.findIndex(m => m.id === message.id)
  if (index !== -1) {
    messages.value.splice(index, 1)
  }
}

// 监听消息变化
watch(() => chatStore.getMessage, () => {
  scrollToBottom()
}, { deep: true })

// 导出需要在模板中使用的变量和方法
defineExpose({
  chatStore,
  status,
  messages,
  sendMessage,
  formatTime,
  copyMessage,
  shareMessage,
  favoriteMessage,
  deleteMessage,
  messagesContainer,
  appInfo,
  appParameters,
  appMeta,
  error,
  userInfo: userStore.userInfo,
  router
})
</script>

<style scoped>
.chat-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: white;
}

.header {
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f5f7f9;
  border-bottom: 1px solid #eee;
  position: relative;
  z-index: 10;
  box-shadow: none;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #0084ff, #0073e6);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  box-shadow: 0 2px 6px rgba(0, 132, 255, 0.2);
  transition: all 0.3s ease;
}

.icon:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 132, 255, 0.3);
}

.title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  letter-spacing: 0.5px;
}

.actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: #666;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  color: #0084ff;
  background: rgba(0, 132, 255, 0.1);
}

.chat-interface {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 输入区域 */
.input-section {
  margin-top: auto;
  padding: 20px 40px;
  background: white;
  border-top: 1px solid #eee;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: #f5f7f9;
  scroll-behavior: smooth;
}

.message {
  display: flex;
  gap: 12px;
  max-width: 70%;
  position: relative;
  margin: 20px 0;
}

.message.ai {
  align-self: flex-start;
}

.message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
  margin-right: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message.ai .avatar {
  background: #0084ff;
  color: white;
  font-size: 20px;
}

.message.user .avatar {
  background: #f0f2f5;
  color: #0084ff;
  font-size: 20px;
  margin-left: 12px;
  margin-right: 0;
}

.message-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
}

.message-content {
  position: relative;
  padding: 12px 16px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-line;
  z-index: 1;
}

.message.ai .message-content {
  background: white;
  color: #333;
  border: 1px solid #e5e5e5;
  border-top-left-radius: 0;
}

.message.user .message-content {
  background: #0084ff;
  color: white;
  border-top-right-radius: 0;
}

/* 气泡尾巴效果 */
.message.ai .message-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: -6px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 6px 6px 0;
  border-color: transparent #e5e5e5 transparent transparent;
}

.message.user .message-content::before {
  content: '';
  position: absolute;
  top: 0;
  right: -6px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 6px 6px 0 0;
  border-color: #0084ff transparent transparent transparent;
}



/* 消息操作按钮 */
.message-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  margin-top: 4px;
}

.message-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
  position: relative;
  z-index: 1;
}

.message:hover .message-actions {
  opacity: 1;
}

.action-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: white;
  color: #666;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.action-icon:hover {
  background: #f5f7f9;
  color: #0084ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.message-time {
  font-size: 12px;
  color: #999;
  margin: 0 8px;
}

/* .message.user .message-time {
  color: rgba(255, 255, 255, 0.7);
} */

.mode-selector {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.mode-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  background-color: #f0f2f5;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.mode-btn:hover {
  background-color: #e6f7ff;
  color: #0066FF;
  transform: translateY(-1px);
}

.mode-btn i {
  font-size: 16px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.action-button {
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.action-button:hover {
  background-color: #0056b3;
}

.error {
  color: red;
}
</style> 