import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, getUserInfo as getUserInfoApi } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/token'

interface UserInfo {
  id: number
  nickname: string
  avatar: string
  phone: string
  country: string // 'CN' 中国, 'VN' 越南
  isRealName: boolean
  isSeller: boolean
  sellerStatus: number // 0:未申请 1:审核中 2:已通过 3:已驳回
}

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref<string>(getToken() || '')
  const userInfo = ref<UserInfo | null>(null)
  const language = ref<string>(uni.getStorageSync('app_language') || 'zh-CN')
  const cartCount = ref<number>(0)

  // Getters
  const isLogin = computed(() => !!token.value)

  // Actions
  async function login(phone: string, password: string) {
    const res: any = await loginApi(phone, password)
    token.value = res.accessToken || res.token || ''
    userInfo.value = res.user || null
    setToken(token.value)
    return res
  }

  async function fetchUserInfo() {
    const res: any = await getUserInfoApi()
    userInfo.value = res
  }

  function setUserInfo(info: UserInfo) {
    userInfo.value = info
    uni.setStorageSync('userInfo', JSON.stringify(info))
  }

  function setLanguage(lang: string) {
    language.value = lang
    uni.setStorageSync('app_language', lang)
  }

  function setCartCount(count: number) {
    cartCount.value = count
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    cartCount.value = 0
    removeToken()
    uni.removeStorageSync('userInfo')
  }

  function initUserInfo() {
    const storedUser = uni.getStorageSync('userInfo')
    if (storedUser) {
      try {
        userInfo.value = JSON.parse(storedUser)
      } catch (e) {
        userInfo.value = null
      }
    }
  }

  return {
    token,
    userInfo,
    language,
    cartCount,
    isLogin,
    login,
    fetchUserInfo,
    setUserInfo,
    setLanguage,
    setCartCount,
    logout,
    initUserInfo
  }
})
