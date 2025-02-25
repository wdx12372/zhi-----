<template>
    <div class="favorites">
        <h2>收藏夹</h2>
        <div class="box">
            <div class="box-item animate-in" v-for="(item, index) in list" :key="item.id"
                @mouseenter="item.status = true"
                @mouseleave="item.status = false">
                <span>{{item.name}}</span>

                <div v-if="!item.status" class="fade" >{{item.time}}</div>
                <div v-else class="delete fade" @click="deleteItem(index)">删除</div>
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref } from 'vue'

const list = ref([
    {id:1, name: '123', time: 'time', status: false},
    {id:2, name: '123', time: 'time', status: false},
    {id:3, name: '123', time: 'time', status: false},
])

</script>

<style scoped>
.favorites{
    background-color: #f5f7f9;

}

h2 {
    font-size: 36px;
    line-height: 50px;
    font-weight: 700;
    text-align: center;
    padding: 16px 0;
}

.box{
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 792px;
    margin: 0 auto;
    min-height: 0;
    padding: 0 16px 36px;
    box-sizing: border-box;
}

.box-item {
    width: 100%;
    padding: 12px;
    cursor: pointer;
    border-radius: 8px;
    line-height: 22px;
    background: #fff;
    border: 1px solid #e5e5e5;
    display: flex;
    flex-direction: column;
    -webkit-text-decoration: none;
    text-decoration: none;
    color: inherit;
    transition: all 0.3s ease;
    margin-bottom: 24px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}

.box-item:hover {
    border-color: #0084ff;
    color: #0084ff;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 132, 255, 0.1);
}

.fade{
    transition: all 0.3s ease;
}


/* 元素进入动画 */
.animate-in {
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
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

</style>