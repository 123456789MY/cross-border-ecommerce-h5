<template>
  <view class="notification-container">
    <!-- Tab 切换 -->
    <view class="tab-bar">
      <view
        class="tab-item"
        :class="{ active: currentTab === 'all' }"
        @click="switchTab('all')"
      >{{ $t('notification.all') }}</view>
      <view
        class="tab-item"
        :class="{ active: currentTab === 'order' }"
        @click="switchTab('order')"
      >{{ $t('notification.order') }}</view>
      <view
        class="tab-item"
        :class="{ active: currentTab === 'system' }"
        @click="switchTab('system')"
      >{{ $t('notification.system') }}</view>
    </view>

    <!-- 通知列表 -->
    <scroll-view scroll-y class="list-scroll" v-if="list.length > 0">
      <view
        class="notification-item"
        v-for="item in list"
        :key="item.id"
        :class="{ unread: !item.isRead }"
        @click="handleClick(item)"
      >
        <view class="item-icon">
          <text class="icon">{{ getIcon(item.type) }}</text>
        </view>
        <view class="item-content">
          <text class="title">{{ item.title }}</text>
          <text class="desc">{{ item.content }}</text>
          <text class="time">{{ formatTime(item.createdAt) }}</text>
        </view>
        <view v-if="!item.isRead" class="unread-dot"></view>
      </view>
    </scroll-view>

    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <text class="empty-text">{{ $t('notification.empty') }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getNotificationList, markAsRead } from '@/api/notification'

const currentTab = ref('all')
const list = ref<any[]>([])

// 获取图标
const getIcon = (type: string) => {
  const icons: Record<string, string> = {
    order: '📦',
    system: '🔔',
    promotion: '🎉',
  }
  return icons[type] || '📢'
}

// 格式化时间
const formatTime = (time: any) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  if (isToday) {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 7) {
    return `${diffDays}天前`
  }
  return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

// 加载通知列表
const loadList = async () => {
  try {
    const params: any = {}
    if (currentTab.value !== 'all') {
      params.type = currentTab.value
    }
    const res = await getNotificationList(params)
    list.value = res.data || []
  } catch (err) {
    console.error('加载通知失败', err)
    // Mock 数据
    list.value = [
      { id: 1, type: 'order', title: '订单状态更新', content: '您的订单已发货，请注意查收', isRead: false, createdAt: new Date(), orderId: 1 },
      { id: 2, type: 'system', title: '系统公告', content: '平台升级通知，预计维护2小时', isRead: true, createdAt: new Date() },
      { id: 3, type: 'promotion', title: '限时优惠', content: '越南咖啡限时8折，速来抢购！', isRead: false, createdAt: new Date() },
    ]
  }
}

// 切换 Tab
const switchTab = (tab: string) => {
  currentTab.value = tab
  loadList()
}

// 点击通知
const handleClick = async (item: any) => {
  if (!item.isRead) {
    try {
      await markAsRead(item.id)
      item.isRead = true
    } catch (err) {
      // 静默处理
    }
  }
  // 根据类型跳转
  if (item.type === 'order') {
    uni.navigateTo({ url: `/pages/order/list` })
  }
}

onShow(() => {
  loadList()
})
</script>

<style scoped lang="scss">
.notification-container {
  background: #f5f5f5;
  min-height: 100vh;
}

/* Tab 栏 */
.tab-bar {
  display: flex;
  background: #fff;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;
}

.tab-item {
  flex: 1;
  text-align: center;
  font-size: 30rpx;
  color: #666;
  position: relative;
  padding-bottom: 16rpx;

  &.active {
    color: #ff6b6b;
    font-weight: bold;
  }

  &.active::after {
    content: '';
    position: absolute;
    bottom: -4rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 48rpx;
    height: 4rpx;
    background: #ff6b6b;
    border-radius: 2rpx;
  }
}

/* 通知列表 */
.list-scroll {
  padding: 20rpx;
}

.notification-item {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  position: relative;
  gap: 20rpx;

  &.unread {
    background: #fff5f5;
  }
}

.item-icon {
  width: 80rpx;
  height: 80rpx;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon {
  font-size: 44rpx;
}

.item-content {
  flex: 1;
}

.title {
  font-size: 30rpx;
  font-weight: bold;
  display: block;
}

.desc {
  font-size: 26rpx;
  color: #666;
  margin-top: 8rpx;
  display: block;
}

.time {
  font-size: 22rpx;
  color: #999;
  margin-top: 12rpx;
  display: block;
}

.unread-dot {
  position: absolute;
  top: 30rpx;
  right: 30rpx;
  width: 16rpx;
  height: 16rpx;
  background: #ff6b6b;
  border-radius: 50%;
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
