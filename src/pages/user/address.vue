<template>
  <view class="address-container">
    <view class="address-list" v-if="addressList.length > 0">
      <view class="address-item" v-for="addr in addressList" :key="addr.id">
        <view class="address-info">
          <view class="address-row">
            <text class="name">{{ addr.receiverName }}</text>
            <text class="phone">{{ addr.receiverPhone }}</text>
          </view>
          <text class="address">{{ addr.fullAddress }}</text>
        </view>
        <view class="address-actions">
          <view class="default-badge" v-if="addr.isDefault">{{ $t('address.default') }}</view>
          <view class="action-icons">
            <text class="edit" @click="editAddress(addr.id)">✏️</text>
            <text class="delete" @click="removeAddress(addr.id)">🗑️</text>
          </view>
        </view>
      </view>
    </view>

    <view class="empty-state" v-else>
      <text class="empty-text">{{ $t('address.empty') }}</text>
    </view>

    <button class="add-btn" @click="addAddress">{{ $t('address.add') }}</button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getAddressList, deleteAddress as apiDeleteAddress } from '@/api/user'

const addressList = ref<any[]>([])

const loadAddressList = async () => {
  try {
    const res = await getAddressList()
    addressList.value = res || []
  } catch (err) {
    console.error('加载地址失败', err)
  }
}

const editAddress = (id: number) => {
  uni.navigateTo({ url: `/pages/user/address-edit?id=${id}` })
}

const addAddress = () => {
  uni.navigateTo({ url: '/pages/user/address-edit' })
}

const removeAddress = (id: number) => {
  uni.showModal({
    title: '提示',
    content: '确定删除该地址吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await apiDeleteAddress(id)
          loadAddressList()
        } catch (err) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    },
  })
}

onShow(() => {
  loadAddressList()
})
</script>

<style scoped lang="scss">
.address-container {
  background: #f5f5f5;
  min-height: 100vh;
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.address-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.address-row {
  margin-bottom: 16rpx;
}

.name {
  font-size: 32rpx;
  font-weight: bold;
  margin-right: 20rpx;
}

.phone {
  font-size: 28rpx;
  color: #666;
}

.address {
  font-size: 28rpx;
  color: #999;
  line-height: 1.5;
}

.address-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.default-badge {
  background: #ffebeb;
  color: #ff6b6b;
  font-size: 22rpx;
  padding: 6rpx 16rpx;
  border-radius: 30rpx;
}

.action-icons {
  display: flex;
  gap: 24rpx;
  font-size: 36rpx;
}

.empty-state {
  text-align: center;
  padding: 100rpx 0;
}

.add-btn {
  position: fixed;
  bottom: 30rpx;
  left: 30rpx;
  right: 30rpx;
  background: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 60rpx;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 32rpx;
}
</style>
