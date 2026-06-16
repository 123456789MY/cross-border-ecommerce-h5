<template>
  <view class="cart-container">
    <!-- 地址栏：白色卡片 -->
    <view class="address-card" v-if="defaultAddress" @click="selectAddress">
      <view class="address-left">
        <view class="address-icon">
          <text class="icon-location">&#xe6a8;</text>
        </view>
        <view class="address-info">
          <view class="address-row">
            <text class="address-name">{{ defaultAddress.receiverName }}</text>
            <text class="address-phone">{{ defaultAddress.receiverPhone }}</text>
          </view>
          <text class="address-detail">{{ defaultAddress.fullAddress }}</text>
        </view>
      </view>
      <text class="address-arrow">&#xe6a3;</text>
    </view>
    <view class="address-card empty" v-else @click="selectAddress">
      <view class="address-left">
        <view class="address-icon empty-icon">
          <text class="icon-location">&#xe6a8;</text>
        </view>
        <text class="add-address">+ {{ $t('cart.addAddress') }}</text>
      </view>
      <text class="address-arrow">&#xe6a3;</text>
    </view>

    <!-- 购物车列表：每个商品白色卡片，圆形选择框+图片+名称+规格+橙色价格+数量加减器 -->
    <scroll-view scroll-y class="cart-list" v-if="cartItems.length > 0">
      <view
        class="cart-item-card"
        v-for="item in cartItems"
        :key="item.id"
      >
        <!-- 选择框 -->
        <view class="item-checkbox" @click="toggleSelect(item.id)">
          <view class="checkbox" :class="{ checked: item.isSelected }">
            <text v-if="item.isSelected" class="check-icon">&#xe6a7;</text>
          </view>
        </view>

        <!-- 商品图片 -->
        <image :src="item.productImage" class="item-image" mode="aspectFill" />

        <!-- 商品信息 -->
        <view class="item-info">
          <text class="item-name">{{ item.productName }}</text>
          <text class="item-specs">{{ item.skuSpecs }}</text>
          <view class="item-bottom">
            <text class="item-price">{{ formatPrice(item.unitPrice) }}</text>
            <view class="quantity-control">
              <view
                class="quantity-btn"
                :class="{ disabled: item.quantity <= 1 }"
                @click="decreaseQuantity(item.id)"
              >
                <text class="btn-text">-</text>
              </view>
              <text class="quantity-num">{{ item.quantity }}</text>
              <view class="quantity-btn" @click="increaseQuantity(item.id)">
                <text class="btn-text">+</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 空状态：居中+橙色按钮 -->
    <view class="empty-cart" v-else>
      <view class="empty-icon-bg">
        <image src="/static/empty-cart.png" class="empty-image" />
      </view>
      <text class="empty-text">{{ $t('cart.empty') }}</text>
      <view class="go-shopping" @click="goHome">
        <text>{{ $t('cart.goShopping') }}</text>
      </view>
    </view>

    <!-- 底部结算栏：全选+合计（橙色大字）+ 橙色渐变"结算"按钮 -->
    <view class="bottom-bar" v-if="cartItems.length > 0">
      <view class="select-all" @click="toggleSelectAll">
        <view class="checkbox" :class="{ checked: allSelected }">
          <text v-if="allSelected" class="check-icon">&#xe6a7;</text>
        </view>
        <text class="select-all-text">{{ $t('cart.selectAll') }}</text>
      </view>
      <view class="total-info">
        <text class="total-label">{{ $t('cart.total') }}</text>
        <text class="total-price">{{ formatPrice(totalPrice) }}</text>
      </view>
      <view class="checkout-btn" @click="checkout">
        <text>{{ $t('cart.checkout') }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getCartList, updateQuantity, selectCartItem, selectAllCart } from '@/api/cart'

// 购物车数据
const cartItems = ref<any[]>([])
const defaultAddress = ref<any>(null)

// 格式化价格
const formatPrice = (price: number) => {
  if (!price) return '₫0'
  return `₫${price.toLocaleString()}`
}

// 是否全选
const allSelected = computed(() => {
  if (cartItems.value.length === 0) return false
  return cartItems.value.every(item => item.isSelected)
})

// 总价
const totalPrice = computed(() => {
  return cartItems.value
    .filter(item => item.isSelected)
    .reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
})

// 加载购物车数据
const loadCartData = async () => {
  try {
    const res = await getCartList()
    cartItems.value = res.list || []
    defaultAddress.value = res.defaultAddress || null
  } catch (err) {
    console.error('加载购物车失败', err)
    // Mock 数据
    cartItems.value = [
      {
        id: 1,
        productId: 1,
        productName: '越南进口咖啡',
        skuSpecs: '500g装',
        productImage: 'https://picsum.photos/200/200?random=1',
        unitPrice: 89000,
        quantity: 1,
        isSelected: true,
      },
      {
        id: 2,
        productId: 2,
        productName: '越南腰果',
        skuSpecs: '400g装',
        productImage: 'https://picsum.photos/200/200?random=2',
        unitPrice: 65000,
        quantity: 2,
        isSelected: false,
      },
    ]
  }
}

// 修改数量
const updateQuantityHandler = async (id: number, quantity: number) => {
  if (quantity < 1) return
  try {
    await updateQuantity(id, quantity)
    const item = cartItems.value.find(i => i.id === id)
    if (item) item.quantity = quantity
  } catch (err) {
    console.error('修改数量失败', err)
  }
}

const increaseQuantity = (id: number) => {
  const item = cartItems.value.find(i => i.id === id)
  if (item) {
    updateQuantityHandler(id, item.quantity + 1)
  }
}

const decreaseQuantity = (id: number) => {
  const item = cartItems.value.find(i => i.id === id)
  if (item && item.quantity > 1) {
    updateQuantityHandler(id, item.quantity - 1)
  }
}

// 选中/取消选中
const toggleSelect = async (id: number) => {
  const item = cartItems.value.find(i => i.id === id)
  if (item) {
    try {
      await selectCartItem(id, !item.isSelected)
      item.isSelected = !item.isSelected
    } catch (err) {
      console.error('操作失败', err)
    }
  }
}

// 全选/取消全选
const toggleSelectAll = async () => {
  const newSelected = !allSelected.value
  try {
    await selectAllCart(newSelected)
    cartItems.value.forEach(item => {
      item.isSelected = newSelected
    })
  } catch (err) {
    console.error('全选失败', err)
  }
}

// 结算
const checkout = () => {
  const selectedItems = cartItems.value.filter(item => item.isSelected)
  if (selectedItems.length === 0) {
    uni.showToast({ title: '请选择商品', icon: 'none' })
    return
  }
  const ids = selectedItems.map(item => item.id).join(',')
  uni.navigateTo({ url: `/pages/order/confirm?cartItemIds=${ids}` })
}

// 选择地址
const selectAddress = () => {
  uni.navigateTo({ url: '/pages/user/address' })
}

// 去首页
const goHome = () => {
  uni.switchTab({ url: '/pages/index/index' })
}

onShow(() => {
  loadCartData()
})
</script>

<style scoped lang="scss">
.cart-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 140rpx;
}

/* 地址栏卡片 */
.address-card {
  background: #ffffff;
  border-radius: 16rpx;
  margin: 24rpx;
  padding: 28rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &.empty {
    .add-address {
      color: #ff5000;
      font-size: 28rpx;
      font-weight: 500;
    }
  }
}

.address-left {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 20rpx;
}

.address-icon {
  width: 64rpx;
  height: 64rpx;
  background: linear-gradient(90deg, #ff9000 0%, #ff5000 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.empty-icon {
    background: #fff0e6;

    .icon-location {
      color: #ff5000;
    }
  }
}

.icon-location {
  font-family: 'iconfont';
  font-size: 32rpx;
  color: #ffffff;
}

.address-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.address-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.address-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #000;
}

.address-phone {
  font-size: 26rpx;
  color: #666;
}

.address-detail {
  font-size: 24rpx;
  color: #999;
  line-height: 1.4;
}

.address-arrow {
  font-family: 'iconfont';
  font-size: 28rpx;
  color: #ccc;
  margin-left: 16rpx;
}

/* 购物车列表 */
.cart-list {
  padding: 0 24rpx;
}

.cart-item-card {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  gap: 20rpx;
}

.item-checkbox {
  width: 48rpx;
  flex-shrink: 0;
}

.checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &.checked {
    background: #ff5000;
    border-color: #ff5000;
  }
}

.check-icon {
  font-family: 'iconfont';
  font-size: 22rpx;
  color: #fff;
}

.item-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  min-width: 0;
}

.item-name {
  font-size: 28rpx;
  color: #000;
  font-weight: 600;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-specs {
  font-size: 24rpx;
  color: #999;
  background: #f5f5f5;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  align-self: flex-start;
}

.item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8rpx;
}

.item-price {
  font-size: 32rpx;
  color: #ff5000;
  font-weight: 700;
}

/* 数量控制 */
.quantity-control {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.quantity-btn {
  width: 52rpx;
  height: 52rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:active {
    background: #e8e8e8;
  }

  &.disabled {
    opacity: 0.4;
  }
}

.btn-text {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
  line-height: 1;
}

.quantity-num {
  font-size: 28rpx;
  color: #333;
  min-width: 56rpx;
  text-align: center;
  font-weight: 500;
}

/* 空购物车 */
.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 160rpx 0;
}

.empty-icon-bg {
  width: 240rpx;
  height: 240rpx;
  background: #fff0e6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
}

.empty-image {
  width: 160rpx;
  height: 160rpx;
  opacity: 0.6;
}

.empty-text {
  color: #999;
  font-size: 28rpx;
  margin-bottom: 48rpx;
}

.go-shopping {
  background: linear-gradient(90deg, #ff9000 0%, #ff5000 100%);
  color: #fff;
  border: none;
  border-radius: 60rpx;
  padding: 24rpx 80rpx;
  font-size: 28rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 24rpx rgba(255, 80, 0, 0.3);
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 12rpx rgba(255, 80, 0, 0.2);
  }
}

/* 底部结算栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  display: flex;
  align-items: center;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
  gap: 24rpx;
  z-index: 100;
}

.select-all {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.select-all-text {
  font-size: 26rpx;
  color: #666;
}

.total-info {
  flex: 1;
  text-align: right;
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 8rpx;
}

.total-label {
  font-size: 26rpx;
  color: #666;
}

.total-price {
  font-size: 40rpx;
  color: #ff5000;
  font-weight: 700;
}

.checkout-btn {
  background: linear-gradient(90deg, #ff9000 0%, #ff5000 100%);
  color: #fff;
  border: none;
  border-radius: 60rpx;
  padding: 22rpx 52rpx;
  font-size: 28rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 24rpx rgba(255, 80, 0, 0.3);
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 12rpx rgba(255, 80, 0, 0.2);
  }
}
</style>
