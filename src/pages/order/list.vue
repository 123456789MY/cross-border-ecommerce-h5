<template>
  <view class="order-list-container">
    <!-- Tab 栏 -->
    <view class="tab-bar">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: currentTab === tab.value }"
        @click="switchTab(tab.value)"
      >
        <text>{{ tab.label }}</text>
        <view v-if="currentTab === tab.value" class="tab-indicator"></view>
      </view>
    </view>

    <!-- 订单列表 -->
    <scroll-view scroll-y class="order-scroll" @scrolltolower="loadMore" v-if="orderList.length > 0">
      <view class="order-card" v-for="order in orderList" :key="order.id">
        <!-- 订单头部 -->
        <view class="order-header">
          <text class="order-no">订单号：{{ order.orderNo }}</text>
          <text class="order-status" :class="getStatusClass(order.status)">
            {{ getStatusText(order.status) }}
          </text>
        </view>

        <!-- 商品列表 -->
        <view class="order-goods">
          <view class="goods-item" v-for="item in order.items" :key="item.id">
            <image :src="item.productImage" class="goods-image" mode="aspectFill" />
            <view class="goods-info">
              <text class="goods-name">{{ item.productName }}</text>
              <text class="goods-specs">{{ item.skuSpecs }}</text>
              <view class="goods-bottom">
                <text class="goods-price">{{ formatPrice(item.unitPrice) }}</text>
                <text class="goods-quantity">x{{ item.quantity }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 订单底部 -->
        <view class="order-footer">
          <text class="total-amount">共{{ order.items.length }}件商品 实付：{{ formatPrice(order.payAmount) }}</text>
          <view class="order-actions">
            <!-- 待付款：取消订单 + 去支付 -->
            <template v-if="order.status === 0">
              <button class="action-btn secondary" size="mini" @click="cancelOrder(order.id)">取消订单</button>
              <button class="action-btn primary" size="mini" @click="goPay(order.id)">去支付</button>
            </template>
            <!-- 待发货：提醒发货（可选） -->
            <template v-if="order.status === 1">
              <button class="action-btn secondary" size="mini" @click="contactSeller(order.sellerId)">联系卖家</button>
            </template>
            <!-- 待收货：查看物流 + 确认收货 -->
            <template v-if="order.status === 2">
              <button class="action-btn secondary" size="mini" @click="viewLogistics(order.id)">查看物流</button>
              <button class="action-btn primary" size="mini" @click="confirmReceive(order.id)">确认收货</button>
            </template>
            <!-- 已完成：申请售后 + 评价 -->
            <template v-if="order.status === 3">
              <button class="action-btn secondary" size="mini" @click="applyAfterSale(order.id)">申请售后</button>
              <button class="action-btn primary" size="mini" @click="goReview(order.id)">评价</button>
            </template>
            <!-- 售后/纠纷：查看进度 -->
            <template v-if="order.status === 4">
              <button class="action-btn secondary" size="mini" @click="viewAfterSale(order.id)">查看售后</button>
            </template>
            <!-- 已取消：删除订单 -->
            <template v-if="order.status === 5">
              <button class="action-btn secondary" size="mini" @click="deleteOrder(order.id)">删除订单</button>
            </template>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 空状态 -->
    <view class="empty-state" v-else-if="!loading">
      <image src="/static/empty-order.png" class="empty-image" />
      <text class="empty-text">{{ $t('order.empty') }}</text>
      <button class="go-shopping" @click="goHome">{{ $t('order.goShopping') }}</button>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-state">
      <text>{{ $t('common.loading') }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getOrderList, cancelOrder as apiCancel, confirmReceive as apiConfirm, deleteOrder as apiDelete } from '@/api/order'

// Tab 配置
const tabs = [
  { label: '全部', value: -1 },
  { label: '待付款', value: 0 },
  { label: '待发货', value: 1 },
  { label: '待收货', value: 2 },
  { label: '已完成', value: 3 },
  { label: '售后/纠纷', value: 4 },
  { label: '已取消', value: 5 },
]

const currentTab = ref(-1)
const orderList = ref<any[]>([])
const page = ref(1)
const pageSize = 20
const hasMore = ref(true)
const loading = ref(false)

// 订单状态文本映射
const getStatusText = (status: number) => {
  const map: Record<number, string> = {
    0: '待付款',
    1: '待发货',
    2: '待收货',
    3: '已完成',
    4: '售后/纠纷',
    5: '已取消',
  }
  return map[status] || '未知'
}

// 订单状态样式
const getStatusClass = (status: number) => {
  const map: Record<number, string> = {
    0: 'status-warning',
    1: 'status-info',
    2: 'status-info',
    3: 'status-success',
    4: 'status-danger',
    5: 'status-default',
  }
  return map[status] || 'status-default'
}

// 格式化价格
const formatPrice = (price: number) => {
  if (!price) return '₫0'
  return `₫${price.toLocaleString()}`
}

// 切换 Tab
const switchTab = (value: number) => {
  if (currentTab.value === value) return
  currentTab.value = value
  page.value = 1
  hasMore.value = true
  orderList.value = []
  loadOrders()
}

// 加载订单
const loadOrders = async (append = false) => {
  if (loading.value) return
  if (!append && !hasMore.value) return

  loading.value = true
  try {
    const params: any = {
      page: page.value,
      size: pageSize,
    }
    if (currentTab.value !== -1) {
      params.status = currentTab.value
    }
    const res = await getOrderList(params)
    const newList = res.list || []
    if (newList.length < pageSize) {
      hasMore.value = false
    }
    if (append) {
      orderList.value.push(...newList)
    } else {
      orderList.value = newList
    }
    page.value++
  } catch (err) {
    console.error('加载订单失败', err)
    // Mock 数据
    if (!append) {
      orderList.value = getMockOrders()
      hasMore.value = false
    }
  } finally {
    loading.value = false
  }
}

// 加载更多
const loadMore = () => {
  if (!loading.value && hasMore.value) {
    loadOrders(true)
  }
}

// 取消订单
const cancelOrder = async (orderId: number) => {
  uni.showModal({
    title: '提示',
    content: '确定要取消该订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await apiCancel(orderId)
          uni.showToast({ title: '已取消', icon: 'success' })
          loadOrders()
        } catch (err) {
          uni.showToast({ title: '取消失败', icon: 'none' })
        }
      }
    },
  })
}

// 去支付
const goPay = (orderId: number) => {
  uni.navigateTo({ url: `/pages/pay/index?orderId=${orderId}` })
}

// 确认收货
const confirmReceive = async (orderId: number) => {
  uni.showModal({
    title: '提示',
    content: '请确认已收到商品，确认后将完成交易',
    success: async (res) => {
      if (res.confirm) {
        try {
          await apiConfirm(orderId)
          uni.showToast({ title: '确认成功', icon: 'success' })
          loadOrders()
        } catch (err) {
          uni.showToast({ title: '操作失败', icon: 'none' })
        }
      }
    },
  })
}

// 删除订单
const deleteOrder = async (orderId: number) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除该订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await apiDelete(orderId)
          uni.showToast({ title: '已删除', icon: 'success' })
          loadOrders()
        } catch (err) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    },
  })
}

// 联系卖家
const contactSeller = (sellerId: number) => {
  uni.navigateTo({ url: `/pages/chat/room?sellerId=${sellerId}` })
}

// 查看物流
const viewLogistics = (orderId: number) => {
  uni.navigateTo({ url: `/pages/logistics/index?orderId=${orderId}` })
}

// 申请售后
const applyAfterSale = (orderId: number) => {
  uni.navigateTo({ url: `/pages/after-sale/apply?orderId=${orderId}` })
}

// 查看售后
const viewAfterSale = (orderId: number) => {
  uni.navigateTo({ url: `/pages/after-sale/detail?orderId=${orderId}` })
}

// 评价
const goReview = (orderId: number) => {
  uni.navigateTo({ url: `/pages/review/create?orderId=${orderId}` })
}

// 去首页
const goHome = () => {
  uni.switchTab({ url: '/pages/index/index' })
}

// Mock 数据
const getMockOrders = () => {
  return [
    {
      id: 1,
      orderNo: 'DD202406150001',
      status: 0,
      payAmount: 89000,
      items: [
        {
          id: 1,
          productName: '越南进口咖啡',
          skuSpecs: '500g装',
          productImage: 'https://picsum.photos/200/200?random=1',
          unitPrice: 89000,
          quantity: 1,
        },
      ],
      sellerId: 1,
    },
    {
      id: 2,
      orderNo: 'DD202406140002',
      status: 2,
      payAmount: 165000,
      items: [
        {
          id: 2,
          productName: '越南腰果',
          skuSpecs: '400g装',
          productImage: 'https://picsum.photos/200/200?random=2',
          unitPrice: 65000,
          quantity: 1,
        },
        {
          id: 3,
          productName: '越南咖啡',
          skuSpecs: '500g装',
          productImage: 'https://picsum.photos/200/200?random=1',
          unitPrice: 89000,
          quantity: 1,
        },
      ],
      sellerId: 1,
    },
    {
      id: 3,
      orderNo: 'DD202406100003',
      status: 3,
      payAmount: 89000,
      items: [
        {
          id: 4,
          productName: '越南咖啡',
          skuSpecs: '500g装',
          productImage: 'https://picsum.photos/200/200?random=1',
          unitPrice: 89000,
          quantity: 1,
        },
      ],
      sellerId: 1,
    },
  ]
}

onShow(() => {
  page.value = 1
  hasMore.value = true
  loadOrders()
})
</script>

<style scoped lang="scss">
.order-list-container {
  background: #f5f5f5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Tab 栏 */
.tab-bar {
  background: #fff;
  display: flex;
  padding: 20rpx 0;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1rpx solid #eee;
}

.tab-item {
  flex: 1;
  text-align: center;
  position: relative;
  padding: 16rpx 0;
  font-size: 28rpx;
  color: #666;

  &.active {
    color: #ff6b6b;
    font-weight: bold;
  }
}

.tab-indicator {
  position: absolute;
  bottom: -20rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 48rpx;
  height: 4rpx;
  background: #ff6b6b;
  border-radius: 2rpx;
}

/* 订单滚动区 */
.order-scroll {
  flex: 1;
  padding: 20rpx 24rpx;
}

/* 订单卡片 */
.order-card {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.order-no {
  font-size: 26rpx;
  color: #666;
}

.order-status {
  font-size: 26rpx;
  font-weight: bold;

  &.status-warning { color: #ff9800; }
  &.status-info { color: #2196f3; }
  &.status-success { color: #4caf50; }
  &.status-danger { color: #f44336; }
  &.status-default { color: #999; }
}

/* 订单商品 */
.order-goods {
  padding: 0 24rpx;
}

.goods-item {
  display: flex;
  padding: 24rpx 0;
  gap: 20rpx;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.goods-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
}

.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.goods-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.goods-specs {
  font-size: 24rpx;
  color: #999;
}

.goods-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.goods-price {
  font-size: 28rpx;
  color: #ff6b6b;
  font-weight: bold;
}

.goods-quantity {
  font-size: 26rpx;
  color: #999;
}

/* 订单底部 */
.order-footer {
  padding: 20rpx 24rpx;
  border-top: 1rpx solid #f0f0f0;
  background: #fafafa;
}

.total-amount {
  font-size: 26rpx;
  color: #666;
  display: block;
  text-align: right;
  margin-bottom: 16rpx;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
}

.action-btn {
  border-radius: 60rpx;
  padding: 12rpx 28rpx;
  font-size: 24rpx;

  &.primary {
    background: #ff6b6b;
    color: #fff;
    border: none;
  }

  &.secondary {
    background: #fff;
    color: #666;
    border: 1rpx solid #ddd;
  }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-image {
  width: 300rpx;
  height: 300rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  color: #999;
  font-size: 28rpx;
  margin-bottom: 40rpx;
}

.go-shopping {
  background: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 60rpx;
  padding: 20rpx 60rpx;
  font-size: 28rpx;
}

.loading-state {
  text-align: center;
  padding: 60rpx;
  color: #999;
}
</style>
