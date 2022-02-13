import request from '@/utils/request'
// 注册
export function register (data) {
  return request({
    url: '/user/register',
    method: 'post',
    data
  })
}
// 登录
export function login (data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}
// 发送邮箱验证码
export function sendMailCode (email) {
  return request({
    url: '/sendcode?email=' + email,
    method: 'get'
  })
}
