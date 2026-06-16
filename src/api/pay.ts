import { get, post } from '@/utils/request'

/**
 * 获取支付参数
 * @param orderId - 订单ID
 * @param method - 支付方式
 */
export function getPaymentParams(orderId: number, method?: string) {
  return post('/payment/pay', { orderId, method })
}

/**
 * 查询支付状态
 * @param orderId
 */
export function queryPaymentStatus(orderId: number) {
  return get(`/payment/status/${orderId}`)
}
