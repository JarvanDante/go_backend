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
