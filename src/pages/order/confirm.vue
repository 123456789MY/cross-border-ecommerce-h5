<template>
  <view class="confirm-container">
    <!-- 地址选择 -->
    <view class="card address-card" @click="selectAddress">
      <view class="address-info" v-if="selectedAddress">
        <view class="address-row">
          <text class="name">{{ selectedAddress.receiverName }}</text>
          <text class="phone">{{ selectedAddress.receiverPhone }}</text>
        </view>
        <text class="address">{{ selectedAddress.fullAddress }}</text>
      </view>
      <view class="address-empty" v-else>
        <text class="add-text">+ {{ $t('order.addAddress') }}</text>
      </view>
      <view class="address-arrow">›</view>
    </view>

    <!-- 商品列表 -->
    <view class="card goods-card">
      <view class="card-title">{{ $t('order.goodsList') }}</view>
      <view class="goods-list">
        <view class="goods-item" v-for="item in orderItems" :key="item.id">
          <image :src="item.productImage" class="goods-image" mode="aspectFill" />
          <view class="goods-info">
            <text class="goods-name">{{ item.productName }}</text>
            <text class="goods-specs">{{ item.skuSpecs }}</text>
            <view class="goods-meta" v-if="item.weight || item.volume">
              <text class="meta-tag" v-if="item.weight">{{ item.weight }}kg</text>
              <text class="meta-tag" v-if="item.volume">{{ item.volume }}m³</text>
            </view>
            <view class="goods-bottom">
              <text class="goods-price">{{ formatPrice(item.unitPrice) }}</text>
              <text class="goods-quantity">x{{ item.quantity }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 服务费说明（固定展示，让客户知道收费明细） -->
    <view class="card service-fee-card" v-if="serviceFeeConfig?.enabled">
      <view class="service-fee-header">
        <view class="service-fee-title-wrap">
          <text class="service-fee-title">{{ $t('order.serviceFee') }}</text>
          <text class="service-fee-badge">{{ $t('order.required') }}</text>
        </view>
      </view>
      <view class="service-fee-content">
        <view class="service-fee-row">
          <text class="service-fee-label">{{ $t('order.feeType') }}</text>
          <text class="service-fee-value">{{ serviceFeeConfig.type === 'weight' ? $t('order.byWeight') : $t('order.byVolume') }}</text>
        </view>
        <view class="service-fee-row">
          <text class="service-fee-label">{{ $t('order.feeRate') }}</text>
          <text class="service-fee-value">{{ formatPrice(serviceFeeConfig.rate) }}/{{ serviceFeeConfig.unit }}</text>
        </view>
        <view class="service-fee-row">
          <text class="service-fee-label">{{ $t('order.feeMin') }}</text>
          <text class="service-fee-value">{{ formatPrice(serviceFeeConfig.minFee) }}</text>
        </view>
        <view class="service-fee-row">
          <text class="service-fee-label">{{ $t('order.calculatedFee') }}</text>
          <text class="service-fee-amount">{{ formatPrice(calculatedServiceFee) }}</text>
        </view>
        <view class="service-fee-formula" v-if="serviceFeeTip">
          <text>{{ serviceFeeTip }}</text>
        </view>
      </view>
    </view>

    <!-- 配送方式 -->
    <view class="card">
      <view class="card-title">{{ $t('order.deliveryMethod') }}</view>
      <view class="delivery-options">
        <view
          class="delivery-item"
          v-for="opt in deliveryOptions"
          :key="opt.value"
          :class="{ active: deliveryType === opt.value }"
          @click="deliveryType = opt.value"
        >
          <text class="delivery-label">{{ opt.label }}</text>
          <text class="delivery-fee" v-if="opt.fee > 0">{{ formatPrice(opt.fee) }}</text>
          <text class="delivery-fee free" v-else>{{ $t('order.freeShipping') }}</text>
        </view>
      </view>
    </view>

    <!-- 可选费用项（质检费、保险费，用户可选择） -->
    <view class="card">
      <view class="card-title">{{ $t('order.optionalServices') }}</view>
      <view class="optional-fee-options">
        <view
          class="optional-fee-item"
          v-for="fee in optionalFees"
          :key="fee.key"
          @click="toggleFee(fee.key)"
        >
          <view class="optional-fee-left">
            <view class="checkbox" :class="{ checked: selectedFees[fee.key] }">
              <text v-if="selectedFees[fee.key]">✓</text>
            </view>
            <view class="optional-fee-info">
              <text class="optional-fee-name">{{ fee.name }}</text>
              <text class="optional-fee-desc">{{ fee.desc }}</text>
            </view>
          </view>
          <text class="optional-fee-price">{{ formatPrice(fee.price) }}</text>
        </view>
      </view>
    </view>

    <!-- 支付方式 -->
    <view class="card">
      <view class="card-title">{{ $t('order.paymentMethod') }}</view>
      <view class="payment-options">
        <view
          class="payment-item"
          v-for="method in paymentMethods"
          :key="method.value"
          @click="selectPaymentMethod(method.value)"
        >
          <view class="payment-left">
            <text class="payment-icon">{{ method.icon }}</text>
            <text class="payment-label">{{ method.label }}</text>
          </view>
          <view class="payment-radio" :class="{ active: paymentMethod === method.value }">
            <text v-if="paymentMethod === method.value">✓</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 费用明细 -->
    <view class="card fee-card">
      <view class="card-title">{{ $t('order.feeDetail') }}</view>
      <view class="fee-list">
        <view class="fee-item">
          <text class="fee-label">{{ $t('order.goodsTotal') }}</text>
          <text class="fee-value">{{ formatPrice(orderAmount) }}</text>
        </view>
        <view class="fee-item" v-if="currentShippingFee > 0">
          <text class="fee-label">{{ $t('order.shippingFee') }}</text>
          <text class="fee-value">{{ formatPrice(currentShippingFee) }}</text>
        </view>
        <!-- 服务费（固定必选项，不可取消） -->
        <view class="fee-item" v-if="serviceFeeConfig?.enabled && calculatedServiceFee > 0">
          <text class="fee-label">{{ $t('order.serviceFee') }}</text>
          <view class="fee-right">
            <text class="fee-value">{{ formatPrice(calculatedServiceFee) }}</text>
            <text class="fee-tip">({{ serviceFeeTip }})</text>
          </view>
        </view>
        <view class="fee-item" v-if="selectedFees.inspection">
          <text class="fee-label">{{ $t('order.inspectionFee') }}</text>
          <text class="fee-value">{{ formatPrice(inspectionFee) }}</text>
        </view>
        <view class="fee-item" v-if="selectedFees.insurance">
          <text class="fee-label">{{ $t('order.insuranceFee') }}</text>
          <text class="fee-value">{{ formatPrice(insuranceFee) }}</text>
        </view>
        <view class="fee-divider"></view>
        <view class="fee-item total">
          <text class="fee-label">{{ $t('order.totalPay') }}</text>
          <text class="fee-total">{{ formatPrice(totalAmount) }}</text>
        </view>
      </view>
    </view>

    <!-- 买家留言 -->
    <view class="card">
      <view class="card-title">{{ $t('order.buyerRemark') }}</view>
      <textarea
        v-model="buyerRemark"
        :placeholder="$t('order.remarkPlaceholder')"
        class="remark-input"
        maxlength="200"
      />
    </view>

    <!-- 底部占位 -->
    <view class="bottom-placeholder"></view>

    <!-- 底部提交栏 -->
    <view class="bottom-bar">
      <view class="total-info">
        <text class="total-label">{{ $t('order.totalPay') }}</text>
        <text class="total-price">{{ formatPrice(totalAmount) }}</text>
      </view>
      <button class="submit-btn" @click="submitOrder" :loading="submitting">{{ $t('order.submitOrder') }}</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getServiceFeeConfig, calculateServiceFee, type ServiceFeeConfig } from '@/api/settings'

const selectedAddress = ref<any>(null)
const orderItems = ref<any[]>([])
const orderAmount = ref(0)
const deliveryType = ref('standard')
const paymentMethod = ref('wechat')
const buyerRemark = ref('')
const submitting = ref(false)

// 配送方式选项
const deliveryOptions = [
  { label: '标准配送', value: 'standard', fee: 0 },
  { label: '快递配送', value: 'express', fee: 15000 },
]

// 支付方式选项
const paymentMethods = [
  { value: 'wechat', label: '微信支付', icon: '💰' },
  { value: 'alipay', label: '支付宝', icon: '📱' },
  { value: 'momo', label: 'MoMo', icon: '🏦' },
]

// 可选费用项（质检费、保险费，用户可选择）
const selectedFees = ref({
  inspection: false,
  insurance: false,
})

// 服务费配置（固定必选项）
const serviceFeeConfig = ref<ServiceFeeConfig | null>(null)
const calculatedServiceFee = ref(0)

// 质检费、保险费（固定金额）
const inspectionFee = 6000    // 质检费 6,000₫（约2元人民币）
const insuranceFee = 6000     // 保险费 6,000₫（约2元人民币）

const optionalFees = [
  { key: 'inspection', name: $t('order.inspectionFee'), desc: $t('order.inspectionDesc'), price: inspectionFee },
  { key: 'insurance', name: $t('order.insuranceFee'), desc: $t('order.insuranceDesc'), price: insuranceFee },
]

// 商品总重量（千克）
const totalWeight = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + (item.weight || 0) * item.quantity, 0)
})

// 商品总体积（立方米）
const totalVolume = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + (item.volume || 0) * item.quantity, 0)
})

// 服务费提示（显示计算说明）
const serviceFeeTip = computed(() => {
  if (!serviceFeeConfig.value?.enabled) return ''
  const unit = serviceFeeConfig.value.type === 'weight' ? 'kg' : 'm³'
  const rate = serviceFeeConfig.value.rate.toLocaleString()
  const baseValue = serviceFeeConfig.value.type === 'weight' ? totalWeight.value : totalVolume.value
  return `${baseValue}${unit} × ${rate}₫/${unit}`
})

// 切换可选费用
const toggleFee = (key: string) => {
  selectedFees.value[key] = !selectedFees.value[key]
}

// 当前运费
const currentShippingFee = computed(() => {
  const opt = deliveryOptions.find(o => o.value === deliveryType.value)
  return opt?.fee || 0
})

// 计算总价（服务费固定包含，不可取消）
const totalAmount = computed(() => {
  let total = orderAmount.value + currentShippingFee.value + calculatedServiceFee.value
  if (selectedFees.value.inspection) total += inspectionFee
  if (selectedFees.value.insurance) total += insuranceFee
  return total
})

// 格式化价格
const formatPrice = (price: number) => {
  if (!price) return '₫0'
  return `₫${price.toLocaleString()}`
}

// 加载服务费配置并计算
const loadServiceFeeConfig = async () => {
  try {
    const config = await getServiceFeeConfig()
    serviceFeeConfig.value = config
    await calculateServiceFeeAmount()
  } catch (err) {
    console.error('加载服务费配置失败', err)
    // 默认配置兜底
    serviceFeeConfig.value = {
      enabled: true,
      type: 'weight',
      rate: 20000,
      unit: 'kg',
      minFee: 15000,
      maxFee: 200000,
    }
    await calculateServiceFeeAmount()
  }
}

// 计算服务费金额
const calculateServiceFeeAmount = async () => {
  if (!serviceFeeConfig.value?.enabled) {
    calculatedServiceFee.value = 0
    return
  }

  try {
    const res = await calculateServiceFee({
      type: serviceFeeConfig.value.type,
      weight: totalWeight.value,
      volume: totalVolume.value,
      quantity: orderItems.value.reduce((sum, item) => sum + item.quantity, 0),
    })
    calculatedServiceFee.value = res.fee
  } catch (err) {
    // 前端兜底计算
    let baseValue = serviceFeeConfig.value.type === 'weight' ? totalWeight.value : totalVolume.value
    let fee = baseValue * serviceFeeConfig.value.rate
    if (fee < serviceFeeConfig.value.minFee) fee = serviceFeeConfig.value.minFee
    if (fee > serviceFeeConfig.value.maxFee) fee = serviceFeeConfig.value.maxFee
    calculatedServiceFee.value = Math.round(fee)
  }
}

// 加载订单数据
const loadOrderData = async (options: any) => {
  if (options.skuId) {
    // 直接购买
    const mockItem = {
      id: 1,
      productName: '越南进口咖啡',
      skuSpecs: '500g装',
      productImage: 'https://picsum.photos/200/200?random=1',
      unitPrice: 89000,
      quantity: Number(options.quantity) || 1,
      weight: 0.5,   // 重量 0.5kg
      volume: 0.001, // 体积 0.001m³
    }
    orderItems.value = [mockItem]
    orderAmount.value = mockItem.unitPrice * mockItem.quantity
  } else if (options.cartItemIds) {
    // 从购物车
    const ids = options.cartItemIds.split(',')
    const mockItems = [
      {
        id: 1,
        productName: '越南进口咖啡',
        skuSpecs: '500g装',
        productImage: 'https://picsum.photos/200/200?random=1',
        unitPrice: 89000,
        quantity: 1,
        weight: 0.5,
        volume: 0.001,
      },
      {
        id: 2,
        productName: '越南腰果',
        skuSpecs: '400g装',
        productImage: 'https://picsum.photos/200/200?random=2',
        unitPrice: 65000,
        quantity: 2,
        weight: 0.4,
        volume: 0.0008,
      },
    ]
    orderItems.value = mockItems.filter(item => ids.includes(String(item.id)))
    orderAmount.value = orderItems.value.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
  }

  // 加载默认地址
  selectedAddress.value = {
    receiverName: '张三',
    receiverPhone: '13800138000',
    fullAddress: '上海市浦东新区世纪大道100号',
  }
}

// 选择地址
const selectAddress = () => {
  uni.navigateTo({ url: '/pages/user/address?select=true' })
}

// 选择支付方式
const selectPaymentMethod = (method: string) => {
  paymentMethod.value = method
}

// 提交订单
const submitOrder = async () => {
  if (!selectedAddress.value) {
    uni.showToast({ title: '请选择收货地址', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    // 构建费用明细（服务费固定包含）
    const feeBreakdown = {
      subtotal: orderAmount.value,
      shippingFee: currentShippingFee.value,
      serviceFee: calculatedServiceFee.value,
      inspectionFee: selectedFees.value.inspection ? inspectionFee : 0,
      insuranceFee: selectedFees.value.insurance ? insuranceFee : 0,
      total: totalAmount.value,
    }

    console.log('订单费用明细', feeBreakdown)
    uni.showToast({ title: '订单创建成功', icon: 'success' })
    setTimeout(() => {
      uni.switchTab({ url: '/pages/order/list' })
    }, 1500)
  } catch (err: any) {
    uni.showToast({ title: err.message || '创建订单失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

onLoad(async (options: any) => {
  await loadOrderData(options)
  await loadServiceFeeConfig()
})
</script>

<style scoped lang="scss">
.confirm-container {
  background: #f5f5f5;
  min-height: 100vh;
  padding: 20rpx;
  box-sizing: border-box;
}

/* 通用卡片 */
.card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.card-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #000;
  margin-bottom: 24rpx;
}

/* 地址卡片 */
.address-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 28rpx;
}

.address-info {
  flex: 1;
}

.address-row {
  display: flex;
  align-items: center;
  margin-bottom: 14rpx;
}

.name {
  font-size: 32rpx;
  font-weight: bold;
  color: #000;
  margin-right: 20rpx;
}

.phone {
  font-size: 26rpx;
  color: #666;
}

.address {
  font-size: 26rpx;
  color: #999;
  line-height: 1.5;
}

.address-empty {
  flex: 1;
}

.add-text {
  color: #ff5000;
  font-size: 30rpx;
  font-weight: 500;
}

.address-arrow {
  font-size: 44rpx;
  color: #ccc;
  margin-left: 16rpx;
}

/* 商品列表 */
.goods-card {
  padding-bottom: 20rpx;
}

.goods-list {
  display: flex;
  flex-direction: column;
}

.goods-item {
  display: flex;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  gap: 24rpx;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-child {
    padding-top: 0;
  }
}

.goods-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
  background: #f5f5f5;
}

.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.goods-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  line-height: 1.4;
}

.goods-specs {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.goods-meta {
  display: flex;
  gap: 12rpx;
  margin-top: 10rpx;
}

.meta-tag {
  font-size: 22rpx;
  color: #ff5000;
  background: #fff0e6;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.goods-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12rpx;
}

.goods-price {
  font-size: 32rpx;
  color: #ff5000;
  font-weight: bold;
}

.goods-quantity {
  font-size: 26rpx;
  color: #999;
}

/* 服务费说明卡片（浅橙色背景） */
.service-fee-card {
  background: #fff0e6;
  border: 1rpx solid rgba(255, 80, 0, 0.12);
}

.service-fee-header {
  margin-bottom: 20rpx;
}

.service-fee-title-wrap {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.service-fee-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #000;
}

.service-fee-badge {
  font-size: 22rpx;
  color: #ff5000;
  background: rgba(255, 80, 0, 0.12);
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}

.service-fee-content {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.service-fee-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.service-fee-label {
  font-size: 26rpx;
  color: #666;
}

.service-fee-value {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}

.service-fee-amount {
  font-size: 32rpx;
  color: #ff5000;
  font-weight: bold;
}

.service-fee-formula {
  margin-top: 8rpx;
  padding: 14rpx 16rpx;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12rpx;
  text-align: center;

  text {
    font-size: 24rpx;
    color: #999;
  }
}

/* 配送方式 */
.delivery-options {
  display: flex;
  gap: 24rpx;
}

.delivery-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 20rpx 32rpx;
  background: #f8f8f8;
  border-radius: 60rpx;
  font-size: 26rpx;
  color: #666;
  border: 2rpx solid transparent;
  transition: all 0.2s;

  &.active {
    background: rgba(255, 80, 0, 0.08);
    color: #ff5000;
    border-color: #ff5000;
  }
}

.delivery-label {
  font-size: 26rpx;
  font-weight: 500;
}

.delivery-fee {
  font-size: 22rpx;
  color: #ff5000;

  &.free {
    color: #52c41a;
  }
}

/* 可选费用项 */
.optional-fee-options {
  display: flex;
  flex-direction: column;
}

.optional-fee-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-child {
    padding-top: 0;
  }
}

.optional-fee-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
  flex: 1;
}

.checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #ddd;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #fff;
  flex-shrink: 0;
  transition: all 0.2s;

  &.checked {
    background: #ff5000;
    border-color: #ff5000;
  }
}

.optional-fee-info {
  display: flex;
  flex-direction: column;
}

.optional-fee-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.optional-fee-desc {
  font-size: 22rpx;
  color: #999;
  margin-top: 6rpx;
}

.optional-fee-price {
  font-size: 28rpx;
  color: #ff5000;
  font-weight: bold;
}

/* 支付方式 */
.payment-options {
  display: flex;
  flex-direction: column;
}

.payment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-child {
    padding-top: 0;
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

.payment-label {
  font-size: 28rpx;
  color: #333;
}

.payment-radio {
  width: 44rpx;
  height: 44rpx;
  border: 2rpx solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #fff;
  transition: all 0.2s;

  &.active {
    background: #ff5000;
    border-color: #ff5000;
  }
}

/* 费用明细 */
.fee-card {
  padding-bottom: 24rpx;
}

.fee-list {
  display: flex;
  flex-direction: column;
}

.fee-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  font-size: 28rpx;

  &.total {
    padding-top: 20rpx;
  }
}

.fee-label {
  color: #666;
}

.fee-value {
  color: #333;
  font-weight: 500;
}

.fee-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.fee-tip {
  font-size: 22rpx;
  color: #999;
}

.fee-divider {
  height: 1rpx;
  background: #f0f0f0;
  margin: 8rpx 0;
}

.fee-total {
  font-size: 36rpx;
  color: #ff5000;
  font-weight: bold;
}

/* 买家留言 */
.remark-input {
  width: 100%;
  background: #f8f8f8;
  border-radius: 16rpx;
  padding: 24rpx;
  font-size: 28rpx;
  color: #333;
  height: 160rpx;
  box-sizing: border-box;
  border: none;
}

/* 底部占位 */
.bottom-placeholder {
  height: 140rpx;
}

/* 底部栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 28rpx;
  padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
  z-index: 100;
}

.total-info {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.total-label {
  font-size: 28rpx;
  color: #666;
}

.total-price {
  font-size: 44rpx;
  color: #ff5000;
  font-weight: bold;
}

.submit-btn {
  background: linear-gradient(90deg, #ff9000 0%, #ff5000 100%);
  color: #fff;
  border: none;
  border-radius: 60rpx;
  padding: 24rpx 56rpx;
  font-size: 30rpx;
  font-weight: bold;
  margin: 0;
  line-height: 1;
}
</style>
