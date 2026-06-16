<template>
  <view class="detail-container" v-if="product">
    <!-- 轮播图（全宽） -->
    <swiper class="swiper" circular indicator-dots autoplay indicator-color="rgba(255,255,255,0.4)" indicator-active-color="#ff5000">
      <swiper-item v-for="(img, idx) in product.images" :key="idx">
        <image :src="img" class="swiper-image" mode="aspectFill" />
      </swiper-item>
    </swiper>

    <!-- 价格区：白色卡片，大字号橙色价格 + 删除线灰色原价 + 销量标签 -->
    <view class="price-section">
      <view class="price-row">
        <text class="price">{{ formatPrice(currentPrice) }}</text>
        <text v-if="product.originalPrice" class="original-price">{{ formatPrice(product.originalPrice) }}</text>
      </view>
      <view class="price-tags">
        <view class="price-tag" v-if="product.originalPrice">
          <text class="tag-text">省{{ formatPrice(product.originalPrice - currentPrice) }}</text>
        </view>
        <view class="sales-tag" v-if="product.salesCount || product.salesCount === 0">
          <text class="sales-text">已售 {{ product.salesCount || 0 }}</text>
        </view>
      </view>
    </view>

    <!-- 商品名称 -->
    <view class="name-section">
      <text class="name">{{ product.name }}</text>
    </view>

    <!-- 尺寸选择（动态 SKU） -->
    <view class="sku-section" v-if="sizeList.length > 0">
      <view class="sku-title">{{ $t('product.size') }}</view>
      <view class="sku-options">
        <view
          class="sku-option"
          :class="{ active: selectedSize === size.value, disabled: !isSizeAvailable(size.value) }"
          v-for="size in sizeList"
          :key="size.value"
          @click="isSizeAvailable(size.value) && selectSize(size.value)"
        >
          <text>{{ size.label }}</text>
        </view>
      </view>
    </view>

    <!-- 颜色选择（动态 SKU） -->
    <view class="sku-section" v-if="colorList.length > 0">
      <view class="sku-title">{{ $t('product.color') }}</view>
      <view class="sku-options">
        <view
          class="sku-option color-option"
          :class="{ active: selectedColor === color.value, disabled: !isColorAvailable(color.value) }"
          v-for="color in colorList"
          :key="color.value"
          @click="isColorAvailable(color.value) && selectColor(color.value)"
        >
          <view class="color-dot" :style="{ backgroundColor: color.rgb }"></view>
          <text>{{ color.label }}</text>
        </view>
      </view>
    </view>

    <!-- 数量选择器 -->
    <view class="quantity-section">
      <text class="quantity-title">{{ $t('product.quantity') }}</text>
      <view class="quantity-control">
        <view class="quantity-btn" :class="{ disabled: quantity <= 1 }" @click="decreaseQuantity">-</view>
        <text class="quantity-num">{{ quantity }}</text>
        <view class="quantity-btn" @click="increaseQuantity">+</view>
      </view>
    </view>

    <!-- 三方比价区（白色卡片） -->
    <view class="compare-section" v-if="comparePrices.length">
      <view class="compare-header">
        <text class="compare-title">{{ $t('product.compareTitle') }}</text>
        <text class="compare-subtitle">多平台比价，买得更放心</text>
      </view>
      <view class="compare-list">
        <view class="compare-item" v-for="item in comparePrices" :key="item.platform">
          <text class="platform">{{ item.platform }}</text>
          <text class="compare-price">{{ formatPrice(item.price) }}</text>
        </view>
      </view>
    </view>

    <!-- 商品参数 -->
    <view class="params-section">
      <view class="section-header">
        <text class="section-title">商品参数</text>
      </view>
      <view class="param-item">
        <text class="param-label">{{ $t('product.seller') }}</text>
        <text class="param-value">{{ product.sellerName || $t('product.platformSeller') }}</text>
      </view>
      <view class="param-item">
        <text class="param-label">{{ $t('product.category') }}</text>
        <text class="param-value">{{ product.categoryName || '-' }}</text>
      </view>
    </view>

    <!-- 详情图区域 -->
    <view class="detail-images-section" v-if="detailImages.length > 0">
      <view class="section-header">
        <text class="section-title">{{ $t('product.detailImages') }}</text>
      </view>
      <view class="detail-images">
        <image
          v-for="(img, idx) in detailImages"
          :key="idx"
          :src="img"
          class="detail-image"
          mode="widthFix"
          @click="previewImage(img)"
        />
      </view>
    </view>

    <!-- 商品详情描述 -->
    <view class="desc-section">
      <view class="section-header">
        <text class="section-title">{{ $t('product.descTitle') }}</text>
      </view>
      <rich-text :nodes="product.description" class="desc-content" />
    </view>

    <!-- 底部占位 -->
    <view class="bottom-placeholder"></view>

    <!-- 底部操作栏：客服+购物车（图标）+ 橙色渐变"立即购买"大按钮 -->
    <view class="bottom-bar">
      <view class="action-group">
        <view class="action-item" @click="gotoChat">
          <text class="action-icon">&#xe6b1;</text>
          <text class="action-text">{{ $t('product.chat') }}</text>
        </view>
        <view class="action-item" @click="addToCart">
          <text class="action-icon">&#xe6af;</text>
          <text class="action-text">{{ $t('product.cart') }}</text>
        </view>
      </view>
      <button class="buy-btn" @click="buyNow">{{ $t('product.buyNow') }}</button>
    </view>
  </view>

  <!-- 加载中 -->
  <view v-else class="loading-container">
    <view class="loading-spinner"></view>
    <text>{{ $t('common.loading') }}</text>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getProductDetail, getComparePrice } from '@/api/goods'

const product = ref<any>(null)
const skuList = ref<any[]>([])
const quantity = ref(1)
const selectedSize = ref('')
const selectedColor = ref('')
const comparePrices = ref<any[]>([])
const detailImages = ref<string[]>([])

// 尺寸列表（从 SKU 提取）
const sizeList = computed(() => {
  const sizes = new Set<string>()
  skuList.value.forEach((sku: any) => {
    if (sku.size) sizes.add(sku.size)
  })
  return Array.from(sizes).map(s => ({ label: s, value: s }))
})

// 颜色列表（从 SKU 提取）
const colorList = computed(() => {
  const colors = new Set<string>()
  skuList.value.forEach((sku: any) => {
    if (sku.color) colors.add(sku.color)
  })
  const colorMap: Record<string, { rgb: string; label: string; border?: boolean }> = {
    '红色': { rgb: '#ff4d4f', label: '红色' },
    '蓝色': { rgb: '#1890ff', label: '蓝色' },
    '黑色': { rgb: '#262626', label: '黑色' },
    '白色': { rgb: '#ffffff', label: '白色', border: true },
    '绿色': { rgb: '#52c41a', label: '绿色' },
    '黄色': { rgb: '#fadb14', label: '黄色' },
    '紫色': { rgb: '#722ed1', label: '紫色' },
    '粉色': { rgb: '#eb2f96', label: '粉色' },
    '灰色': { rgb: '#8c8c8c', label: '灰色' },
    '橙色': { rgb: '#fa8c16', label: '橙色' },
  }
  return Array.from(colors).map(c => {
    const mapped = colorMap[c]
    return mapped ? { ...mapped, value: c } : { label: c, rgb: '#ccc', value: c }
  })
})

// 当前选中的 SKU
const selectedSku = computed(() => {
  if (!selectedSize.value && !selectedColor.value) return null
  return skuList.value.find((sku: any) =>
    (!selectedSize.value || sku.size === selectedSize.value) &&
    (!selectedColor.value || sku.color === selectedColor.value)
  )
})

// 当前价格
const currentPrice = computed(() => {
  return selectedSku.value?.price || product.value?.minPrice || 0
})

// 判断尺寸是否可用（根据已选颜色过滤）
const isSizeAvailable = (size: string) => {
  if (!selectedColor.value) return true
  return skuList.value.some((sku: any) => sku.size === size && sku.color === selectedColor.value)
}

// 判断颜色是否可用（根据已选尺寸过滤）
const isColorAvailable = (color: string) => {
  if (!selectedSize.value) return true
  return skuList.value.some((sku: any) => sku.color === color && sku.size === selectedSize.value)
}

// 格式化价格
const formatPrice = (price: number) => {
  if (!price) return '₫0'
  return `₫${price.toLocaleString()}`
}

// 选择尺寸
const selectSize = (size: string) => {
  selectedSize.value = size
}

// 选择颜色
const selectColor = (color: string) => {
  selectedColor.value = color
}

// 数量增减
const increaseQuantity = () => {
  const stock = selectedSku.value?.stock || 999
  if (quantity.value < stock) quantity.value++
  else uni.showToast({ title: '超出库存数量', icon: 'none' })
}

const decreaseQuantity = () => {
  if (quantity.value > 1) quantity.value--
}

// 预览图片
const previewImage = (url: string) => {
  uni.previewImage({ urls: detailImages.value, current: url })
}

// 加载商品详情
const loadProduct = async (id: number) => {
  try {
    const res = await getProductDetail(id)
    product.value = res.data
    skuList.value = res.data.skus || []
    detailImages.value = res.data.detailImages || []
  } catch (err) {
    console.error('加载商品详情失败', err)
    // Mock 数据
    product.value = {
      id,
      name: '越南进口咖啡',
      minPrice: 89000,
      originalPrice: 120000,
      salesCount: 1250,
      images: ['https://picsum.photos/750/400?random=1', 'https://picsum.photos/750/400?random=2'],
      description: '<p>优质越南咖啡豆，香浓醇厚，回味悠长。精选越南高原地区优质咖啡豆，经过精心烘焙，保留原始风味。</p>',
      sellerName: '越南直营',
      categoryName: '食品饮料',
      sellerId: 1,
    }
    skuList.value = [
      { id: 1, size: 'S', color: '红色', price: 89000, stock: 100 },
      { id: 2, size: 'M', color: '红色', price: 99000, stock: 80 },
      { id: 3, size: 'L', color: '蓝色', price: 109000, stock: 60 },
      { id: 4, size: 'S', color: '黑色', price: 89000, stock: 50 },
      { id: 5, size: 'M', color: '蓝色', price: 99000, stock: 70 },
      { id: 6, size: 'L', color: '黑色', price: 109000, stock: 40 },
    ]
    detailImages.value = [
      'https://picsum.photos/750/800?random=10',
      'https://picsum.photos/750/800?random=11',
      'https://picsum.photos/750/800?random=12',
    ]
  }
}

// 加载三方比价
const loadComparePrice = async (productId: number) => {
  try {
    const res = await getComparePrice(productId)
    comparePrices.value = res.data || []
  } catch (err) {
    console.error('加载比价失败', err)
    comparePrices.value = [
      { platform: '淘宝', price: 95000 },
      { platform: '京东', price: 92000 },
      { platform: '拼多多', price: 88000 },
    ]
  }
}

// 加入购物车
const addToCart = () => {
  if (sizeList.value.length > 0 && !selectedSize.value) {
    uni.showToast({ title: '请选择尺寸', icon: 'none' })
    return
  }
  if (colorList.value.length > 0 && !selectedColor.value) {
    uni.showToast({ title: '请选择颜色', icon: 'none' })
    return
  }
  uni.showToast({ title: '已加入购物车', icon: 'success' })
}

// 立即购买
const buyNow = () => {
  if (sizeList.value.length > 0 && !selectedSize.value) {
    uni.showToast({ title: '请选择尺寸', icon: 'none' })
    return
  }
  if (colorList.value.length > 0 && !selectedColor.value) {
    uni.showToast({ title: '请选择颜色', icon: 'none' })
    return
  }
  const skuId = selectedSku.value?.id || product.value?.id
  uni.navigateTo({ url: `/pages/order/confirm?skuId=${skuId}&quantity=${quantity.value}` })
}

// 联系商家
const gotoChat = () => {
  if (!product.value?.sellerId) {
    uni.showToast({ title: '暂不支持', icon: 'none' })
    return
  }
  uni.navigateTo({ url: `/pages/chat/room?sellerId=${product.value.sellerId}` })
}

onLoad((options: any) => {
  const id = Number(options.id)
  if (id) {
    loadProduct(id)
    loadComparePrice(id)
  }
})
</script>

<style scoped lang="scss">
.detail-container {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

.swiper {
  width: 100%;
  height: 750rpx;
}

.swiper-image {
  width: 100%;
  height: 100%;
}

/* 价格区 */
.price-section {
  background: #ffffff;
  margin: 20rpx 24rpx 0;
  padding: 28rpx;
  border-radius: 16rpx;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.price {
  font-size: 56rpx;
  color: #ff5000;
  font-weight: bold;
}

.original-price {
  font-size: 28rpx;
  color: #999;
  text-decoration: line-through;
}

.price-tags {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.price-tag {
  background: #fff0e6;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
}

.tag-text {
  font-size: 24rpx;
  color: #ff5000;
  font-weight: 500;
}

.sales-tag {
  background: #f5f5f5;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
}

.sales-text {
  font-size: 24rpx;
  color: #666;
}

/* 商品名称 */
.name-section {
  background: #ffffff;
  margin: 16rpx 24rpx 0;
  padding: 28rpx;
  border-radius: 16rpx;
}

.name {
  font-size: 32rpx;
  color: #000;
  font-weight: 600;
  line-height: 1.5;
}

/* SKU 选择区 */
.sku-section {
  background: #ffffff;
  margin: 16rpx 24rpx 0;
  padding: 28rpx;
  border-radius: 16rpx;
}

.sku-title {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
  font-weight: 500;
}

.sku-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.sku-option {
  padding: 14rpx 32rpx;
  background: #f5f5f5;
  border-radius: 60rpx;
  font-size: 26rpx;
  color: #333;
  border: 2rpx solid transparent;
  transition: all 0.2s ease;

  &.active {
    background: #fff0e6;
    border-color: #ff5000;
    color: #ff5000;
  }

  &.disabled {
    opacity: 0.4;
    pointer-events: none;
  }
}

.color-option {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.color-dot {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(0, 0, 0, 0.1);
}

/* 数量选择 */
.quantity-section {
  background: #ffffff;
  margin: 16rpx 24rpx 0;
  padding: 28rpx;
  border-radius: 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quantity-title {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 0;
  border: 2rpx solid #e8e8e8;
  border-radius: 12rpx;
  overflow: hidden;
}

.quantity-btn {
  width: 64rpx;
  height: 56rpx;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #333;
  font-weight: 500;

  &.disabled {
    color: #ccc;
  }
}

.quantity-num {
  font-size: 28rpx;
  min-width: 72rpx;
  text-align: center;
  color: #333;
  font-weight: 500;
}

/* 三方比价 */
.compare-section {
  background: #ffffff;
  margin: 16rpx 24rpx 0;
  padding: 28rpx;
  border-radius: 16rpx;
}

.compare-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.compare-title {
  font-size: 30rpx;
  color: #333;
  font-weight: 600;
}

.compare-subtitle {
  font-size: 24rpx;
  color: #999;
}

.compare-list {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}

.compare-item {
  text-align: center;
  flex: 1;
  background: #f9f9f9;
  border-radius: 12rpx;
  padding: 20rpx 0;
}

.platform {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.compare-price {
  font-size: 28rpx;
  color: #ff5000;
  font-weight: bold;
}

/* 商品参数 */
.params-section {
  background: #ffffff;
  margin: 16rpx 24rpx 0;
  padding: 28rpx;
  border-radius: 16rpx;
}

.section-header {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  position: relative;
  padding-left: 20rpx;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6rpx;
  height: 28rpx;
  background: linear-gradient(90deg, #ff9000 0%, #ff5000 100%);
  border-radius: 4rpx;
}

.param-item {
  display: flex;
  justify-content: space-between;
  padding: 18rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.param-item:last-child {
  border-bottom: none;
}

.param-label {
  color: #999;
  font-size: 28rpx;
}

.param-value {
  color: #333;
  font-size: 28rpx;
  font-weight: 500;
}

/* 详情图区域 */
.detail-images-section {
  background: #ffffff;
  margin: 16rpx 24rpx 0;
  padding: 28rpx;
  border-radius: 16rpx;
}

.detail-images {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.detail-image {
  width: 100%;
  border-radius: 12rpx;
  display: block;
}

/* 商品描述 */
.desc-section {
  background: #ffffff;
  margin: 16rpx 24rpx 0;
  padding: 28rpx;
  border-radius: 16rpx;
}

.desc-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.8;
}

/* 底部占位 */
.bottom-placeholder {
  height: 140rpx;
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  padding-bottom: calc(16rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
  gap: 20rpx;
  z-index: 100;
}

.action-group {
  display: flex;
  gap: 32rpx;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  min-width: 80rpx;
}

.action-icon {
  font-family: 'iconfont';
  font-size: 40rpx;
  color: #666;
}

.action-text {
  font-size: 22rpx;
  color: #666;
}

.buy-btn {
  flex: 1;
  background: linear-gradient(90deg, #ff9000 0%, #ff5000 100%);
  color: #fff;
  border: none;
  border-radius: 60rpx;
  height: 84rpx;
  line-height: 84rpx;
  font-size: 32rpx;
  font-weight: bold;
  box-shadow: 0 4rpx 16rpx rgba(255, 80, 0, 0.3);
}

.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: #999;
  gap: 24rpx;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #f0f0f0;
  border-top-color: #ff5000;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
