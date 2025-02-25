<template>
  <div class="input-wrapper animate-in">
    <input type="file" hidden id="fileInput" ref="fileInput"
      accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, .txt, .xls, .xlsx, .doc, .docx">
    <div class="fileBox" v-if="showFile">
      <div class="fileCont">
        <button class="tool-btn delIcon" @click="delFile">
          <i class="fas fa-times-circle " />
        </button>

        <i class="fas fa-paperclip"></i>
        <span class="fileName" :title="fileInfo.name">{{ fileInfo.name }}</span>
      </div>
    </div>
    <div class="input-box">
      <input type="text" v-model="inputMessage" placeholder="输入问题开始对话..." @keyup.enter="sendMessage" />
      <div class="input-tools">
        <button class="tool-btn" title="附件" @click="handleClick">
          <i class="fas fa-paperclip"></i>
        </button>
        <button class="tool-btn" title="点击开始语音输入" @click="recordAudio" v-if="!audioFlag">
          <i class="fas fa-microphone" ></i>
        </button>
        <button class="tool-btn" title="点击结束" @click="stopAudio" v-else>
          <i class="fas fa-stop" ></i>
        </button>
        <div class="divider"></div>
        <button class="send-btn" @click="sendMessage" :disabled="!inputMessage.trim()">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import {uploadFile, audioTotext} from '@/util/uploadFile'
import { useToast } from 'vue-toast-notification';

const $toast = useToast();

const inputMessage = ref('')
const showFile = ref(false)
const fileInfo = ref({
})

const audioFlag = ref(false)

const files = ref([])

const emitMessage = defineEmits(['send-message'])

const sendMessage = () => {
  if (!inputMessage.value.trim()) return

  emitMessage('send-message', {
    query: inputMessage.value,
    files: files.value
  })

  inputMessage.value = ''
  delFile()
}

const delFile = () => {
  fileInfo.value = {}
  showFile.value = false
  files.value = []
}


const handleClick = () => {
  const fileInput = document.getElementById('fileInput');

  fileInput.click()

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0]; // 获取选中的文件
    if (file) {
      fileInfo.value = file;
      showFile.value = true
      try {
        const result = await uploadFile(file); // 调用上传函数
        $toast.success('上传成功！');
        console.log({ result });
        files.value = [{
          'type': result.mime_type,
          'transfer_method': 'local_file',
          'upload_file_id': result.id,
        }];
      } catch (e) {
        $toast.error('上传失败：' + e.message);
      }

    } else {
      alert('未选择文件！');
    }
  });
}


const recordAudio = () => {
  startRecording()
}

const stopAudio = () => {
  stopRecording()
}

// 请求麦克风权限并初始化录音
let mediaRecorder;
let audioChunks = [];
async function startRecording () {
  try {
    audioFlag.value = true
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    // 收集音频数据
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    // 录音停止后的处理
    mediaRecorder.onstop = async() => {
      $toast.success('正在转换为文字...');

      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const file = new File([audioUrl], Math.random(), { type: 'audio/wav' });
      try{
        const result = await audioTotext(file)
        // TODO 假设result.text是文本内容, 将下面的注释打开就行
        // inputMessage.value = result.text
      }catch(e){
        $toast.error('语音转文字出错了，请先使用文字输入吧！');
        console.error('语音转文字出错了:', e)
      }

      audioChunks = []; // 清空数据
    };

    mediaRecorder.start();
  } catch (error) {
    // 部署后需要为https才可以访问麦克风权限
    $toast.error('无法访问麦克风,请在浏览器设置中允许当前域名获取麦克风权限');
    audioFlag.value = false

    console.error('无法访问麦克风:', error);
  }
}

// 停止录音
function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    // 停止 MediaRecorder
    mediaRecorder.stop();
    audioFlag.value = false

    // 获取当前的 MediaStream 并停止所有音频轨道
    if (mediaRecorder.stream) {
      const tracks = mediaRecorder.stream.getTracks();
      tracks.forEach(track => {
        if (track.kind === "audio" && track.readyState === "live") {
          track.stop(); // 停止音频轨道
        }
      });
    }
  } else {
    console.log("录音未开始或已停止");
  }
}

</script>

<style scoped>
.fileCont i {
  margin-right: 12px;
  width: 20px;
  text-align: center;
}

.input-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: white;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.input-box {
  display: flex;
  align-items: center;
  background: white;
  width: 100%;
}

.fileBox {
  margin-bottom: 10px;
  padding: 4px;
  max-width: 33%;
}

.fileCont {
  position: relative;
  background: #F5F7F9;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
}

.input-wrapper:focus-within {
  border-color: #0084ff;
  box-shadow: 0 4px 12px rgba(0, 132, 255, 0.1);
  transform: translateY(-1px);
}

.input-wrapper input {
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: #f5f7f9;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  outline: none;
  transition: all 0.3s ease;
}

.input-wrapper input:focus {
  background: white;
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

/* 添加工具提示 */
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


.delIcon {
  position: absolute;
  top: 1px;
  right: -2px;
  margin: 0;
  color: red;
  width: auto;
  height: auto;
}

.delIcon i {
  margin: 0;
}
</style>