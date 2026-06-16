<template>
  <view class="profile-container">
    <view class="avatar-section" @click="changeAvatar">
      <image :src="form.avatar || '/static/default-avatar.png'" class="avatar" mode="aspectFill" />
      <text class="avatar-tip">{{ $t('user.changeAvatar') }}</text>
    </view>

    <view class="form-section">
      <view class="form-item">
        <text class="label">{{ $t('user.nickname') }}</text>
        <input v-model="form.nickname" class="input" :placeholder="$t('user.nicknamePlaceholder')" />
      </view>
      <view class="form-item">
        <text class="label">{{ $t('user.gender') }}</text>
        <view class="gender-options">
          <label class="gender-option" @click="form.gender = 0">
            <radio :checked="form.gender === 0" /> {{ $t('user.genderUnknown') }}
          </label>
          <label class="gender-option" @click="form.gender = 1">
            <radio :checked="form.gender === 1" /> {{ $t('user.genderMale') }}
          </label>
          <label class="gender-option" @click="form.gender = 2">
            <radio :checked="form.gender === 2" /> {{ $t('user.genderFemale') }}
          </label>
        </view>
      </view>
    </view>

    <button class="save-btn" @click="saveProfile">{{ $t('common.save') }}</button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getUserInfo, updateUserProfile } from '@/api/user'

const form = ref({
  nickname: '',
  gender: 0,
  avatar: '',
})

onLoad(async () => {
  try {
    const res = await getUserInfo()
    form.value = { ...form.value, ...res }
  } catch (err) {
    console.error('加载用户信息失败', err)
  }
})

const changeAvatar = () => {
  uni.chooseImage({
    count: 1,
    success: (res: any) => {
      form.value.avatar = res.tempFilePaths[0]
    },
  })
}

const saveProfile = async () => {
  try {
    await updateUserProfile(form.value)
    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1500)
  } catch (err: any) {
    uni.showToast({ title: err.message || '保存失败', icon: 'none' })
  }
}
</script>

<style scoped lang="scss">
.profile-container {
  background: #f5f5f5;
  min-height: 100vh;
  padding: 30rpx;
}

.avatar-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 40rpx;
  text-align: center;
  margin-bottom: 20rpx;
}

.avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  margin-bottom: 16rpx;
}

.avatar-tip {
  font-size: 26rpx;
  color: #999;
}

.form-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 0 30rpx;
  margin-bottom: 40rpx;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.label {
  width: 160rpx;
  font-size: 30rpx;
  color: #333;
}

.input {
  flex: 1;
  font-size: 30rpx;
}

.gender-options {
  display: flex;
  gap: 40rpx;
}

.gender-option {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.save-btn {
  background: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 60rpx;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 32rpx;
}
</style>
