const BASE_URL = 'http://localhost:3000/api'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
  showLoading?: boolean
}

interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
}

function request<T = any>(options: RequestOptions): Promise<T> {
  const { url, method = 'GET', data, header = {}, showLoading = true } = options

  const token = uni.getStorageSync('access_token') || ''

  if (showLoading) {
    uni.showLoading({ title: '加载中...', mask: true })
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        ...header
      },
      success: (res: any) => {
        if (showLoading) uni.hideLoading()

        if (res.statusCode === 200) {
          const result = res.data as ApiResponse<T>
          if (result.code === 200) {
            resolve(result.data)
          } else if (result.code === 401) {
            uni.removeStorageSync('token')
            uni.showToast({ title: '登录已过期', icon: 'none' })
            setTimeout(() => {
              uni.navigateTo({ url: '/pages/login/index' })
            }, 1500)
            reject(new Error(result.message))
          } else {
            uni.showToast({ title: result.message || '请求失败', icon: 'none' })
            reject(new Error(result.message))
          }
        } else {
          uni.showToast({ title: '网络错误', icon: 'none' })
          reject(new Error('网络错误'))
        }
      },
      fail: (err) => {
        if (showLoading) uni.hideLoading()
        uni.showToast({ title: '请求失败', icon: 'none' })
        reject(err)
      }
    })
  })
}

export const get = <T = any>(url: string, params?: any, showLoading = true) =>
  request<T>({ url, method: 'GET', data: params, showLoading })

export const post = <T = any>(url: string, data?: any, showLoading = true) =>
  request<T>({ url, method: 'POST', data, showLoading })

export const put = <T = any>(url: string, data?: any, showLoading = true) =>
  request<T>({ url, method: 'PUT', data, showLoading })

export const del = <T = any>(url: string, data?: any, showLoading = true) =>
  request<T>({ url, method: 'DELETE', data, showLoading })

export default request
