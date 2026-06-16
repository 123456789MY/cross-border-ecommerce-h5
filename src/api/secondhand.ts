import { get, post } from '@/utils/request'

// 获取二手商品列表
export function getSecondhandList(params: any) {
  return get('/secondhand/list', params)
}

// 获取二手商品详情
export function getSecondhandDetail(id: number) {
  return get(`/secondhand/${id}`)
}

// 发布二手商品
export function publishSecondhand(data: any) {
  return post('/secondhand', data)
}

// 获取议价记录
export function getBargainList(secondhandId: number) {
  return get(`/secondhand/${secondhandId}/bargains`)
}

// 创建议价
export function createBargain(data: any) {
  return post('/secondhand/bargain', data)
}
