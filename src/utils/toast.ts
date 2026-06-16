export function showToast(title: string, icon: 'success' | 'error' | 'none' = 'none') {
  uni.showToast({
    title,
    icon,
    duration: 2000,
  })
}
