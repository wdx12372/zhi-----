<template>
  <div class="strategy-container">
    <div class="header">
      <div class="title-section">
        <div class="icon">
          <i class="fas fa-search-location"></i>
        </div>
        <span class="title">天网追缉</span>
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
        <button class="action-btn" title="通知">
          <i class="fas fa-bell"></i>
          <div class="btn-hover-bg"></div>
        </button>

      </div>
    </div>

    <div class="chat-interface">
      <div class="messages-container" ref="messagesContainer">
        <!-- AI 初始消息 -->
        <div class="message ai">
          <div class="avatar">
            <i class="fas fa-search-location"></i>
          </div>
          <div class="message-wrapper">
            <div class="message-content">我是天网追缉小助手，请你询问:</div>
            <div class="message-time">13:45</div>
          </div>
        </div>

        <!-- 问题建议消息 -->
        <div class="message ai">
          <div class="avatar">
            <i class="fas fa-search-location"></i>
          </div>
          <div class="message-wrapper">
            <div class="message-content">
              <div class="questions-header">
                <span>你可以这样问我：</span>
                <div class="nav-buttons">
                  <button @click="prevPage" :disabled="currentPage === 0">
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  <button @click="nextPage" :disabled="currentPage >= Math.ceil(allQuestions.length / 4) - 1">
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
              <div class="questions-list">
                <div 
                  v-for="question in currentPageQuestions" 
                  :key="question"
                  class="question-item"
                  @click="selectQuestion(question)"
                >
                  {{ question }}
                </div>
              </div>
            </div>
            <div class="message-time">13:45</div>
          </div>
        </div>


        <!-- 其他对话消息 -->
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
              <i class="fas fa-search-location"></i>
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
              <div class="message-content">{{ message.content }}</div>
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
          <button class="mode-btn active">
            <i class="fas fa-search-location"></i>
            天网追缉
          </button>
          <button class="mode-btn" @click="switchMode('strategy')">
            <i class="fas fa-book"></i>
            侦查谋略
          </button>
        </div>
        <InputWrapper @send-message="sendMessage" ></InputWrapper>

      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick, computed, onUnmounted, watch } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useRoute, useRouter } from 'vue-router'
import InputWrapper from '@/components/InputWrapper.vue'
import { useToast } from 'vue-toast-notification';


export default {
  name: 'TianwenTracker',
  components: {
    InputWrapper
  },
  setup() {
    const $toast = useToast();
    const route = useRoute()
    const router = useRouter()
    const chatStore = useChatStore()
    const inputMessage = ref('')
    // const messages = ref([])
    const messages = computed(()=>{
      return chatStore.getCurrentMessages
    })
    const chatContent = ref(null)
    const showQuestions = ref(false)
    const currentPage = ref(0)
    const questionsPerPage = 4
    const currentQuestionIndex = ref(0)
    const allQuestions = [
      '网络开设赌场罪的侦查期限是多久？',
      '个人参加小额度网络赌博一般如何处理？',
      '如何对对网络赌博应用暗网作为媒介的问题？',
      '网络赌博如何取证？',
      '网络赌博一般期限在多久？',
      '张三的身份证号是多少？',
      '显示张三最近一次出入境记录',
      '张三的电话号码是多少？',
      '张三有几个手机号？',
      '显示张三最近一次通话记录',
      '张三的年龄多大？',
      '张三户籍地在哪？',
      '显示张三的人员基本信息',
      '张三的背景是什么？',
      '张三的出入境理由是什么？',
      '张三是哪国公民？',
      '张三上次通话的对端号码是多少？',
      '显示张三近期的对端电话号码',
      '显示张三近期对端用户姓名',
      '张三上次通话电话的对端姓名是什么？',
      '张三上次通话时间是什么时候？',
      '张三上次通话持续了多久？',
      '显示张三的主账户信息',
      '张三上次资金转账交易方的户名是什么？',
      '张三交易账户的开户银行是哪家？',
      '显示张三的对手户姓名',
      '张三上次交易使用的的交易币是什么？',
      '张三目前账户的交易余额是多少？',
      '显示张三近期来的借贷标志',
      '显示张三的性别',
      '张三的民族是什么？',
      '张三综合违法性评级是多少？',
      '张三同住址人员有哪些？',
      '张三同户号人员是那些？',
      '张三同乘车人员有哪些？',
      '张三同乘机人员有哪些？',
      '张三的同出入境人员有哪些？',
      '张三的同案人员有哪些？',
      '张三的同住宿人员是哪些？',
      '张三同订票人员有哪些？',
      '显示张三的服兵役情况',
      '显示张三的驾驶信息',
      '显示张三的车辆信息',
      '显示张三的出入证件信息',
      '显示张三的机动车违章情况',
      '显示张三的出入境记录',
      '显示张三的银行核查信息',
      '显示张三的民航离岗记录',
      '显示张三的旅客住宿信息定位张三上次住宿的旅店',
      '定位张三的居住地点',
      '定位张三的出入境地点',
      '定位张三同行人员的出境信息'
    ]

    const status = computed(() => {
      return chatStore.getStatus
    })

    // 添加消息容器的引用
    const messagesContainer = ref(null)

    // 滚动到底部的函数
    const scrollToBottom = () => {
      if (messagesContainer.value) {
        nextTick(() => {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        })
      }
    }

    // 初始化消息
    onMounted(() => {
      const conversationId = route.query.id
      const shouldRestore = route.query.restore === 'true'

      if (shouldRestore && conversationId) {
        // 恢复历史对话
        const conversation = chatStore.restoreConversation(conversationId)
        if (conversation) {
          // messages.value = conversation.messages
          nextTick(() => {
            scrollToBottom()
          })
        }
      }else{
        chatStore.createdEmptyConversation()
      }
    })

    // 发送消息时保存到 store
    const sendMessage = async (e) => {
      // if (!inputMessage.value.trim()) return

      // 如果是第一条消息，创建新对话
      if (messages.value.length === 0) {
        await chatStore.createConversation('tianwen', true)
      }
      
      // 保存消息到 store
      await chatStore.sendMessage(e, 'tianwen')
      
      // 如果是第一条消息，更新路由以反映新对话
      if (messages.value.length === 1 && chatStore.currentConversation) {
        router.replace({
          name: 'Tianwen',
          query: { 
            id: chatStore.currentConversation.id,
            new: true
          }
        })
      }
      
      scrollToBottom()
    }

    // 监听消息列表变化
    watch(()=>chatStore.getMessage, () => {
      scrollToBottom()
    }, { deep: true })

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // 计算当前页显示的问题
    const currentPageQuestions = computed(() => {
      const start = currentPage.value * 4
      return allQuestions.slice(start, start + 4)
    })

    const nextPage = () => {
      if (currentPage.value < Math.ceil(allQuestions.length / 4) - 1) {
        currentPage.value++
      }
    }

    const prevPage = () => {
      if (currentPage.value > 0) {
        currentPage.value--
      }
    }

    const refreshQuestions = () => {
      // 随机打乱问题顺序
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5)
      allQuestions.splice(0, allQuestions.length, ...shuffled)
      currentPage.value = 0
    }

    const selectQuestion = (question) => {
      // inputMessage.value = question
      sendMessage({query:question})
    }

    // 自动轮播
    onMounted(() => {
      const autoCarousel = setInterval(() => {
        if (currentPage.value < Math.ceil(allQuestions.length / questionsPerPage) - 1) {
          currentPage.value++
        } else {
          currentPage.value = 0
        }
      }, 5000) // 每5秒切换一次

      // 组件卸载时清除定时器
      onUnmounted(() => {
        clearInterval(autoCarousel)
      })
    })

    const toggleQuestions = () => {
      showQuestions.value = !showQuestions.value
    }

    const handleInputBlur = () => {
      setTimeout(() => {
        showQuestions.value = false
      }, 200)
    }

    const copyMessage = async (content) => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(content)
          $toast.success('已复制到剪切板！');
        }else{
          const textArea = document.createElement('textarea')
          textArea.value = content
          document.body.appendChild(textArea)
          textArea.focus()
          textArea.select()
          $toast.success('已复制到剪切板！');

          return new Promise((res, rej) => {
            document.execCommand('copy') ? res() : rej()
            textArea.remove()
          })
        }
      } catch (err) {
        console.error('复制失败:', err)
        $toast.error('复制失败：'+err);
      }
    }

    const shareMessage = (message) => {
      // 实现分享功能
      console.log('分享消息:', message)
    }

    const favoriteMessage = (message) => {
      // 实现收藏功能
      console.log('收藏消息:', message)
    }

    const deleteMessage = (message) => {
      // 实现删除功能
      const index = messages.value.findIndex(m => m.id === message.id)
      if (index !== -1) {
        messages.value.splice(index, 1)
      }
    }

    // 在 setup 中添加切换模式的方法
    const switchMode = (mode) => {
      router.push({ 
        name: mode === 'tianwen' ? 'Tianwen' : 'Strategy',
        query: { 
          fromChat: true,
          lastMessage: inputMessage.value 
        }
      })
    }

    const fetchAppInfo = () => {
      // 实现获取应用基本信息的功能
      console.log('获取应用基本信息')
    }

    const fetchUserInfo = () => {
      // 实现获取用户信息的功能
      console.log('获取用户信息')
    }

    return {
      chatStore,
      status,
      inputMessage,
      messages,
      chatContent,
      showQuestions,
      toggleQuestions,
      selectQuestion,
      handleInputBlur,
      sendMessage,
      formatTime,
      currentPage,
      allQuestions,
      currentPageQuestions,
      nextPage,
      prevPage,
      refreshQuestions,
      copyMessage,
      shareMessage,
      favoriteMessage,
      deleteMessage,
      messagesContainer,
      scrollToBottom,
      switchMode,
      fetchAppInfo,
      fetchUserInfo
    }
  }
}
</script>

<style scoped>
.strategy-container {
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
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
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

.btn-hover-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(0, 132, 255, 0.1);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.4s ease, height 0.4s ease;
}

.action-btn:hover .btn-hover-bg {
  width: 200%;
  height: 200%;
}

.action-btn i {
  position: relative;
  z-index: 1;
  font-size: 16px;
  transition: transform 0.3s ease;
}

.action-btn:hover i {
  transform: scale(1.1);
}

/* 添加工具提示 */
.action-btn::after {
  content: attr(title);
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 12px;
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.action-btn:hover::after {
  opacity: 1;
  visibility: visible;
  bottom: -25px;
}

/* 添加点击效果 */
.action-btn:active {
  transform: scale(0.95);
}

.action-btn:active i {
  transform: scale(0.9);
}

.chat-interface {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.question-suggestions {
  padding: 16px;
  background: white;
}

.suggestion-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestion-item {
  padding: 12px 16px;
  background: white;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggestion-item:hover {
  background: #f5f5f5;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: #f5f7f9;
  scroll-behavior: smooth; /* 添加平滑滚动效果 */
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

.user-avatar {
  margin-left: 12px;
  margin-right: 0;
  background: #f0f2f5 !important;
  color: #0084ff !important;
}

.message.user .message-content {
  background: #0084ff;
  color: white;
  border-top-right-radius: 0;
  margin-right: 0;
}

.message.user .message-time {
  text-align: right;
  padding-right: 8px;
}

.message-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.messages-container {
  padding: 20px 40px;
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

.message-time {
  font-size: 12px;
  color: #8e8e8e;
  padding: 0 4px;
}

.message.ai .message-time {
  text-align: left;
}

.message.user .message-time {
  text-align: right;
  padding-right: 16px;
}

/* 添加气泡尾巴效果 */
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

.message.ai .message-content::after {
  content: '';
  position: absolute;
  top: 1px;
  left: -4px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 4px 4px 0;
  border-color: transparent white transparent transparent;
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

.input-section {
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

.mode-selector .active{
  border-color: #0084ff;
  color: #0084ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 132, 255, 0.1);
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

/* 添加输入框动画效果 */
@keyframes focusIn {
  0% { transform: scale(1); }
  50% { transform: scale(1.002); }
  100% { transform: scale(1); }
}

.input-wrapper:focus-within {
  animation: focusIn 0.2s ease-out;
}

/* 添加按钮点击效果 */
.tool-btn:active,
.send-btn:active:not(:disabled) {
  transform: scale(0.95);
}

/* 加工具提示 */
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

.question-list {
  position: relative;
  padding-top: 24px !important;
}

.question-nav {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
}

.question-nav button {
  width: 24px;
  height: 24px;
  border: none;
  background: #f0f2f5;
  color: #666;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.question-nav button:hover:not(:disabled) {
  background: #e4e6e9;
  color: #333;
}

.question-nav button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.question-item {
  padding: 8px 0;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #eee;
}

.question-item:last-child {
  border-bottom: none;
}

.question-item:hover {
  color: var(--primary-color);
  padding-left: 8px;
}

/* 添加过渡动画 */
.question-item {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.questions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  color: #666;
  font-size: 14px;
}

.nav-buttons {
  display: flex;
  gap: 8px;
}

.nav-buttons button {
  width: 28px;
  height: 28px;
  border: none;
  background: #f5f5f5;
  color: #666;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.nav-buttons button:hover:not(:disabled) {
  background: #e0e0e0;
  color: #333;
}

.nav-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.question-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 4px;
}

.question-item:hover {
  background-color: #f5f5f5;
  padding-left: 16px;
}

/* 消息动画效果 */
.message {
  animation: slideIn 0.3s ease-out;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.message:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 头动画效果 */
.avatar {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  transform-origin: center;
}

/* 光效扫过动画 */
.avatar::before {
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
  animation: lightSweep 3s infinite;
  opacity: 0;
}

/* 悬浮效果 */
.message:hover .avatar {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 4px 12px rgba(0, 132, 255, 0.2);
}

/* AI头像特殊果 */
.message.ai .avatar {
  animation: pulse 2s infinite;
}

.message.ai .avatar i {
  transition: all 0.3s ease;
}

.message.ai:hover .avatar i {
  animation: bounce 0.5s ease;
}

/* 户头像特殊效果 */
.message.user .avatar {
  animation: float 3s ease-in-out infinite;
}

.message.user:hover .avatar {
  transform: scale(1.1) rotate(-5deg);
}

/* 头像边框动画 */
.avatar::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 2px solid transparent;
  border-radius: inherit;
  animation: borderRotate 4s linear infinite;
  pointer-events: none;
}

.message:hover .avatar::after {
  border-color: rgba(0, 132, 255, 0.3);
}

/* 动画关键帧 */
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

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes borderRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 添加交互状态动画 */
.message.ai .avatar:active {
  transform: scale(0.95);
}

.message.user .avatar:active {
  transform: scale(0.95) rotate(-10deg);
}

/* 添加头像图标颜色渐变 */
.message.ai .avatar i {
  background: linear-gradient(135deg, #fff, #e6f3ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.message.user .avatar i {
  background: linear-gradient(135deg, #0084ff, #0073e6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 输入框动画效果 */
.input-wrapper {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-wrapper:focus-within {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 132, 255, 0.15);
}

.input-wrapper input {
  transition: all 0.3s ease;
}

.input-wrapper input:focus::placeholder {
  transform: translateX(5px);
  opacity: 0.7;
}

/* 工具按钮动画 */
.tool-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.tool-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(0, 132, 255, 0.1);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.4s ease, height 0.4s ease;
}

.tool-btn:hover::before {
  width: 200%;
  height: 200%;
}

/* 发送按钮动画 */
.send-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.send-btn::after {
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

.send-btn:active::after {
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

/* 问题项动画 */
.question-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.question-item::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #0084ff, transparent);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.question-item:hover::after {
  transform: translateX(0);
}

.question-item:hover {
  background: rgba(0, 132, 255, 0.05);
  padding-left: 20px;
  color: #0084ff;
}

/* 导航按钮动画 */
.nav-buttons button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-buttons button:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-buttons button:active:not(:disabled) {
  transform: scale(0.95);
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



/* 时间戳动画 */
.message-time {
  transition: all 0.3s ease;
}

.message:hover .message-time {
  opacity: 1;
  transform: translateY(-2px);
}

/* 添加滚动条样式 */
.messages-container {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 132, 255, 0.2) transparent;
}

.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background-color: rgba(0, 132, 255, 0.2);
  border-radius: 3px;
  transition: all 0.3s ease;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 132, 255, 0.4);
}

.message-actions {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 10;
}

/* .message.ai .message-actions {
  right: -40px;
} */

/* .message.user .message-actions {
  left: -90px;
  right: auto;
} */

.message:hover .message-actions {
  opacity: 1;
}

.action-icon {
  width: 32px;
  height: 36px;
  border: none;
  background: white;
  color: #666;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.action-icon:hover {
  background: #f5f7f9;
  color: #0084ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.message.ai .action-icon {
  color: #666;
}

.message.user .action-icon {
  color: #666;

}

/* 添加工具提示 */
.action-icon {
  position: relative;
}

.action-icon::after {
  content: attr(title);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-4px);
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

.action-icon:hover::after {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(-8px);
}

/* 添加点击反馈 */
.action-icon:active {
  transform: scale(0.9);
}

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

/* .message.user .action-icon {
  background: rgba(255, 255, 255, 0.9);
  color: #0084ff;
} */

.message.user .action-icon:hover {
  background: white;
  color: #0084ff;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin: 0 8px;
}

/* .message.user .message-time {
  color: rgba(255, 255, 255, 0.7);
} */

/* 调整按钮大小和颜色 */
.action-icon i {
  font-size: 16px;
}

/* 增加按钮背景对比度 */
.action-icon {
  background: rgba(255, 255, 255, 0.95);
}

/* 调整按钮位置，使其更靠近消息内容 */
.message-footer {
  margin-top: 8px;
  padding: 0 8px;
}

/* 确保按钮在消息气泡上方显示 */
.message-actions {
  z-index: 2;
}
</style> 