<template>
  <view class="live-page">
    <!-- 顶部橙色渐变头部 -->
    <view class="header">
      <view class="header-title">直播</view>
    </view>

    <!-- 分类标签 -->
    <scroll-view class="category-scroll" scroll-x show-scrollbar="false">
      <view
        v-for="item in categories"
        :key="item.id"
        class="category-item"
        :class="{ active: activeCategory === item.id }"
        @click="activeCategory = item.id"
      >
        {{ item.name }}
      </view>
    </scroll-view>

    <!-- 直播列表 -->
    <view class="live-grid">
      <view v-for="live in liveList" :key="live.id" class="live-card">
        <view class="cover-wrapper">
          <image class="cover-image" :src="live.cover" mode="aspectFill" />
          <view class="live-badge">直播中</view>
          <view class="viewer-count">
            <text class="viewer-icon">&#xe6a8;</text>
            {{ live.viewers }}
          </view>
        </view>
        <view class="live-info">
          <image class="avatar" :src="live.avatar" mode="aspectFill" />
          <view class="info-right">
            <text class="anchor-name">{{ live.anchorName }}</text>
            <text class="live-title">{{ live.title }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Category {
  id: number
  name: string
}

interface LiveRoom {
  id: number
  cover: string
  avatar: string
  anchorName: string
  title: string
  viewers: string
}

const activeCategory = ref<number>(0)

const categories = ref<Category[]>([
  { id: 0, name: '全部' },
  { id: 1, name: '带货' },
  { id: 2, name: '美食' },
  { id: 3, name: '美妆' },
  { id: 4, name: '穿搭' },
  { id: 5, name: '数码' },
  { id: 6, name: '家居' },
])

const liveList = ref<LiveRoom[]>([
  {
    id: 1,
    cover: 'https://picsum.photos/400/225?random=1',
    avatar: 'https://picsum.photos/100/100?random=11',
    anchorName: '小美直播间',
    title: '夏季新品穿搭分享',
    viewers: '1.2万',
  },
  {
    id: 2,
    cover: 'https://picsum.photos/400/225?random=2',
    avatar: 'https://picsum.photos/100/100?random=12',
    anchorName: '吃货大王',
    title: '深夜食堂美食探店',
    viewers: '8563',
  },
  {
    id: 3,
    cover: 'https://picsum.photos/400/225?random=3',
    avatar: 'https://picsum.photos/100/100?random=13',
    anchorName: '美妆达人莉莉',
    title: '平价好物彩妆推荐',
    viewers: '2.5万',
  },
  {
    id: 4,
    cover: 'https://picsum.photos/400/225?random=4',
    avatar: 'https://picsum.photos/100/100?random=14',
    anchorName: '科技前沿',
    title: '最新数码产品开箱',
    viewers: '6234',
  },
  {
    id: 5,
    cover: 'https://picsum.photos/400/225?random=5',
    avatar: 'https://picsum.photos/100/100?random=15',
    anchorName: '家居生活馆',
    title: '温馨家居好物分享',
    viewers: '9876',
  },
  {
    id: 6,
    cover: 'https://picsum.photos/400/225?random=6',
    avatar: 'https://picsum.photos/100/100?random=16',
    anchorName: '健身教练阿杰',
    title: '居家健身直播教学',
    viewers: '1.8万',
  },
  {
    id: 7,
    cover: 'https://picsum.photos/400/225?random=7',
    avatar: 'https://picsum.photos/100/100?random=17',
    anchorName: '旅行日记',
    title: '云南美景实时直播',
    viewers: '3.2万',
  },
  {
    id: 8,
    cover: 'https://picsum.photos/400/225?random=8',
    avatar: 'https://picsum.photos/100/100?random=18',
    anchorName: '萌宠乐园',
    title: '可爱猫咪日常直播',
    viewers: '1.5万',
  },
])
</script>

<style scoped>
.live-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

/* 顶部头部 */
.header {
  background: linear-gradient(135deg, #ff5000 0%, #ff7a45 100%);
  padding: 80rpx 32rpx 40rpx;
  border-radius: 0 0 32rpx 32rpx;
}

.header-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
  text-align: center;
}

/* 分类标签 */
.category-scroll {
  white-space: nowrap;
  padding: 24rpx 20rpx;
  background-color: #ffffff;
  margin: 20rpx 24rpx 0;
  border-radius: 16rpx;
}

.category-item {
  display: inline-block;
  padding: 12rpx 32rpx;
  margin-right: 16rpx;
  font-size: 28rpx;
  color: #666666;
  background-color: #f5f5f5;
  border-radius: 32rpx;
  transition: all 0.3s;
}

.category-item.active {
  color: #ffffff;
  background-color: #ff5000;
  font-weight: 500;
}

/* 直播网格 */
.live-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 20rpx 24rpx;
  gap: 20rpx;
}

.live-card {
  width: calc(50% - 10rpx);
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.cover-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 */
}

.cover-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 16rpx 16rpx 0 0;
}

.live-badge {
  position: absolute;
  top: 12rpx;
  left: 12rpx;
  background: linear-gradient(90deg, #ff4d4f 0%, #ff7875 100%);
  color: #ffffff;
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  font-weight: 500;
}

.viewer-count {
  position: absolute;
  bottom: 12rpx;
  right: 12rpx;
  background-color: rgba(0, 0, 0, 0.5);
  color: #ffffff;
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.live-info {
  display: flex;
  align-items: center;
  padding: 16rpx;
}

.avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.info-right {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.anchor-name {
  font-size: 26rpx;
  color: #333333;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.live-title {
  font-size: 24rpx;
  color: #999999;
  margin-top: 6rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
