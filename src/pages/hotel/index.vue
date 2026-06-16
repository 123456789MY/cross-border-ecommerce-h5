<template>
  <view class="hotel-page">
    <!-- 顶部固定搜索区 -->
    <view class="header-fixed">
      <view class="header-gradient">
        <view class="header-title">酒店预订</view>
      </view>

      <!-- 搜索卡片 -->
      <view class="search-card">
        <!-- 城市选择 -->
        <view class="form-row" @click="openCityPanel">
          <view class="form-label">
            <text class="icon iconfont">&#xe6b0;</text>
            目的地
          </view>
          <view class="form-value">
            <text class="city-name">{{ searchForm.city }}</text>
            <text class="arrow iconfont">&#xe6a3;</text>
          </view>
        </view>

        <view class="divider" />

        <!-- 入住日期 -->
        <view class="form-row" @click="selectCheckInDate">
          <view class="form-label">
            <text class="icon iconfont">&#xe6b1;</text>
            入住
          </view>
          <view class="form-value">
            <text class="date-text">{{ searchForm.checkInDate }}</text>
            <text class="week-text">{{ searchForm.checkInWeek }}</text>
            <text class="arrow iconfont">&#xe6a3;</text>
          </view>
        </view>

        <view class="divider" />

        <!-- 离店日期 -->
        <view class="form-row" @click="selectCheckOutDate">
          <view class="form-label">
            <text class="icon iconfont">&#xe6b2;</text>
            离店
          </view>
          <view class="form-value">
            <text class="date-text">{{ searchForm.checkOutDate }}</text>
            <text class="week-text">{{ searchForm.checkOutWeek }}</text>
            <text class="arrow iconfont">&#xe6a3;</text>
          </view>
        </view>

        <view class="divider" />

        <!-- 关键词输入 -->
        <view class="form-row keyword-row">
          <view class="form-label">
            <text class="icon iconfont">&#xe6b4;</text>
            关键词
          </view>
          <input
            v-model="searchForm.keyword"
            class="keyword-input"
            placeholder="酒店名/位置/品牌"
            placeholder-class="keyword-placeholder"
          />
        </view>

        <!-- 搜索按钮 -->
        <view class="search-btn" @click="onSearch">搜索酒店</view>
      </view>
    </view>

    <!-- 筛选栏（搜索后显示） -->
    <view v-if="hasSearched" class="filter-bar">
      <view class="filter-sort">
        <view
          v-for="item in sortOptions"
          :key="item.value"
          class="sort-item"
          :class="{ active: sortType === item.value }"
          @click="changeSort(item.value)"
        >
          {{ item.label }}
        </view>
      </view>
      <view class="filter-extra">
        <view
          class="filter-tag"
          :class="{ active: priceFilter !== '' }"
          @click="openPriceFilter"
        >
          价格
          <text class="arrow iconfont">&#xe6a3;</text>
        </view>
        <view
          class="filter-tag"
          :class="{ active: starFilter !== 0 }"
          @click="openStarFilter"
        >
          星级
          <text class="arrow iconfont">&#xe6a3;</text>
        </view>
      </view>
    </view>

    <!-- 酒店列表 -->
    <view v-if="hasSearched" class="hotel-list">
      <view
        v-for="hotel in filteredHotels"
        :key="hotel.id"
        class="hotel-card"
        @click="goDetail(hotel.id)"
      >
        <image class="hotel-image" :src="hotel.image" mode="aspectFill" />
        <view class="hotel-content">
          <view class="hotel-name">{{ hotel.name }}</view>
          <view class="hotel-meta">
            <view class="hotel-stars">
              <text
                v-for="i in hotel.stars"
                :key="i"
                class="star iconfont"
              >&#xe6b5;</text>
            </view>
            <text class="hotel-score">{{ hotel.rating }}分</text>
            <text class="hotel-comment">{{ hotel.commentCount }}条评价</text>
          </view>
          <view class="hotel-location">
            <text class="iconfont">&#xe6b6;</text>
            {{ hotel.location }}
          </view>
          <view class="hotel-tags">
            <text
              v-for="tag in hotel.tags"
              :key="tag"
              class="tag"
            >{{ tag }}</text>
          </view>
          <view class="hotel-price-row">
            <text class="price-symbol">¥</text>
            <text class="price-num">{{ hotel.price }}</text>
            <text class="price-unit">起</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 未搜索时展示热门推荐 -->
    <view v-else class="hot-section">
      <view class="section-header">
        <text class="section-title">热门酒店推荐</text>
        <text class="section-more">更多 <text class="iconfont">&#xe6a3;</text></text>
      </view>
      <scroll-view class="hotel-scroll" scroll-x show-scrollbar="false">
        <view
          v-for="hotel in hotHotels"
          :key="hotel.id"
          class="hotel-item"
          @click="goDetail(hotel.id)"
        >
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

    <!-- 城市选择面板 -->
    <view v-if="showCityPanel" class="city-panel-mask" @click="closeCityPanel">
      <view class="city-panel" @click.stop>
        <view class="panel-header">
          <text class="panel-title">选择城市</text>
          <text class="panel-close iconfont" @click="closeCityPanel">&#xe6b7;</text>
        </view>
        <view class="panel-body">
          <view class="city-section-title">热门城市</view>
          <view class="city-grid">
            <view
              v-for="city in hotCities"
              :key="city"
              class="city-grid-item"
              :class="{ active: searchForm.city === city }"
              @click="selectCity(city)"
            >
              {{ city }}
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 价格筛选面板 -->
    <view v-if="showPricePanel" class="filter-panel-mask" @click="closePricePanel">
      <view class="filter-panel" @click.stop>
        <view class="panel-header">
          <text class="panel-title">价格区间</text>
          <text class="panel-close iconfont" @click="closePricePanel">&#xe6b7;</text>
        </view>
        <view class="filter-options">
          <view
            v-for="item in priceOptions"
            :key="item.value"
            class="filter-option"
            :class="{ active: priceFilter === item.value }"
            @click="selectPriceFilter(item.value)"
          >
            {{ item.label }}
          </view>
        </view>
      </view>
    </view>

    <!-- 星级筛选面板 -->
    <view v-if="showStarPanel" class="filter-panel-mask" @click="closeStarPanel">
      <view class="filter-panel" @click.stop>
        <view class="panel-header">
          <text class="panel-title">酒店星级</text>
          <text class="panel-close iconfont" @click="closeStarPanel">&#xe6b7;</text>
        </view>
        <view class="filter-options">
          <view
            v-for="item in starOptions"
            :key="item.value"
            class="filter-option"
            :class="{ active: starFilter === item.value }"
            @click="selectStarFilter(item.value)"
          >
            {{ item.label }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// ==================== 类型定义 ====================
interface SearchForm {
  city: string
  checkInDate: string
  checkInWeek: string
  checkOutDate: string
  checkOutWeek: string
  keyword: string
}

interface Hotel {
  id: number
  name: string
  image: string
  rating: number
  price: number
  location: string
  stars: number
  commentCount: number
  tags: string[]
  city: string
}

// ==================== 响应式数据 ====================
const searchForm = ref<SearchForm>({
  city: '北京',
  checkInDate: '06月16日',
  checkInWeek: '今天',
  checkOutDate: '06月17日',
  checkOutWeek: '明天',
  keyword: '',
})

const hasSearched = ref(false)
const sortType = ref('default')
const priceFilter = ref('')
const starFilter = ref(0)

const showCityPanel = ref(false)
const showPricePanel = ref(false)
const showStarPanel = ref(false)

// ==================== 常量数据 ====================
const hotCities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '西安', '三亚', '厦门', '昆明']

const sortOptions = [
  { label: '综合排序', value: 'default' },
  { label: '价格从低到高', value: 'priceAsc' },
  { label: '价格从高到低', value: 'priceDesc' },
  { label: '评分最高', value: 'rating' },
]

const priceOptions = [
  { label: '全部价格', value: '' },
  { label: '¥300以下', value: '0-300' },
  { label: '¥300-500', value: '300-500' },
  { label: '¥500-800', value: '500-800' },
  { label: '¥800-1500', value: '800-1500' },
  { label: '¥1500以上', value: '1500+' },
]

const starOptions = [
  { label: '全部星级', value: 0 },
  { label: '五星级', value: 5 },
  { label: '四星级', value: 4 },
  { label: '三星级', value: 3 },
  { label: '经济型', value: 2 },
]

// ==================== Mock 酒店数据 ====================
const allHotels = ref<Hotel[]>([
  {
    id: 1,
    name: '北京王府半岛酒店',
    image: 'https://picsum.photos/400/300?random=1',
    rating: 4.9,
    price: 1288,
    location: '王府井大街8号',
    stars: 5,
    commentCount: 2341,
    tags: ['免费取消', '含早餐', '泳池'],
    city: '北京',
  },
  {
    id: 2,
    name: '上海外滩华尔道夫酒店',
    image: 'https://picsum.photos/400/300?random=2',
    rating: 4.8,
    price: 1588,
    location: '中山东一路2号',
    stars: 5,
    commentCount: 1892,
    tags: ['江景房', '含早餐', 'SPA'],
    city: '上海',
  },
  {
    id: 3,
    name: '广州四季酒店',
    image: 'https://picsum.photos/400/300?random=3',
    rating: 4.9,
    price: 998,
    location: '珠江新城珠江西路5号',
    stars: 5,
    commentCount: 1567,
    tags: ['免费取消', '高空景观'],
    city: '广州',
  },
  {
    id: 4,
    name: '深圳瑞吉酒店',
    image: 'https://picsum.photos/400/300?random=4',
    rating: 4.7,
    price: 888,
    location: '罗湖区深南东路5016号',
    stars: 5,
    commentCount: 1234,
    tags: ['含早餐', '健身房'],
    city: '深圳',
  },
  {
    id: 5,
    name: '杭州西湖国宾馆',
    image: 'https://picsum.photos/400/300?random=5',
    rating: 4.8,
    price: 688,
    location: '西湖区杨公堤18号',
    stars: 4,
    commentCount: 3421,
    tags: ['湖景房', '免费取消', '含早餐'],
    city: '杭州',
  },
  {
    id: 6,
    name: '成都博舍酒店',
    image: 'https://picsum.photos/400/300?random=6',
    rating: 4.9,
    price: 1188,
    location: '锦江区笔帖式街81号',
    stars: 5,
    commentCount: 987,
    tags: ['含早餐', 'SPA', '免费取消'],
    city: '成都',
  },
  {
    id: 7,
    name: '西安索菲特传奇酒店',
    image: 'https://picsum.photos/400/300?random=7',
    rating: 4.8,
    price: 768,
    location: '新城区东新街319号',
    stars: 5,
    commentCount: 1456,
    tags: ['历史建筑', '含早餐'],
    city: '西安',
  },
  {
    id: 8,
    name: '三亚亚特兰蒂斯酒店',
    image: 'https://picsum.photos/400/300?random=8',
    rating: 4.7,
    price: 1888,
    location: '海棠区海棠北路36号',
    stars: 5,
    commentCount: 5678,
    tags: ['水上乐园', '海景房', '含早餐'],
    city: '三亚',
  },
  {
    id: 9,
    name: '厦门康莱德酒店',
    image: 'https://picsum.photos/400/300?random=9',
    rating: 4.8,
    price: 868,
    location: '思明区演武西路186号',
    stars: 5,
    commentCount: 2134,
    tags: ['海景房', '免费取消', '含早餐'],
    city: '厦门',
  },
  {
    id: 10,
    name: '昆明翠湖宾馆',
    image: 'https://picsum.photos/400/300?random=10',
    rating: 4.5,
    price: 368,
    location: '五华区翠湖南路6号',
    stars: 4,
    commentCount: 876,
    tags: ['湖景房', '免费取消'],
    city: '昆明',
  },
  {
    id: 11,
    name: '北京如家精选酒店',
    image: 'https://picsum.photos/400/300?random=11',
    rating: 4.3,
    price: 298,
    location: '朝阳区建国路88号',
    stars: 3,
    commentCount: 4567,
    tags: ['经济型', '免费取消'],
    city: '北京',
  },
  {
    id: 12,
    name: '上海全季酒店',
    image: 'https://picsum.photos/400/300?random=12',
    rating: 4.4,
    price: 358,
    location: '浦东新区陆家嘴环路1000号',
    stars: 3,
    commentCount: 3210,
    tags: ['商务出行', '含早餐'],
    city: '上海',
  },
  {
    id: 13,
    name: '广州花园酒店',
    image: 'https://picsum.photos/400/300?random=13',
    rating: 4.6,
    price: 528,
    location: '越秀区环市东路368号',
    stars: 4,
    commentCount: 2345,
    tags: ['花园景观', '含早餐', '免费取消'],
    city: '广州',
  },
  {
    id: 14,
    name: '深圳华侨城洲际酒店',
    image: 'https://picsum.photos/400/300?random=14',
    rating: 4.7,
    price: 698,
    location: '南山区华侨城深南大道9009号',
    stars: 5,
    commentCount: 1876,
    tags: ['亲子酒店', '泳池', '含早餐'],
    city: '深圳',
  },
  {
    id: 15,
    name: '杭州法云安缦',
    image: 'https://picsum.photos/400/300?random=15',
    rating: 4.9,
    price: 4588,
    location: '西湖区西湖街道法云弄22号',
    stars: 5,
    commentCount: 432,
    tags: ['奢华度假', '含早餐', 'SPA'],
    city: '杭州',
  },
])

// 热门推荐（取前5条）
const hotHotels = computed(() => allHotels.value.slice(0, 5))

// ==================== 计算属性：筛选后的酒店列表 ====================
const filteredHotels = computed(() => {
  let list = [...allHotels.value]

  // 按城市筛选
  if (searchForm.value.city) {
    list = list.filter((h) => h.city === searchForm.value.city)
  }

  // 按关键词筛选
  if (searchForm.value.keyword) {
    const kw = searchForm.value.keyword.toLowerCase()
    list = list.filter(
      (h) =>
        h.name.toLowerCase().includes(kw) ||
        h.location.toLowerCase().includes(kw)
    )
  }

  // 按价格区间筛选
  if (priceFilter.value) {
    if (priceFilter.value === '0-300') {
      list = list.filter((h) => h.price < 300)
    } else if (priceFilter.value === '300-500') {
      list = list.filter((h) => h.price >= 300 && h.price < 500)
    } else if (priceFilter.value === '500-800') {
      list = list.filter((h) => h.price >= 500 && h.price < 800)
    } else if (priceFilter.value === '800-1500') {
      list = list.filter((h) => h.price >= 800 && h.price < 1500)
    } else if (priceFilter.value === '1500+') {
      list = list.filter((h) => h.price >= 1500)
    }
  }

  // 按星级筛选
  if (starFilter.value > 0) {
    list = list.filter((h) => h.stars === starFilter.value)
  }

  // 排序
  if (sortType.value === 'priceAsc') {
    list.sort((a, b) => a.price - b.price)
  } else if (sortType.value === 'priceDesc') {
    list.sort((a, b) => b.price - a.price)
  } else if (sortType.value === 'rating') {
    list.sort((a, b) => b.rating - a.rating)
  }

  return list
})

// ==================== 方法 ====================
const openCityPanel = () => {
  showCityPanel.value = true
}

const closeCityPanel = () => {
  showCityPanel.value = false
}

const selectCity = (city: string) => {
  searchForm.value.city = city
  showCityPanel.value = false
}

const selectCheckInDate = () => {
  uni.showToast({ title: '选择入住日期', icon: 'none' })
}

const selectCheckOutDate = () => {
  uni.showToast({ title: '选择离店日期', icon: 'none' })
}

const onSearch = () => {
  hasSearched.value = true
  uni.showToast({ title: `正在搜索${searchForm.value.city}的酒店`, icon: 'none' })
}

const changeSort = (type: string) => {
  sortType.value = type
}

const openPriceFilter = () => {
  showPricePanel.value = true
}

const closePricePanel = () => {
  showPricePanel.value = false
}

const selectPriceFilter = (value: string) => {
  priceFilter.value = value
  showPricePanel.value = false
}

const openStarFilter = () => {
  showStarPanel.value = true
}

const closeStarPanel = () => {
  showStarPanel.value = false
}

const selectStarFilter = (value: number) => {
  starFilter.value = value
  showStarPanel.value = false
}

const goDetail = (id: number) => {
  uni.navigateTo({
    url: `/pages/hotel/detail?id=${id}`,
  })
}
</script>

<style scoped>
/* ==================== 页面基础 ==================== */
.hotel-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

/* ==================== 顶部固定搜索区 ==================== */
.header-fixed {
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-gradient {
  background: linear-gradient(90deg, #ff9000 0%, #ff5000 100%);
  padding: 60rpx 32rpx 80rpx;
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

/* 关键词输入 */
.keyword-row {
  justify-content: flex-start;
}

.keyword-input {
  flex: 1;
  margin-left: 16rpx;
  font-size: 30rpx;
  color: #333333;
}

.keyword-placeholder {
  color: #cccccc;
}

/* 搜索按钮 */
.search-btn {
  margin-top: 32rpx;
  background: linear-gradient(90deg, #ff9000 0%, #ff5000 100%);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 500;
  text-align: center;
  padding: 28rpx 0;
  border-radius: 40rpx;
}

/* ==================== 筛选栏 ==================== */
.filter-bar {
  background-color: #ffffff;
  margin: 0 24rpx 20rpx;
  padding: 20rpx 24rpx;
  border-radius: 16rpx;
}

.filter-sort {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.sort-item {
  font-size: 26rpx;
  color: #666666;
  padding: 8rpx 16rpx;
  border-radius: 24rpx;
  transition: all 0.2s;
}

.sort-item.active {
  color: #ff5000;
  background-color: #fff2e8;
  font-weight: 500;
}

.filter-extra {
  display: flex;
  gap: 16rpx;
}

.filter-tag {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #666666;
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
  background-color: #f5f5f5;
}

.filter-tag.active {
  color: #ff5000;
  background-color: #fff2e8;
  font-weight: 500;
}

/* ==================== 酒店列表 ==================== */
.hotel-list {
  margin: 0 24rpx;
}

.hotel-card {
  display: flex;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.hotel-card .hotel-image {
  width: 220rpx;
  height: 220rpx;
  border-radius: 16rpx;
  flex-shrink: 0;
  margin-right: 24rpx;
}

.hotel-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.hotel-name {
  font-size: 30rpx;
  color: #333333;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hotel-meta {
  display: flex;
  align-items: center;
  margin-top: 8rpx;
}

.hotel-stars {
  display: flex;
  margin-right: 12rpx;
}

.hotel-stars .star {
  color: #ff9000;
  font-size: 22rpx;
  margin-right: 2rpx;
}

.hotel-score {
  font-size: 26rpx;
  color: #ff5000;
  font-weight: bold;
  margin-right: 12rpx;
}

.hotel-comment {
  font-size: 22rpx;
  color: #999999;
}

.hotel-location {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #666666;
  margin-top: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hotel-location .iconfont {
  color: #999999;
  font-size: 22rpx;
  margin-right: 4rpx;
}

.hotel-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 12rpx;
}

.hotel-tags .tag {
  font-size: 20rpx;
  color: #ff5000;
  background-color: #fff2e8;
  padding: 4rpx 10rpx;
  border-radius: 8rpx;
}

.hotel-price-row {
  display: flex;
  align-items: baseline;
  margin-top: 12rpx;
}

.price-symbol {
  font-size: 24rpx;
  color: #ff5000;
  font-weight: bold;
}

.price-num {
  font-size: 40rpx;
  color: #ff5000;
  font-weight: bold;
  margin: 0 4rpx;
}

.price-unit {
  font-size: 22rpx;
  color: #999999;
}

/* ==================== 热门推荐（未搜索时） ==================== */
.hot-section {
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

.hotel-item .hotel-image {
  width: 280rpx;
  height: 180rpx;
  border-radius: 16rpx;
}

.hotel-item .hotel-name {
  font-size: 26rpx;
  color: #333333;
  font-weight: 500;
  margin-top: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hotel-item .hotel-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8rpx;
}

.hotel-item .hotel-rating {
  font-size: 24rpx;
  color: #ff5000;
  font-weight: 500;
}

.hotel-item .hotel-price {
  font-size: 28rpx;
  color: #ff5000;
  font-weight: bold;
}

.hotel-item .price-symbol {
  font-size: 22rpx;
}

.hotel-item .price-unit {
  font-size: 22rpx;
  color: #999999;
  font-weight: normal;
}

.hotel-item .hotel-location {
  font-size: 22rpx;
  color: #999999;
  margin-top: 4rpx;
}

/* ==================== 城市选择面板 ==================== */
.city-panel-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
  align-items: flex-end;
}

.city-panel {
  background-color: #ffffff;
  width: 100%;
  border-radius: 32rpx 32rpx 0 0;
  padding: 32rpx;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.panel-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.panel-close {
  font-size: 36rpx;
  color: #999999;
  padding: 8rpx;
}

.city-section-title {
  font-size: 28rpx;
  color: #666666;
  margin-bottom: 20rpx;
}

.city-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.city-grid-item {
  width: calc(20% - 16rpx);
  text-align: center;
  padding: 20rpx 0;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333333;
}

.city-grid-item.active {
  background: linear-gradient(90deg, #ff9000 0%, #ff5000 100%);
  color: #ffffff;
  font-weight: 500;
}

/* ==================== 筛选面板（价格/星级共用） ==================== */
.filter-panel-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
  align-items: flex-end;
}

.filter-panel {
  background-color: #ffffff;
  width: 100%;
  border-radius: 32rpx 32rpx 0 0;
  padding: 32rpx;
  animation: slideUp 0.3s ease-out;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.filter-option {
  width: calc(33.333% - 14rpx);
  text-align: center;
  padding: 24rpx 0;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333333;
}

.filter-option.active {
  background: linear-gradient(90deg, #ff9000 0%, #ff5000 100%);
  color: #ffffff;
  font-weight: 500;
}
</style>
