<template>
  <view class="search-page">
    <!-- 固定头部（橙色渐变） -->
    <view class="fixed-header">
      <!-- 搜索框（白色圆角） -->
      <view class="search-box">
        <!-- 左侧：🔍 图标 -->
        <view class="search-left">
          <text class="search-icon">🔍</text>
        </view>

        <!-- 中间：输入区域 -->
        <view class="search-input-area">
          <input
            ref="inputRef"
            v-model="keyword"
            type="text"
            :placeholder="searchPlaceholder"
            placeholder-class="placeholder-class"
            confirm-type="search"
            @confirm="doSearch"
            @input="onInput"
            class="search-input"
          />
        </view>

        <!-- 右侧：📷 相机图标 -->
        <view class="search-right">
          <view class="camera-icon" @click="handleCameraSearch">
            <text>📷</text>
          </view>
        </view>
      </view>

      <!-- 当前范围标签 -->
      <view class="scope-tag" v-if="sourceType">
        <text class="scope-label">{{ $t('search.currentScope') }}：</text>
        <text class="scope-value">{{ getSourceName(sourceType) }}</text>
      </view>
    </view>

    <!-- 滚动内容区 -->
    <scroll-view scroll-y class="content-scroll">
      <!-- 分类快捷入口（横向滚动，白色胶囊，选中橙色） -->
      <scroll-view scroll-x class="category-row" :show-scrollbar="false">
        <view
          class="category-item"
          v-for="cat in categories"
          :key="cat.id"
          :class="{ active: activeCategory === cat.id }"
          @click="selectCategory(cat.id)"
        >
          <text class="cat-icon">{{ cat.icon }}</text>
          <text class="cat-name">{{ cat.name }}</text>
        </view>
      </scroll-view>

      <!-- 历史记录（标签组） -->
      <view class="card" v-if="historyList.length > 0 && !showSuggest">
        <view class="card-header">
          <text class="card-title">📜 历史记录</text>
          <text class="clear-link" @click="clearHistory">清空</text>
        </view>
        <view class="tag-group">
          <text
            class="tag"
            v-for="item in historyList"
            :key="item.keyword"
            @click="searchHistory(item.keyword)"
          >
            {{ item.keyword }}
          </text>
        </view>
      </view>

      <!-- 热门搜索（排名列表，前3名橙色） -->
      <view class="card" v-if="!showSuggest">
        <view class="card-header">
          <text class="card-title">🔥 热门搜索</text>
        </view>
        <view class="hot-list">
          <view
            class="hot-item"
            v-for="(item, idx) in hotList"
            :key="item"
            @click="searchHistory(item)"
          >
            <text class="hot-rank" :class="{ 'hot-rank-top': idx < 3 }">{{ idx + 1 }}</text>
            <text class="hot-name">{{ item }}</text>
            <text class="hot-fire" v-if="idx < 3">🔥</text>
          </view>
        </view>
      </view>

      <!-- 搜索建议列表 -->
      <view class="card" v-if="showSuggest && suggestList.length > 0">
        <view class="suggest-item" v-for="item in suggestList" :key="item" @click="searchHistory(item)">
          <text class="suggest-icon">🔍</text>
          <text class="suggest-text">{{ item }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 数据
const keyword = ref('')
const inputRef = ref<any>(null)
const showSuggest = ref(false)
const historyList = ref<any[]>([])
const sourceType = ref(0)
const activeCategory = ref(0)

// 分类数据
const categories = ref([
  { id: 0, name: '推荐', icon: '🔥' },
  { id: 1, name: '咖啡', icon: '☕' },
  { id: 2, name: '腰果', icon: '🥜' },
  { id: 3, name: '水果', icon: '🍎' },
  { id: 4, name: '工艺品', icon: '🏺' },
  { id: 5, name: '服装', icon: '👕' },
  { id: 6, name: '美妆', icon: '💄' },
])

// 热门搜索
const hotList = ref(['越南咖啡', '越南腰果', '越南拖鞋', '越南香水', '越南水果', '越南工艺品'])

// 搜索建议
const suggestList = ref<string[]>([])

// 根据 source 获取占位符
const searchPlaceholder = computed(() => {
  const map: Record<number, string> = {
    0: '搜索商品',
    1: '搜索直营商品',
    2: '搜索中国比价商品',
    3: '搜索越南商品',
  }
  return map[sourceType.value] || '搜索商品'
})

// 获取来源名称
const getSourceName = (type: number) => {
  const map: Record<number, string> = {
    0: '比价直营',
    1: '比价中国',
    2: '越南直销',
    3: '二手交易',
  }
  return map[type] || '全部'
}

// 加载历史
const loadHistory = () => {
  const history = uni.getStorageSync('search_history') || []
  historyList.value = history.slice(0, 10)
}

// 保存历史
const saveHistory = (kw: string) => {
  if (!kw.trim()) return
  let history = uni.getStorageSync('search_history') || []
  history = history.filter((item: any) => item.keyword !== kw)
  history.unshift({ keyword: kw, source: sourceType.value, time: Date.now() })
  if (history.length > 10) history = history.slice(0, 10)
  uni.setStorageSync('search_history', history)
  loadHistory()
}

// 清空历史
const clearHistory = () => {
  uni.showModal({
    title: '提示',
    content: '确定清空搜索历史吗？',
    success: (res: any) => {
      if (res.confirm) {
        uni.removeStorageSync('search_history')
        loadHistory()
      }
    },
  })
}

// 执行搜索
const doSearch = () => {
  if (!keyword.value.trim()) return
  saveHistory(keyword.value)
  uni.navigateTo({
    url: `/pages/search/result?keyword=${encodeURIComponent(keyword.value)}&source=${sourceType.value}`,
  })
}

// 点击历史/热门
const searchHistory = (kw: string) => {
  keyword.value = kw
  doSearch()
}

// 扫一扫
const handleScan = () => {
  uni.scanCode({
    onlyFromCamera: true,
    scanType: ['barCode', 'qrCode'],
    success: (res: any) => {
      keyword.value = res.result
      doSearch()
    },
    fail: () => uni.showToast({ title: '扫码失败', icon: 'none' }),
  })
}

// 拍照识图
const handleCameraSearch = () => {
  uni.chooseImage({
    count: 1,
    sourceType: ['camera'],
    success: (res: any) => {
      uni.showLoading({ title: '识别中...' })
      setTimeout(() => {
        uni.hideLoading()
        keyword.value = '越南咖啡'
        doSearch()
      }, 1500)
    },
    fail: () => {
      uni.showToast({ title: '拍照失败', icon: 'none' })
    },
  })
}

// 选择分类
const selectCategory = (id: number) => {
  activeCategory.value = id
  const cat = categories.value.find(c => c.id === id)
  if (cat && cat.name !== '推荐') {
    keyword.value = cat.name
    doSearch()
  }
}

// 输入联想
const onInput = () => {
  if (keyword.value.trim()) {
    showSuggest.value = true
    suggestList.value = [`${keyword.value}咖啡`, `${keyword.value}腰果`, `${keyword.value}特产`].filter(i => i !== keyword.value)
  } else {
    showSuggest.value = false
  }
}

onLoad((options: any) => {
  sourceType.value = Number(options.source) || 0
  loadHistory()
  nextTick(() => {
    setTimeout(() => inputRef.value?.focus(), 300)
  })
})
</script>

<style scoped lang="scss">
/* ========== 页面根 ========== */
.search-page {
  background: #f5f5f5;
  min-height: 100vh;
}

/* ========== 固定头部（橙色渐变） ========== */
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: linear-gradient(90deg, #ff9000 0%, #ff5000 100%);
  padding: calc(var(--status-bar-height, 44px) + 20rpx) 30rpx 40rpx;
  border-radius: 0 0 40rpx 40rpx;
}

/* ========== 搜索框（白色圆角） ========== */
.search-box {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 60rpx;
  padding: 12rpx 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

/* 左侧：🔍 图标 */
.search-left {
  margin-right: 12rpx;
}

.search-icon {
  font-size: 32rpx;
  color: #999;
}

/* 中间：输入区域 */
.search-input-area {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 0 12rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  height: 56rpx;
  color: #333;
}

.placeholder-class {
  color: #999;
}

/* 右侧：📷 相机图标 */
.search-right {
  margin-left: 12rpx;
}

.camera-icon {
  width: 56rpx;
  height: 56rpx;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

/* ========== 当前范围标签 ========== */
.scope-tag {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  background: rgba(255, 255, 255, 0.2);
  padding: 12rpx 24rpx;
  border-radius: 60rpx;
}

.scope-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.scope-value {
  font-size: 24rpx;
  color: #ffffff;
  font-weight: bold;
}

/* ========== 滚动内容区 ========== */
.content-scroll {
  padding-top: calc(var(--status-bar-height, 44px) + 240rpx);
  padding-left: 30rpx;
  padding-right: 30rpx;
  padding-bottom: 60rpx;
}

/* ========== 分类快捷入口（横向滚动，白色胶囊，选中橙色） ========== */
.category-row {
  white-space: nowrap;
  margin-bottom: 24rpx;
}

.category-item {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  background: #ffffff;
  padding: 16rpx 32rpx;
  border-radius: 60rpx;
  margin-right: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

  &.active {
    background: linear-gradient(90deg, #ff9000 0%, #ff5000 100%);
  }

  &.active .cat-name {
    color: #ffffff;
  }

  &.active .cat-icon {
    color: #ffffff;
  }
}

.cat-icon {
  font-size: 28rpx;
}

.cat-name {
  font-size: 26rpx;
  color: #333;
}

/* ========== 卡片通用 ========== */
.card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #000;
}

.clear-link {
  font-size: 24rpx;
  color: #999;
}

/* ========== 历史记录（标签组） ========== */
.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.tag {
  background: #f5f5f5;
  padding: 16rpx 28rpx;
  border-radius: 60rpx;
  font-size: 26rpx;
  color: #666;
}

/* ========== 热门搜索（排名列表，前3名橙色） ========== */
.hot-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.hot-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.hot-rank {
  width: 44rpx;
  height: 44rpx;
  background: #e8e8e8;
  border-radius: 12rpx;
  text-align: center;
  line-height: 44rpx;
  font-size: 24rpx;
  color: #666;
}

.hot-rank-top {
  background: #ff5000;
  color: #ffffff;
}

.hot-name {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.hot-fire {
  font-size: 32rpx;
}

/* ========== 搜索建议列表 ========== */
.suggest-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.suggest-icon {
  font-size: 32rpx;
  color: #999;
}

.suggest-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}
</style>
