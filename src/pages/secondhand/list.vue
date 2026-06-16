<template>
  <view class="secondhand-container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <input
        v-model="keyword"
        type="text"
        :placeholder="$t('secondhand.searchPlaceholder')"
        confirm-type="search"
        @confirm="handleSearch"
      />
      <text class="search-btn" @click="handleSearch">{{ $t('common.search') }}</text>
    </view>

    <!-- 分类筛选 -->
    <scroll-view scroll-x class="category-bar" :show-scrollbar="false">
      <view
        class="category-item"
        :class="{ active: currentCategory === 0 }"
        @click="selectCategory(0)"
      >{{ $t('secondhand.all') }}</view>
      <view
        class="category-item"
        v-for="cat in categories"
        :key="cat.id"
        :class="{ active: currentCategory === cat.id }"
        @click="selectCategory(cat.id)"
      >{{ cat.name }}</view>
    </scroll-view>

    <!-- 商品列表 -->
    <scroll-view scroll-y class="list-scroll" @scrolltolower="loadMore" v-if="list.length > 0">
      <view class="secondhand-card" v-for="item in list" :key="item.id" @click="goToDetail(item.id)">
        <image :src="item.images?.[0] || '/static/placeholder.png'" class="card-image" mode="aspectFill" />
        <view class="card-info">
          <text class="card-title">{{ item.title }}</text>
          <text class="card-price">{{ formatPrice(item.price) }}</text>
          <view class="card-footer">
            <text class="card-user">{{ item.user?.nickname || $t('secondhand.anonymous') }}</text>
            <text class="card-city">{{ item.city || '' }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 空状态 -->
    <view class="empty-state" v-else-if="!loading">
      <text class="empty-text">{{ $t('secondhand.noData') }}</text>
    </view>

    <!-- 发布按钮 -->
    <button class="publish-btn" @click="goToPublish">+ {{ $t('secondhand.publish') }}</button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getSecondhandList } from '@/api/secondhand'

const keyword = ref('')
const list = ref<any[]>([])
const page = ref(1)
const pageSize = 20
const hasMore = ref(true)
const loading = ref(false)
const currentCategory = ref(0)
const categories = ref([
  { id: 1, name: '数码' },
  { id: 2, name: '家居' },
  { id: 3, name: '服饰' },
])

// 格式化价格
const formatPrice = (price: number) => {
  if (!price) return '₫0'
  return `₫${price.toLocaleString()}`
}

// 加载列表
const loadList = async (reset = false) => {
  if (loading.value) return
  if (reset) {
    page.value = 1
    hasMore.value = true
    list.value = []
  }
  if (!hasMore.value) return

  loading.value = true
  try {
    const params: any = {
      keyword: keyword.value,
      page: page.value,
      size: pageSize,
    }
    if (currentCategory.value) {
      params.categoryId = currentCategory.value
    }
    const res = await getSecondhandList(params)
    const newList = res.data?.list || []
    if (newList.length < pageSize) {
      hasMore.value = false
    }
    if (reset) {
      list.value = newList
    } else {
      list.value.push(...newList)
    }
    page.value++
  } catch (err) {
    console.error('加载失败', err)
    if (reset) {
      list.value = getMockData()
      hasMore.value = false
    }
  } finally {
    loading.value = false
  }
}

// 加载更多
const loadMore = () => {
  if (!loading.value && hasMore.value) {
    loadList(false)
  }
}

// 搜索
const handleSearch = () => {
  loadList(true)
}

// 选择分类
const selectCategory = (id: number) => {
  currentCategory.value = id
  loadList(true)
}

// 跳转详情
const goToDetail = (id: number) => {
  uni.navigateTo({ url: `/pages/secondhand/detail?id=${id}` })
}

// 跳转发布页
const goToPublish = () => {
  uni.navigateTo({ url: '/pages/secondhand/publish' })
}

// Mock 数据
const getMockData = () => {
  return [
    { id: 1, title: '二手 iPhone 12', price: 5000000, images: ['https://picsum.photos/200/200?random=1'], user: { nickname: '卖家A' }, city: '河内' },
    { id: 2, title: '二手洗衣机', price: 1500000, images: ['https://picsum.photos/200/200?random=2'], user: { nickname: '卖家B' }, city: '胡志明市' },
    { id: 3, title: '二手 MacBook Air', price: 12000000, images: ['https://picsum.photos/200/200?random=3'], user: { nickname: '卖家C' }, city: '河内' },
    { id: 4, title: '二手沙发', price: 800000, images: ['https://picsum.photos/200/200?random=4'], user: { nickname: '卖家D' }, city: '胡志明市' },
  ]
}

onLoad(() => {
  loadList(true)
})
</script>

<style scoped lang="scss">
.secondhand-container {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 20rpx 24rpx;
  gap: 20rpx;
}

.search-bar input {
  flex: 1;
  background: #f5f5f5;
  border-radius: 60rpx;
  padding: 20rpx 28rpx;
  font-size: 28rpx;
}

.search-btn {
  color: #ff6b6b;
  font-size: 28rpx;
}

/* 分类栏 */
.category-bar {
  white-space: nowrap;
  background: #fff;
  padding: 20rpx 0;
}

.category-item {
  display: inline-block;
  padding: 12rpx 32rpx;
  font-size: 28rpx;
  color: #666;
  margin: 0 8rpx;
  border-radius: 60rpx;

  &.active {
    background: #ff6b6b;
    color: #fff;
  }
}

/* 商品列表 */
.list-scroll {
  padding: 20rpx;
}

.secondhand-card {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.card-image {
  width: 200rpx;
  height: 200rpx;
}

.card-info {
  flex: 1;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-title {
  font-size: 30rpx;
  font-weight: bold;
}

.card-price {
  font-size: 32rpx;
  color: #ff6b6b;
  font-weight: bold;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  font-size: 24rpx;
  color: #999;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-text {
  color: #999;
  font-size: 28rpx;
}

/* 发布按钮 */
.publish-btn {
  position: fixed;
  bottom: 120rpx;
  right: 30rpx;
  background: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 60rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}
</style>
