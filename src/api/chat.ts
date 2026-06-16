import { get, post, put } from '@/utils/request'

// 获取会话列表
export function getSessionList() {
  return get('/chat/sessions')
}

// 获取消息列表
export function getMessageList(sellerId: number, page = 1) {
  return get(`/chat/messages/${sellerId}`, { page, size: 20 })
}

// 发送消息（HTTP 兜底）
export function sendMessage(data: any) {
  return post('/chat/send', data)
}

// 标记已读
export function markRead(sessionId: number) {
  return put(`/chat/read/${sessionId}`)
}
