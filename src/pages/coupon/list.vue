<template>
  <div class="coupon-page">
    <!-- 顶部头部 -->
    <div class="header">
      <div class="header-content">
        <div class="back-btn" @click="goBack">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 class="title">领券中心</h1>
        <div class="placeholder"></div>
      </div>
    </div>

    <!-- 分类标签 -->
    <div class="category-tabs">
      <div class="tabs-wrapper">
        <div
          v-for="tab in tabs"
          :key="tab.value"
          class="tab-item"
          :class="{ active: activeTab === tab.value }"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </div>
      </div>
    </div>

    <!-- 优惠券列表 -->
    <div class="coupon-list">
      <div
        v-for="coupon in filteredCoupons"
        :key="coupon.id"
        class="coupon-card"
      >
        <div class="coupon-left">
          <div class="amount">
            <span class="symbol">¥</span>
            <span class="number">{{ coupon.amount }}</span>
          </div>
          <div class="condition">{{ coupon.condition }}</div>
        </div>
        <div class="coupon-divider">
          <div class="circle top"></div>
          <div class="dashed-line"></div>
          <div class="circle bottom"></div>
        </div>
        <div class="coupon-right">
          <div class="coupon-info">
            <div class="coupon-name">{{ coupon.name }}</div>
            <div class="validity">有效期：{{ coupon.validity }}</div>
            <div class="scope">{{ coupon.scope }}</div>
          </div>
          <button
            class="action-btn"
            :class="{ received: coupon.received }"
            @click="receiveCoupon(coupon)"
          >
            {{ coupon.received ? '已领取' : '立即领取' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 底部提示 -->
    <div class="bottom-tip">没有更多优惠券了</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Coupon {
  id: number
  amount: number
  condition: string
  name: string
  validity: string
  scope: string
  received: boolean
  category: string
}

const tabs = [
  { label: '全部', value: 'all' },
  { label: '食品', value: 'food' },
  { label: '美妆', value: 'beauty' },
  { label: '家居', value: 'home' },
]

const activeTab = ref('all')

const coupons = ref<Coupon[]>([
  {
    id: 1,
    amount: 20,
    condition: '满100减20',
    name: '全场通用优惠券',
    validity: '2026.06.16 - 2026.07.16',
    scope: '全品类可用',
    received: false,
    category: 'all',
  },
  {
    id: 2,
    amount: 50,
    condition: '满200减50',
    name: '食品生鲜专享券',
    validity: '2026.06.16 - 2026.06.30',
    scope: '食品、生鲜类目',
    received: false,
    category: 'food',
  },
  {
    id: 3,
    amount: 30,
    condition: '满150减30',
    name: '美妆护肤优惠券',
    validity: '2026.06.16 - 2026.07.01',
    scope: '美妆、护肤类目',
    received: true,
    category: 'beauty',
  },
  {
    id: 4,
    amount: 100,
    condition: '满500减100',
    name: '家居生活大额券',
    validity: '2026.06.16 - 2026.07.31',
    scope: '家居、生活类目',
    received: false,
    category: 'home',
  },
  {
    id: 5,
    amount: 15,
    condition: '满80减15',
    name: '零食饮料优惠券',
    validity: '2026.06.16 - 2026.06.25',
    scope: '零食、饮料类目',
    received: false,
    category: 'food',
  },
  {
    id: 6,
    amount: 80,
    condition: '满400减80',
    name: '美妆大牌专享券',
    validity: '2026.06.16 - 2026.07.10',
    scope: '指定美妆品牌',
    received: true,
    category: 'beauty',
  },
])

const filteredCoupons = computed(() => {
  if (activeTab.value === 'all') {
    return coupons.value
  }
  return coupons.value.filter(c => c.category === activeTab.value)
})

const receiveCoupon = (coupon: Coupon) => {
  if (coupon.received) return
  coupon.received = true
  // 这里可以添加领取成功的提示
}

const goBack = () => {
  // 返回上一页
  history.back()
}
</script>

<style scoped>
.coupon-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

/* 顶部头部 */
.header {
  background: linear-gradient(135deg, #ff5000 0%, #ff7a00 100%);
  padding: 40rpx 30rpx 80rpx;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  font-size: 36rpx;
  font-weight: 600;
  color: #ffffff;
}

.placeholder {
  width: 60rpx;
}

/* 分类标签 */
.category-tabs {
  background-color: #ffffff;
  padding: 20rpx 0;
  margin-top: -40rpx;
  margin-left: 30rpx;
  margin-right: 30rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.tabs-wrapper {
  display: flex;
  padding: 0 20rpx;
  overflow-x: auto;
  scrollbar-width: none;
}

.tabs-wrapper::-webkit-scrollbar {
  display: none;
}

.tab-item {
  flex-shrink: 0;
  padding: 16rpx 40rpx;
  font-size: 28rpx;
  color: #666666;
  border-radius: 32rpx;
  margin-right: 16rpx;
  transition: all 0.3s;
}

.tab-item.active {
  background-color: #ff5000;
  color: #ffffff;
  font-weight: 600;
}

/* 优惠券列表 */
.coupon-list {
  padding: 30rpx;
}

.coupon-card {
  display: flex;
  background-color: #ffffff;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.coupon-left {
  width: 220rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fff5f0 0%, #ffffff 100%);
  padding: 30rpx 0;
}

.amount {
  display: flex;
  align-items: flex-start;
  color: #ff5000;
}

.symbol {
  font-size: 32rpx;
  font-weight: 600;
  margin-top: 8rpx;
}

.number {
  font-size: 72rpx;
  font-weight: 700;
  line-height: 1;
}

.condition {
  font-size: 24rpx;
  color: #ff5000;
  margin-top: 12rpx;
  font-weight: 500;
}

/* 分割线 */
.coupon-divider {
  width: 2rpx;
  position: relative;
  background-color: #f0f0f0;
}

.coupon-divider .circle {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 24rpx;
  height: 24rpx;
  background-color: #f5f5f5;
  border-radius: 50%;
}

.coupon-divider .circle.top {
  top: -12rpx;
}

.coupon-divider .circle.bottom {
  bottom: -12rpx;
}

.coupon-divider .dashed-line {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 2rpx;
  height: 80%;
  border-left: 2rpx dashed #e0e0e0;
}

/* 右侧内容 */
.coupon-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
}

.coupon-info {
  flex: 1;
}

.coupon-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 12rpx;
}

.validity {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 8rpx;
}

.scope {
  font-size: 24rpx;
  color: #ff5000;
  background-color: #fff5f0;
  display: inline-block;
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
}

.action-btn {
  width: 160rpx;
  height: 64rpx;
  border-radius: 32rpx;
  border: none;
  font-size: 26rpx;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #ff5000 0%, #ff7a00 100%);
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
  margin-left: 20rpx;
}

.action-btn:active {
  opacity: 0.8;
}

.action-btn.received {
  background: #cccccc;
  cursor: not-allowed;
}

/* 底部提示 */
.bottom-tip {
  text-align: center;
  font-size: 24rpx;
  color: #999999;
  padding: 40rpx 0;
}
</style>
