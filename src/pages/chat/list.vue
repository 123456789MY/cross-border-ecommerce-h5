<template>
  <view class="chat-list-container">
    <view class="session-list" v-if="sessionList.length > 0">
      <view
        class="session-item"
        v-for="session in sessionList"
        :key="session.id"
        @click="enterChat(session)"
      >
        <image :src="session.avatar || '/static/default-avatar.png'" class="avatar" />
        <view class="session-info">
          <text class="name">{{ session.name }}</text>
          <text class="last-message">{{ session.lastMessage }}</text>
        </view>
        <view class="session-right">
          <text class="time">{{ formatTime(session.lastTime) }}</text>
          <view v-if="session.unreadCount > 0" class="unread-badge">
            {{ session.unreadCount > 99 ? '99+' : session.unreadCount }}
          </view>
        </view>
      </view>
    </view>

    <view class="empty-state" v-else>
      <text class="empty-text">{{ $t('chat.noSession') }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getSessionList } from '@/api/chat'

const sessionList = ref<any[]>([])

// 格式化时间
const formatTime = (time: any) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  if (isToday) {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

// 加载会话列表
const loadSessions = async () => {
  try {
    const res = await getSessionList()
    sessionList.value = res.data || []
  } catch (err) {
    console.error('加载会话列表失败', err)
    // Mock 数据
    sessionList.value = [
      { id: 1, name: '商家A', avatar: '', lastMessage: '你好，请问商品还在吗？', lastTime: new Date(), unreadCount: 2, sellerId: 1 },
      { id: 2, name: '商家B', avatar: '', lastMessage: '欢迎光临', lastTime: new Date(), unreadCount: 0, sellerId: 2 },
      { id: 3, name: '商家C', avatar: '', lastMessage: '好的，马上发货', lastTime: new Date(), unreadCount: 1, sellerId: 3 },
    ]
  }
}

// 进入聊天室
const enterChat = (session: any) => {
  uni.navigateTo({
    url: `/pages/chat/room?sellerId=${session.sellerId}&sellerName=${session.name}`,
  })
}

onShow(() => {
  loadSessions()
})
</script>

<style scoped lang="scss">
.chat-list-container {
  background: #f5f5f5;
  min-height: 100vh;
}

.session-item {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 24rpx;
  margin-bottom: 2rpx;
  gap: 20rpx;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
}

.session-info {
  flex: 1;
}

.name {
  font-size: 30rpx;
  font-weight: bold;
  display: block;
}

.last-message {
  font-size: 26rpx;
  color: #999;
  margin-top: 8rpx;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-right {
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.time {
  font-size: 22rpx;
  color: #ccc;
}

.unread-badge {
  background: #ff6b6b;
  color: #fff;
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 30rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-text {
  color: #999;
  font-size: 28rpx;
}
</style>
