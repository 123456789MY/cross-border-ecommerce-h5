<template>
  <view class="chat-room">
    <!-- 消息列表 -->
    <scroll-view
      scroll-y
      class="message-list"
      :scroll-top="scrollTop"
      :scroll-with-animation="true"
    >
      <view
        class="message-item"
        :class="msg.isSelf ? 'self' : 'other'"
        v-for="msg in messageList"
        :key="msg.id"
      >
        <image :src="msg.avatar || '/static/default-avatar.png'" class="avatar" mode="aspectFill" />
        <view class="message-content">
          <text class="message-text">{{ msg.content }}</text>
          <text class="message-time">{{ formatTime(msg.createdAt) }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 输入栏 -->
    <view class="input-bar">
      <view class="input-wrapper">
        <input
          v-model="inputText"
          type="text"
          :placeholder="$t('chat.inputPlaceholder')"
          confirm-type="send"
          @confirm="sendMessage"
        />
        <view class="emoji-btn" @click="showEmoji = !showEmoji">😊</view>
      </view>
      <button class="send-btn" @click="sendMessage">{{ $t('chat.send') }}</button>
    </view>

    <!-- 表情面板 -->
    <view class="emoji-panel" v-if="showEmoji">
      <view class="emoji-list">
        <text v-for="emoji in emojis" :key="emoji" @click="insertEmoji(emoji)">{{ emoji }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { getMessageList } from '@/api/chat'
import { connectSocket, disconnectSocket, onSocketMessage, sendSocketMessage } from '@/utils/socket'

const sellerId = ref(0)
const sellerName = ref('')
const messageList = ref<any[]>([])
const inputText = ref('')
const scrollTop = ref(0)
const showEmoji = ref(false)

const emojis = ['😀', '😂', '😍', '😢', '👍', '❤️', '🎉', '🔥']

// 格式化时间
const formatTime = (time: any) => {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 加载历史消息
const loadMessages = async () => {
  try {
    const res = await getMessageList(sellerId.value)
    messageList.value = res.data?.list || []
    setTimeout(() => {
      scrollTop.value = 99999
    }, 100)
  } catch (err) {
    console.error('加载消息失败', err)
    // Mock 数据
    messageList.value = [
      { id: 1, content: '你好，请问这个商品还有吗？', isSelf: true, createdAt: new Date(), avatar: '/static/default-avatar.png' },
      { id: 2, content: '有的，可以下单哦', isSelf: false, createdAt: new Date(), avatar: '/static/default-avatar.png' },
      { id: 3, content: '好的，价格可以优惠吗？', isSelf: true, createdAt: new Date(), avatar: '/static/default-avatar.png' },
      { id: 4, content: '可以给您打九折', isSelf: false, createdAt: new Date(), avatar: '/static/default-avatar.png' },
    ]
    setTimeout(() => {
      scrollTop.value = 99999
    }, 100)
  }
}

// 发送消息
const sendMessage = async () => {
  if (!inputText.value.trim()) return
  const content = inputText.value
  inputText.value = ''
  showEmoji.value = false

  // 本地先显示
  const tempMsg = {
    id: Date.now(),
    content,
    isSelf: true,
    createdAt: new Date(),
    avatar: '/static/default-avatar.png',
  }
  messageList.value.push(tempMsg)
  scrollTop.value = 99999

  // 通过 WebSocket 发送
  try {
    await sendSocketMessage({
      toSellerId: sellerId.value,
      content,
      type: 'text',
    })
  } catch (err) {
    // WebSocket 未连接时静默处理
    console.log('WebSocket 发送失败，消息仅本地显示')
  }
}

// 插入表情
const insertEmoji = (emoji: string) => {
  inputText.value += emoji
}

// 接收新消息
const handleNewMessage = (msg: any) => {
  if (String(msg.sellerId) === String(sellerId.value) || String(msg.userId) === String(sellerId.value)) {
    messageList.value.push({
      id: Date.now(),
      content: msg.content,
      isSelf: msg.isSelf || false,
      createdAt: new Date(),
      avatar: '/static/default-avatar.png',
    })
    scrollTop.value = 99999
  }
}

onLoad((options: any) => {
  sellerId.value = Number(options.sellerId)
  sellerName.value = options.sellerName || '商家'
  uni.setNavigationBarTitle({ title: sellerName.value })

  loadMessages()

  // 连接 WebSocket
  connectSocket()
  onSocketMessage(handleNewMessage)
})

onUnload(() => {
  disconnectSocket()
})
</script>

<style scoped lang="scss">
.chat-room {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

.message-list {
  flex: 1;
  padding: 20rpx;
}

.message-item {
  display: flex;
  margin-bottom: 30rpx;

  &.self {
    flex-direction: row-reverse;

    .message-content {
      background: #ff6b6b;
      color: #fff;
      margin-right: 20rpx;
    }

    .message-time {
      color: rgba(255, 255, 255, 0.7);
    }
  }

  &.other {
    .message-content {
      background: #fff;
      margin-left: 20rpx;
    }
  }
}

.avatar {
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
}

.message-content {
  max-width: 500rpx;
  padding: 20rpx;
  border-radius: 16rpx;
  position: relative;
}

.message-text {
  font-size: 28rpx;
  word-break: break-all;
}

.message-time {
  font-size: 20rpx;
  color: #ccc;
  margin-top: 8rpx;
  display: block;
  text-align: right;
}

/* 输入栏 */
.input-bar {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 16rpx 24rpx;
  gap: 16rpx;
  border-top: 1rpx solid #eee;
}

.input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 60rpx;
  padding: 16rpx 24rpx;
  gap: 12rpx;
}

.input-wrapper input {
  flex: 1;
  font-size: 28rpx;
}

.emoji-btn {
  font-size: 40rpx;
}

.send-btn {
  background: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 60rpx;
  padding: 16rpx 32rpx;
  font-size: 28rpx;
}

/* 表情面板 */
.emoji-panel {
  background: #fff;
  border-top: 1rpx solid #eee;
  padding: 20rpx;
}

.emoji-list {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
}

.emoji-list text {
  font-size: 48rpx;
  padding: 12rpx;
}
</style>
