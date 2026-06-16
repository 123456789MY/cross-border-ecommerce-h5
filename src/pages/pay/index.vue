<template>
  <view class="pay-container">
    <!-- 订单信息 -->
    <view class="order-info">
      <view class="info-row">
        <text class="label">{{ $t('pay.orderNo') }}</text>
        <text class="value">{{ orderInfo.orderNo }}</text>
      </view>
      <view class="info-row">
        <text class="label">{{ $t('pay.orderAmount') }}</text>
        <text class="value amount">{{ formatPrice(orderInfo.amount) }}</text>
      </view>
    </view>

    <!-- 支付方式选择 -->
    <view class="payment-section">
      <view class="section-title">{{ $t('pay.selectMethod') }}</view>
      <view class="payment-list">
        <view
          class="payment-item"
          v-for="method in paymentMethods"
          :key="method.value"
          @click="selectMethod(method.value)"
        >
          <view class="payment-left">
            <text class="payment-icon">{{ method.icon }}</text>
            <view class="payment-info">
              <text class="payment-name">{{ method.label }}</text>
              <text v-if="method.desc" class="payment-desc">{{ method.desc }}</text>
            </view>
          </view>
          <view class="payment-radio" :class="{ active: selectedMethod === method.value }">
            <text v-if="selectedMethod === method.value">✓</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 倒计时提示 -->
    <view class="timeout-tip" v-if="countdown > 0">
      <text>{{ $t('pay.payWithin') }}</text>
      <text class="countdown">{{ formatCountdown(countdown) }}</text>
    </view>

    <!-- 底部支付按钮 -->
    <view class="bottom-bar">
      <button class="pay-btn" @click="handlePay" :loading="paying">
        {{ $t('pay.payNow') }} {{ formatPrice(orderInfo.amount) }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { getPaymentParams, queryPaymentStatus } from '@/api/pay'

// 订单信息
const orderInfo = ref({
  orderId: 0,
  orderNo: '',
  amount: 0,
})

// 支付方式
const paymentMethods = [
  { value: 'wechat', label: '微信支付', icon: '💚', desc: '推荐使用微信支付' },
  { value: 'alipay', label: '支付宝', icon: '📱', desc: '支付宝安全支付' },
  { value: 'momo', label: 'MoMo', icon: '🏦', desc: '越南本地支付' },
]
const selectedMethod = ref('wechat')
const paying = ref(false)

// 倒计时
const countdown = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

// 格式化价格
const formatPrice = (price: number) => {
  if (!price) return '₫0'
  return `₫${price.toLocaleString()}`
}

// 选择支付方式
const selectMethod = (method: string) => {
  selectedMethod.value = method
}

// 获取订单信息
const loadOrderInfo = async (orderId: number) => {
  try {
    const res = await getPaymentParams(orderId, selectedMethod.value)
    orderInfo.value = {
      orderId: orderId,
      orderNo: res.data.orderNo,
      amount: res.data.amount,
    }
    // 启动倒计时（15分钟）
    countdown.value = 15 * 60
    startCountdown()
  } catch (err) {
    console.error('加载订单失败', err)
    // Mock 数据
    orderInfo.value = {
      orderId: orderId,
      orderNo: `DD${Date.now()}`,
      amount: 89000,
    }
    countdown.value = 15 * 60
    startCountdown()
  }
}

// 启动倒计时
const startCountdown = () => {
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearInterval(timer!)
      uni.showToast({ title: '订单已超时，请重新下单', icon: 'none' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  }, 1000)
}

// 格式化倒计时
const formatCountdown = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 发起支付
const handlePay = async () => {
  paying.value = true
  try {
    const res = await getPaymentParams(orderInfo.value.orderId, selectedMethod.value)
    const { channel, params } = res.data

    // 根据不同支付渠道调起支付
    if (channel === 'wechat') {
      // #ifdef H5
      // 微信 H5 支付
      window.location.href = params.mwebUrl
      // #endif
      // 模拟支付成功（开发环境）
      uni.showToast({ title: '支付成功' })
      setTimeout(() => {
        uni.redirectTo({ url: `/pages/pay/result?orderId=${orderInfo.value.orderId}&status=success` })
      }, 1000)
    } else if (channel === 'alipay') {
      // 支付宝支付
      // 模拟支付成功
      uni.showToast({ title: '支付成功' })
      setTimeout(() => {
        uni.redirectTo({ url: `/pages/pay/result?orderId=${orderInfo.value.orderId}&status=success` })
      }, 1000)
    } else {
      // 模拟支付成功
      uni.showToast({ title: '支付成功' })
      setTimeout(() => {
        uni.redirectTo({ url: `/pages/pay/result?orderId=${orderInfo.value.orderId}&status=success` })
      }, 1000)
    }
  } catch (err) {
    console.error('支付失败', err)
    uni.redirectTo({ url: `/pages/pay/result?orderId=${orderInfo.value.orderId}&status=fail` })
  } finally {
    paying.value = false
  }
}

// 轮询支付状态
const pollPaymentStatus = async (orderId: number) => {
  let retries = 10
  const poll = setInterval(async () => {
    try {
      const res = await queryPaymentStatus(orderId)
      if (res.data.status === 'success') {
        clearInterval(poll)
        uni.redirectTo({ url: `/pages/pay/result?orderId=${orderId}&status=success` })
      }
    } catch (err) {
      // 继续轮询
    }
    retries--
    if (retries <= 0) {
      clearInterval(poll)
    }
  }, 2000)
}

onLoad((options: any) => {
  const orderId = Number(options.orderId)
  if (orderId) {
    loadOrderInfo(orderId)
  }
})

onUnload(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped lang="scss">
.pay-container {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

/* 订单信息 */
.order-info {
  background: #fff;
  margin: 20rpx 24rpx;
  padding: 30rpx;
  border-radius: 16rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;

  .label {
    font-size: 28rpx;
    color: #666;
  }

  .value {
    font-size: 28rpx;
    color: #333;
  }

  .amount {
    font-size: 40rpx;
    color: #ff6b6b;
    font-weight: bold;
  }
}

/* 支付方式 */
.payment-section {
  background: #fff;
  margin: 0 24rpx 20rpx;
  padding: 24rpx;
  border-radius: 16rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 24rpx;
}

.payment-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.payment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.payment-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.payment-icon {
  font-size: 44rpx;
}

.payment-info {
  display: flex;
  flex-direction: column;
}

.payment-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.payment-desc {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}

.payment-radio {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #fff;

  &.active {
    background: #ff6b6b;
    border-color: #ff6b6b;
  }
}

/* 倒计时 */
.timeout-tip {
  text-align: center;
  padding: 20rpx;
  color: #999;
  font-size: 24rpx;
}

.countdown {
  color: #ff6b6b;
  font-weight: bold;
  margin-left: 8rpx;
}

/* 底部按钮 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 24rpx;
  padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.pay-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  color: #fff;
  border: none;
  border-radius: 60rpx;
  height: 96rpx;
  line-height: 96rpx;
  font-size: 32rpx;
  font-weight: bold;
  width: 100%;
}
</style>
