const TOKEN_KEY = 'access_token'

export function getToken(): string | null {
  return uni.getStorageSync(TOKEN_KEY)
}

export function setToken(token: string) {
  uni.setStorageSync(TOKEN_KEY, token)
}

export function removeToken() {
  uni.removeStorageSync(TOKEN_KEY)
}
