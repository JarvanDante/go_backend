// src/api/admin.js
import request from '@/utils/request'

// 获取员工列表
export function admins(params) {
  return request({
    url: '/api/backend/admins',
    method: 'get',
    params
  })
}

// 创建员工
export function createAdmin(data) {
  return request({
    url: '/api/backend/create-admin',
    method: 'post',
    data
  })
}

// 编辑员工
export function updateAdmin(data) {
  return request({
    url: '/api/backend/update-admin',
    method: 'post',
    data
  })
}

// 删除员工
export function deleteAdmin(data) {
  return request({
    url: '/api/backend/delete-admin',
    method: 'post',
    data
  })
}
