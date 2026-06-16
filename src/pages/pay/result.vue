<template>
  <view class="result-container">
    <view class="result-card" :class="isSuccess ? 'success' : 'fail'">
      <view class="icon-wrapper">
        <text class="icon" v-if="isSuccess">✓</text>
        <text class="icon" v-else>✗</text>
      </view>
      <text class="title">{{ isSuccess ? $t('pay.success') : $t('pay.fail') }}</text>
      <text class="message">{{ resultMessage }}</text>
    </view>

    <view class="action-buttons">
      <button class="btn primary" @click="viewOrder">{{ $t('pay.viewOrder') }}</button>
      <button class="btn secondary" @click="backToHome">{{ $t('pay.backHome') }}</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const isSuccess = ref(true)
const resultMessage = ref('')

onLoad((options: any) => {
  isSuccess.value = options.status === 'success'
  resultMessage.value = isSuccess.value ? '订单支付成功，请等待商家发货' : '支付失败，请稍后重试'
})

const viewOrder = () => {
  uni.switchTab({ url: '/pages/order/list' })
}

const backToHome = () => {
  uni.switchTab({ url: '/pages/index/index' })
}
</script>

<style scoped lang="scss">
.result-container {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 48rpx;
}

.result-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  text-align: center;
  width: 100%;
  margin-bottom: 48rpx;

  &.success .icon {
    background: #4caf50;
  }

  &.fail .icon {
    background: #f44336;
  }
}

.icon-wrapper {
  margin-bottom: 30rpx;
}

.icon {
  display: inline-block;
  width: 100rpx;
  height: 100rpx;
  line-height: 100rpx;
  border-radius: 50%;
  color: #fff;
  font-size: 56rpx;
  text-align: center;
}

.title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.message {
  font-size: 28rpx;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 24rpx;
  width: 100%;
}

.btn {
  flex: 1;
  border-radius: 60rpx;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 30rpx;

  &.primary {
    background: #ff6b6b;
    color: #fff;
    border: none;
  }

  &.secondary {
    background: #fff;
    color: #666;
    border: 1rpx solid #ddd;
  }
}
</style>
