import { get, post, put, del } from '@/utils/request'

// 发送验证码
export function sendSmsCode(phone: string) {
  return post('/auth/sms-code', { phone })
}

// 注册
export function register(data: { phone: string; smsCode: string; password: string }) {
  return post('/auth/register', data)
}

// 登录
export function login(phone: string, password: string) {
  return post('/auth/login', { phone, password })
}

// 获取用户信息
export function getUserInfo() {
  return get('/user/profile')
}

// 更新用户资料
export function updateUserProfile(data: any) {
  return put('/user/profile', data)
}

// 获取实名状态
export function getRealnameStatus() {
  return get('/user/realname/status')
}

// 提交实名认证
export function submitRealname(data: any) {
  return post('/user/realname', data)
}

// 获取商家申请状态
export function getSellerApplyStatus() {
  return get('/user/seller/status')
}

// 提交商家入驻申请
export function submitSellerApply(data: any) {
  return post('/user/seller/apply', data)
}

// 获取地址列表
export function getAddressList() {
  return get('/user/address')
}

// 添加地址
export function addAddress(data: any) {
  return post('/user/address', data)
}

// 更新地址
export function updateAddress(id: number, data: any) {
  return put(`/user/address/${id}`, data)
}

// 删除地址
export function deleteAddress(id: number) {
  return del(`/user/address/${id}`)
}

// 设置默认地址
export function setDefaultAddress(id: number) {
  return put(`/user/address/${id}/default`)
}
