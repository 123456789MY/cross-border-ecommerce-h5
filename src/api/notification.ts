import { get, put } from '@/utils/request'

// 获取通知列表
export function getNotificationList(params?: any) {
  return get('/notification/list', params)
}

// 获取未读数
export function getUnreadCount() {
  return get('/notification/unread-count')
}

// 标记单条已读
export function markAsRead(id: number) {
  return put(`/notification/read/${id}`)
}

// 全部已读
export function markAllAsRead() {
  return put('/notification/read-all')
}
