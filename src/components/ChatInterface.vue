<template>
  <div class="chat-interface">
    <div class="chat-content" ref="chatContent">
      <div v-for="message in messages" 
           :key="message.id" 
           :class="['message', message.type]">
        <div class="message-content">{{ message.content }}</div>
        <div class="message-time">{{ formatTime(message.timestamp) }}</div>
      </div>
    </div>

    <div class="input-section">
      <div class="mode-tabs">
        <div class="tab active">{{ mode }}</div>
      </div>
      
      <div class="input-area">
        <input 
          type="text" 
          v-model="inputMessage"
          :placeholder="getPlaceholder()"
          @keyup.enter="sendMessage"
        >
        <button 
          class="send-btn"
          @click="sendMessage"
          :disabled="!inputMessage.trim()"
        >
          <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'

export default {
  name: 'ChatInterface',
  props: {
    mode: {
      type: String,
      required: true
    },
    initialMessages: {
      type: Array,
      default: () => []
    }
  },
  
  emits: ['send-message'],

  setup(props, { emit }) {
    const inputMessage = ref('')
    const messages = ref(props.initialMessages)
    const chatContent = ref(null)

    const getPlaceholder = () => {
      return props.mode === '天网追踪' 
        ? '输入追踪目标信息...' 
        : '输入案情描述...'
    }

    const sendMessage = async () => {
      if (!inputMessage.value.trim()) return

      const message = {
        id: Date.now(),
        content: inputMessage.value,
        type: 'user',
        timestamp: new Date()
      }
      
      messages.value.push(message)
      emit('send-message', message)
      inputMessage.value = ''

      await nextTick()
      scrollToBottom()
    }

    const scrollToBottom = () => {
      if (chatContent.value) {
        chatContent.value.scrollTop = chatContent.value.scrollHeight
      }
    }

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    onMounted(() => {
      if (messages.value.length === 0) {
        messages.value.push({
          id: Date.now(),
          content: `你好，我是${props.mode}助手，请输入您的需求。`,
          type: 'ai',
          timestamp: new Date()
        })
      }
      scrollToBottom()
    })

    return {
      inputMessage,
      messages,
      chatContent,
      getPlaceholder,
      sendMessage,
      formatTime
    }
  }
}
</script>

<style scoped>
.chat-interface {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 20px;
}

.chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 8px;
  position: relative;
}

.message.user {
  align-self: flex-end;
  background-color: var(--primary-color);
  color: white;
}

.message.ai {
  align-self: flex-start;
  background-color: white;
  border: 1px solid #e0e0e0;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.input-section {
  background: white;
  border-radius: 8px;
  padding: 16px;
}

.mode-tabs {
  margin-bottom: 12px;
}

.tab {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 14px;
  background-color: var(--primary-color);
  color: white;
}

.input-area {
  display: flex;
  gap: 12px;
}

.input-area input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.send-btn {
  padding: 0 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.send-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style> 