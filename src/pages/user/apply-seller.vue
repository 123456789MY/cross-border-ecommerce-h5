<template>
  <view class="seller-container">
    <view class="form-section">
      <view class="form-item">
        <text class="label">{{ $t('seller.shopName') }}</text>
        <input v-model="form.shopName" class="input" :placeholder="$t('seller.shopNamePlaceholder')" />
      </view>
      <view class="form-item">
        <text class="label">{{ $t('seller.contactName') }}</text>
        <input v-model="form.contactName" class="input" :placeholder="$t('seller.contactNamePlaceholder')" />
      </view>
      <view class="form-item">
        <text class="label">{{ $t('seller.contactPhone') }}</text>
        <input v-model="form.contactPhone" class="input" :placeholder="$t('seller.contactPhonePlaceholder')" />
      </view>
      <view class="form-item">
        <text class="label">{{ $t('seller.businessLicense') }}</text>
        <view class="upload-box" @click="uploadLicense">
          <image v-if="form.businessLicense" :src="form.businessLicense" class="upload-img" mode="aspectFill" />
          <text v-else class="upload-tip">{{ $t('seller.clickUpload') }}</text>
        </view>
      </view>
      <view class="form-item">
        <text class="label">{{ $t('seller.introduction') }}</text>
        <textarea v-model="form.introduction" class="textarea" :placeholder="$t('seller.introductionPlaceholder')" />
      </view>
    </view>

    <button class="submit-btn" @click="submitApply">{{ $t('common.submit') }}</button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { submitSellerApply } from '@/api/user'

const form = ref({
  shopName: '',
  contactName: '',
  contactPhone: '',
  businessLicense: '',
  introduction: '',
})

const uploadLicense = () => {
  uni.chooseImage({
    count: 1,
    success: (res: any) => {
      form.value.businessLicense = res.tempFilePaths[0]
    },
  })
}

const submitApply = async () => {
  if (!form.value.shopName || !form.value.contactName || !form.value.contactPhone) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }
  try {
    await submitSellerApply(form.value)
    uni.showToast({ title: '提交成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1500)
  } catch (err: any) {
    uni.showToast({ title: err.message || '提交失败', icon: 'none' })
  }
}
</script>

<style scoped lang="scss">
.seller-container {
  background: #f5f5f5;
  min-height: 100vh;
  padding: 30rpx;
}

.form-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 0 30rpx;
  margin-bottom: 40rpx;
}

.form-item {
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.label {
  font-size: 30rpx;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.input {
  font-size: 30rpx;
  width: 100%;
}

.textarea {
  font-size: 30rpx;
  width: 100%;
  height: 160rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  padding: 16rpx;
}

.upload-box {
  width: 100%;
  height: 200rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed #ddd;
}

.upload-img {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}

.upload-tip {
  font-size: 28rpx;
  color: #999;
}

.submit-btn {
  background: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 60rpx;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 32rpx;
}
</style>
