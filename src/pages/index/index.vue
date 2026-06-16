<template>
  <view class="home-container">
    <!-- 顶部固定栏（橙色渐变背景） -->
    <view class="fixed-header">
      <view class="top-bar">
        <!-- 左侧：定位 -->
        <view class="location" @click="chooseCity">
          <text class="location-icon">📍</text>
          <text class="location-name">{{ currentCity || '河内' }}</text>
        </view>
        <!-- 中间：搜索框 -->
        <view class="search-box" @click="goToSearch(-1, '搜索宝贝')">
          <text class="search-icon">🔍</text>
          <text class="search-placeholder">搜索宝贝</text>
          <text class="search-camera" @click.stop="handleCameraSearch(-1)">📷</text>
        </view>
        <!-- 右侧：消息 -->
        <view class="message-btn">
          <text class="message-icon">🔔</text>
        </view>
      </view>
    </view>

    <!-- 滚动内容区 -->
    <scroll-view scroll-y class="content-scroll">
      <!-- 金刚区（两行，每行5个） -->
      <view class="kingkong-section">
        <view class="kingkong-row">
          <view class="kingkong-item" v-for="(item, index) in kingkongRow1" :key="index" @click="handleKingKong(item)">
            <view class="kingkong-icon-wrap" :style="{ background: item.gradient }">
              <text class="kingkong-icon">{{ item.icon }}</text>
            </view>
            <text class="kingkong-name">{{ item.name }}</text>
          </view>
        </view>
        <view class="kingkong-row">
          <view class="kingkong-item" v-for="(item, index) in kingkongRow2" :key="index" @click="handleKingKong(item)">
            <view class="kingkong-icon-wrap" :style="{ background: item.gradient }">
              <text class="kingkong-icon">{{ item.icon }}</text>
            </view>
            <text class="kingkong-name">{{ item.name }}</text>
          </view>
        </view>
      </view>

      <!-- 轮播图 -->
      <swiper class="banner-swiper" circular autoplay interval="3000" indicator-dots indicator-color="rgba(255,255,255,0.5)" indicator-active-color="#ffffff">
        <swiper-item v-for="(banner, index) in banners" :key="index">
          <image :src="banner.image" class="banner-image" mode="aspectFill" />
        </swiper-item>
      </swiper>

      <!-- 限时秒杀区 -->
      <view class="flash-sale-card">
        <view class="flash-header">
          <view class="flash-title-wrap">
            <text class="flash-title">限时秒杀</text>
            <text class="flash-fire">🔥</text>
          </view>
          <view class="flash-countdown">
            <text class="countdown-num">{{ countdown.h }}</text>
            <text class="countdown-colon">:</text>
            <text class="countdown-num">{{ countdown.m }}</text>
            <text class="countdown-colon">:</text>
            <text class="countdown-num">{{ countdown.s }}</text>
          </view>
          <text class="flash-more">更多 ›</text>
        </view>
        <scroll-view scroll-x class="flash-scroll" :show-scrollbar="false">
          <view class="flash-item" v-for="item in flashProducts" :key="item.id" @click="gotoDetail(item.id, item.source)">
            <image :src="item.mainImage" class="flash-img" mode="aspectFill" />
            <text class="flash-price">{{ formatPrice(item.price) }}</text>
            <text class="flash-original">{{ formatPrice(item.originalPrice) }}</text>
          </view>
        </scroll-view>
      </view>

      <!-- 活动入口（横向滚动） -->
      <scroll-view scroll-x class="activity-scroll" :show-scrollbar="false">
        <view class="activity-card" v-for="(act, index) in activities" :key="index" :style="{ background: act.gradient }">
          <text class="activity-title">{{ act.title }}</text>
          <text class="activity-desc">{{ act.desc }}</text>
        </view>
      </scroll-view>

      <!-- 瀑布流推荐 -->
      <view class="waterfall-section">
        <view class="waterfall-header">
          <text class="waterfall-title">猜你喜欢</text>
          <text class="waterfall-heart">❤️</text>
        </view>
        <view class="waterfall-wrap">
          <view class="waterfall-col">
            <view class="waterfall-card" v-for="item in waterfallLeft" :key="item.id" @click="gotoDetail(item.id, item.source)">
              <image :src="item.mainImage" class="waterfall-img" mode="widthFix" />
              <view class="waterfall-info">
                <text class="waterfall-name">{{ item.name }}</text>
                <view class="waterfall-tags">
                  <text class="waterfall-tag" v-for="(tag, tidx) in item.tags" :key="tidx">{{ tag }}</text>
                </view>
                <view class="waterfall-bottom">
                  <text class="waterfall-price">{{ formatPrice(item.price) }}</text>
                  <text class="waterfall-sales">{{ item.sales }}人付款</text>
                </view>
              </view>
            </view>
          </view>
          <view class="waterfall-col">
            <view class="waterfall-card" v-for="item in waterfallRight" :key="item.id" @click="gotoDetail(item.id, item.source)">
              <image :src="item.mainImage" class="waterfall-img" mode="widthFix" />
              <view class="waterfall-info">
                <text class="waterfall-name">{{ item.name }}</text>
                <view class="waterfall-tags">
                  <text class="waterfall-tag" v-for="(tag, tidx) in item.tags" :key="tidx">{{ tag }}</text>
                </view>
                <view class="waterfall-bottom">
                  <text class="waterfall-price">{{ formatPrice(item.price) }}</text>
                  <text class="waterfall-sales">{{ item.sales }}人付款</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const currentCity = ref('河内')

// 金刚区数据
const kingkongRow1 = ref([
  { name: '比价直营', icon: '🏬', gradient: 'linear-gradient(135deg, #ff9000 0%, #ff5000 100%)', action: 'direct' },
  { name: '比价中国', icon: '🇨🇳', gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ff5000 100%)', action: 'china' },
  { name: '越南直销', icon: '🇻🇳', gradient: 'linear-gradient(135deg, #11998e 0%, #ff9000 100%)', action: 'vietnam' },
  { name: '二手交易', icon: '🔄', gradient: 'linear-gradient(135deg, #f093fb 0%, #ff5000 100%)', action: 'secondhand' },
  { name: '领券中心', icon: '🎫', gradient: 'linear-gradient(135deg, #ff9000 0%, #ff6b6b 100%)', action: 'coupon' },
])
const kingkongRow2 = ref([
  { name: '充值中心', icon: '📱', gradient: 'linear-gradient(135deg, #667eea 0%, #ff5000 100%)', action: 'recharge' },
  { name: '火车票', icon: '🚄', gradient: 'linear-gradient(135deg, #ff9000 0%, #764ba2 100%)', action: 'train' },
  { name: '酒店', icon: '🏨', gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ff9000 100%)', action: 'hotel' },
  { name: '更多', icon: '➕', gradient: 'linear-gradient(135deg, #999 0%, #666 100%)', action: 'more' },
  { name: '直播', icon: '📺', gradient: 'linear-gradient(135deg, #ff5000 0%, #ff9000 100%)', action: 'live' },
])

// 轮播图数据
const banners = ref([
  { image: 'https://picsum.photos/750/300?random=banner1' },
  { image: 'https://picsum.photos/750/300?random=banner2' },
  { image: 'https://picsum.photos/750/300?random=banner3' },
])

// 限时秒杀商品
const flashProducts = ref<any[]>([])

// 倒计时
const countdown = ref({ h: '02', m: '15', s: '36' })
let countdownTimer: ReturnType<typeof setInterval> | null = null

// 活动入口
const activities = ref([
  { title: '新人专享', desc: '首单立减50%', gradient: 'linear-gradient(135deg, #ff9000 0%, #ff5000 100%)' },
  { title: '品牌特卖', desc: '大牌低至1折', gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ff5000 100%)' },
  { title: '拼团好物', desc: '2人成团更省', gradient: 'linear-gradient(135deg, #667eea 0%, #ff9000 100%)' },
  { title: '每日签到', desc: '领积分兑好礼', gradient: 'linear-gradient(135deg, #11998e 0%, #ff5000 100%)' },
])

// 瀑布流商品
const waterfallLeft = ref<any[]>([])
const waterfallRight = ref<any[]>([])

// 问候语
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const userName = computed(() => userStore.userInfo?.nickname || '')

// 格式化价格
const formatPrice = (price: number) => {
  if (!price) return '₫0'
  return `₫${price.toLocaleString()}`
}

// 跳转搜索页（带来源参数）
const goToSearch = (source: number, title: string) => {
  uni.navigateTo({ url: `/pages/search/index?source=${source}&title=${encodeURIComponent(title)}` })
}

// 扫一扫（带来源）
const handleScan = (source: number) => {
  uni.scanCode({
    onlyFromCamera: true,
    scanType: ['barCode', 'qrCode'],
    success: (res: any) => {
      uni.navigateTo({ url: `/pages/search/result?keyword=${encodeURIComponent(res.result)}&source=${source}` })
    },
    fail: () => {
      uni.showToast({ title: '扫码失败', icon: 'none' })
    },
  })
}

// 拍照识图（带来源）
const handleCameraSearch = (source: number) => {
  uni.chooseImage({
    count: 1,
    sourceType: ['camera'],
    success: (res: any) => {
      uni.showLoading({ title: '识别中...' })
      setTimeout(() => {
        uni.hideLoading()
        uni.navigateTo({ url: `/pages/search/result?keyword=越南咖啡&source=${source}` })
      }, 1500)
    },
    fail: () => {
      uni.showToast({ title: '拍照失败', icon: 'none' })
    },
  })
}

// 金刚区点击
const handleKingKong = (item: any) => {
  switch (item.action) {
    case 'direct':
      goToDirectSale()
      break
    case 'china':
      goToChinaCompare()
      break
    case 'vietnam':
      goToVietnamDirect()
      break
    case 'secondhand':
      goToSecondhand()
      break
    case 'coupon':
      uni.navigateTo({ url: '/pages/coupon/list' })
      break
    case 'recharge':
      uni.navigateTo({ url: '/pages/recharge/index' })
      break
    case 'train':
      uni.navigateTo({ url: '/pages/train/index' })
      break
    case 'hotel':
      uni.navigateTo({ url: '/pages/hotel/index' })
      break
    case 'live':
      uni.navigateTo({ url: '/pages/live/list' })
      break
    default:
      uni.showToast({ title: `${item.name} 即将上线`, icon: 'none' })
  }
}

// 跳转商品列表
const goToDirectSale = () => {
  uni.navigateTo({ url: '/pages/products/list?source=0&title=比价直营' })
}

const goToChinaCompare = () => {
  uni.navigateTo({ url: '/pages/products/list?source=1&title=比价中国' })
}

const goToVietnamDirect = () => {
  uni.navigateTo({ url: '/pages/products/list?source=2&title=越南直销' })
}

const goToSecondhand = () => {
  uni.navigateTo({ url: '/pages/secondhand/list' })
}

// 跳转商品详情（带来源）
const gotoDetail = (id: number, source: number) => {
  uni.navigateTo({ url: `/pages/products/detail?id=${id}&source=${source}` })
}

// 选择城市
const chooseCity = () => {
  // TODO: 城市选择
}

// 启动倒计时
const startCountdown = () => {
  let totalSeconds = 2 * 3600 + 15 * 60 + 36
  countdownTimer = setInterval(() => {
    if (totalSeconds <= 0) {
      totalSeconds = 2 * 3600 + 15 * 60 + 36
    }
    totalSeconds--
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    countdown.value = {
      h: h.toString().padStart(2, '0'),
      m: m.toString().padStart(2, '0'),
      s: s.toString().padStart(2, '0'),
    }
  }, 1000)
}

// 加载数据
const loadProducts = async () => {
  // Mock 数据 - 限时秒杀
  flashProducts.value = [
    { id: 1, name: '越南进口咖啡', mainImage: 'https://picsum.photos/200/200?random=1', price: 59000, originalPrice: 89000, source: 0 },
    { id: 2, name: '越南腰果', mainImage: 'https://picsum.photos/200/200?random=2', price: 45000, originalPrice: 65000, source: 0 },
    { id: 3, name: '越南拖鞋', mainImage: 'https://picsum.photos/200/200?random=3', price: 89000, originalPrice: 120000, source: 0 },
    { id: 4, name: '越南沉香', mainImage: 'https://picsum.photos/200/200?random=4', price: 280000, originalPrice: 350000, source: 2 },
    { id: 5, name: '热带水果干', mainImage: 'https://picsum.photos/200/200?random=5', price: 39000, originalPrice: 55000, source: 2 },
  ]

  // Mock 数据 - 瀑布流左列
  waterfallLeft.value = [
    { id: 301, name: '精选咖啡豆 越南原装进口 浓郁香醇 500g装', mainImage: 'https://picsum.photos/300/400?random=301', price: 120000, source: 0, sales: 2341, tags: ['包邮', '热销'] },
    { id: 303, name: '越南沉香手串 天然老料', mainImage: 'https://picsum.photos/300/350?random=303', price: 350000, source: 2, sales: 892, tags: ['正品'] },
    { id: 305, name: '热带水果干混合装 芒果干菠萝干', mainImage: 'https://picsum.photos/300/380?random=305', price: 55000, source: 2, sales: 5678, tags: ['买二送一'] },
    { id: 307, name: '越南乳胶枕 天然乳胶 护颈枕', mainImage: 'https://picsum.photos/300/360?random=307', price: 299000, source: 0, sales: 1234, tags: ['进口'] },
  ]

  // Mock 数据 - 瀑布流右列
  waterfallRight.value = [
    { id: 302, name: '进口零食礼包 越南特产组合', mainImage: 'https://picsum.photos/300/360?random=302', price: 199000, source: 1, sales: 4567, tags: ['大礼包'] },
    { id: 304, name: '手工编织包 越南传统工艺', mainImage: 'https://picsum.photos/300/420?random=304', price: 85000, source: 0, sales: 3210, tags: ['手工'] },
    { id: 306, name: '越南鱼露 传统酿造 调味佳品', mainImage: 'https://picsum.photos/300/340?random=306', price: 45000, source: 2, sales: 8901, tags: ['调味'] },
    { id: 308, name: '越南奥黛 传统服饰 优雅大方', mainImage: 'https://picsum.photos/300/400?random=308', price: 450000, source: 2, sales: 567, tags: ['传统'] },
  ]
}

onMounted(() => {
  loadProducts()
  startCountdown()
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style scoped lang="scss">
.home-container {
  background: #f5f5f5;
  min-height: 100vh;
}

/* 顶部固定栏（橙色渐变背景） */
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(90deg, #ff9000 0%, #ff5000 100%);
  padding: calc(var(--status-bar-height, 44px) + 12rpx) 24rpx 24rpx;
  z-index: 100;
}

.top-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.location {
  display: flex;
  align-items: center;
  gap: 4rpx;
  flex-shrink: 0;
}

.location-icon {
  font-size: 24rpx;
}

.location-name {
  font-size: 26rpx;
  color: #fff;
  font-weight: 500;
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 60rpx;
  padding: 14rpx 24rpx;
  gap: 12rpx;
}

.search-icon {
  font-size: 28rpx;
  color: #999;
}

.search-placeholder {
  flex: 1;
  font-size: 28rpx;
  color: #999;
}

.search-camera {
  font-size: 28rpx;
  color: #666;
}

.message-btn {
  flex-shrink: 0;
  padding: 8rpx;
}

.message-icon {
  font-size: 40rpx;
}

/* 内容区 */
.content-scroll {
  margin-top: calc(var(--status-bar-height, 44px) + 100rpx);
  padding: 20rpx 24rpx 120rpx;
}

/* 金刚区 */
.kingkong-section {
  background: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
  padding: 24rpx 16rpx;
  margin-bottom: 20rpx;
}

.kingkong-row {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20rpx;
}

.kingkong-row:last-child {
  margin-bottom: 0;
}

.kingkong-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  width: 20%;
}

.kingkong-icon-wrap {
  width: 88rpx;
  height: 88rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kingkong-icon {
  font-size: 40rpx;
}

.kingkong-name {
  font-size: 24rpx;
  color: #333;
}

/* 轮播图 */
.banner-swiper {
  height: 280rpx;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
}

.banner-image {
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
}

/* 限时秒杀区 */
.flash-sale-card {
  background: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.flash-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.flash-title-wrap {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.flash-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #000;
}

.flash-fire {
  font-size: 32rpx;
}

.flash-countdown {
  display: flex;
  align-items: center;
  margin-left: 20rpx;
  gap: 4rpx;
}

.countdown-num {
  background: #000;
  color: #fff;
  font-size: 22rpx;
  font-weight: bold;
  padding: 4rpx 8rpx;
  border-radius: 6rpx;
}

.countdown-colon {
  font-size: 22rpx;
  color: #000;
  font-weight: bold;
}

.flash-more {
  margin-left: auto;
  font-size: 24rpx;
  color: #999;
}

.flash-scroll {
  white-space: nowrap;
}

.flash-item {
  display: inline-block;
  width: 180rpx;
  margin-right: 20rpx;
  text-align: center;
}

.flash-img {
  width: 180rpx;
  height: 180rpx;
  border-radius: 12rpx;
}

.flash-price {
  display: block;
  font-size: 28rpx;
  color: #ff5000;
  font-weight: bold;
  margin-top: 8rpx;
}

.flash-original {
  display: block;
  font-size: 22rpx;
  color: #999;
  text-decoration: line-through;
  margin-top: 4rpx;
}

/* 活动入口 */
.activity-scroll {
  white-space: nowrap;
  margin-bottom: 20rpx;
}

.activity-card {
  display: inline-block;
  width: 280rpx;
  height: 140rpx;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-right: 16rpx;
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
}

.activity-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #fff;
}

.activity-desc {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 8rpx;
}

/* 瀑布流推荐 */
.waterfall-section {
  background: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
  padding: 24rpx;
}

.waterfall-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  margin-bottom: 20rpx;
}

.waterfall-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #000;
}

.waterfall-heart {
  font-size: 32rpx;
}

.waterfall-wrap {
  display: flex;
  gap: 16rpx;
}

.waterfall-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.waterfall-card {
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.waterfall-img {
  width: 100%;
  border-radius: 16rpx 16rpx 0 0;
}

.waterfall-info {
  padding: 16rpx;
}

.waterfall-name {
  display: block;
  font-size: 26rpx;
  color: #000;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 10rpx;
}

.waterfall-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 10rpx;
}

.waterfall-tag {
  background: #fff0e6;
  color: #ff5000;
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
}

.waterfall-bottom {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.waterfall-price {
  font-size: 32rpx;
  color: #ff5000;
  font-weight: bold;
}

.waterfall-sales {
  font-size: 20rpx;
  color: #999;
}
</style>
