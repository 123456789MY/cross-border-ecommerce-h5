<template>
  <view class="detail-container" v-if="detail">
    <!-- 轮播图 -->
    <swiper class="swiper" circular indicator-dots>
      <swiper-item v-for="(img, idx) in detail.images" :key="idx">
        <image :src="img" class="swiper-image" mode="aspectFill" />
      </swiper-item>
    </swiper>

    <!-- 价格区 -->
    <view class="price-section">
      <text class="price">{{ formatPrice(detail.price) }}</text>
    </view>

    <!-- 标题 -->
    <view class="title-section">
      <text class="title">{{ detail.title }}</text>
    </view>

    <!-- 用户信息 -->
    <view class="user-section">
      <image src="/static/default-avatar.png" class="user-avatar" />
      <text class="user-name">{{ detail.user?.nickname || $t('secondhand.anonymous') }}</text>
      <text class="user-city">{{ detail.city || '' }}</text>
    </view>

    <!-- 商品描述 -->
    <view class="desc-section">
      <text class="desc-title">{{ $t('secondhand.desc') }}</text>
      <text class="desc-content">{{ detail.description }}</text>
    </view>

    <!-- 议价记录 -->
    <view class="bargain-section" v-if="bargainList.length > 0">
      <view class="section-header">
        <text class="section-title">{{ $t('secondhand.bargainHistory') }}</text>
      </view>
      <view class="bargain-item" v-for="item in bargainList" :key="item.id">
        <text class="bargain-user">{{ item.userName }}</text>
        <text class="bargain-price">{{ formatPrice(item.offeredPrice) }}</text>
        <text class="bargain-time">{{ item.createdAt }}</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="action-item" @click="contactSeller">
        <text class="action-icon">💬</text>
        <text class="action-text">{{ $t('common.chat') }}</text>
      </view>
      <view class="action-item" @click="report">
        <text class="action-icon">⚠️</text>
        <text class="action-text">{{ $t('secondhand.report') }}</text>
      </view>
      <button class="bargain-btn" @click="openBargainPopup">{{ $t('secondhand.bargain') }}</button>
    </view>

    <!-- 议价弹窗 -->
    <view class="bargain-mask" v-if="showBargain" @click="closeBargainPopup">
      <view class="bargain-popup" @click.stop>
        <view class="popup-header">
          <text class="popup-title">{{ $t('secondhand.bargain') }}</text>
          <text class="close" @click="closeBargainPopup">✕</text>
        </view>
        <view class="popup-content">
          <text class="current-price">{{ $t('secondhand.currentPrice') }}：{{ formatPrice(detail.price) }}</text>
          <input v-model="offerPrice" type="number" :placeholder="$t('secondhand.enterPrice')" class="price-input" />
          <textarea v-model="bargainMsg" :placeholder="$t('secondhand.leaveMessage')" class="msg-input" />
        </view>
        <view class="popup-footer">
          <button class="submit-btn" @click="submitBargain">{{ $t('common.submit') }}</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getSecondhandDetail, getBargainList, createBargain } from '@/api/secondhand'

const detail = ref<any>(null)
const bargainList = ref<any[]>([])
const showBargain = ref(false)
const offerPrice = ref('')
const bargainMsg = ref('')

// 格式化价格
const formatPrice = (price: number) => {
  if (!price) return '₫0'
  return `₫${price.toLocaleString()}`
}

// 加载详情
const loadDetail = async (id: number) => {
  try {
    const res = await getSecondhandDetail(id)
    detail.value = res.data
  } catch (err) {
    console.error('加载失败', err)
    detail.value = {
      id,
      title: '二手 iPhone 12',
      price: 5000000,
      images: ['https://picsum.photos/750/400?random=1'],
      description: '九成新，使用一年，功能完好。原装充电器、数据线齐全。',
      user: { nickname: '卖家A' },
      city: '河内',
      userId: 1,
    }
  }
}

// 加载议价记录
const loadBargainList = async (id: number) => {
  try {
    const res = await getBargainList(id)
    bargainList.value = res.data || []
  } catch (err) {
    bargainList.value = []
  }
}

// 显示议价弹窗
const openBargainPopup = () => {
  showBargain.value = true
}

const closeBargainPopup = () => {
  showBargain.value = false
}

// 提交议价
const submitBargain = async () => {
  if (!offerPrice.value) {
    uni.showToast({ title: '请输入出价', icon: 'none' })
    return
  }
  try {
    await createBargain({
      secondhandId: detail.value.id,
      offeredPrice: offerPrice.value,
      message: bargainMsg.value,
    })
    uni.showToast({ title: '议价已提交', icon: 'success' })
    closeBargainPopup()
    loadBargainList(detail.value.id)
  } catch (err: any) {
    uni.showToast({ title: err.message || '提交失败', icon: 'none' })
  }
}

// 联系卖家
const contactSeller = () => {
  uni.navigateTo({ url: `/pages/chat/room?sellerId=${detail.value.userId}` })
}

// 举报
const report = () => {
  uni.showActionSheet({
    itemList: ['虚假信息', '欺诈', '违规商品'],
    success: (res) => {
      uni.showToast({ title: '举报已提交', icon: 'success' })
    },
  })
}

onLoad((options: any) => {
  const id = Number(options.id)
  if (id) {
    loadDetail(id)
    loadBargainList(id)
  }
})
</script>

<style scoped lang="scss">
.detail-container {
  background: #fff;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

.swiper {
  width: 100%;
  height: 750rpx;
}

.swiper-image {
  width: 100%;
  height: 100%;
}

.price-section {
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.price {
  font-size: 48rpx;
  color: #ff6b6b;
  font-weight: bold;
}

.title-section {
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
}

.user-section {
  display: flex;
  align-items: center;
  padding: 30rpx;
  gap: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
}

.user-name {
  font-size: 30rpx;
  font-weight: bold;
  flex: 1;
}

.user-city {
  font-size: 24rpx;
  color: #999;
}

.desc-section {
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.desc-title {
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

.desc-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

/* 议价记录 */
.bargain-section {
  padding: 30rpx;
}

.section-header {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
}

.bargain-item {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  font-size: 26rpx;
}

.bargain-user {
  flex: 1;
}

.bargain-price {
  color: #ff6b6b;
  font-weight: bold;
  margin: 0 20rpx;
}

.bargain-time {
  color: #999;
}

/* 底部栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  gap: 20rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.action-icon {
  font-size: 40rpx;
}

.action-text {
  font-size: 22rpx;
  color: #666;
}

.bargain-btn {
  flex: 1;
  background: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 60rpx;
  height: 80rpx;
  font-size: 32rpx;
}

/* 议价弹窗 */
.bargain-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  align-items: flex-end;
}

.bargain-popup {
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 30rpx;
  width: 100%;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
}

.close {
  font-size: 36rpx;
  color: #999;
}

.current-price {
  font-size: 28rpx;
  color: #666;
  display: block;
}

.price-input, .msg-input {
  width: 100%;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-top: 20rpx;
  box-sizing: border-box;
  font-size: 28rpx;
}

.msg-input {
  height: 160rpx;
}

.popup-footer {
  margin-top: 30rpx;
}

.submit-btn {
  background: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 60rpx;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 32rpx;
  width: 100%;
}
</style>
