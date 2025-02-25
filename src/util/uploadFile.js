// 引入 axios
import axios from 'axios';
import { createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'
const pinia = createPinia();
const userStore = useUserStore(pinia);

/**
 * 上传文件到指定接口
 * @param {File} file - 要上传的文件对象
 * @param {string} apiKey - API 密钥
 * @param {string} userId - 用户ID
 * @returns {Promise} - 返回上传结果的 Promise
 */
async function uploadFile(file,type) {
    const apiUrl = '/api/files/upload';

    return new Promise(async (resolve, reject) => {
        try{
            const formData = new FormData();
            formData.append('file', file); // 添加文件
            formData.append('user', userStore.getUserId); // 添加用户ID
    
            // 发起 POST 请求
            const response = await axios.post(apiUrl, formData, {
                headers: {
                    'Authorization': `Bearer app-2vWsFF8PM5gJjxnHe5zVGqB1`, // 设置认证头
                    'Content-Type': 'multipart/form-data' // 设置内容类型
                }
            });
    
            // 处理响应
            console.log('文件上传成功：', response.data);
            resolve(response.data);
        }catch(e){
            reject(e);
        }
       
    })
}


async function audioTotext(file) {
    const apiUrl = '/api/audio-to-text';

    return new Promise(async (resolve, reject) => {
        try{
            const formData = new FormData();
            formData.append('file', file); // 添加文件
            formData.append('user', userStore.getUserId); // 添加用户ID
    
            // 发起 POST 请求
            const response = await axios.post(apiUrl, formData, {
                headers: {
                    'Authorization': `Bearer app-2vWsFF8PM5gJjxnHe5zVGqB1`, // 设置认证头
                    'Content-Type': 'multipart/form-data' // 设置内容类型
                }
            });
    
            // 处理响应
            console.log('文件上传成功：', response.data);
            resolve(response.data);
        }catch(e){
            reject(e);
        }
       
    })
}


export {uploadFile, audioTotext};
