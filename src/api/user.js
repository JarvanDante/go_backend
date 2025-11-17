import request from '@/utils/request'

// 调用 GoFrame 登录接口
export function login(data) {
  return request({
    url: '/api/backend/login',
    method: 'post',
    data
  })
}

// 登录后获取用户信息
export function getInfo() {
  return request({
    url: '/api/backend/get-info', // 你的后端接口，如果没有我可以帮你写
    method: 'get'
  })
}

export function permissions(data) {
  return request({
    url: '/api/backend/permissions',
    method: 'get',
    data
  })
}

// 退出登录（如果你有对应接口）
export function logout() {
  return request({
    url: '/api/backend/logout',
    method: 'post'
  })
}
