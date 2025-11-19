import request from '@/utils/request'

export function basicSetting(params = {}) {
  return request({
    url: '/api/backend/basic-setting',
    method: 'get',
    params
  })
}

export function updateBasicSetting(data) {
  return request({
    url: '/api/backend/update-basic-setting',
    method: 'post',
    data
  })
}
