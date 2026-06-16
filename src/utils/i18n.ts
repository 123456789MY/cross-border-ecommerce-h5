import { createI18n } from 'vue-i18n'
import zhCN from '../locale/zh-CN.json'
import viVN from '../locale/vi-VN.json'

// 强制重新加载语言包
const messages = {
  'zh-CN': { ...zhCN },
  'zh': { ...zhCN },
  'vi-VN': { ...viVN },
  'vi': { ...viVN }
}

// 获取默认语言：优先本地存储 > 系统语言 > 默认中文
const getDefaultLocale = () => {
  const stored = uni.getStorageSync('app_language')
  if (stored && (stored === 'zh-CN' || stored === 'vi-VN')) {
    return stored
  }

  // 根据系统语言判断
  try {
    const systemInfo = uni.getSystemInfoSync()
    const language = systemInfo.language || ''
    if (language.toLowerCase().includes('vi')) {
      return 'vi-VN'
    }
  } catch (e) {
    // ignore
  }

  return 'zh-CN'
}

const i18n = createI18n({
  legacy: false,
  locale: getDefaultLocale(),
  fallbackLocale: {
    'vi-VN': ['vi', 'zh-CN'],
    'zh-CN': ['zh', 'en'],
    default: 'zh-CN'
  },
  messages
})

export default i18n
