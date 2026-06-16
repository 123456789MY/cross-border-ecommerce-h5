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
          <view class="facility-item" v-for="(item, index) in displayedFacilities" :key="index" @click="showFacilityDetail(item)" @tap="showFacilityDetail(item)">
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
          <!-- 房型头部：可点击展开 -->
          <view class="room-header" @click="toggleRoomDetail(index)">
            <image class="room-image" :src="room.image" mode="aspectFill" />
            <view class="room-info">
              <view class="room-name">{{ room.name }}</view>
              <view class="room-tags">
                <text class="tag">{{ room.bedType }}</text>
                <text class="tag">{{ room.area }}㎡</text>
                <text class="tag">{{ room.window }}</text>
                <text class="tag" v-if="room.breakfast">含早</text>
              </view>
              <view class="room-meta">
                <text class="meta-text">{{ room.capacity }} · {{ room.floor }}</text>
              </view>
              <view class="room-bottom">
                <view class="room-price">
                  <text class="price-symbol">¥</text>
                  <text class="price-num">{{ room.price }}</text>
                  <text class="price-unit">/晚</text>
                </view>
                <view class="detail-toggle">
                  <text class="detail-text">{{ expandedRooms[index] ? '收起详情' : '查看详情' }}</text>
                  <text class="detail-arrow" :class="{ 'arrow-up': expandedRooms[index] }">▼</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 房型详情展开区 -->
          <view class="room-detail" v-if="expandedRooms[index]">
            <!-- 房间图片轮播 -->
            <view class="room-image-swiper-wrapper">
              <swiper class="room-image-swiper" :indicator-dots="true" :autoplay="false" circular>
                <swiper-item v-for="(img, imgIndex) in room.images" :key="imgIndex">
                  <image class="room-swiper-image" :src="img" mode="aspectFill" />
                </swiper-item>
              </swiper>
            </view>

            <!-- 房间信息 -->
            <view class="room-detail-info">
              <view class="detail-row">
                <text class="detail-label">楼层</text>
                <text class="detail-value">{{ room.floor }}</text>
              </view>
              <view class="detail-row">
                <text class="detail-label">可住人数</text>
                <text class="detail-value">{{ room.capacity }}</text>
              </view>
              <view class="detail-row">
                <text class="detail-label">卫浴</text>
                <text class="detail-value">{{ room.bathroom }}</text>
              </view>
            </view>

            <!-- 房间设施 -->
            <view class="room-facilities">
              <view class="detail-section-title">房间设施</view>
              <view class="room-facility-tags">
                <text class="room-facility-tag" v-for="(fac, fIndex) in room.facilities" :key="fIndex">{{ fac }}</text>
              </view>
            </view>

            <!-- 政策信息 -->
            <view class="room-policies">
              <view class="detail-section-title">入住政策</view>
              <text class="policy-text">{{ room.policy }}</text>
              <view class="detail-section-title" style="margin-top: 16rpx;">退改政策</view>
              <text class="policy-text">{{ room.cancelPolicy }}</text>
            </view>

            <!-- 预订按钮 -->
            <view class="room-detail-book">
              <view class="book-btn" @click="bookRoom(room)">立即预订</view>
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

    <!-- 客户点评 -->
    <view class="review-card card">
      <view class="review-header">
        <view class="section-title">客户点评</view>
        <view class="review-summary">
          <text class="review-score">{{ hotel.score }}</text>
          <text class="review-score-label">分</text>
          <text class="review-total">（{{ hotel.commentCount }}条评价）</text>
        </view>
      </view>

      <!-- 评分维度 -->
      <view class="rating-dimensions">
        <view class="rating-item" v-for="dim in ratingDimensions" :key="dim.label">
          <text class="rating-label">{{ dim.label }}</text>
          <view class="rating-bar-bg">
            <view class="rating-bar-fill" :style="{ width: dim.score * 20 + '%' }"></view>
          </view>
          <text class="rating-value">{{ dim.score.toFixed(1) }}</text>
        </view>
      </view>

      <!-- 标签筛选 -->
      <view class="review-tags">
        <view
          class="review-tag"
          :class="{ active: reviewFilter === tag }"
          v-for="tag in reviewTagOptions"
          :key="tag"
          @click="reviewFilter = tag"
        >
          {{ tag }}
        </view>
      </view>

      <!-- 点评列表 -->
      <view class="review-list">
        <view class="review-item" v-for="(review, index) in filteredReviews" :key="index">
          <view class="review-user">
            <image class="user-avatar" :src="review.avatar" mode="aspectFill" />
            <view class="user-info">
              <text class="user-name">{{ review.username }}</text>
              <view class="user-meta">
                <text class="review-date">{{ review.date }}</text>
                <text class="room-type">{{ review.roomType }}</text>
              </view>
            </view>
            <view class="user-score">
              <text class="user-score-num">{{ review.score }}</text>
              <text class="user-score-label">分</text>
            </view>
          </view>
          <view class="review-content">{{ review.content }}</view>
          <view class="review-images" v-if="review.images && review.images.length > 0">
            <image
              v-for="(img, imgIdx) in review.images"
              :key="imgIdx"
              class="review-img"
              :src="img"
              mode="aspectFill"
              @click="previewReviewImage(img)"
            />
          </view>
          <view class="review-footer">
            <view class="review-helpful" @click="toggleHelpful(index)">
              <text class="helpful-icon">{{ review.helpful ? '👍' : '👍' }}</text>
              <text class="helpful-count">{{ review.helpfulCount }}</text>
            </view>
            <view class="review-reply" v-if="review.reply">
              <text class="reply-label">酒店回复：</text>
              <text class="reply-text">{{ review.reply }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 查看更多 -->
      <view class="review-more" @click="loadMoreReviews" v-if="hasMoreReviews">
        <text class="more-text">查看更多点评</text>
        <text class="more-arrow">▼</text>
      </view>
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
    <view class="popup-mask" v-show="showFacilities" @click="closeFacilities"></view>
    <view class="facilities-popup-native" v-show="showFacilities">
      <view class="popup-header">
        <text class="popup-title">全部设施</text>
        <text class="popup-close" @click="closeFacilities">✕</text>
      </view>
      <scroll-view class="popup-body" scroll-y="true">
        <view v-for="(group, gIndex) in facilityGroups" :key="gIndex" class="facility-group">
          <view class="group-title">{{ group.category }}</view>
          <view class="group-list">
            <view class="popup-facility-item" v-for="(item, index) in group.items" :key="index" @click="showFacilityDetail(item)">
              <text class="popup-facility-icon">{{ item.icon }}</text>
              <view class="popup-facility-info">
                <text class="popup-facility-name">{{ item.name }}</text>
                <text class="popup-facility-desc">{{ item.desc }}</text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 设施详情弹窗 -->
    <view class="popup-mask" v-if="showFacilityDetailPopup" @click="closeFacilityDetail"></view>
    <view class="facility-detail-popup-native" v-if="showFacilityDetailPopup && selectedFacility">
      <view class="detail-popup-header">
        <text class="detail-popup-icon">{{ selectedFacility.icon }}</text>
        <text class="detail-popup-title">{{ selectedFacility.name }}</text>
        <text class="detail-popup-close" @click="closeFacilityDetail">✕</text>
      </view>
      <view class="detail-popup-body">
        <view class="detail-popup-category">
          <text class="category-label">分类</text>
          <text class="category-value">{{ selectedFacility.category }}</text>
        </view>
        <view class="detail-popup-desc">
          <text class="desc-label">详情</text>
          <text class="desc-value">{{ selectedFacility.desc }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

interface Facility {
  name: string
  icon: string
  desc: string
  category: string
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
  facilities: string[]
  policy: string
  cancelPolicy: string
  images: string[]
  floor: string
  capacity: string
  bathroom: string
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
const showFacilities = ref(false)
const showFacilityDetailPopup = ref(false)
const selectedFacility = ref<Facility | null>(null)
const expandedRooms = ref<boolean[]>([])

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

// 设施按分类分组
const facilityGroups = computed(() => {
  const groups: Record<string, Facility[]> = {}
  hotel.value.facilities.forEach(item => {
    if (!groups[item.category]) {
      groups[item.category] = []
    }
    groups[item.category].push(item)
  })
  return Object.keys(groups).map(category => ({
    category,
    items: groups[category]
  }))
})

// Mock 数据
const mockHotelData: Record<string, Hotel> = {
  '1': {
    id: '1',
    name: '杭州西湖希尔顿酒店',
    images: [
      '/static/hotel/hotel1_cover.jpg',
      '/static/hotel/hotel1_lobby.jpg',
      '/static/hotel/hotel1_pool.jpg'
    ],
    stars: 5,
    score: 4.8,
    commentCount: 2341,
    address: '杭州市西湖区龙井路1号',
    openYear: 2015,
    renovateYear: 2022,
    facilities: [
      { name: 'WiFi', icon: '📶', desc: '全酒店覆盖高速无线网络，免费使用', category: '网络' },
      { name: '停车场', icon: '🅿️', desc: '地下停车场，提供200个车位，住客免费', category: '交通' },
      { name: '餐厅', icon: '🍽️', desc: '中西餐厅，提供自助早餐和特色菜肴', category: '餐饮' },
      { name: '健身房', icon: '💪', desc: '24小时开放，配备跑步机、哑铃等器械', category: '休闲' },
      { name: '游泳池', icon: '🏊', desc: '室内恒温泳池，长25米，开放时间6:00-22:00', category: '休闲' },
      { name: 'SPA', icon: '💆', desc: '专业按摩师提供全身按摩、面部护理等服务', category: '休闲' },
      { name: '会议室', icon: '📊', desc: '多功能会议室，可容纳10-200人，配备投影设备', category: '商务' },
      { name: '接送机', icon: '🚗', desc: '提供机场接送服务，需提前预约', category: '交通' },
      { name: '洗衣服务', icon: '👕', desc: '提供干洗、湿洗服务，24小时内送回', category: '服务' },
      { name: '商务中心', icon: '💼', desc: '提供打印、复印、传真等商务服务', category: '商务' },
      { name: '酒吧', icon: '🍸', desc: '大堂吧提供各类酒水、咖啡和下午茶', category: '餐饮' },
      { name: '儿童乐园', icon: '🎠', desc: '室内儿童游乐区，配备安全设施', category: '休闲' }
    ],
    rooms: [
      {
        id: 'r1',
        name: '豪华大床房',
        image: '/static/hotel/room1_1.jpg',
        bedType: '大床',
        area: 35,
        window: '有窗',
        breakfast: true,
        price: 688,
        facilities: ['空调', '电视', '迷你吧', '保险箱', '吹风机', '浴缸'],
        policy: '14:00入住，12:00退房',
        cancelPolicy: '入住当天18:00前可免费取消',
        images: [
          '/static/hotel/room1_1.jpg',
          '/static/hotel/room1_2.jpg',
          '/static/hotel/room1_3.jpg',
          '/static/hotel/room1_4.jpg'
        ],
        floor: '5-10层',
        capacity: '2人',
        bathroom: '独立卫浴'
      },
      {
        id: 'r2',
        name: '行政双床房',
        image: '/static/hotel/room2_1.jpg',
        bedType: '双床',
        area: 40,
        window: '有窗',
        breakfast: true,
        price: 788,
        facilities: ['空调', '电视', '迷你吧', '保险箱', '吹风机', '独立淋浴'],
        policy: '14:00入住，12:00退房',
        cancelPolicy: '入住当天18:00前可免费取消',
        images: [
          '/static/hotel/room2_1.jpg',
          '/static/hotel/room2_2.jpg',
          '/static/hotel/room2_3.jpg',
          '/static/hotel/room2_4.jpg'
        ],
        floor: '11-15层',
        capacity: '2人',
        bathroom: '独立卫浴'
      },
      {
        id: 'r3',
        name: '湖景套房',
        image: '/static/hotel/room3_1.jpg',
        bedType: '大床',
        area: 65,
        window: '湖景',
        breakfast: true,
        price: 1288,
        facilities: ['空调', '电视', '迷你吧', '保险箱', '吹风机', '浴缸', '客厅', '书房'],
        policy: '14:00入住，12:00退房',
        cancelPolicy: '入住前一天18:00前可免费取消',
        images: [
          '/static/hotel/room3_1.jpg',
          '/static/hotel/room3_2.jpg',
          '/static/hotel/room3_3.jpg',
          '/static/hotel/room3_4.jpg'
        ],
        floor: '16-20层',
        capacity: '2人',
        bathroom: '独立卫浴+浴缸'
      },
      {
        id: 'r4',
        name: '标准单人房',
        image: '/static/hotel/room4_1.jpg',
        bedType: '单人床',
        area: 25,
        window: '有窗',
        breakfast: false,
        price: 388,
        facilities: ['空调', '电视', '吹风机', '独立淋浴'],
        policy: '14:00入住，12:00退房',
        cancelPolicy: '入住当天18:00前可免费取消',
        images: [
          '/static/hotel/room4_1.jpg',
          '/static/hotel/room4_2.jpg',
          '/static/hotel/room4_3.jpg'
        ],
        floor: '3-4层',
        capacity: '1人',
        bathroom: '独立卫浴'
      }
    ],
    introduction: '杭州西湖希尔顿酒店坐落于风景秀丽的西湖景区，毗邻龙井茶园，环境优美，交通便利。酒店拥有各类豪华客房，配备现代化设施，为您提供舒适惬意的入住体验。',
    surroundInfo: '距离西湖风景区约2公里，距离灵隐寺约5公里，周边有多个购物中心和特色餐厅。'
  },
  '2': {
    id: '2',
    name: '上海外滩W酒店',
    images: [
      '/static/hotel/hotel2_cover.jpg',
      '/static/hotel/hotel2_lobby.jpg',
      '/static/hotel/hotel2_view.jpg'
    ],
    stars: 5,
    score: 4.9,
    commentCount: 5678,
    address: '上海市黄浦区中山东一路',
    openYear: 2017,
    facilities: [
      { name: 'WiFi', icon: '📶', desc: '全酒店覆盖高速无线网络，免费使用', category: '网络' },
      { name: '停车场', icon: '🅿️', desc: '地下停车场，提供150个车位，住客免费', category: '交通' },
      { name: '餐厅', icon: '🍽️', desc: '顶层景观餐厅，提供中西式自助早餐', category: '餐饮' },
      { name: '健身房', icon: '💪', desc: '24小时健身房，配备泰诺健器械', category: '休闲' },
      { name: '游泳池', icon: '🏊', desc: '无边际泳池，可俯瞰外滩美景', category: '休闲' },
      { name: 'SPA', icon: '💆', desc: '水疗中心，提供芳香疗法和热石按摩', category: '休闲' },
      { name: '会议室', icon: '📊', desc: '8间会议室，配备视频会议系统', category: '商务' },
      { name: '酒吧', icon: '🍸', desc: '屋顶酒吧，夜景绝佳', category: '餐饮' }
    ],
    rooms: [
      {
        id: 'r1',
        name: '奇妙客房',
        image: '/static/hotel/room5_1.jpg',
        bedType: '大床',
        area: 38,
        window: '城景',
        breakfast: false,
        price: 1588,
        facilities: ['空调', '电视', '迷你吧', '保险箱', '吹风机', '独立淋浴'],
        policy: '15:00入住，12:00退房',
        cancelPolicy: '入住前一天18:00前可免费取消',
        images: [
          '/static/hotel/room5_1.jpg',
          '/static/hotel/room5_2.jpg',
          '/static/hotel/room5_3.jpg',
          '/static/hotel/room5_4.jpg'
        ],
        floor: '10-20层',
        capacity: '2人',
        bathroom: '独立卫浴'
      },
      {
        id: 'r2',
        name: '外滩景观房',
        image: '/static/hotel/room6_1.jpg',
        bedType: '大床',
        area: 45,
        window: '江景',
        breakfast: true,
        price: 2288,
        facilities: ['空调', '电视', '迷你吧', '保险箱', '吹风机', '浴缸', '智能马桶'],
        policy: '15:00入住，12:00退房',
        cancelPolicy: '入住前两天18:00前可免费取消',
        images: [
          '/static/hotel/room6_1.jpg',
          '/static/hotel/room6_2.jpg',
          '/static/hotel/room6_3.jpg',
          '/static/hotel/room6_4.jpg'
        ],
        floor: '21-30层',
        capacity: '2人',
        bathroom: '独立卫浴+浴缸'
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
    expandedRooms.value = new Array(data.rooms.length).fill(false)
  } else {
    hotel.value = mockHotelData['1']
    expandedRooms.value = new Array(mockHotelData['1'].rooms.length).fill(false)
  }
}

function goBack() {
  uni.navigateBack()
}

// ==================== 客户点评 ====================
interface Review {
  username: string
  avatar: string
  date: string
  roomType: string
  score: number
  content: string
  images: string[]
  helpful: boolean
  helpfulCount: number
  reply: string
  tags: string[]
}

const ratingDimensions = ref([
  { label: '环境', score: 4.8 },
  { label: '服务', score: 4.9 },
  { label: '卫生', score: 4.7 },
  { label: '设施', score: 4.6 },
  { label: '位置', score: 4.8 },
])

const reviewTagOptions = ['全部', '好评', '有图', '差评', '最新']

const reviewFilter = ref('全部')

const allReviews = ref<Review[]>([
  {
    username: '旅行达人小王',
    avatar: '/static/hotel/review_avatar_1.jpg',
    date: '2026-06-15',
    roomType: '豪华大床房',
    score: 5.0,
    content: '酒店环境非常好，房间宽敞明亮，窗外就是西湖美景。服务态度很热情，前台小姐姐特别耐心地给我们介绍了周边的美食和景点。早餐种类丰富，中西式都有，味道也很不错。唯一的小遗憾是泳池人有点多，不过整体体验非常满意，下次还会再来！',
    images: ['/static/hotel/room1_1.jpg', '/static/hotel/hotel1_pool.jpg'],
    helpful: false,
    helpfulCount: 128,
    reply: '感谢您的五星好评！很高兴您对酒店环境和服务满意，期待您的再次光临。泳池高峰期建议避开10:00-12:00时段，体验会更好哦~',
    tags: ['好评', '有图'],
  },
  {
    username: '出差党老李',
    avatar: '/static/hotel/review_avatar_2.jpg',
    date: '2026-06-12',
    roomType: '行政双床房',
    score: 4.5,
    content: '出差入住的，位置很方便，离地铁站步行5分钟。房间干净整洁，办公桌够大，WiFi速度快，适合办公。早餐虽然丰富但中式菜品偏少。隔音效果一般，走廊声音能听到。总体性价比不错。',
    images: ['/static/hotel/room2_3.jpg'],
    helpful: false,
    helpfulCount: 56,
    reply: '感谢您的中肯评价！我们已将中式早餐的建议反馈给餐饮部，会尽快丰富菜品。关于隔音问题，我们正在升级隔音设施，给您带来不便敬请谅解。',
    tags: ['好评'],
  },
  {
    username: '度假小仙女',
    avatar: '/static/hotel/review_avatar_3.jpg',
    date: '2026-06-10',
    roomType: '湖景套房',
    score: 5.0,
    content: '太美了！湖景套房的景色简直绝了，早上拉开窗帘就能看到西湖日出，太浪漫了！房间面积很大，客厅和卧室分开，浴室有浴缸可以泡澡看湖景。SPA也很推荐，技师手法专业。唯一缺点是价格略贵，但绝对物超所值！',
    images: ['/static/hotel/room3_1.jpg', '/static/hotel/room3_2.jpg', '/static/hotel/room3_3.jpg'],
    helpful: false,
    helpfulCount: 234,
    reply: '非常感谢您的热情分享！湖景套房确实是我们酒店的明星房型，能看到西湖日出是很多客人的最爱。期待您下次带着家人一起来体验！',
    tags: ['好评', '有图'],
  },
  {
    username: '背包客小张',
    avatar: '/static/hotel/review_avatar_4.jpg',
    date: '2026-06-08',
    roomType: '标准单人房',
    score: 3.5,
    content: '房间比较小，床也不太舒服，枕头太软了。窗户对着停车场，有点吵。热水供应不稳定，晚上洗澡水温忽冷忽热。位置还可以，离景区不远。这个价位只能说一般般吧。',
    images: [],
    helpful: false,
    helpfulCount: 23,
    reply: '非常抱歉给您带来了不好的入住体验。关于热水和枕头的问题，我们已安排工程部和客房部检查整改。如需更换枕头类型，可随时联系前台，我们有多种枕头可供选择。',
    tags: ['差评'],
  },
  {
    username: '亲子游妈妈',
    avatar: '/static/hotel/review_avatar_5.jpg',
    date: '2026-06-05',
    roomType: '豪华大床房',
    score: 4.8,
    content: '带孩子来度假的，酒店对小朋友很友好，有儿童拖鞋和牙刷。泳池有儿童专区，安全员也很负责。周边景点多，步行就能到西湖。早餐有儿童餐区，孩子很喜欢。唯一建议是能增加一些亲子活动就更好了。',
    images: ['/static/hotel/hotel1_pool.jpg'],
    helpful: false,
    helpfulCount: 89,
    reply: '感谢您的建议！我们正在筹备亲子活动项目，预计下个月就会推出周末亲子手工课和户外探索活动，敬请期待！',
    tags: ['好评', '有图'],
  },
  {
    username: '商务人士陈总',
    avatar: '/static/hotel/review_avatar_6.jpg',
    date: '2026-06-01',
    roomType: '湖景套房',
    score: 4.9,
    content: '接待客户选的这家酒店，果然没让我失望。湖景套房气派大方，客厅适合小规模商务会谈。会议室设备齐全，服务周到。晚上的湖景夜景也很美，客户非常满意。推荐商务接待使用。',
    images: ['/static/hotel/room3_4.jpg'],
    helpful: false,
    helpfulCount: 167,
    reply: '感谢您的认可和推荐！我们的商务中心提供专业的会议服务，如需定制商务接待方案，欢迎提前联系我们的VIP管家。',
    tags: ['好评', '有图'],
  },
])

const displayReviewCount = ref(3)
const hasMoreReviews = computed(() => displayReviewCount.value < allReviews.value.length)

const filteredReviews = computed(() => {
  let list = allReviews.value
  if (reviewFilter.value === '好评') {
    list = list.filter(r => r.score >= 4.5)
  } else if (reviewFilter.value === '差评') {
    list = list.filter(r => r.score < 4.0)
  } else if (reviewFilter.value === '有图') {
    list = list.filter(r => r.images.length > 0)
  } else if (reviewFilter.value === '最新') {
    list = [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
  return list.slice(0, displayReviewCount.value)
})

function toggleHelpful(index: number) {
  const review = allReviews.value[index]
  review.helpful = !review.helpful
  review.helpfulCount += review.helpful ? 1 : -1
}

function loadMoreReviews() {
  displayReviewCount.value = allReviews.value.length
}

function previewReviewImage(url: string) {
  uni.previewImage({ urls: [url] })
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
  showFacilities.value = true
}

function closeFacilities() {
  showFacilities.value = false
}

function showFacilityDetail(item: Facility) {
  console.log('showFacilityDetail clicked', item)
  selectedFacility.value = item
  showFacilityDetailPopup.value = true
  console.log('showFacilityDetailPopup set to', showFacilityDetailPopup.value)
}

function closeFacilityDetail() {
  showFacilityDetailPopup.value = false
  selectedFacility.value = null
}

function toggleRoomDetail(index: number) {
  expandedRooms.value[index] = !expandedRooms.value[index]
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
  flex-direction: column;
  background-color: #fafafa;
  border-radius: 12rpx;
  overflow: hidden;
  padding: 16rpx;
}

.room-header {
  display: flex;
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

.room-meta {
  margin-top: 8rpx;
}

.meta-text {
  font-size: 22rpx;
  color: #999999;
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

.detail-toggle {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.detail-text {
  font-size: 24rpx;
  color: #ff5000;
}

.detail-arrow {
  font-size: 20rpx;
  color: #ff5000;
  transition: transform 0.3s;
}

.arrow-up {
  transform: rotate(180deg);
}

/* 房型详情展开区 */
.room-detail {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.room-image-swiper-wrapper {
  margin-bottom: 20rpx;
}

.room-image-swiper {
  width: 100%;
  height: 320rpx;
  border-radius: 12rpx;
  overflow: hidden;
}

.room-swiper-image {
  width: 100%;
  height: 320rpx;
}

.room-detail-info {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.detail-row {
  display: flex;
  align-items: center;
}

.detail-label {
  font-size: 26rpx;
  color: #999999;
  width: 140rpx;
  flex-shrink: 0;
}

.detail-value {
  font-size: 26rpx;
  color: #333333;
  flex: 1;
}

.detail-section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 12rpx;
}

.room-facilities {
  margin-bottom: 20rpx;
}

.room-facility-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.room-facility-tag {
  font-size: 22rpx;
  color: #ff5000;
  background-color: #fff0e6;
  padding: 8rpx 20rpx;
  border-radius: 8rpx;
}

.room-policies {
  margin-bottom: 20rpx;
}

.policy-text {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.6;
}

.room-detail-book {
  display: flex;
  justify-content: flex-end;
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
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

.facilities-popup-native {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ffffff;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  z-index: 999;
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

.facility-group {
  margin-bottom: 24rpx;
}

.group-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #ff5000;
  margin-bottom: 16rpx;
  padding-left: 12rpx;
  border-left: 6rpx solid #ff5000;
}

.group-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.popup-facility-item {
  display: flex;
  align-items: flex-start;
  padding: 16rpx;
  background: #fafafa;
  border-radius: 12rpx;
}

.popup-facility-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.popup-facility-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.popup-facility-name {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.popup-facility-desc {
  font-size: 24rpx;
  color: #666666;
  line-height: 1.5;
}

/* 设施详情弹窗 */
.facility-detail-popup-native {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #ffffff;
  border-radius: 24rpx;
  width: 560rpx;
  padding: 40rpx;
  z-index: 999;
}

.detail-popup-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  margin-bottom: 30rpx;
}

.detail-popup-icon {
  font-size: 64rpx;
  margin-bottom: 16rpx;
}

.detail-popup-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
}

.detail-popup-close {
  position: absolute;
  top: -10rpx;
  right: 0;
  font-size: 32rpx;
  color: #999999;
}

.detail-popup-body {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.detail-popup-category {
  display: flex;
  align-items: center;
}

.category-label {
  font-size: 26rpx;
  color: #999999;
  width: 100rpx;
  flex-shrink: 0;
}

.category-value {
  font-size: 26rpx;
  color: #ff5000;
  font-weight: 500;
}

.detail-popup-desc {
  display: flex;
  flex-direction: column;
}

.desc-label {
  font-size: 26rpx;
  color: #999999;
  margin-bottom: 8rpx;
}

.desc-value {
  font-size: 28rpx;
  color: #333333;
  line-height: 1.6;
}

/* ==================== 客户点评 ==================== */
.review-card {
  margin-top: 20rpx;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.review-summary {
  display: flex;
  align-items: baseline;
}

.review-score {
  font-size: 48rpx;
  color: #ff5000;
  font-weight: bold;
}

.review-score-label {
  font-size: 24rpx;
  color: #ff5000;
  margin-left: 4rpx;
}

.review-total {
  font-size: 24rpx;
  color: #999;
  margin-left: 8rpx;
}

/* 评分维度 */
.rating-dimensions {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 24rpx;
  padding: 24rpx;
  background: #fafafa;
  border-radius: 12rpx;
}

.rating-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.rating-label {
  font-size: 26rpx;
  color: #666;
  width: 60rpx;
  flex-shrink: 0;
}

.rating-bar-bg {
  flex: 1;
  height: 12rpx;
  background: #e8e8e8;
  border-radius: 6rpx;
  overflow: hidden;
}

.rating-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff9000, #ff5000);
  border-radius: 6rpx;
  transition: width 0.3s;
}

.rating-value {
  font-size: 26rpx;
  color: #ff5000;
  font-weight: bold;
  width: 60rpx;
  text-align: right;
  flex-shrink: 0;
}

/* 标签筛选 */
.review-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.review-tag {
  padding: 12rpx 28rpx;
  background: #f5f5f5;
  border-radius: 24rpx;
  font-size: 26rpx;
  color: #666;
}

.review-tag.active {
  background: linear-gradient(90deg, #ff9000, #ff5000);
  color: #fff;
  font-weight: 500;
}

/* 点评列表 */
.review-list {
  display: flex;
  flex-direction: column;
}

.review-item {
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.review-item:last-child {
  border-bottom: none;
}

.review-user {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.user-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.user-meta {
  display: flex;
  gap: 16rpx;
  margin-top: 4rpx;
}

.review-date {
  font-size: 22rpx;
  color: #999;
}

.room-type {
  font-size: 22rpx;
  color: #ff5000;
  background: #fff2e8;
  padding: 2rpx 12rpx;
  border-radius: 8rpx;
}

.user-score {
  display: flex;
  align-items: baseline;
  flex-shrink: 0;
}

.user-score-num {
  font-size: 36rpx;
  color: #ff5000;
  font-weight: bold;
}

.user-score-label {
  font-size: 20rpx;
  color: #ff5000;
}

.review-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.8;
  margin-bottom: 16rpx;
}

.review-images {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.review-img {
  width: 180rpx;
  height: 180rpx;
  border-radius: 12rpx;
}

.review-footer {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.review-helpful {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 0;
}

.helpful-icon {
  font-size: 28rpx;
}

.helpful-count {
  font-size: 24rpx;
  color: #999;
}

.review-reply {
  background: #f8f8f8;
  padding: 20rpx;
  border-radius: 12rpx;
  border-left: 6rpx solid #ff5000;
}

.reply-label {
  font-size: 26rpx;
  color: #ff5000;
  font-weight: 500;
}

.reply-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}

/* 查看更多 */
.review-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 0;
  gap: 8rpx;
}

.more-text {
  font-size: 28rpx;
  color: #ff5000;
}

.more-arrow {
  font-size: 22rpx;
  color: #ff5000;
}
</style>
