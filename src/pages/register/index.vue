<template>
  <view class="register-container">
    <view class="logo-area">
      <image src="/static/logo.png" class="logo" mode="aspectFit" />
      <text class="slogan">{{ $t('register.slogan') }}</text>
    </view>

    <view class="form">
      <!-- 手机号 -->
      <view class="input-group">
        <text class="input-label">{{ $t('register.phone') }}</text>
        <input
          v-model="form.phone"
          type="number"
          :placeholder="$t('register.phonePlaceholder')"
          class="input"
        />
      </view>

      <!-- 验证码 + 发送按钮 -->
      <view class="input-group">
        <text class="input-label">{{ $t('register.smsCode') }}</text>
        <view class="sms-row">
          <input
            v-model="form.smsCode"
            type="number"
            :placeholder="$t('register.smsCodePlaceholder')"
            class="input sms-input"
          />
          <button
            class="sms-btn"
            :disabled="countdown > 0 || !form.phone"
            @click="sendCode"
          >
            {{ countdown > 0 ? `${countdown}s` : $t('register.getCode') }}
          </button>
        </view>
      </view>

      <!-- 密码 -->
      <view class="input-group">
        <text class="input-label">{{ $t('register.password') }}</text>
        <input
          v-model="form.password"
          type="password"
          :placeholder="$t('register.passwordPlaceholder')"
          class="input"
        />
      </view>

      <!-- 确认密码 -->
      <view class="input-group">
        <text class="input-label">{{ $t('register.confirmPassword') }}</text>
        <input
          v-model="form.confirmPassword"
          type="password"
          :placeholder="$t('register.confirmPasswordPlaceholder')"
          class="input"
        />
      </view>

      <!-- 注册按钮 -->
      <button class="register-btn" :loading="loading" @click="handleRegister">
        {{ $t('register.registerBtn') }}
      </button>

      <!-- 登录入口 -->
      <view class="login-link">
        <text @click="gotoLogin">{{ $t('register.hasAccount') }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { sendSmsCode, register } from '@/api/user'
import { showToast } from '@/utils/toast'

const loading = ref(false)
const countdown = ref(0)
let timer: any = null

const form = reactive({
  phone: '',
  smsCode: '',
  password: '',
  confirmPassword: '',
})

const sendCode = async () => {
  if (!form.phone) {
    showToast('请填写手机号')
    return
  }
  if (countdown.value > 0) return

  try {
    await sendSmsCode(form.phone)
    showToast('验证码已发送')
    countdown.value = 60
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(timer)
    }, 1000)
  } catch (err: any) {
    showToast(err.message || '发送失败')
  }
}

const handleRegister = async () => {
  if (!form.phone || !form.smsCode || !form.password) {
    showToast('请填写完整信息')
    return
  }
  if (form.password !== form.confirmPassword) {
    showToast('两次密码输入不一致')
    return
  }

  loading.value = true
  try {
    await register({
      phone: form.phone,
      smsCode: form.smsCode,
      password: form.password,
    })
    showToast('注册成功，请登录')
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (err: any) {
    showToast(err.message || '注册失败')
  } finally {
    loading.value = false
  }
}

const gotoLogin = () => {
  uni.navigateBack()
}
</script>

<style scoped lang="scss">
.register-container {
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
  margin-bottom: 60rpx;
}

.logo {
  width: 140rpx;
  height: 140rpx;
  background: #fff;
  border-radius: 50%;
  padding: 16rpx;
}

.slogan {
  color: #fff;
  font-size: 28rpx;
  margin-top: 20rpx;
  display: block;
}

.form {
  width: 100%;
}

.input-group {
  margin-bottom: 24rpx;
}

.input-label {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  font-size: 26rpx;
  margin-bottom: 8rpx;
}

.input {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 60rpx;
  padding: 20rpx 28rpx;
  font-size: 28rpx;
  border: none;
  width: 100%;
  box-sizing: border-box;
}

.sms-row {
  display: flex;
  gap: 20rpx;
  align-items: center;
}

.sms-input {
  flex: 1;
}

.sms-btn {
  background: #4ecdc4;
  color: #fff;
  border: none;
  border-radius: 60rpx;
  padding: 20rpx 24rpx;
  font-size: 26rpx;
  white-space: nowrap;
}

.sms-btn[disabled] {
  opacity: 0.6;
}

.register-btn {
  background: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 60rpx;
  padding: 24rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-top: 40rpx;
  width: 100%;
}

.login-link {
  margin-top: 40rpx;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: underline;
}
</style>
