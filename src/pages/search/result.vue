<template>
  <view class="result-container">
    <!-- 顶部栏 -->
    <view class="result-header">
      <text class="back-btn" @click="goBack">←</text>
      <text class="result-title">{{ $t('search.resultFor') }} "{{ keyword }}"</text>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view class="filter-item" :class="{ active: sortType === 'default' }" @click="changeSort('default')">
        {{ $t('product.sortDefault') }}
      </view>
      <view class="filter-item" :class="{ active: sortType === 'price_asc' }" @click="changeSort('price_asc')">
        {{ $t('product.priceAsc') }}
      </view>
      <view class="filter-item" :class="{ active: sortType === 'price_desc' }" @click="changeSort('price_desc')">
        {{ $t('product.priceDesc') }}
      </view>
      <view class="filter-item" :class="{ active: sortType === 'sales' }" @click="changeSort('sales')">
        {{ $t('product.sales') }}
      </view>
    </view>

    <!-- 商品列表 -->
    <scroll-view scroll-y class="result-scroll" @scrolltolower="loadMore" v-if="productList.length > 0">
      <view class="product-grid">
        <view class="product-card" v-for="item in productList" :key="item.id" @click="gotoDetail(item.id)">
          <image :src="item.mainImage" class="product-image" mode="aspectFill" />
          <view class="product-info">
            <text class="product-name">{{ item.name }}</text>
            <text class="product-price">{{ formatPrice(item.minPrice) }}</text>
            <text v-if="item.salesCount" class="product-sales">{{ $t('product.sold') }}{{ item.salesCount }}</text>
          </view>
        </view>
      </view>

      <view v-if="loading" class="load-more">
        <text>{{ $t('common.loading') }}</text>
      </view>
      <view v-else-if="!hasMore && productList.length > 0" class="load-more">
        <text>{{ $t('common.noMore') }}</text>
      </view>
    </scroll-view>

    <!-- 空状态 -->
    <view class="empty-state" v-else-if="!loading">
      <text class="empty-text">{{ $t('search.noResult') }}</text>
      <button class="back-home" @click="goHome">{{ $t('search.backHome') }}</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { searchProducts } from '@/api/search'

const keyword = ref('')
const productList = ref<any[]>([])
const page = ref(1)
const pageSize = 20
const hasMore = ref(true)
const loading = ref(false)
const sortType = ref('default')

// 格式化价格
const formatPrice = (price: number) => {
  if (!price) return '₫0'
  return `₫${price.toLocaleString()}`
}

// 切换排序
const changeSort = (type: string) => {
  if (sortType.value === type) return
  sortType.value = type
  loadProducts(true)
}

// 加载商品
const loadProducts = async (reset = false) => {
  if (loading.value) return
  if (reset) {
    page.value = 1
    hasMore.value = true
    productList.value = []
  }
  if (!hasMore.value) return

  loading.value = true
  try {
    const res = await searchProducts({
      keyword: keyword.value,
      page: page.value,
      size: pageSize,
      sort: sortType.value !== 'default' ? sortType.value : undefined,
    })
    const newList = res.list || []
    if (newList.length < pageSize) {
      hasMore.value = false
    }
    if (reset) {
      productList.value = newList
    } else {
      productList.value.push(...newList)
    }
    page.value++
  } catch (err) {
    console.error('搜索失败', err)
    if (reset) {
      productList.value = getMockData()
      hasMore.value = false
    }
  } finally {
    loading.value = false
  }
}

// 加载更多
const loadMore = () => {
  if (!loading.value && hasMore.value) {
    loadProducts(false)
  }
}

// Mock 数据
const getMockData = () => {
  const list = []
  for (let i = 1; i <= 8; i++) {
    list.push({
      id: i,
      name: `${keyword.value} 商品${i}`,
      mainImage: `https://picsum.photos/200/200?random=${i}`,
      minPrice: Math.floor(Math.random() * 500000) + 50000,
      salesCount: Math.floor(Math.random() * 1000),
    })
  }
  return list
}

// 跳转详情
const gotoDetail = (id: number) => {
  uni.navigateTo({ url: `/pages/products/detail?id=${id}` })
}

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 回首页
const goHome = () => {
  uni.switchTab({ url: '/pages/index/index' })
}

onLoad((options: any) => {
  keyword.value = decodeURIComponent(options.keyword || '')
  loadProducts(true)
})
</script>

<style scoped lang="scss">
.result-container {
  background: #f5f5f5;
  min-height: 100vh;
}

/* 顶部栏 */
.result-header {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  background: #fff;
  gap: 16rpx;
}

.back-btn {
  font-size: 36rpx;
  color: #333;
  padding: 8rpx;
}

.result-title {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scope-badge {
  background: #ffebeb;
  color: #ff6b6b;
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  white-space: nowrap;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  background: #fff;
  padding: 20rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.filter-item {
  flex: 1;
  text-align: center;
  font-size: 26rpx;
  color: #666;
  padding: 12rpx 0;

  &.active {
    color: #ff6b6b;
    font-weight: bold;
  }
}

/* 商品网格 */
.result-scroll {
  height: calc(100vh - 180rpx);
}

.product-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 16rpx;
  gap: 16rpx;
}

.product-card {
  width: calc(50% - 8rpx);
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 320rpx;
}

.product-info {
  padding: 16rpx;
}

.product-name {
  font-size: 26rpx;
  color: #333;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  line-height: 1.4;
}

.product-price {
  font-size: 30rpx;
  color: #ff6b6b;
  font-weight: bold;
  display: block;
  margin-top: 8rpx;
}

.product-sales {
  font-size: 22rpx;
  color: #999;
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 30rpx;
  font-size: 26rpx;
  color: #999;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.back-home {
  background: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 60rpx;
  padding: 20rpx 60rpx;
  font-size: 28rpx;
}
</style>
