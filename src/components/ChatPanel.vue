<template>
  <div class="chat-panel">
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
        <div class="file-upload">
          <input 
            type="file" 
            ref="fileInput" 
            @change="handleFileUpload" 
            style="display: none"
            multiple
            accept=".txt,.doc,.docx,.pdf,.jpg,.png"
          >
          <button class="upload-btn" @click="$refs.fileInput.click()">
            <i class="fas fa-paperclip"></i>
          </button>
        </div>

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
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick, watch } from 'vue'

export default {
  name: 'ChatPanel',
  props: {
    mode: {
      type: String,
      required: true
    },
    messages: {
      type: Array,
      default: () => []
    }
  },

  emits: ['send', 'file-upload'],

  setup(props, { emit }) {
    const inputMessage = ref('')
    const chatContent = ref(null)
    const fileInput = ref(null)

    const getPlaceholder = () => {
      return props.mode === '天网追踪' 
        ? '输入追踪目标信息...' 
        : '输入案情描述...'
    }

    const sendMessage = async () => {
      if (!inputMessage.value.trim()) return

      emit('send', inputMessage.value)
      inputMessage.value = ''
      await nextTick()
      scrollToBottom()
    }

    const handleFileUpload = (event) => {
      const files = Array.from(event.target.files)
      if (files.length > 0) {
        emit('file-upload', files)
        fileInput.value.value = '' // 重置文件输入
      }
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

    // 监听消息变化，自动滚动到底部
    watch(() => props.messages.length, () => {
      nextTick(scrollToBottom)
    })

    onMounted(() => {
      scrollToBottom()
    })

    return {
      inputMessage,
      chatContent,
      fileInput,
      getPlaceholder,
      sendMessage,
      handleFileUpload,
      formatTime
    }
  }
}
</script>

<style scoped>
.chat-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--background-color);
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
  border: 1px solid var(--border-color);
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.input-section {
  padding: 16px;
  background: white;
  border-top: 1px solid var(--border-color);
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
  align-items: center;
}

.file-upload {
  flex-shrink: 0;
}

.upload-btn {
  padding: 8px;
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  color: #666;
}

.upload-btn:hover {
  background-color: #f5f5f5;
}

.input-area input {
  flex: 1;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
}

.send-btn {
  padding: 12px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.send-btn:disabled {
  background-color: var(--secondary-color);
  cursor: not-allowed;
}

.send-btn:hover:not(:disabled) {
  opacity: 0.9;
}
</style> 