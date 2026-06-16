<template>
  <view class="realname-container">
    <view class="form-section">
      <view class="form-item">
        <text class="label">{{ $t('realname.name') }}</text>
        <input v-model="form.realName" class="input" :placeholder="$t('realname.namePlaceholder')" />
      </view>
      <view class="form-item">
        <text class="label">{{ $t('realname.idCard') }}</text>
        <input v-model="form.idCard" class="input" :placeholder="$t('realname.idCardPlaceholder')" />
      </view>
      <view class="form-item">
        <text class="label">{{ $t('realname.frontPhoto') }}</text>
        <view class="upload-box" @click="uploadFront">
          <image v-if="form.frontPhoto" :src="form.frontPhoto" class="upload-img" mode="aspectFill" />
          <text v-else class="upload-tip">{{ $t('realname.clickUpload') }}</text>
        </view>
      </view>
      <view class="form-item">
        <text class="label">{{ $t('realname.backPhoto') }}</text>
        <view class="upload-box" @click="uploadBack">
          <image v-if="form.backPhoto" :src="form.backPhoto" class="upload-img" mode="aspectFill" />
          <text v-else class="upload-tip">{{ $t('realname.clickUpload') }}</text>
        </view>
      </view>
    </view>

    <button class="submit-btn" @click="submitRealname">{{ $t('common.submit') }}</button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { submitRealname as apiSubmitRealname } from '@/api/user'

const form = ref({
  realName: '',
  idCard: '',
  frontPhoto: '',
  backPhoto: '',
})

const uploadFront = () => {
  uni.chooseImage({
    count: 1,
    success: (res: any) => {
      form.value.frontPhoto = res.tempFilePaths[0]
    },
  })
}

const uploadBack = () => {
  uni.chooseImage({
    count: 1,
    success: (res: any) => {
      form.value.backPhoto = res.tempFilePaths[0]
    },
  })
}

const submitRealname = async () => {
  if (!form.value.realName || !form.value.idCard) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }
  try {
    await apiSubmitRealname(form.value)
    uni.showToast({ title: '提交成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1500)
  } catch (err: any) {
    uni.showToast({ title: err.message || '提交失败', icon: 'none' })
  }
}
</script>

<style scoped lang="scss">
.realname-container {
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
