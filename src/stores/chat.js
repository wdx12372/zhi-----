import { defineStore } from 'pinia'
import { chatAPI } from '@/services/api'
import { useUserStore } from '@/stores/user'

export const useChatStore = defineStore('chat', {
  state: () => ({
    conversations: [],
    currentConversation: null,
    loading: false,
    error: null,
    message: '',
    chatID: false,
    think: '',
    thinking: false
  }),

  getters: {
    getMessage: (state) => {
      return state.message
    },
    getStatus: (state) => {
      return state.chatID
    },
    getCurrentMessages: (state) => {
      return state.currentConversation?.messages || []
    },

    // 获取最近对话，按时间倒序排列
    getRecentConversations: (state) => {
      return [...state.conversations].sort((a, b) => {
        // 先按置顶状态排序
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        // 再按最后更新时间排序
        return b.lastUpdated - a.lastUpdated
      })
    },

    // 获取对话预览
    getConversationPreview: (state) => (conversationId) => {
      const conversation = state.conversations.find(c => c.id === conversationId)
      if (!conversation) return ''
      const lastMessage = conversation.messages[conversation.messages.length - 1]
      return lastMessage ? lastMessage.content.slice(0, 50) : '暂无消息'
    }
  },

  actions: {
    // 最新的一条消息存下来，实现打字机效果
    setMessage(text){
      this.message = this.message + text
    },
    // 置空
    resetMessage(){
      this.message = ''
    },
    createdEmptyConversation(){
      console.log('创建空对话')
      this.currentConversation = null
    },
    // 创建新对话
    async createConversation (mode = 'general') {
      try {
        this.loading = true
        // 调用 Dify API 创建对话
        const response = await chatAPI.createConversation()

        const newConversation = {
          id: response.data.conversation_id,
          mode,
          messages: [],
          timestamp: new Date(),
          lastUpdated: new Date(),
          title: this.getDefaultTitle(mode)
        }

        this.conversations.push(newConversation)
        this.currentConversation = newConversation
        this.saveToLocalStorage()

        return newConversation
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // 获取默认标题
    getDefaultTitle (mode) {
      const titles = {
        'tianwen': '天网追缉',
        'strategy': '侦查谋略',
        'general': '智能助手'
      }
      return titles[mode] || '新对话'
    },

    // 发送消息
    async sendMessage(content, mode = null) {
      try {
        this.loading = true;
        
        // 在方法内部获取 userStore
        const userStore = useUserStore();

        if (!this.currentConversation) {
          await this.createConversation(mode || 'general');
        }

        // 添加用户消息到界面
        const userMessage = {
          id: new Date(),
          content: content.query,
          files: content.files, // 如果有文件需要上传，可以在这里添加
          type: 'user',
          timestamp: new Date()
        };
        this.currentConversation.messages.push(userMessage);

        this.resetMessage()

        let aiMessage = {
          id: Math.random().toString(36),
          content: '思考中...',
          type: 'ai',
          timestamp: new Date()
        };

        this.currentConversation.messages.push(aiMessage);
        // this.loading = true

        // 调用 Dify API 发送消息
        const response = await chatAPI.sendMessage({
          query: content.query,
          conversation_id: this.currentConversation.id,
          user: userStore.getUserId, // 在这里使用 userStore
          files: content.files
        });
        this.resetMessage()

        const reader = response.body
          .pipeThrough(new TextDecoderStream())
          .getReader();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break; // 数据流结束
          this.handleSSEData(value)
        }
        // return this.currentConversation.id;
      } catch (error) {
        this.error = error.message;
        console.error('发送消息失败:', error);
      } finally {
        this.loading = false;
      }
    },

    // 处理接收到的数据
    handleSSEData (rawData) {
      // 去掉 "data: " 前缀并解析 JSON
      try {
        // const jsonData = JSON.parse(data.replace("data:", "").trim());
        const parts = rawData.split("data:");
        for (const part of parts) {
            // 去除多余的空格和换行符
            const trimmedPart = part.trim();
            if (!trimmedPart) continue; // 跳过空字符串
    
            try {
                // 解析 JSON 数据
                const jsonData = JSON.parse(trimmedPart);

                // 提取关键信息
                const { event, conversation_id } = jsonData;

                // 根据事件类型处理
                switch (event) {
                  case "message":
                    // 处理ai消息
                    const { answer } = jsonData;
                      this.chatID = conversation_id
                      this.setMessage(answer)
                    break;
                  case 'message_end':
                    // 处理消息结束事件
                    console.log('end')
                    const aiMessage = {
                      id: conversation_id,
                      content: this.message,
                      type: 'ai',
                      timestamp: new Date()
                    };
                    this.sendFeedback(aiMessage)
                    break;
                }

            } catch (error) {
                console.error("解析 JSON 数据时出错:", error);
            }
        }
      } catch (e) {
        console.error("解析数据失败:", e);
      }
    },

    //输出完通知事件
    sendFeedback(aiMessage){
      this.currentConversation.messages[this.currentConversation.messages.length-1] = {
        ...aiMessage
      }
      this.currentConversation.id = aiMessage.id
      this.currentConversation.lastUpdated = new Date();
      this.saveToLocalStorage();
      this.chatID = false
    },


    // 上传文件
    async uploadFile(file) {
      try {
        const userStore = useUserStore();
        const response = await chatAPI.uploadFile(file, userStore.getUserId);
        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    // 语音转文字
    async audioToText(file) {
      try {
        const userStore = useUserStore();
        const response = await chatAPI.audioToText(file, userStore.getUserId);
        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    // 保存到本地存储
    saveToLocalStorage () {
      localStorage.setItem('conversations', JSON.stringify(this.conversations))
    },

    // 从本地存储加载
    loadFromLocalStorage () {
      const saved = localStorage.getItem('conversations')
      if (saved) {
        this.conversations = JSON.parse(saved)
      }
    },

    // 恢复对话
    restoreConversation (conversationId) {
      const conversation = this.conversations.find(c => c.id === conversationId)
      
      if (conversation) {
        this.currentConversation = { ...conversation }
        return this.currentConversation
      }
      return null
    },

    // 设置初始消息并生成标题
    setInitialMessage (message) {
      if (this.currentConversation) {
        const userMessage = {
          id: Date.now(),
          content: message,
          type: 'user',
          timestamp: new Date()
        }
        this.currentConversation.messages.push(userMessage)
        this.currentConversation.lastUpdated = new Date()

        // 根据消息内容生成标题
        this.generateTitle(message)
      }
    },

    // 生成对话标题
    generateTitle (content) {
      if (!this.currentConversation) return

      // 提取关键词作为标题
      let title = this.extractKeywords(content)

      // 根据模式添加前缀
      const prefix = {
        'tianwen': '[天网] ',
        'strategy': '[谋略] ',
        'general': '[对话] '
      }[this.currentConversation.mode] || ''

      this.currentConversation.title = prefix + title
    },

    // 提取关键词
    extractKeywords (content) {
      // 1. 如果内容包含问号，截取到第一个问号
      const questionMarkIndex = content.indexOf('？')
      if (questionMarkIndex !== -1) {
        return content.slice(0, questionMarkIndex + 1)
      }

      // 2. 如果内容包含特定关键词，提取关键词所在句子
      const keywords = ['谁', '什么', '哪里', '如何', '为什么', '怎么', '多少', '何时', '在哪']
      for (const keyword of keywords) {
        const index = content.indexOf(keyword)
        if (index !== -1) {
          // 找到关键词所在句子的结束位置
          const endIndex = content.indexOf('。', index)
          if (endIndex !== -1) {
            return content.slice(index, endIndex + 1)
          }
        }
      }

      // 3. 如果内容太长，截取前20个字符
      if (content.length > 20) {
        return content.slice(0, 20) + '...'
      }

      // 4. 如果都不符合，直接返回原内容
      return content
    },

    // 置顶/取消置顶对话
    togglePin (conversationId) {
      const conversation = this.conversations.find(c => c.id === conversationId)
      if (conversation) {
        conversation.isPinned = !conversation.isPinned
        this.saveToLocalStorage();
      }
    },

    // 删除对话
    async deleteConversation (conversationId) {
      console.log(conversationId);
      try {
        // const response = await chatAPI.delConversations(conversationId);
        // if (response.data && response.data.result === "success") {
          // 这里可以添加其他逻辑，例如更新状态或通知用户
          this.conversations = this.conversations.filter(c => c.id !== conversationId);
          this.saveToLocalStorage();
          console.log('会话已成功删除:', conversationId);
        // } else {
          // console.error('删除会话失败:', response);
          // throw new Error('删除会话失败');
        // }
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    // 批量删除对话
    deleteMultipleConversations (conversationIds) {
      try {
        conversationIds.forEach(id => {
          this.deleteConversation(id)
        })
        return true
      } catch (error) {
        console.error('批量删除对话失败:', error)
        return false
      }
    },

    // 清空所有对话
    clearAllConversations () {
      try {
        this.conversations = []
        this.currentConversation = null
        this.saveToLocalStorage()
        return true
      } catch (error) {
        console.error('清空所有对话失败:', error)
        return false
      }
    },

    // 导出对话历史
    exportConversation (conversationId) {
      const conversation = this.conversations.find(c => c.id === conversationId)
      if (!conversation) return null

      return {
        title: conversation.title,
        mode: conversation.mode,
        timestamp: conversation.timestamp,
        messages: conversation.messages
      }
    },

    // 添加获取对话模式的方法
    getConversationMode (conversationId) {
      const conversation = this.conversations.find(c => c.id === conversationId)
      return conversation ? conversation.mode : 'general'
    },

    // 加载对话历史
    async loadConversationHistory (conversationId) {
      try {
        this.loading = true;
        const response = await chatAPI.getConversationHistory(conversationId);

        const messages = response.data.map(msg => ({
          id: msg.id,
          content: msg.answer,
          type: 'ai', // 假设所有历史消息都是 AI 消息
          timestamp: new Date(msg.created_at),
          files: msg.message_files || [] // 添加文件信息
        }));

        if (this.currentConversation) {
          this.currentConversation.messages = messages;
        }

        return messages;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async stopTaskResponse (taskId) {
      try {
        const response = await chatAPI.stopResponse(taskId);
        if (response.data && response.data.result === "success") {
          console.log('任务响应已成功停止:', taskId);
          // 这里可以添加其他逻辑，例如更新状态或通知用户
        } else {
          console.error('停止任务响应失败:', response);
          throw new Error('停止任务响应失败');
        }
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    async sendMessageFeedback (messageId, rating, content) {
      try {
        const response = await chatAPI.sendFeedback(messageId, rating, content);
        if (response.data && response.data.result === "success") {
          console.log('消息反馈已成功发送:', messageId);
          // 这里可以添加其他逻辑，例如更新状态或通知用户
        } else {
          console.error('发送消息反馈失败:', response);
          throw new Error('发送消息反馈失败');
        }
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    async fetchMessageHistory (conversationId) {
      try {
        const response = await chatAPI.getMessageHistory(conversationId);
        if (response.data) {
          console.log('获取到的历史会话:', response.data);
          return response.data; // 返回历史会话数据
        } else {
          console.error('获取历史会话失败:', response);
          throw new Error('获取历史会话失败');
        }
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    async fetchConversations () {
      try {
        const response = await chatAPI.getConversations();
        if (response.data) {
          console.log('获取到的对话列表:', response.data);
          return response.data; // 返回对话列表
        } else {
          console.error('获取对话失败:', response);
          throw new Error('获取对话失败');
        }
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    async updateConversationName (conversationId, newName) {
      try {
        const response = await chatAPI.renameConversation(conversationId, newName);
        if (response.data) {
          console.log('会话已成功重命名:', response.data);
          // 更新当前会话的名称
          if (this.currentConversation && this.currentConversation.id === conversationId) {
            this.currentConversation.name = response.data.name;
          }
          return response.data; // 返回重命名后的会话信息
        } else {
          console.error('重命名会话失败:', response);
          throw new Error('重命名会话失败');
        }
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    async convertAudioToText (audioFile) {
      try {
        const response = await chatAPI.audioToText(audioFile);
        if (response.data) {
          console.log('转录文本:', response.data.text);
          return response.data.text; // 返回转录的文本
        } else {
          console.error('语音转文字失败:', response);
          throw new Error('语音转文字失败');
        }
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    async convertTextToAudio (messageId, text) {
      try {
        const response = await chatAPI.textToAudio(messageId, text);
        const audioBlob = new Blob([response.data], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // 这里可以播放音频或进行其他处理
        const audio = new Audio(audioUrl);
        audio.play();

        console.log('音频已成功生成并播放');
        return audioUrl; // 返回音频的 URL
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    async fetchAppInfo () {
      try {
        const response = await chatAPI.getAppInfo();
        if (response.data) {
          console.log('应用基本信息:', response.data);
          return response.data; // 返回应用信息
        } else {
          console.error('获取应用信息失败:', response);
          throw new Error('获取应用信息失败');
        }
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    async fetchAppParameters () {
      try {
        const response = await chatAPI.getAppParameters();
        if (response.data) {
          console.log('应用参数:', response.data);
          return response.data; // 返回应用参数
        } else {
          console.error('获取应用参数失败:', response);
          throw new Error('获取应用参数失败');
        }
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    async fetchAppMeta () {
      try {
        const response = await chatAPI.getAppMeta();
        if (response.data) {
          console.log('应用信息:', response.data);
          return response.data; // 返回应用信息
        } else {
          console.error('获取应用信息失败:', response);
          throw new Error('获取应用信息失败');
        }
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    }
  }
}) 