import request from '@/utils/request'

/* 获取游戏管理列表 */
export function Games() {
  return request({
    url: '/api/backend/games',
    method: 'get'
  })
}
/* 修改游戏开关 */
export function updateGames(data) {
  return request({
    url: '/api/backend/update-games',
    method: 'post',
    data
  })
}
