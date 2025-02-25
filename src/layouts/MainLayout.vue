<template>
  <div class="main-layout">
    <Sidebar />
    <div class="main-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
</script>

<style>
:root {
  --gradient-from: #2b5876;
  --gradient-to: #4e4376;
  --gradient-hover-from: #3a6f94;
  --gradient-hover-to: #5d5191;
  --primary-color: #2b5876;
  --text-primary: #333;
  --text-secondary: #666;
  --text-light: #999;
  --border-color: #e0e0e0;
  --bg-light: #f5f5f5;
  --bg-lighter: #f8f9fa;
  --shadow-sm: 0 2px 6px rgba(43, 88, 118, 0.2);
  --shadow-md: 0 4px 12px rgba(43, 88, 118, 0.4);
}

.main-layout {
  display: flex;
  width: 100%;
  height: 100vh;
}

.main-content {
  flex: 1;
  overflow: hidden;
}
</style> 