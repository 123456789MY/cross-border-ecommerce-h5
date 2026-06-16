<template>
  <view class="product-list-container">
    <!-- 顶部筛选栏（白色卡片，选中项橙色+下划线） -->
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

    <!-- 商品列表（2列瀑布流，大图片卡片） -->
    <scroll-view scroll-y class="product-scroll" @scrolltolower="loadMore">
      <view class="product-grid">
        <view class="product-card" v-for="item in productList" :key="item.id" @click="gotoDetail(item.id)">
          <!-- 图片（圆角16rpx） -->
          <image :src="item.mainImage || '/static/placeholder.png'" class="product-image" mode="aspectFill" />
          <view class="product-info">
            <!-- 名称 -->
            <text class="product-name">{{ item.name }}</text>
            <!-- 标签（橙色背景胶囊） -->
            <view class="product-tags" v-if="item.tags && item.tags.length">
              <text class="product-tag" v-for="(tag, tIdx) in item.tags.slice(0, 2)" :key="tIdx">{{ tag }}</text>
            </view>
            <view class="product-tags" v-else>
              <text class="product-tag">热销</text>
            </view>
            <!-- 价格（橙色大字） + 销量 -->
            <view class="product-meta">
              <text class="product-price">{{ formatPrice(item.minPrice) }}</text>
              <text v-if="item.salesCount" class="product-sales">{{ $t('product.sold') }}{{ item.salesCount }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <view v-if="loading" class="load-more">
        <view class="loading-dots">
          <view class="dot"></view>
          <view class="dot"></view>
          <view class="dot"></view>
        </view>
        <text>{{ $t('common.loading') }}</text>
      </view>
      <view v-else-if="!hasMore && productList.length > 0" class="load-more">
        <view class="divider-line"></view>
        <text>{{ $t('common.noMore') }}</text>
        <view class="divider-line"></view>
      </view>
      <view v-else-if="!loading && productList.length === 0" class="empty-state">
        <view class="empty-icon">
          <text class="empty-emoji">📦</text>
        </view>
        <text class="empty-title">{{ $t('product.noData') }}</text>
        <text class="empty-subtitle">去看看其他商品吧</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getProductList } from '@/api/goods'

// 接收路由参数
const source = ref(0)       // 0=直营, 1=中国比价, 2=越南直销
const title = ref('')

// 列表数据
const productList = ref<any[]>([])
const page = ref(1)
const pageSize = 20
const hasMore = ref(true)
const loading = ref(false)

// 排序类型
const sortType = ref('default')

// 获取路由参数
onLoad((options: any) => {
  source.value = Number(options.source) || 0
  title.value = options.title || getTitleBySource(source.value)
  uni.setNavigationBarTitle({ title: title.value })
  loadProducts(true)
})

// 根据来源获取标题
const getTitleBySource = (src: number) => {
  const titles: Record<number, string> = {
    0: '比价直营',
    1: '比价中国',
    2: '越南直销',
  }
  return titles[src] || '商品列表'
}

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
    const params: any = {
      source: source.value,
      page: page.value,
      size: pageSize,
    }
    if (sortType.value !== 'default') {
      params.sort = sortType.value
    }

    const res = await getProductList(params)
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
    console.error('加载商品失败', err)
    // 临时使用 Mock 数据（无接口时）
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

// 跳转详情
const gotoDetail = (id: number) => {
  uni.navigateTo({ url: `/pages/products/detail?id=${id}` })
}

// Mock 数据（供接口未就绪时测试）
const getMockData = () => {
  const mockList = []
  for (let i = 1; i <= 10; i++) {
    mockList.push({
      id: i,
      name: `${title.value}商品${i}`,
      mainImage: `https://picsum.photos/200/200?random=${i}`,
      minPrice: Math.floor(Math.random() * 500000) + 50000,
      salesCount: Math.floor(Math.random() * 1000),
      tags: ['包邮', '正品保证'],
    })
  }
  return mockList
}
</script>

<style scoped lang="scss">
.product-list-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

/* 筛选栏（白色卡片，选中项橙色+下划线） */
.filter-bar {
  display: flex;
  background: #ffffff;
  padding: 24rpx 0;
  margin: 20rpx 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 10;
}

.filter-item {
  flex: 1;
  text-align: center;
  font-size: 28rpx;
  color: #666;
  position: relative;
  transition: all 0.3s ease;

  &.active {
    color: #ff5000;
    font-weight: 600;
  }

  &.active::after {
    content: '';
    position: absolute;
    bottom: -16rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 40rpx;
    height: 4rpx;
    background: #ff5000;
    border-radius: 2rpx;
  }
}

/* 商品列表 */
.product-scroll {
  flex: 1;
  padding: 0 24rpx 24rpx;
}

.product-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

/* 商品卡片（2列瀑布流，大图片卡片） */
.product-card {
  width: calc(50% - 12rpx);
  background: #ffffff;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;
}

/* 图片（圆角16rpx） */
.product-image {
  width: 100%;
  height: 360rpx;
  display: block;
  border-radius: 16rpx 16rpx 0 0;
}

.product-info {
  padding: 20rpx;
}

.product-name {
  font-size: 28rpx;
  color: #000;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  height: 76rpx;
  font-weight: 500;
}

/* 标签（橙色背景胶囊） */
.product-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 12rpx;
}

.product-tag {
  background: linear-gradient(90deg, #ff9000 0%, #ff5000 100%);
  color: #ffffff;
  font-size: 20rpx;
  padding: 4rpx 14rpx;
  border-radius: 60rpx;
}

/* 价格（橙色大字） + 销量 */
.product-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
}

.product-price {
  font-size: 36rpx;
  color: #ff5000;
  font-weight: bold;
}

.product-sales {
  font-size: 22rpx;
  color: #999;
}

/* 加载状态 */
.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
  color: #999;
  font-size: 26rpx;
  gap: 16rpx;
}

.loading-dots {
  display: flex;
  gap: 8rpx;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  background: #ff5000;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.divider-line {
  width: 60rpx;
  height: 1rpx;
  background: #e0e0e0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 160rpx 0;
}

.empty-icon {
  width: 160rpx;
  height: 160rpx;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  margin-bottom: 32rpx;
}

.empty-emoji {
  font-size: 72rpx;
}

.empty-title {
  color: #666;
  font-size: 30rpx;
  font-weight: 500;
  margin-bottom: 12rpx;
}

.empty-subtitle {
  color: #999;
  font-size: 26rpx;
}
</style>
