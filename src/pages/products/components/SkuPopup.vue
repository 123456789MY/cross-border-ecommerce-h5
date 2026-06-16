<template>
  <view class="sku-mask" v-if="modelValue" @click="close">
    <view class="sku-popup" @click.stop>
      <view class="popup-header">
        <text class="title">{{ $t('product.selectSku') }}</text>
        <text class="close" @click="close">✕</text>
      </view>

      <scroll-view scroll-y class="sku-list">
        <view
          class="sku-item"
          :class="{ active: selectedSku?.id === sku.id }"
          v-for="sku in skuList"
          :key="sku.id"
          @click="selectSku(sku)"
        >
          <text class="sku-specs">{{ sku.specs }}</text>
          <text class="sku-price">{{ formatPrice(sku.price) }}</text>
          <text class="sku-stock">{{ $t('product.stock') }}{{ sku.stock }}</text>
        </view>
      </scroll-view>

      <view class="popup-footer">
        <button class="confirm-btn" @click="confirm">{{ $t('common.confirm') }}</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  skuList: any[]
  selectedSku: any | null
}>()

const emit = defineEmits(['update:modelValue', 'select', 'confirm'])

// 关闭弹窗
const close = () => {
  emit('update:modelValue', false)
}

// 选择 SKU
const selectSku = (sku: any) => {
  emit('select', sku)
}

// 确认
const confirm = () => {
  emit('confirm')
  close()
}

// 格式化价格
const formatPrice = (price: number) => {
  if (!price) return '₫0'
  return `₫${price.toLocaleString()}`
}
</script>

<style scoped lang="scss">
.sku-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}

.sku-popup {
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  max-height: 70vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 32rpx;
  border-bottom: 1rpx solid #eee;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
}

.close {
  font-size: 40rpx;
  color: #999;
  padding: 8rpx;
}

.sku-list {
  flex: 1;
  padding: 20rpx 32rpx;
  max-height: 500rpx;
}

.sku-item {
  background: #f5f5f5;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &.active {
    background: #ffebeb;
    border: 1rpx solid #ff6b6b;
  }
}

.sku-specs {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  flex: 2;
}

.sku-price {
  font-size: 28rpx;
  color: #ff6b6b;
  font-weight: bold;
  flex: 1;
  text-align: right;
}

.sku-stock {
  font-size: 22rpx;
  color: #999;
  flex: 1;
  text-align: right;
}

.popup-footer {
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #eee;
}

.confirm-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  color: #fff;
  border: none;
  border-radius: 60rpx;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 32rpx;
  font-weight: bold;
}
</style>
