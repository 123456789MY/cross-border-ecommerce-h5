let socket: any = null
let messageCallback: ((data: any) => void) | null = null

// 连接 WebSocket
export function connectSocket() {
  const token = uni.getStorageSync('access_token')
  if (!token) {
    console.log('未登录，WebSocket 跳过连接')
    return
  }

  try {
    socket = uni.connectSocket({
      url: `ws://localhost:3000/ws/chat?token=${token}`,
      success: () => console.log('WebSocket 连接中'),
    })

    if (socket) {
      socket.onOpen(() => {
        console.log('WebSocket 已连接')
      })

      socket.onMessage((res: any) => {
        try {
          const data = JSON.parse(res.data)
          if (messageCallback) {
            messageCallback(data)
          }
        } catch (e) {
          console.error('解析消息失败', e)
        }
      })

      socket.onClose(() => {
        console.log('WebSocket 已断开')
        // 不自动重连，避免开发环境无限重试
      })

      socket.onError((err: any) => {
        console.log('WebSocket 错误', err)
      })
    }
  } catch (e) {
    console.log('WebSocket 创建失败', e)
  }
}

// 断开连接
export function disconnectSocket() {
  if (socket) {
    socket.close()
    socket = null
  }
}

// 发送消息
export function sendSocketMessage(data: any): Promise<void> {
  if (!socket) {
    return Promise.reject('WebSocket 未连接')
  }
  return new Promise((resolve, reject) => {
    socket.send({
      data: JSON.stringify(data),
      success: () => resolve(),
      fail: (err: any) => reject(err),
    })
  })
}

// 注册消息接收回调
export function onSocketMessage(callback: (data: any) => void) {
  messageCallback = callback
}
