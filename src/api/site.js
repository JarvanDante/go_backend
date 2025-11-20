import request from '@/utils/request'

/* 获取站点基本信息 */
export function basicSetting(data) {
  return request({
    url: '/api/backend/basic-setting',
    method: 'get',
    data
  })
}
/* 修改站点基本信息 */
export function updateBasicSetting(data) {
  return request({
    url: '/api/backend/update-basic-setting',
    method: 'post',
    data
  })
}
/* 获取会员注册配置信息 */
export function registerSetting(data) {
  return request({
    url: '/api/backend/register-setting',
    method: 'get',
    data
  })
}
/* 修改会员注册配置 */
export function updateRegisterSetting(data) {
  return request({
    url: '/api/backend/update-register-setting',
    method: 'post',
    data
  })
}
