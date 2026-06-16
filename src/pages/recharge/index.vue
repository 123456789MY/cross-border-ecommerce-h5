<template>
  <div class="recharge-page">
    <!-- 顶部头部 -->
    <div class="header">
      <div class="header-content">
        <div class="back-btn" @click="goBack">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 class="title">充值中心</h1>
        <div class="placeholder"></div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 充值类型切换 -->
      <div class="type-switch">
        <div
          class="type-btn"
          :class="{ active: rechargeType === 'phone' }"
          @click="rechargeType = 'phone'"
        >
          话费充值
        </div>
        <div
          class="type-btn"
          :class="{ active: rechargeType === 'data' }"
          @click="rechargeType = 'data'"
        >
          流量充值
        </div>
      </div>

      <!-- 手机号输入 -->
      <div class="phone-section">
        <div class="section-title">充值号码</div>
        <div class="phone-input-wrapper">
          <input
            v-model="phoneNumber"
            type="tel"
            maxlength="11"
            placeholder="请输入手机号码"
            class="phone-input"
          />
          <div v-if="phoneNumber.length === 11" class="carrier-tag">中国移动</div>
        </div>
      </div>

      <!-- 充值档位选择 -->
      <div class="amount-section">
        <div class="section-title">{{ rechargeType === 'phone' ? '充值金额' : '流量档位' }}</div>
        <div class="amount-grid">
          <div
            v-for="item in amountOptions"
            :key="item.value"
            class="amount-item"
            :class="{ active: selectedAmount === item.value }"
            @click="selectedAmount = item.value"
          >
            <div class="amount-value">{{ item.label }}</div>
            <div class="amount-price">{{ item.price }}</div>
          </div>
        </div>
      </div>

      <!-- 支付方式 -->
      <div class="payment-section">
        <div class="section-title">支付方式</div>
        <div class="payment-list">
          <div
            v-for="payment in paymentMethods"
            :key="payment.value"
            class="payment-item"
            :class="{ active: selectedPayment === payment.value }"
            @click="selectedPayment = payment.value"
          >
            <div class="payment-left">
              <div class="payment-icon" :class="payment.value">
                <svg v-if="payment.value === 'wechat'" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9.5 4C5.36 4 2 6.69 2 10c0 1.89 1.08 3.56 2.78 4.66L4 17l2.5-1.25c.73.2 1.5.31 2.31.31.17 0 .33 0 .5-.02-.09-.32-.16-.65-.16-1 0-3.31 3.13-6 7-6 .35 0 .69.03 1.02.08C16.43 6.11 13.32 4 9.5 4z" fill="#07C160"/>
                </svg>
                <svg v-else-if="payment.value === 'alipay'" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 5h14v14H5z" fill="#1677FF"/>
                  <text x="8" y="16" fill="white" font-size="10" font-weight="bold">支</text>
                </svg>
                <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#FF6B00"/>
                  <text x="7" y="16" fill="white" font-size="10" font-weight="bold">M</text>
                </svg>
              </div>
              <span class="payment-name">{{ payment.label }}</span>
            </div>
            <div class="check-icon" v-if="selectedPayment === payment.value">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#ff5000"/>
                <path d="M8 12l3 3 5-6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="bottom-bar">
      <div class="price-info">
        <span class="price-label">实付金额：</span>
        <span class="price-symbol">¥</span>
        <span class="price-value">{{ actualPrice }}</span>
      </div>
      <button class="recharge-btn" @click="handleRecharge">
        立即充值
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface AmountOption {
  value: number
  label: string
  price: string
}

interface PaymentMethod {
  label: string
  value: string
}

const rechargeType = ref<'phone' | 'data'>('phone')
const phoneNumber = ref('')
const selectedAmount = ref(50)
const selectedPayment = ref('alipay')

const phoneAmounts: AmountOption[] = [
  { value: 30, label: '30元', price: '售价 ¥29.9' },
  { value: 50, label: '50元', price: '售价 ¥49.5' },
  { value: 100, label: '100元', price: '售价 ¥98.8' },
  { value: 200, label: '200元', price: '售价 ¥196' },
  { value: 300, label: '300元', price: '售价 ¥294' },
  { value: 500, label: '500元', price: '售价 ¥488' },
]

const dataAmounts: AmountOption[] = [
  { value: 30, label: '500MB', price: '售价 ¥10' },
  { value: 50, label: '1GB', price: '售价 ¥15' },
  { value: 100, label: '3GB', price: '售价 ¥30' },
  { value: 200, label: '5GB', price: '售价 ¥50' },
  { value: 300, label: '10GB', price: '售价 ¥80' },
  { value: 500, label: '20GB', price: '售价 ¥150' },
]

const amountOptions = computed(() => {
  return rechargeType.value === 'phone' ? phoneAmounts : dataAmounts
})

const paymentMethods: PaymentMethod[] = [
  { label: '微信支付', value: 'wechat' },
  { label: '支付宝', value: 'alipay' },
  { label: 'MoMo支付', value: 'momo' },
]

const actualPrice = computed(() => {
  const option = amountOptions.value.find(item => item.value === selectedAmount.value)
  if (!option) return '0.00'
  // 从价格字符串中提取数字
  const match = option.price.match(/¥([\d.]+)/)
  return match ? match[1] : '0.00'
})

const handleRecharge = () => {
  if (phoneNumber.value.length !== 11) {
    alert('请输入正确的手机号码')
    return
  }
  // 这里可以添加充值逻辑
  alert(`正在使用${paymentMethods.find(p => p.value === selectedPayment.value)?.label}充值...`)
}

const goBack = () => {
  history.back()
}
</script>

<style scoped>
.recharge-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 160rpx;
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

/* 主内容区 */
.main-content {
  padding: 0 30rpx;
  margin-top: -40rpx;
}

/* 充值类型切换 */
.type-switch {
  display: flex;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 8rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.type-btn {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #666666;
  border-radius: 12rpx;
  transition: all 0.3s;
  cursor: pointer;
}

.type-btn.active {
  background-color: #ff5000;
  color: #ffffff;
  font-weight: 600;
}

/* 手机号输入 */
.phone-section {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 20rpx;
}

.phone-input-wrapper {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.phone-input {
  flex: 1;
  height: 80rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 32rpx;
  color: #333333;
  outline: none;
  transition: border-color 0.3s;
}

.phone-input:focus {
  border-color: #ff5000;
}

.phone-input::placeholder {
  color: #cccccc;
}

.carrier-tag {
  padding: 8rpx 20rpx;
  background-color: #fff5f0;
  color: #ff5000;
  font-size: 24rpx;
  border-radius: 8rpx;
  font-weight: 500;
}

/* 充值档位 */
.amount-section {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.amount-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.amount-item {
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 24rpx 0;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.amount-item.active {
  border-color: #ff5000;
  background-color: #fff5f0;
}

.amount-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8rpx;
}

.amount-item.active .amount-value {
  color: #ff5000;
}

.amount-price {
  font-size: 22rpx;
  color: #999999;
}

/* 支付方式 */
.payment-section {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.payment-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.payment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  cursor: pointer;
  transition: all 0.3s;
}

.payment-item.active {
  border-color: #ff5000;
  background-color: #fff5f0;
}

.payment-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.payment-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.payment-icon.wechat {
  background-color: #e6f7ed;
}

.payment-icon.alipay {
  background-color: #e6f0ff;
}

.payment-icon.momo {
  background-color: #fff0e6;
}

.payment-name {
  font-size: 28rpx;
  color: #333333;
}

.check-icon {
  width: 40rpx;
  height: 40rpx;
}

/* 底部栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price-info {
  display: flex;
  align-items: baseline;
}

.price-label {
  font-size: 28rpx;
  color: #666666;
}

.price-symbol {
  font-size: 28rpx;
  color: #ff5000;
  font-weight: 600;
}

.price-value {
  font-size: 44rpx;
  color: #ff5000;
  font-weight: 700;
}

.recharge-btn {
  width: 280rpx;
  height: 80rpx;
  border-radius: 40rpx;
  border: none;
  font-size: 30rpx;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #ff5000 0%, #ff7a00 100%);
  cursor: pointer;
  transition: all 0.3s;
}

.recharge-btn:active {
  opacity: 0.8;
}
</style>
