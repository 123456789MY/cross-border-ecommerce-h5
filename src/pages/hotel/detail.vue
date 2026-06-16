<template>
  <view class="hotel-detail-page">
    <!-- 顶部图片区 -->
    <view class="header-section">
      <swiper class="hotel-swiper" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="500" circular>
        <swiper-item v-for="(img, index) in hotel.images" :key="index">
          <image class="swiper-image" :src="img" mode="aspectFill" />
        </swiper-item>
      </swiper>
      <view class="back-btn" @click="goBack">
        <text class="back-icon">&#xe679;</text>
      </view>
    </view>

    <!-- 酒店信息卡片 -->
    <view class="info-card card">
      <view class="hotel-name">{{ hotel.name }}</view>
      <view class="hotel-stars">
        <text class="star" v-for="n in hotel.stars" :key="n">⭐</text>
      </view>
      <view class="hotel-rating">
        <text class="score">{{ hotel.score }}分</text>
        <text class="comment-count">{{ hotel.commentCount }}条评价</text>
      </view>
      <view class="hotel-address" @click="openMap">
        <text class="address-text">{{ hotel.address }}</text>
        <view class="map-btn">
          <text class="map-icon">🗺️</text>
          <text>地图</text>
        </view>
      </view>
      <view class="hotel-year">
        <text v-if="hotel.openYear">{{ hotel.openYear }}年开业</text>
        <text v-if="hotel.renovateYear" class="renovate">{{ hotel.renovateYear }}年装修</text>
      </view>
    </view>

    <!-- 设施服务 -->
    <view class="facilities-card card">
      <view class="section-title">设施服务</view>
      <scroll-view class="facilities-scroll" scroll-x="true" show-scrollbar="false">
        <view class="facilities-list">
          <view class="facility-item" v-for="(item, index) in displayedFacilities" :key="index">
            <view class="facility-icon">{{ item.icon }}</view>
            <text class="facility-name">{{ item.name }}</text>
          </view>
        </view>
      </scroll-view>
      <view class="all-facilities-btn" @click="showAllFacilities">
        <text>全部设施</text>
        <text class="arrow">›</text>
      </view>
    </view>

    <!-- 房型列表 -->
    <view class="rooms-card card">
      <view class="section-title">房型列表</view>
      <view class="room-list">
        <view class="room-item" v-for="(room, index) in hotel.rooms" :key="index">
          <image class="room-image" :src="room.image" mode="aspectFill" />
          <view class="room-info">
            <view class="room-name">{{ room.name }}</view>
            <view class="room-tags">
              <text class="tag">{{ room.bedType }}</text>
              <text class="tag">{{ room.area }}㎡</text>
              <text class="tag">{{ room.window }}</text>
              <text class="tag" v-if="room.breakfast">含早</text>
            </view>
            <view class="room-bottom">
              <view class="room-price">
                <text class="price-symbol">¥</text>
                <text class="price-num">{{ room.price }}</text>
                <text class="price-unit">/晚</text>
              </view>
              <view class="book-btn" @click="bookRoom(room)">预订</view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 酒店介绍 -->
    <view class="intro-card card">
      <view class="section-title">酒店介绍</view>
      <view class="intro-text">{{ hotel.introduction }}</view>
      <view class="surround-title">周边信息</view>
      <view class="surround-text">{{ hotel.surroundInfo }}</view>
    </view>

    <!-- 底部占位 -->
    <view class="bottom-placeholder"></view>

    <!-- 底部固定栏 -->
    <view class="bottom-bar">
      <view class="bar-left">
        <view class="action-btn" @click="toggleFavorite">
          <text class="action-icon">{{ isFavorite ? '❤️' : '🤍' }}</text>
          <text class="action-text">收藏</text>
        </view>
        <view class="action-btn" @click="shareHotel">
          <text class="action-icon">📤</text>
          <text class="action-text">分享</text>
        </view>
      </view>
      <view class="bar-right">
        <view class="book-now-btn" @click="bookNow">立即预订</view>
      </view>
    </view>

    <!-- 全部设施弹窗 -->
    <uni-popup ref="facilitiesPopup" type="bottom">
      <view class="facilities-popup">
        <view class="popup-header">
          <text class="popup-title">全部设施</text>
          <text class="popup-close" @click="closeFacilities">✕</text>
        </view>
        <scroll-view class="popup-body" scroll-y="true">
          <view class="popup-facility-item" v-for="(item, index) in hotel.facilities" :key="index">
            <text class="popup-facility-icon">{{ item.icon }}</text>
            <text class="popup-facility-name">{{ item.name }}</text>
          </view>
        </scroll-view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

interface Facility {
  name: string
  icon: string
}

interface Room {
  id: string
  name: string
  image: string
  bedType: string
  area: number
  window: string
  breakfast: boolean
  price: number
}

interface Hotel {
  id: string
  name: string
  images: string[]
  stars: number
  score: number
  commentCount: number
  address: string
  openYear?: number
  renovateYear?: number
  facilities: Facility[]
  rooms: Room[]
  introduction: string
  surroundInfo: string
}

const hotelId = ref('')
const isFavorite = ref(false)
const facilitiesPopup = ref<any>(null)

const hotel = ref<Hotel>({
  id: '',
  name: '',
  images: [],
  stars: 5,
  score: 0,
  commentCount: 0,
  address: '',
  facilities: [],
  rooms: [],
  introduction: '',
  surroundInfo: ''
})

const displayedFacilities = computed(() => {
  return hotel.value.facilities.slice(0, 8)
})

// Mock 数据
const mockHotelData: Record<string, Hotel> = {
  '1': {
    id: '1',
    name: '杭州西湖希尔顿酒店',
    images: [
      'https://picsum.photos/400/300?random=1',
      'https://picsum.photos/400/300?random=2',
      'https://picsum.photos/400/300?random=3'
    ],
    stars: 5,
    score: 4.8,
    commentCount: 2341,
    address: '杭州市西湖区龙井路1号',
    openYear: 2015,
    renovateYear: 2022,
    facilities: [
      { name: 'WiFi', icon: '📶' },
      { name: '停车场', icon: '🅿️' },
      { name: '餐厅', icon: '🍽️' },
      { name: '健身房', icon: '💪' },
      { name: '游泳池', icon: '🏊' },
      { name: 'SPA', icon: '💆' },
      { name: '会议室', icon: '📊' },
      { name: '接送机', icon: '🚗' },
      { name: '洗衣服务', icon: '👕' },
      { name: '商务中心', icon: '💼' },
      { name: '酒吧', icon: '🍸' },
      { name: '儿童乐园', icon: '🎠' }
    ],
    rooms: [
      {
        id: 'r1',
        name: '豪华大床房',
        image: 'https://picsum.photos/200/150?random=4',
        bedType: '大床',
        area: 35,
        window: '有窗',
        breakfast: true,
        price: 688
      },
      {
        id: 'r2',
        name: '行政双床房',
        image: 'https://picsum.photos/200/150?random=5',
        bedType: '双床',
        area: 40,
        window: '有窗',
        breakfast: true,
        price: 788
      },
      {
        id: 'r3',
        name: '湖景套房',
        image: 'https://picsum.photos/200/150?random=6',
        bedType: '大床',
        area: 65,
        window: '湖景',
        breakfast: true,
        price: 1288
      },
      {
        id: 'r4',
        name: '标准单人房',
        image: 'https://picsum.photos/200/150?random=7',
        bedType: '单人床',
        area: 25,
        window: '有窗',
        breakfast: false,
        price: 388
      }
    ],
    introduction: '杭州西湖希尔顿酒店坐落于风景秀丽的西湖景区，毗邻龙井茶园，环境优美，交通便利。酒店拥有各类豪华客房，配备现代化设施，为您提供舒适惬意的入住体验。',
    surroundInfo: '距离西湖风景区约2公里，距离灵隐寺约5公里，周边有多个购物中心和特色餐厅。'
  },
  '2': {
    id: '2',
    name: '上海外滩W酒店',
    images: [
      'https://picsum.photos/400/300?random=8',
      'https://picsum.photos/400/300?random=9',
      'https://picsum.photos/400/300?random=10'
    ],
    stars: 5,
    score: 4.9,
    commentCount: 5678,
    address: '上海市黄浦区中山东一路',
    openYear: 2017,
    facilities: [
      { name: 'WiFi', icon: '📶' },
      { name: '停车场', icon: '🅿️' },
      { name: '餐厅', icon: '🍽️' },
      { name: '健身房', icon: '💪' },
      { name: '游泳池', icon: '🏊' },
      { name: 'SPA', icon: '💆' },
      { name: '会议室', icon: '📊' },
      { name: '酒吧', icon: '🍸' }
    ],
    rooms: [
      {
        id: 'r1',
        name: '奇妙客房',
        image: 'https://picsum.photos/200/150?random=11',
        bedType: '大床',
        area: 38,
        window: '城景',
        breakfast: false,
        price: 1588
      },
      {
        id: 'r2',
        name: '外滩景观房',
        image: 'https://picsum.photos/200/150?random=12',
        bedType: '大床',
        area: 45,
        window: '江景',
        breakfast: true,
        price: 2288
      }
    ],
    introduction: '上海外滩W酒店位于外滩核心地段，拥有绝佳的黄浦江景观。酒店设计时尚前卫，融合上海本土文化元素，是商务出行和休闲度假的理想选择。',
    surroundInfo: '步行可达外滩、南京路步行街，距离豫园约1.5公里，周边高端商场林立。'
  }
}

onLoad((options: any) => {
  hotelId.value = options.hotelId || '1'
  loadHotelData()
})

function loadHotelData() {
  const data = mockHotelData[hotelId.value]
  if (data) {
    hotel.value = data
  } else {
    hotel.value = mockHotelData['1']
  }
}

function goBack() {
  uni.navigateBack()
}

function openMap() {
  uni.openLocation({
    latitude: 30.25,
    longitude: 120.15,
    name: hotel.value.name,
    address: hotel.value.address
  })
}

function showAllFacilities() {
  facilitiesPopup.value?.open()
}

function closeFacilities() {
  facilitiesPopup.value?.close()
}

function bookRoom(room: Room) {
  uni.navigateTo({
    url: `/pages/hotel/booking?hotelId=${hotel.value.id}&roomId=${room.id}`
  })
}

function toggleFavorite() {
  isFavorite.value = !isFavorite.value
  uni.showToast({
    title: isFavorite.value ? '已收藏' : '已取消收藏',
    icon: 'none'
  })
}

function shareHotel() {
  uni.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline']
  })
}

function bookNow() {
  if (hotel.value.rooms.length > 0) {
    bookRoom(hotel.value.rooms[0])
  }
}
</script>

<style scoped>
.hotel-detail-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 卡片通用样式 */
.card {
  background-color: #ffffff;
  border-radius: 16rpx;
  margin: 20rpx;
  padding: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20rpx;
}

/* 顶部图片区 */
.header-section {
  position: relative;
  width: 100%;
}

.hotel-swiper {
  width: 100%;
  height: 400rpx;
}

.swiper-image {
  width: 100%;
  height: 400rpx;
}

.back-btn {
  position: absolute;
  top: 40rpx;
  left: 20rpx;
  width: 64rpx;
  height: 64rpx;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.back-icon {
  color: #ffffff;
  font-size: 36rpx;
  font-family: 'iconfont';
}

/* 酒店信息卡片 */
.hotel-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 12rpx;
}

.hotel-stars {
  margin-bottom: 12rpx;
}

.star {
  font-size: 28rpx;
  margin-right: 4rpx;
}

.hotel-rating {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.score {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff5000;
  margin-right: 16rpx;
}

.comment-count {
  font-size: 24rpx;
  color: #999999;
}

.hotel-address {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.address-text {
  font-size: 26rpx;
  color: #666666;
  flex: 1;
  margin-right: 20rpx;
}

.map-btn {
  display: flex;
  align-items: center;
  padding: 8rpx 16rpx;
  background-color: #fff0e6;
  border-radius: 24rpx;
  font-size: 24rpx;
  color: #ff5000;
}

.map-icon {
  margin-right: 4rpx;
}

.hotel-year {
  font-size: 24rpx;
  color: #999999;
}

.renovate {
  margin-left: 20rpx;
}

/* 设施服务 */
.facilities-scroll {
  white-space: nowrap;
  margin-bottom: 16rpx;
}

.facilities-list {
  display: flex;
  flex-direction: row;
}

.facility-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 40rpx;
  min-width: 80rpx;
}

.facility-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.facility-name {
  font-size: 22rpx;
  color: #666666;
}

.all-facilities-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
  font-size: 26rpx;
  color: #666666;
}

.arrow {
  margin-left: 8rpx;
  font-size: 32rpx;
  color: #999999;
}

/* 房型列表 */
.room-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.room-item {
  display: flex;
  background-color: #fafafa;
  border-radius: 12rpx;
  overflow: hidden;
  padding: 16rpx;
}

.room-image {
  width: 180rpx;
  height: 140rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.room-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.room-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
}

.room-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 8rpx;
}

.tag {
  font-size: 20rpx;
  color: #666666;
  background-color: #f0f0f0;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.room-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12rpx;
}

.room-price {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 24rpx;
  color: #ff5000;
}

.price-num {
  font-size: 40rpx;
  font-weight: bold;
  color: #ff5000;
}

.price-unit {
  font-size: 22rpx;
  color: #999999;
  margin-left: 4rpx;
}

.book-btn {
  background: linear-gradient(90deg, #ff9000 0%, #ff5000 100%);
  color: #ffffff;
  font-size: 26rpx;
  padding: 12rpx 32rpx;
  border-radius: 28rpx;
  font-weight: bold;
}

/* 酒店介绍 */
.intro-text {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.8;
  margin-bottom: 20rpx;
}

.surround-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 12rpx;
}

.surround-text {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.8;
}

/* 底部占位 */
.bottom-placeholder {
  height: 120rpx;
}

/* 底部固定栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.bar-left {
  display: flex;
  gap: 40rpx;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.action-icon {
  font-size: 36rpx;
  margin-bottom: 2rpx;
}

.action-text {
  font-size: 20rpx;
  color: #666666;
}

.bar-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  margin-left: 30rpx;
}

.book-now-btn {
  background: linear-gradient(90deg, #ff9000 0%, #ff5000 100%);
  color: #ffffff;
  font-size: 30rpx;
  font-weight: bold;
  padding: 20rpx 60rpx;
  border-radius: 40rpx;
  text-align: center;
}

/* 弹窗 */
.facilities-popup {
  background-color: #ffffff;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 60vh;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx;
  position: relative;
  border-bottom: 1rpx solid #f0f0f0;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.popup-close {
  position: absolute;
  right: 30rpx;
  font-size: 32rpx;
  color: #999999;
}

.popup-body {
  padding: 20rpx 30rpx;
  max-height: 50vh;
}

.popup-facility-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.popup-facility-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.popup-facility-name {
  font-size: 28rpx;
  color: #333333;
}
</style>
