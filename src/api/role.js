import request from '@/utils/request'

// 获取角色列表
export function getRoles() {
  return request({
    url: '/api/backend/roles',
    method: 'get'
  })
}

// 获取权限列表
export function getPermissions() {
  return request({
    url: '/api/backend/permissions',
    method: 'get'
  })
}

// 创建角色
export function createRole(data) {
  return request({
    url: '/api/backend/create-role',
    method: 'post',
    data
  })
}

// 更新角色
export function updateRole(data) {
  return request({
    url: '/api/backend/update-role',
    method: 'post',
    data
  })
}

// 删除角色
export function deleteRole(data) {
  return request({
    url: '/api/backend/delete-role',
    method: 'post',
    data
  })
}

// 保存角色权限
export function savePermission(data) {
  return request({
    url: '/api/backend/save-permission',
    method: 'post',
    data
  })
}
