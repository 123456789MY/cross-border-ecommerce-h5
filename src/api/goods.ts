import { get } from '@/utils/request'

/**
 * 获取商品列表
 * @param params - { source, page, size, sort }
 * @returns {Promise}
 */
export function getProductList(params: any) {
  return get('/products', params)
}

/**
 * 获取商品详情
 * @param id
 * @returns {Promise}
 */
export function getProductDetail(id: number) {
  return get(`/product/${id}`)
}

/**
 * 获取三方比价
 * @param productId
 * @returns {Promise}
 */
export function getComparePrice(productId: number) {
  return get(`/product/compare/${productId}`)
}
