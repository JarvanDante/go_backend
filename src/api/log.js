import request from '@/utils/request'

/*后台操作日志列表*/
export function adminLogs(params) {
  return request({
    url: '/api/backend/admin-logs',
    method: 'get',
    params
  })
}
