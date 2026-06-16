import { get } from '@/utils/request'

/**
 * 搜索商品
 * @param params - { keyword, page, size, sort }
 */
export function searchProducts(params: any) {
  return get('/products/search', params)
}
