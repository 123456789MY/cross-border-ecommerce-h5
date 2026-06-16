import { get, put, del } from '@/utils/request'

/**
 * 获取订单列表
 * @param params - { page, size, status }
 */
export function getOrderList(params: any) {
  return get('/orders', params)
}

/**
 * 获取订单详情
 * @param id
 */
export function getOrderDetail(id: number) {
  return get(`/order/${id}`)
}

/**
 * 取消订单
 * @param id
 */
export function cancelOrder(id: number) {
  return put(`/order/${id}/cancel`)
}

/**
 * 确认收货
 * @param id
 */
export function confirmReceive(id: number) {
  return put(`/order/${id}/confirm`)
}

/**
 * 删除订单
 * @param id
 */
export function deleteOrder(id: number) {
  return del(`/order/${id}`)
}
