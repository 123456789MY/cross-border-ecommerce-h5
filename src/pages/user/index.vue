<template>
  <view class="user-container">
    <!-- 用户信息区（橙色渐变背景） -->
    <view class="user-header" @click="goToProfile">
      <view class="user-header-main">
        <image :src="userInfo.avatar || '/static/default-avatar.png'" class="avatar" mode="aspectFill" />
        <view class="user-info">
          <text class="nickname">{{ userInfo.nickname || $t('user.guest') }}</text>
          <text class="phone">{{ userInfo.phone || $t('user.loginTip') }}</text>
        </view>
        <text class="setting-icon" @click.stop="goToSettings">⚙️</text>
      </view>
      <view class="user-tags">
        <view class="tag">
          <text class="tag-text">普通会员</text>
        </view>
        <view class="tag">
          <text class="tag-text">积分 0</text>
        </view>
      </view>
    </view>

    <!-- 订单状态入口（白色卡片） -->
    <view class="card">
      <view class="section-header">
        <text class="section-title">{{ $t('user.myOrders') }}</text>
        <text class="section-link" @click="goToOrderList">{{ $t('user.viewAll') }} ›</text>
      </view>
      <view class="order-stats">
        <view class="stat-item" @click="goToOrderList(0)">
          <view class="stat-icon-wrap">
            <text class="stat-icon">💰</text>
            <view class="badge" v-if="orderCounts[0] > 0">{{ orderCounts[0] }}</view>
          </view>
          <text class="stat-label">{{ $t('order.status0') }}</text>
        </view>
        <view class="stat-item" @click="goToOrderList(1)">
          <view class="stat-icon-wrap">
            <text class="stat-icon">📦</text>
            <view class="badge" v-if="orderCounts[1] > 0">{{ orderCounts[1] }}</view>
          </view>
          <text class="stat-label">{{ $t('order.status1') }}</text>
        </view>
        <view class="stat-item" @click="goToOrderList(2)">
          <view class="stat-icon-wrap">
            <text class="stat-icon">🚚</text>
            <view class="badge" v-if="orderCounts[2] > 0">{{ orderCounts[2] }}</view>
          </view>
          <text class="stat-label">{{ $t('order.status2') }}</text>
        </view>
        <view class="stat-item" @click="goToOrderList(3)">
          <view class="stat-icon-wrap">
            <text class="stat-icon">✅</text>
            <view class="badge" v-if="orderCounts[3] > 0">{{ orderCounts[3] }}</view>
          </view>
          <text class="stat-label">{{ $t('order.status3') }}</text>
        </view>
        <view class="stat-item" @click="goToOrderList(4)">
          <view class="stat-icon-wrap">
            <text class="stat-icon">🔄</text>
            <view class="badge" v-if="orderCounts[4] > 0">{{ orderCounts[4] }}</view>
          </view>
          <text class="stat-label">{{ $t('order.status4') }}</text>
        </view>
      </view>
    </view>

    <!-- 资产区（白色卡片） -->
    <view class="card assets-card">
      <view class="assets-list">
        <view class="assets-item" @click="goToCoupons">
          <text class="assets-icon">🎫</text>
          <text class="assets-num">0</text>
          <text class="assets-label">优惠券</text>
        </view>
        <view class="assets-item" @click="goToPoints">
          <text class="assets-icon">⭐</text>
          <text class="assets-num">0</text>
          <text class="assets-label">积分</text>
        </view>
        <view class="assets-item" @click="goToFavorites">
          <text class="assets-icon">❤️</text>
          <text class="assets-num">0</text>
          <text class="assets-label">收藏</text>
        </view>
        <view class="assets-item" @click="goToFootprint">
          <text class="assets-icon">👣</text>
          <text class="assets-num">0</text>
          <text class="assets-label">足迹</text>
        </view>
      </view>
    </view>

    <!-- 功能菜单（白色卡片） -->
    <view class="card">
      <view class="menu-item" @click="goToAddress">
        <view class="menu-icon-wrap">
          <text class="menu-icon">📍</text>
        </view>
        <text class="menu-label">{{ $t('user.address') }}</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goToRealname">
        <view class="menu-icon-wrap">
          <text class="menu-icon">🆔</text>
        </view>
        <text class="menu-label">{{ $t('user.realname') }}</text>
        <view class="menu-status" v-if="realnameStatus !== null">
          <text :class="realnameStatusClass">{{ realnameStatusText }}</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goToApplySeller">
        <view class="menu-icon-wrap">
          <text class="menu-icon">🏪</text>
        </view>
        <text class="menu-label">{{ $t('user.applySeller') }}</text>
        <view class="menu-status" v-if="sellerStatus !== null">
          <text :class="sellerStatusClass">{{ sellerStatusText }}</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="toggleLanguage">
        <view class="menu-icon-wrap">
          <text class="menu-icon">🌐</text>
        </view>
        <text class="menu-label">{{ $t('user.language') }}</text>
        <text class="menu-value">{{ currentLang === 'zh-CN' ? '中文' : 'Tiếng Việt' }}</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goToCustomerService">
        <view class="menu-icon-wrap">
          <text class="menu-icon">💬</text>
        </view>
        <text class="menu-label">客服中心</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goToAbout">
        <view class="menu-icon-wrap">
          <text class="menu-icon">ℹ️</text>
        </view>
        <text class="menu-label">关于我们</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="card logout-card">
      <view class="logout-item" @click="handleLogout">
        <text class="logout-text">{{ $t('user.logout') }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import { getUserInfo, getRealnameStatus, getSellerApplyStatus } from '@/api/user'

const userStore = useUserStore()
const { t, locale } = useI18n()

const userInfo = ref<any>({})
const realnameStatus = ref<number | null>(null)
const sellerStatus = ref<number | null>(null)
const orderCounts = ref<number[]>([0, 0, 0, 0, 0])

// 实名状态映射
const realnameStatusMap: Record<number, { text: string; class: string }> = {
  0: { text: '未认证', class: 'status-warning' },
  1: { text: '审核中', class: 'status-info' },
  2: { text: '已认证', class: 'status-success' },
  3: { text: '已驳回', class: 'status-danger' },
}

// 商家申请状态映射
const sellerStatusMap: Record<number, { text: string; class: string }> = {
  0: { text: '待审核', class: 'status-warning' },
  1: { text: '已通过', class: 'status-success' },
  2: { text: '已驳回', class: 'status-danger' },
}

const realnameStatusText = computed(() => realnameStatusMap[realnameStatus.value ?? -1]?.text || '')
const realnameStatusClass = computed(() => realnameStatusMap[realnameStatus.value ?? -1]?.class || '')
const sellerStatusText = computed(() => sellerStatusMap[sellerStatus.value ?? -1]?.text || '')
const sellerStatusClass = computed(() => sellerStatusMap[sellerStatus.value ?? -1]?.class || '')
const currentLang = computed(() => locale.value)

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const res = await getUserInfo()
    userInfo.value = res
  } catch (err) {
    userInfo.value = { nickname: '', phone: '' }
  }
}

// 加载实名状态
const loadRealnameStatus = async () => {
  try {
    const res = await getRealnameStatus()
    realnameStatus.value = res.status ?? 0
  } catch (err) {
    realnameStatus.value = 0
  }
}

// 加载商家申请状态
const loadSellerStatus = async () => {
  try {
    const res = await getSellerApplyStatus()
    sellerStatus.value = res.status ?? null
  } catch (err) {
    sellerStatus.value = null
  }
}

// 跳转订单列表
const goToOrderList = (status = -1) => {
  if (status === -1) {
    uni.switchTab({ url: '/pages/order/list' })
  } else {
    uni.navigateTo({ url: `/pages/order/list?status=${status}` })
  }
}

// 跳转个人资料
const goToProfile = () => {
  uni.navigateTo({ url: '/pages/user/profile' })
}

// 跳转地址管理
const goToAddress = () => {
  uni.navigateTo({ url: '/pages/user/address' })
}

// 跳转实名认证
const goToRealname = () => {
  uni.navigateTo({ url: '/pages/user/realname' })
}

// 跳转商家入驻
const goToApplySeller = () => {
  uni.navigateTo({ url: '/pages/user/apply-seller' })
}

// 跳转设置
const goToSettings = () => {
  uni.navigateTo({ url: '/pages/user/settings' })
}

// 切换语言
const toggleLanguage = () => {
  const newLang = locale.value === 'zh-CN' ? 'vi-VN' : 'zh-CN'
  locale.value = newLang
  uni.setStorageSync('language', newLang)
  uni.showToast({ title: t('common.languageChanged'), icon: 'success' })
}

// 跳转优惠券
const goToCoupons = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

// 跳转积分
const goToPoints = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

// 跳转收藏
const goToFavorites = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

// 跳转足迹
const goToFootprint = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

// 跳转客服
const goToCustomerService = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

// 跳转关于
const goToAbout = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: t('common.tip'),
    content: t('user.logoutConfirm'),
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.reLaunch({ url: '/pages/login/index' })
      }
    },
  })
}

onShow(() => {
  if (userStore.isLogin) {
    loadUserInfo()
    loadRealnameStatus()
    loadSellerStatus()
  } else {
    userInfo.value = { nickname: '', phone: '' }
  }
})
</script>

<style scoped lang="scss">
.user-container {
  background: #f5f5f5;
  min-height: 100vh;
  padding: 0 20rpx 120rpx;
  box-sizing: border-box;
}

/* 统一卡片样式 */
.card {
  background: #ffffff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  padding: 24rpx;
}

/* 用户信息区（橙色渐变背景） */
.user-header {
  background: linear-gradient(90deg, #ff9000 0%, #ff5000 100%);
  border-radius: 0 0 24rpx 24rpx;
  padding: 60rpx 30rpx 40rpx;
  margin: 0 -20rpx 20rpx;
}

.user-header-main {
  display: flex;
  align-items: center;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid #ffffff;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
}

.nickname {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
  display: block;
}

.phone {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 8rpx;
  display: block;
}

.setting-icon {
  font-size: 40rpx;
  color: #ffffff;
  padding: 10rpx;
}

/* 会员标签 */
.user-tags {
  display: flex;
  margin-top: 20rpx;
  gap: 16rpx;
}

.tag {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 24rpx;
  padding: 6rpx 20rpx;
}

.tag-text {
  font-size: 22rpx;
  color: #ffffff;
}

/* 区块头部 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #000000;
}

.section-link {
  font-size: 26rpx;
  color: #999999;
}

/* 订单统计 */
.order-stats {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
  padding: 8rpx 0;
  flex: 1;
}

.stat-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: rgba(255, 80, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12rpx;
  position: relative;
}

.stat-icon {
  font-size: 36rpx;
  display: block;
}

.badge {
  position: absolute;
  top: -6rpx;
  right: -6rpx;
  min-width: 28rpx;
  height: 28rpx;
  background: #ff5000;
  color: #ffffff;
  font-size: 20rpx;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666666;
  display: block;
}

/* 资产区 */
.assets-card {
  padding: 30rpx 24rpx;
}

.assets-list {
  display: flex;
  justify-content: space-around;
}

.assets-item {
  text-align: center;
  flex: 1;
}

.assets-icon {
  font-size: 40rpx;
  display: block;
  margin-bottom: 8rpx;
}

.assets-num {
  font-size: 32rpx;
  font-weight: bold;
  color: #000000;
  display: block;
}

.assets-label {
  font-size: 24rpx;
  color: #666666;
  display: block;
  margin-top: 4rpx;
}

/* 菜单项 */
.menu-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.menu-icon-wrap {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: linear-gradient(90deg, #ff9000 0%, #ff5000 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.menu-icon {
  font-size: 28rpx;
}

.menu-label {
  flex: 1;
  font-size: 30rpx;
  color: #333333;
}

.menu-value {
  font-size: 26rpx;
  color: #999999;
  margin-right: 16rpx;
}

.menu-status {
  margin-right: 16rpx;
}

.status-warning { color: #ff9800; }
.status-info { color: #2196f3; }
.status-success { color: #4caf50; }
.status-danger { color: #f44336; }

.menu-arrow {
  font-size: 32rpx;
  color: #cccccc;
}

/* 退出登录 */
.logout-card {
  padding: 0;
  overflow: hidden;
}

.logout-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx 0;
}

.logout-text {
  font-size: 30rpx;
  color: #ff5000;
  font-weight: 500;
}
</style>
