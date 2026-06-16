<template>
  <view class="hotel-page">
    <!-- 顶部橙色渐变头部 -->
    <view class="header">
      <view class="header-title">酒店预订</view>
    </view>

    <!-- 搜索卡片 -->
    <view class="search-card">
      <!-- 城市选择 -->
      <view class="form-row" @click="selectCity">
        <view class="form-label">
          <text class="icon">&#xe6b0;</text>
          目的地
        </view>
        <view class="form-value">
          <text class="city-name">{{ searchForm.city }}</text>
          <text class="arrow">&#xe6a3;</text>
        </view>
      </view>

      <view class="divider" />

      <!-- 入住日期 -->
      <view class="form-row" @click="selectCheckInDate">
        <view class="form-label">
          <text class="icon">&#xe6b1;</text>
          入住
        </view>
        <view class="form-value">
          <text class="date-text">{{ searchForm.checkInDate }}</text>
          <text class="week-text">{{ searchForm.checkInWeek }}</text>
          <text class="arrow">&#xe6a3;</text>
        </view>
      </view>

      <view class="divider" />

      <!-- 离店日期 -->
      <view class="form-row" @click="selectCheckOutDate">
        <view class="form-label">
          <text class="icon">&#xe6b2;</text>
          离店
        </view>
        <view class="form-value">
          <text class="date-text">{{ searchForm.checkOutDate }}</text>
          <text class="week-text">{{ searchForm.checkOutWeek }}</text>
          <text class="arrow">&#xe6a3;</text>
        </view>
      </view>

      <!-- 搜索按钮 -->
      <view class="search-btn" @click="onSearch">搜索酒店</view>
    </view>

    <!-- 热门酒店推荐 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">热门酒店推荐</text>
        <text class="section-more">更多 &#xe6a3;</text>
      </view>
      <scroll-view class="hotel-scroll" scroll-x show-scrollbar="false">
        <view v-for="hotel in hotHotels" :key="hotel.id" class="hotel-item">
          <image class="hotel-image" :src="hotel.image" mode="aspectFill" />
          <view class="hotel-name">{{ hotel.name }}</view>
          <view class="hotel-info">
            <text class="hotel-rating">{{ hotel.rating }}分</text>
            <text class="hotel-price">
              <text class="price-symbol">¥</text>
              {{ hotel.price }}
              <text class="price-unit">起</text>
            </text>
          </view>
          <view class="hotel-location">{{ hotel.location }}</view>
        </view>
      </scroll-view>
    </view>

    <!-- 提示信息 -->
    <view class="notice-card">
      <text class="notice-icon">&#xe6b3;</text>
      <view class="notice-content">
        <text class="notice-title">更多酒店即将上线</text>
        <text class="notice-desc">我们正在努力拓展更多优质酒店资源，敬请期待！</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface SearchForm {
  city: string
  checkInDate: string
  checkInWeek: string
  checkOutDate: string
  checkOutWeek: string
}

interface Hotel {
  id: number
  name: string
  image: string
  rating: number
  price: number
  location: string
}

const searchForm = ref<SearchForm>({
  city: '北京',
  checkInDate: '06月16日',
  checkInWeek: '今天',
  checkOutDate: '06月17日',
  checkOutWeek: '明天',
})

const hotHotels = ref<Hotel[]>([
  {
    id: 1,
    name: '北京王府半岛酒店',
    image: 'https://picsum.photos/300/200?random=21',
    rating: 4.9,
    price: 1288,
    location: '王府井',
  },
  {
    id: 2,
    name: '上海外滩华尔道夫',
    image: 'https://picsum.photos/300/200?random=22',
    rating: 4.8,
    price: 1588,
    location: '外滩',
  },
  {
    id: 3,
    name: '广州四季酒店',
    image: 'https://picsum.photos/300/200?random=23',
    rating: 4.9,
    price: 998,
    location: '珠江新城',
  },
  {
    id: 4,
    name: '深圳瑞吉酒店',
    image: 'https://picsum.photos/300/200?random=24',
    rating: 4.7,
    price: 888,
    location: '罗湖区',
  },
  {
    id: 5,
    name: '杭州西湖国宾馆',
    image: 'https://picsum.photos/300/200?random=25',
    rating: 4.8,
    price: 688,
    location: '西湖区',
  },
])

const selectCity = () => {
  uni.showToast({ title: '选择城市', icon: 'none' })
}

const selectCheckInDate = () => {
  uni.showToast({ title: '选择入住日期', icon: 'none' })
}

const selectCheckOutDate = () => {
  uni.showToast({ title: '选择离店日期', icon: 'none' })
}

const onSearch = () => {
  uni.showToast({ title: '搜索酒店', icon: 'none' })
}
</script>

<style scoped>
.hotel-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

/* 顶部头部 */
.header {
  background: linear-gradient(135deg, #ff5000 0%, #ff7a45 100%);
  padding: 80rpx 32rpx 80rpx;
  border-radius: 0 0 32rpx 32rpx;
}

.header-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
  text-align: center;
}

/* 搜索卡片 */
.search-card {
  background-color: #ffffff;
  margin: -40rpx 24rpx 24rpx;
  padding: 32rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
}

.form-label {
  display: flex;
  align-items: center;
  font-size: 30rpx;
  color: #333333;
  font-weight: 500;
}

.form-label .icon {
  margin-right: 16rpx;
  color: #ff5000;
  font-size: 32rpx;
}

.form-value {
  display: flex;
  align-items: center;
}

.city-name {
  font-size: 32rpx;
  color: #333333;
  font-weight: bold;
}

.date-text {
  font-size: 30rpx;
  color: #333333;
}

.week-text {
  font-size: 24rpx;
  color: #999999;
  margin-left: 12rpx;
}

.arrow {
  margin-left: 12rpx;
  color: #cccccc;
  font-size: 24rpx;
}

.divider {
  height: 1rpx;
  background-color: #f0f0f0;
  margin-left: 48rpx;
}

.search-btn {
  margin-top: 32rpx;
  background: linear-gradient(90deg, #ff5000 0%, #ff7a45 100%);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 500;
  text-align: center;
  padding: 28rpx 0;
  border-radius: 40rpx;
}

/* 热门推荐 */
.section {
  margin: 0 24rpx 24rpx;
  background-color: #ffffff;
  padding: 24rpx;
  border-radius: 16rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.section-more {
  font-size: 26rpx;
  color: #999999;
}

.hotel-scroll {
  white-space: nowrap;
}

.hotel-item {
  display: inline-block;
  width: 280rpx;
  margin-right: 20rpx;
  vertical-align: top;
}

.hotel-image {
  width: 280rpx;
  height: 180rpx;
  border-radius: 12rpx;
}

.hotel-name {
  font-size: 26rpx;
  color: #333333;
  font-weight: 500;
  margin-top: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hotel-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8rpx;
}

.hotel-rating {
  font-size: 24rpx;
  color: #ff5000;
  font-weight: 500;
}

.hotel-price {
  font-size: 28rpx;
  color: #ff5000;
  font-weight: bold;
}

.price-symbol {
  font-size: 22rpx;
}

.price-unit {
  font-size: 22rpx;
  color: #999999;
  font-weight: normal;
}

.hotel-location {
  font-size: 22rpx;
  color: #999999;
  margin-top: 4rpx;
}

/* 提示卡片 */
.notice-card {
  margin: 0 24rpx;
  background-color: #fff7e6;
  padding: 32rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: flex-start;
  border: 1rpx solid #ffd8bf;
}

.notice-icon {
  font-size: 48rpx;
  color: #ff5000;
  margin-right: 20rpx;
}

.notice-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.notice-title {
  font-size: 30rpx;
  color: #ff5000;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.notice-desc {
  font-size: 26rpx;
  color: #999999;
}
</style>
