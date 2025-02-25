<template>
  <div class="sidebar">
    <div class="new-chat">
      <button :class="{
        'new-chat-btn':true,
        'disable':chatStore.getStatus !== false
      }" @click="createNewChat">
        <i class="fas fa-plus"></i>
        新对话
      </button>
    </div>
    
    <div class="search-box">
      <div class="search-input-wrapper">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          placeholder="搜索对话历史" 
          v-model="searchQuery"
        >
      </div>
    </div>

    <nav class="nav-sections">
      <router-link :to="{ name: 'Home' }" class="nav-item" exact-active-class="active">
        <i class="fas fa-home"></i>
        <span>首页</span>
      </router-link>
      <div class="nav-item"
        :class="{ active: isActive('Tianwen'), 'disable': chatStore.getStatus !== false }"
        @click="jumpPage('Tianwen')">
        <i class="fas fa-search"></i>
        <span>天网追缉</span>
      </div>
      <div class="nav-item"
        :class="{ active: isActive('Strategy'), 'disable': chatStore.getStatus !== false }"
        @click="jumpPage('Strategy')">
        <i class="fas fa-book"></i>
        <span>侦查谋略</span>
      </div>
    </nav>

    <div class="chat-history">
      <div class="history-header">
        <span>最近对话</span>
        <div class="history-actions" v-if="filteredChats.length > 0">
          <button @click="delAll" title="清空对话" :class="{
            'action-btn': true, 'disable':chatStore.getStatus !== false
          }">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
      
      <div 
        v-for="chat in filteredChats" 
        :key="chat.id" 
        class="chat-item"
        :class="{ active: currentChatId === chat.id, disable:chatStore.getStatus !== false }"
        @click="selectChat(chat)"
      >
        <div class="chat-icon">
          <i :class="getChatIcon(chat.mode)"></i>
        </div>
        <div class="chat-info">
          <div class="chat-title">{{ chat.title || getDefaultTitle(chat) }}</div>
          <div class="chat-preview">{{ getLastMessage(chat) }}</div>
          <div class="chat-time">{{ formatTime(chat.timestamp) }}</div>
        </div>
        <div class="chat-actions">
          <button @click.stop="togglePin(chat)" :class="{
            'action-btn': true, 'disable':chatStore.getStatus !== false
          }">
            <i class="fas fa-thumbtack" :class="{ 'pinned': chat.isPinned }"></i>
          </button>
          <button @click.stop="confirmDelete(chat)" :class="{
            'action-btn': true, 'disable':chatStore.getStatus !== false
          }">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="bottom-section">
      <router-link to="/favorites" :class="{ 'active': activeBar === 'favorites', 'nav-item':true }">
        <i class="fas fa-star"></i>
        <span>收藏夹</span>
      </router-link>
      <router-link to="/settings" :class="{ 'active': activeBar === 'Settings', 'nav-item':true }">
        <i class="fas fa-cog"></i>
        <span>设置</span>
      </router-link>
    </div>

    <!-- 删除确认对话框 -->
    <div class="modal" v-if="showDeleteConfirm">
      <div class="modal-content">
        <h3>确认删除</h3>
        <p>{{ deleteMessage }}</p>
        <div class="modal-actions">
          <button @click="cancelDelete">取消</button>
          <button class="delete-btn" @click="executeDelete">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useChatStore } from '../stores/chat'
import { useUserStore } from '../stores/user'

export default {
  name: 'Sidebar',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const chatStore = useChatStore()
    const userStore = useUserStore()
    const searchQuery = ref('')
    const currentChatId = ref(null)
    const showDeleteConfirm = ref(false)
    const chatToDelete = ref(null)
    const deleteMessage = ref('')

    const activeBar = computed(() => {
      return route.name
    })

    const filteredChats = computed(() => {
      return chatStore.conversations
        .filter(chat => {
          if (!searchQuery.value) return true;
          return chat.messages.some(msg => 
            msg.content.toLowerCase().includes(searchQuery.value.toLowerCase())
          );
        })
        .sort((a, b) => {
          // 检查 isPinned 属性
          const isPinnedA = a.isPinned === true;
          const isPinnedB = b.isPinned === true;

          // 如果 a 和 b 的 isPinned 都为 true 或都为 false，按时间排序
          if (isPinnedA === isPinnedB) {
            return b.timestamp - a.timestamp;
          }

          // 如果 a 是 true，b 是 false 或不存在，a 排在前面
          if (isPinnedA) return -1;

          // 如果 b 是 true，a 是 false 或不存在，b 排在前面
          return 1;
        });
    });

    const createNewChat = async () => {
      if(chatStore.getStatus !== false){
        return
      }

      try {
        // const conversation = await chatStore.createConversation('tianwen')
        // console.log(conversation)
        chatStore.createdEmptyConversation()

        router.push(`/general`)
      } catch (error) {
        console.error('创建对话失败:', error)
      }
    }

    const selectChat = async (chat) => {
      if(chatStore.getStatus !== false){
        return
      }

      currentChatId.value = chat.id
      const conversation = await chatStore.restoreConversation(chat.id)
      if (conversation) {

        const routeName = getRouteByMode(conversation.mode)
        router.push({
          name: routeName,
          query: { 
            id: conversation.id,
            restore: true
          }
        })
      }
    }

    const jumpPage = (routeName) => {
      if(chatStore.getStatus !== false) {
        return
      }
      chatStore.createdEmptyConversation()
      router.push({ name: routeName })
    }

    const getRouteByMode = (mode) => {
      const routes = {
        'tianwen': 'Tianwen',
        'strategy': 'Strategy',
        'general': 'general'
      }
      return routes[mode] || 'general'
    }

    const getModeLabel = (mode) => {
      const labels = {
        tianwen: '天网追缉',
        strategy: '侦查谋略'
      }
      return labels[mode] || mode
    }

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const getLastMessage = (chat) => {
      const lastMsg = chat.messages[chat.messages.length - 1]
      return lastMsg ? lastMsg.content.slice(0, 30) + (lastMsg.content.length > 30 ? '...' : '') : '暂无消息'
    }

    const getChatIcon = (mode) => {
      const icons = {
        'tianwen': 'fas fa-search-location',
        'strategy': 'fas fa-book',
        'general': 'fas fa-comments'
      }
      return icons[mode] || 'fas fa-comments'
    }

    const getDefaultTitle = (chat) => {
      const titles = {
        'tianwen': '天网追缉',
        'strategy': '侦查谋略',
        'general': '智能助手'
      }
      return titles[chat.mode] || '新对话'
    }

    const isActive = (routeName) => {
      return route.name === routeName
    }

    watch(() => route.query.id, (newId) => {
      currentChatId.value = newId ? parseInt(newId) : null
    }, { immediate: true })

    // 确认删除单个对话
    const confirmDelete = (chat) => {
      if(chatStore.getStatus !== false){
        return
      }

      chatToDelete.value = chat
      
      deleteMessage.value = `确定要删除"${chat.title || getDefaultTitle(chat)}"吗？`
      showDeleteConfirm.value = true
    }
    // 对话置顶
    const togglePin = (chat) => {
      if(chatStore.getStatus !== false){
        return
      }

      chatStore.togglePin(chat.id)
    }

    const delAll = () => {
      if(chatStore.getStatus !== false){
        return
      }
      confirmClearAll()
    }

    // 确认清空所有对话
    const confirmClearAll = () => {
      chatToDelete.value = 'all'
      deleteMessage.value = '确定要清空所有对话吗？'
      showDeleteConfirm.value = true
    }

    // 执行删除操作
    const executeDelete = () => {
      if (chatToDelete.value === 'all') {
        chatStore.clearAllConversations()
        router.replace('/')
      } else {
        chatStore.deleteConversation(chatToDelete.value.id)
        router.replace('/')
      }
      showDeleteConfirm.value = false
      chatToDelete.value = null
    }

    // 取消删除
    const cancelDelete = () => {
      showDeleteConfirm.value = false
      chatToDelete.value = null
    }

    // 添加登录状态检查
    const checkAuth = () => {
      if (!userStore.isLoggedIn) {
        router.push('/login')
      }
    }

    // 在组件创建时检查登录状态
    checkAuth()

    return {
      chatStore,
      userStore,
      jumpPage,
      searchQuery,
      filteredChats,
      createNewChat,
      selectChat,
      getRouteByMode,
      getModeLabel,
      formatTime,
      getLastMessage,
      getChatIcon,
      getDefaultTitle,
      currentChatId,
      isActive,
      showDeleteConfirm,
      deleteMessage,
      confirmDelete,
      confirmClearAll,
      executeDelete,
      cancelDelete,
      activeBar,
      delAll,
      togglePin
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 280px;
  height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e0e0e0;
  padding: 16px;
  transition: all 0.3s ease;
}

.new-chat-btn {
  width: 100%;
  padding: 12px;
  background-color: #0066FF;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  font-size: 14px;
  transition: all 0.3s ease;
}

.new-chat-btn:hover {
  background-color: #0052cc;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,102,255,0.3);
}

.search-input-wrapper {
  position: relative;
  margin-bottom: 20px;
}

.search-input-wrapper i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.search-input-wrapper input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-input-wrapper input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
  outline: none;
}

.nav-sections {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 20px;
}

.nav-item {
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 12px;
  color: #666;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 14px;
}

.nav-item i {
  margin-right: 12px;
  width: 20px;
  text-align: center;
}

.nav-item:hover {
  background-color: #f0f0f0;
  color: var(--primary-color);
}

.nav-item.active {
  background-color: #e6f7ff;
  color: #0084ff;
  font-weight: 500;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  margin: 0 -16px;
  padding: 0 16px;
}

.history-header {
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
  margin-bottom: 8px;
  padding-left: 4px;
  display: flex;
  align-items: center;
}

.chat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  margin-bottom: 4px;
}

.chat-item:hover {
  background: #f5f7f9;
}

.chat-item.active {
  background: #e6f7ff;
  color: #0084ff;
}

.chat-icon {
  width: 40px;
  height: 40px;
  background: #f0f2f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0084ff;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-preview {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.chat-actions {
  display: none;
  gap: 4px;
}

.chat-item:hover .chat-actions {
  display: flex;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #666;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #0084ff;
}

.action-btn i.pinned {
  color: #0084ff;
  transform: rotate(45deg);
}

.disable {
  cursor: no-drop;
}

.disable:hover{
  cursor: no-drop;
}

.bottom-section {
  margin-top: auto;
  border-top: 1px solid #e0e0e0;
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.settings-btn {
  cursor: pointer;
}

/* 自定义滚动条 */
.chat-history::-webkit-scrollbar {
  width: 4px;
}

.chat-history::-webkit-scrollbar-track {
  background: transparent;
}

.chat-history::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 2px;
}

.chat-history::-webkit-scrollbar-thumb:hover {
  background: #999;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-content h3 {
  margin: 0 0 16px 0;
  color: #333;
}

.modal-content p {
  margin: 0 0 24px 0;
  color: #666;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-actions button:first-child {
  background: #f5f5f5;
  color: #666;
}

.modal-actions .delete-btn {
  background: #ff4d4f;
  color: white;
}

.modal-actions button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.history-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #666;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #ff4d4f;
}
</style> 