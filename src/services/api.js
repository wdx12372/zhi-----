import axios from 'axios'

// 创建 axios 实例
const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer app-2vWsFF8PM5gJjxnHe5zVGqB1'  // 添加默认的授权token
  }
})

// 创建聊天专用的 axios 实例
const chatApi = axios.create({
  baseURL: '/chat',  // 使用不同的基础URL
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI3ZDg4ZWYzMC0zZGQwLTRhMTgtYjUzOS03MjY2M2IxMTdjMjAiLCJzdWIiOiJXZWIgQVBJIFBhc3Nwb3J0IiwiYXBwX2lkIjoiN2Q4OGVmMzAtM2RkMC00YTE4LWI1MzktNzI2NjNiMTE3YzIwIiwiYXBwX2NvZGUiOiJBSmdVUDBVY2tDMU9CZ1J1IiwiZW5kX3VzZXJfaWQiOiI4MjcyZjQzNy0yNzIwLTQxYWItYTQ4Yi0xNGY5MDIwMmExMTQifQ.M58DdM2IH1c0emaXzEf-RSIijsOghfAMt3gFoPE2vMw'
  }
})

// 创建聊天 API 实例
export const chatAPI = {
  async sendMessage({ query, conversation_id, user, files }) {
    // 使用 fetch API 处理流式响应
    return await fetch("/chat/chat-messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI3ZDg4ZWYzMC0zZGQwLTRhMTgtYjUzOS03MjY2M2IxMTdjMjAiLCJzdWIiOiJXZWIgQVBJIFBhc3Nwb3J0IiwiYXBwX2lkIjoiN2Q4OGVmMzAtM2RkMC00YTE4LWI1MzktNzI2NjNiMTE3YzIwIiwiYXBwX2NvZGUiOiJBSmdVUDBVY2tDMU9CZ1J1IiwiZW5kX3VzZXJfaWQiOiI4MjcyZjQzNy0yNzIwLTQxYWItYTQ4Yi0xNGY5MDIwMmExMTQifQ.M58DdM2IH1c0emaXzEf-RSIijsOghfAMt3gFoPE2vMw'
      },
      body: JSON.stringify({
        inputs: {},
        query: query,
        response_mode: "streaming",
        conversation_id: conversation_id || "",
        user: user,
        files: files || []
      }),
    });
  },

  async createConversation() {
    return await chatApi.get(`/conversations`, {
      params: {
        last_id: "",
        limit: 20
      }
    })
  },

  async uploadFile(file, userId) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('user', userId)
    return await chatApi.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  async audioToText(file, userId) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('user', userId)
    return await chatApi.post('/audio/transcriptions', formData)
  },

  // 其他 API 方法...
  async getConversationHistory(conversationId) {
    return await chatApi.get(`/conversations/${conversationId}/messages`)
  },

  async getConversations() {
    return await chatApi.get('/conversations')
  },

  async delConversations(conversationId) {
    return await chatApi.delete(`/conversations/${conversationId}`)
  },

  async stopResponse(taskId) {
    return await chatApi.post(`/chat-messages/${taskId}/stop`)
  },

  async sendFeedback(messageId, rating, content) {
    return await chatApi.post(`/messages/${messageId}/feedback`, {
      rating,
      content
    })
  },

  async getMessageHistory(conversationId) {
    return await chatApi.get(`/conversations/${conversationId}/messages`)
  },

  async renameConversation(conversationId, newName) {
    return await chatApi.patch(`/conversations/${conversationId}`, {
      name: newName
    })
  },

  async textToAudio(messageId, text) {
    return await chatApi.post('/text-to-audio', {
      message_id: messageId,
      text
    }, {
      responseType: 'blob'
    })
  },

  async getAppInfo() {
    return await api.get('/info')
  },

  async getAppParameters() {
    return await api.get('/parameters')
  },

  async getAppMeta() {
    return await api.get('/meta')
  }
}

// 请求拦截器
const setupInterceptors = (axiosInstance) => {
  axiosInstance.interceptors.request.use(
    config => {
      return config
    },
    error => {
      return Promise.reject(error)
    }
  )

  axiosInstance.interceptors.response.use(
    response => response,
    error => {
      if (error.response) {
        console.error('API Error:', error.response.data)
        return Promise.reject(error.response.data)
      } else if (error.request) {
        console.error('Network Error:', error.request)
        return Promise.reject(new Error('网络错误，请检查网络连接'))
      } else {
        console.error('Request Error:', error.message)
        return Promise.reject(error)
      }
    }
  )
}

setupInterceptors(api)
setupInterceptors(chatApi) 