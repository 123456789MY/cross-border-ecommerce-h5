import { get, post, put, del } from '@/utils/request'

/**
 * 获取购物车列表
 */
export function getCartList() {
  return get('/cart')
}

/**
 * 加入购物车
 * @param data - { skuId, quantity }
 */
export function addToCart(data: { skuId: number; quantity: number }) {
  return post('/cart/item', data)
}

/**
 * 修改商品数量
 * @param id - 购物车项ID
 * @param quantity
 */
export function updateQuantity(id: number, quantity: number) {
  return put(`/cart/item/${id}`, { quantity })
}

/**
 * 删除购物车商品
 * @param id
 */
export function deleteCartItem(id: number) {
  return del(`/cart/item/${id}`)
}

/**
 * 选中/取消选中
 * @param id
 * @param selected
 */
export function selectCartItem(id: number, selected: boolean) {
  return put('/cart/select', { cartItemId: id, selected })
}

/**
 * 全选/取消全选
 * @param selected
 */
export function selectAllCart(selected: boolean) {
  return put('/cart/select-all', { selected })
}
