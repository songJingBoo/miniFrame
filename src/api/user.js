import request from '@/utils/request'
// 登录
export function login (account) {
  return request({
    url: '/user/login?account=' + account,
    method: 'post'
  })
}
export function queryUser (data) {
  return request({
    url: '/user/info',
    method: 'get'
  })
}

export function uploadFile (data) {
  return request({
    url: '/uploadfile',
    method: 'post',
    data
  })
}
