<template>
  <view class="settings-container">
    <view class="section">
      <view class="menu-item">
        <text class="menu-label">{{ $t('settings.pushNotification') }}</text>
        <switch :checked="pushEnabled" @change="togglePush" />
      </view>
      <view class="menu-item" @click="clearCache">
        <text class="menu-label">{{ $t('settings.clearCache') }}</text>
        <text class="menu-value">{{ cacheSize }}</text>
      </view>
      <view class="menu-item" @click="checkUpdate">
        <text class="menu-label">{{ $t('settings.checkUpdate') }}</text>
        <text class="menu-value">{{ $t('settings.version') }} 1.0.0</text>
      </view>
      <view class="menu-item" @click="showPrivacy">
        <text class="menu-label">{{ $t('settings.privacyPolicy') }}</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="showTerms">
        <text class="menu-label">{{ $t('settings.termsService') }}</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <view class="logout-section">
      <button class="logout-btn" @click="handleLogout">{{ $t('user.logout') }}</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const pushEnabled = ref(true)
const cacheSize = ref('12.5MB')

// 切换推送
const togglePush = (e: any) => {
  pushEnabled.value = e.detail.value
  uni.setStorageSync('pushEnabled', pushEnabled.value)
}

// 清除缓存
const clearCache = () => {
  uni.showModal({
    title: '提示',
    content: '确定清除缓存吗？清除后需要重新登录。',
    success: (res) => {
      if (res.confirm) {
        // 保留 token 和语言设置，清除其他缓存
        const token = uni.getStorageSync('access_token')
        const language = uni.getStorageSync('app_language')
        uni.clearStorageSync()
        if (token) uni.setStorageSync('access_token', token)
        if (language) uni.setStorageSync('app_language', language)
        cacheSize.value = '0KB'
        uni.showToast({ title: '清除成功', icon: 'success' })
      }
    },
  })
}

// 检查更新
const checkUpdate = () => {
  uni.showToast({ title: '已是最新版本', icon: 'none' })
}

// 隐私政策
const showPrivacy = () => {
  uni.showModal({
    title: '隐私政策',
    content: '我们重视您的隐私保护。本应用收集的信息仅用于提供服务，不会泄露给第三方。',
    showCancel: false,
  })
}

// 服务条款
const showTerms = () => {
  uni.showModal({
    title: '服务条款',
    content: '使用本应用即表示您同意我们的服务条款。请遵守相关法律法规。',
    showCancel: false,
  })
}

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.reLaunch({ url: '/pages/login/index' })
      }
    },
  })
}
</script>

<style scoped lang="scss">
.settings-container {
  background: #f5f5f5;
  min-height: 100vh;
  padding: 20rpx;
}

.section {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 40rpx;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.menu-label {
  font-size: 30rpx;
  color: #333;
}

.menu-value {
  font-size: 26rpx;
  color: #999;
}

.menu-arrow {
  font-size: 36rpx;
  color: #ccc;
}

.logout-section {
  padding: 20rpx;
}

.logout-btn {
  background: #fff;
  color: #f44336;
  border: 1rpx solid #f44336;
  border-radius: 60rpx;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 32rpx;
}
</style>
