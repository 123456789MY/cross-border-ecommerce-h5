<template>
  <view class="train-page">
    <!-- 顶部橙色渐变头部 -->
    <view class="header">
      <view class="header-title">火车票</view>
    </view>

    <!-- 搜索卡片 -->
    <view class="search-card">
      <!-- 出发站 -->
      <view class="station-row">
        <view class="station-item" @click="selectDeparture">
          <text class="station-label">出发</text>
          <text class="station-name">{{ searchForm.departure }}</text>
        </view>
        <view class="exchange-btn" @click="exchangeStation">
          <text class="exchange-icon">&#xe6b4;</text>
        </view>
        <view class="station-item" @click="selectArrival">
          <text class="station-label">到达</text>
          <text class="station-name">{{ searchForm.arrival }}</text>
        </view>
      </view>

      <view class="divider" />

      <!-- 出发日期 -->
      <view class="form-row" @click="selectDate">
        <view class="form-label">
          <text class="icon">&#xe6b1;</text>
          出发日期
        </view>
        <view class="form-value">
          <text class="date-text">{{ searchForm.date }}</text>
          <text class="week-text">{{ searchForm.week }}</text>
          <text class="arrow">&#xe6a3;</text>
        </view>
      </view>

      <!-- 搜索按钮 -->
      <view class="search-btn" @click="onSearch">查询车票</view>
    </view>

    <!-- 热门线路推荐 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">热门线路推荐</text>
      </view>
      <view class="route-list">
        <view v-for="route in hotRoutes" :key="route.id" class="route-item">
          <view class="route-info">
            <view class="route-stations">
              <text class="station">{{ route.from }}</text>
              <view class="route-arrow">
                <text class="arrow-line">----</text>
                <text class="arrow-icon">&#xe6b5;</text>
                <text class="arrow-line">----</text>
              </view>
              <text class="station">{{ route.to }}</text>
            </view>
            <view class="route-meta">
              <text class="train-type">{{ route.type }}</text>
              <text class="duration">{{ route.duration }}</text>
            </view>
          </view>
          <view class="route-price">
            <text class="price-symbol">¥</text>
            <text class="price-num">{{ route.price }}</text>
            <text class="price-unit">起</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 提示信息 -->
    <view class="notice-card">
      <text class="notice-icon">&#xe6b3;</text>
      <view class="notice-content">
        <text class="notice-title">火车票功能即将上线</text>
        <text class="notice-desc">我们正在与铁路12306对接，火车票预订功能即将开放，敬请期待！</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface SearchForm {
  departure: string
  arrival: string
  date: string
  week: string
}

interface Route {
  id: number
  from: string
  to: string
  type: string
  duration: string
  price: number
}

const searchForm = ref<SearchForm>({
  departure: '北京',
  arrival: '上海',
  date: '06月16日',
  week: '今天',
})

const hotRoutes = ref<Route[]>([
  {
    id: 1,
    from: '北京',
    to: '上海',
    type: 'G高铁',
    duration: '4小时28分',
    price: 553,
  },
  {
    id: 2,
    from: '北京',
    to: '广州',
    type: 'G高铁',
    duration: '8小时15分',
    price: 862,
  },
  {
    id: 3,
    from: '上海',
    to: '杭州',
    type: 'G高铁',
    duration: '45分钟',
    price: 73,
  },
  {
    id: 4,
    from: '广州',
    to: '深圳',
    type: 'G高铁',
    duration: '29分钟',
    price: 75,
  },
  {
    id: 5,
    from: '北京',
    to: '西安',
    type: 'G高铁',
    duration: '4小时30分',
    price: 515,
  },
  {
    id: 6,
    from: '成都',
    to: '重庆',
    type: 'G高铁',
    duration: '1小时30分',
    price: 146,
  },
])

const selectDeparture = () => {
  uni.showToast({ title: '选择出发站', icon: 'none' })
}

const selectArrival = () => {
  uni.showToast({ title: '选择到达站', icon: 'none' })
}

const exchangeStation = () => {
  const temp = searchForm.value.departure
  searchForm.value.departure = searchForm.value.arrival
  searchForm.value.arrival = temp
}

const selectDate = () => {
  uni.showToast({ title: '选择出发日期', icon: 'none' })
}

const onSearch = () => {
  uni.showToast({ title: '查询车票', icon: 'none' })
}
</script>

<style scoped>
.train-page {
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

/* 车站选择 */
.station-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
}

.station-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.station-label {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 8rpx;
}

.station-name {
  font-size: 44rpx;
  color: #333333;
  font-weight: bold;
}

.exchange-btn {
  width: 72rpx;
  height: 72rpx;
  background-color: #fff7e6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 24rpx;
}

.exchange-icon {
  font-size: 32rpx;
  color: #ff5000;
}

.divider {
  height: 1rpx;
  background-color: #f0f0f0;
  margin: 16rpx 0;
}

/* 表单行 */
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

/* 搜索按钮 */
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

/* 热门线路 */
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

.route-list {
  display: flex;
  flex-direction: column;
}

.route-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.route-item:last-child {
  border-bottom: none;
}

.route-info {
  flex: 1;
}

.route-stations {
  display: flex;
  align-items: center;
}

.route-stations .station {
  font-size: 30rpx;
  color: #333333;
  font-weight: 500;
}

.route-arrow {
  display: flex;
  align-items: center;
  margin: 0 16rpx;
}

.arrow-line {
  font-size: 20rpx;
  color: #cccccc;
  letter-spacing: 2rpx;
}

.arrow-icon {
  font-size: 24rpx;
  color: #999999;
  margin: 0 8rpx;
}

.route-meta {
  display: flex;
  align-items: center;
  margin-top: 8rpx;
}

.train-type {
  font-size: 22rpx;
  color: #ff5000;
  background-color: #fff7e6;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  margin-right: 12rpx;
}

.duration {
  font-size: 22rpx;
  color: #999999;
}

.route-price {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 22rpx;
  color: #ff5000;
}

.price-num {
  font-size: 36rpx;
  color: #ff5000;
  font-weight: bold;
}

.price-unit {
  font-size: 22rpx;
  color: #999999;
  margin-left: 4rpx;
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
