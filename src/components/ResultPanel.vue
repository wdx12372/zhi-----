<template>
  <div class="result-panel">
    <div class="panel-header">
      <h3>{{ title }}</h3>
      <button class="close-btn" @click="$emit('close')">
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <div class="panel-content">
      <!-- 天网追踪结果 -->
      <template v-if="mode === 'tianwen'">
        <div v-for="(info, type) in trackingInfo" 
             :key="type" 
             class="info-section">
          <h4>{{ type }}</h4>
          <div class="info-details">
            <div v-for="(item, index) in info" 
                 :key="index" 
                 class="info-item">
              <span class="info-label">{{ item.label }}:</span>
              <span class="info-value">{{ item.value }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- 侦察谋略结果 -->
      <template v-else>
        <div class="analysis-section">
          <h4>法律法规</h4>
          <div class="law-list">
            <div v-for="(law, index) in analysisInfo.laws" 
                 :key="index" 
                 class="law-item">
              <div class="law-title">{{ law.title }}</div>
              <div class="law-content">{{ law.content }}</div>
            </div>
          </div>
        </div>

        <div class="analysis-section">
          <h4>类案检索</h4>
          <div class="case-list">
            <div v-for="(caseItem, index) in analysisInfo.cases" 
                 :key="index" 
                 class="case-item">
              <div class="case-title">{{ caseItem.title }}</div>
              <div class="case-content">{{ caseItem.content }}</div>
              <div class="case-reference">参考价值：{{ caseItem.reference }}</div>
            </div>
          </div>
        </div>

        <div class="analysis-section">
          <h4>侦查建议</h4>
          <div class="suggestion-list">
            <div v-for="(suggestion, index) in analysisInfo.suggestions" 
                 :key="index" 
                 class="suggestion-item">
              <div class="suggestion-title">{{ suggestion.title }}</div>
              <div class="suggestion-content">{{ suggestion.content }}</div>
            </div>
          </div>
        </div>
      </template>

      <div class="panel-actions">
        <button class="action-btn" @click="exportResult">
          <i class="fas fa-download"></i>
          导出结果
        </button>
        <button class="action-btn" @click="refreshResult">
          <i class="fas fa-sync"></i>
          刷新
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResultPanel',
  props: {
    mode: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: '分析结果'
    },
    trackingInfo: {
      type: Object,
      default: () => ({})
    },
    analysisInfo: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['close', 'refresh', 'export'],

  methods: {
    exportResult() {
      this.$emit('export')
    },
    refreshResult() {
      this.$emit('refresh')
    }
  }
}
</script>

<style scoped>
.result-panel {
  position: fixed;
  right: 20px;
  top: 80px;
  width: 360px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  z-index: 100;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 4px;
  border-radius: 4px;
}

.close-btn:hover {
  background-color: #f5f5f5;
}

.panel-content {
  padding: 16px;
  max-height: 70vh;
  overflow-y: auto;
}

.info-section, .analysis-section {
  margin-bottom: 20px;
}

.info-section h4, .analysis-section h4 {
  margin-bottom: 12px;
  color: var(--primary-color);
  font-weight: 500;
}

.info-item {
  display: flex;
  margin-bottom: 8px;
}

.info-label {
  color: #666;
  margin-right: 8px;
  min-width: 80px;
}

.info-value {
  color: #333;
}

.law-item, .case-item, .suggestion-item {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
}

.law-title, .case-title, .suggestion-title {
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
}

.law-content, .case-content, .suggestion-content {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-line;
}

.case-reference {
  margin-top: 8px;
  color: var(--primary-color);
  font-size: 13px;
}

.panel-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.action-btn {
  flex: 1;
  padding: 8px 16px;
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background-color: #f5f5f5;
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.action-btn i {
  font-size: 14px;
}
</style> 