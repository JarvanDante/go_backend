import request from '@/utils/request'

// 获取会员等级列表
export function getMemberGrades() {
  return request({
    url: '/api/backend/user-grades',
    method: 'get'
  })
}

// 保存会员等级
export function saveMemberGrades(data, fieldsDisable, autoProviding) {
  return request({
    url: '/api/backend/save-user-grades',
    method: 'post',
    data: {
      data: JSON.stringify(data),
      fieldsDisable: fieldsDisable || '',
      autoProviding: autoProviding || ''
    }
  })
}

// 删除会员等级
export function deleteMemberGrade(id) {
  return request({
    url: '/api/backend/delete-user-grades',
    method: 'post',
    data: { id }
  })
}

// 获取返水设置
export function getRebateSetting() {
  return request({
    url: '/api/backend/rebate-setting',
    method: 'get'
  })
}

// 添加返水规则
export function createRebateRule(data) {
  return request({
    url: '/api/backend/create-rebate-rule',
    method: 'post',
    data
  })
}

// 编辑返水规则
export function updateRebateRule(data) {
  return request({
    url: '/api/backend/update-rebate-rule',
    method: 'post',
    data
  })
}

// 删除返水规则
export function deleteRebateRule(id) {
  return request({
    url: '/api/backend/delete-rebate-rule',
    method: 'post',
    data: { id }
  })
}

// 添加返水规则条件
export function createRebateOption(data) {
  return request({
    url: '/api/backend/create-rebate-option',
    method: 'post',
    data
  })
}

// 编辑返水规则条件
export function updateRebateOption(data) {
  return request({
    url: '/api/backend/update-rebate-option',
    method: 'post',
    data
  })
}

// 删除返水规则条件
export function deleteRebateOption(id) {
  return request({
    url: '/api/backend/delete-rebate-option',
    method: 'post',
    data: { id }
  })
}
