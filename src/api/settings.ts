import { get, post } from '@/utils/request'

// 服务费配置接口
export interface ServiceFeeConfig {
  enabled: boolean
  type: 'weight' | 'volume'
  rate: number
  unit: string
  minFee: number
  maxFee: number
}

// 计算服务费请求参数
export interface CalculateServiceFeeParams {
  type: 'weight' | 'volume'
  weight?: number
  volume?: number
  quantity?: number
}

// 获取服务费配置
export function getServiceFeeConfig() {
  return get<ServiceFeeConfig>('/app/settings/service-fee')
}

// 计算服务费（根据商品重量/体积）
export function calculateServiceFee(data: CalculateServiceFeeParams) {
  return post<{ fee: number }>('/app/order/calculate-fee', data)
}
