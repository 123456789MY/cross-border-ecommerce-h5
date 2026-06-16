<template>
  <view class="login-container">
    <view class="logo-area">
      <image src="/static/logo.png" class="logo" mode="aspectFit" />
      <text class="slogan">{{ $t('login.slogan') }}</text>
    </view>

    <view class="form">
      <!-- 手机号输入 -->
      <view class="input-group">
        <text class="input-label">{{ $t('login.phone') }}</text>
        <input
          v-model="form.phone"
          type="number"
          :placeholder="$t('login.phonePlaceholder')"
          class="input"
        />
      </view>

      <!-- 密码输入 -->
      <view class="input-group">
        <text class="input-label">{{ $t('login.password') }}</text>
        <input
          v-model="form.password"
          type="password"
          :placeholder="$t('login.passwordPlaceholder')"
          class="input"
          @confirm="handleLogin"
        />
      </view>

      <!-- 登录按钮 -->
      <button class="login-btn" :loading="loading" @click="handleLogin">
        {{ $t('login.loginBtn') }}
      </button>

      <!-- 注册入口 -->
      <view class="register-link">
        <text @click="gotoRegister">{{ $t('login.noAccount') }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import { showToast } from '@/utils/toast'

const userStore = useUserStore()
const { locale } = useI18n()
const loading = ref(false)

const form = reactive({
  phone: '',
  password: '',
})

const handleLogin = async () => {
  if (!form.phone || !form.password) {
    showToast('请填写手机号和密码')
    return
  }

  loading.value = true
  try {
    const res: any = await userStore.login(form.phone, form.password)
    // 根据用户国家设置语言
    const country = res?.user?.country || 'CN'
    const lang = country === 'VN' ? 'vi-VN' : 'zh-CN'
    locale.value = lang
    uni.setStorageSync('app_language', lang)
    userStore.setLanguage(lang)
    showToast('登录成功')
    // 跳转到首页（TabBar页面需用switchTab）
    uni.switchTab({ url: '/pages/index/index' })
  } catch (err: any) {
    showToast(err.message || '登录失败')
  } finally {
    loading.value = false
  }
}

const gotoRegister = () => {
  uni.navigateTo({ url: '/pages/register/index' })
}
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 48rpx;
}

.logo-area {
  text-align: center;
  margin-bottom: 80rpx;
}

.logo {
  width: 160rpx;
  height: 160rpx;
  background: #fff;
  border-radius: 50%;
  padding: 20rpx;
}

.slogan {
  color: #fff;
  font-size: 28rpx;
  margin-top: 24rpx;
  display: block;
}

.form {
  width: 100%;
}

.input-group {
  margin-bottom: 32rpx;
}

.input-label {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  font-size: 28rpx;
  margin-bottom: 12rpx;
}

.input {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 60rpx;
  padding: 24rpx 32rpx;
  font-size: 30rpx;
  border: none;
  width: 100%;
  box-sizing: border-box;
}

.login-btn {
  background: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 60rpx;
  padding: 24rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-top: 48rpx;
  width: 100%;
}

.register-link {
  margin-top: 48rpx;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: underline;
}
</style>
