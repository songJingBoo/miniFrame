import request from '@/utils/request'
// 登录
export function login (account) {
  return request({
    url: '/user/login?account=' + account,
    method: 'post'
  })
}
/** 用户管理  **/
// 查询用户
export function queryUser (data) {
  return request({
    url: '/user/queryUser',
    method: 'get',
    data
  })
}
// 新增用户
export function addUser (data) {
  return request({
    url: '/user/addUser',
    method: 'post',
    data
  })
}
// 配置用户角色
export function addUserRole (data) {
  return request({
    url: '/user/addUserRole',
    method: 'post',
    data
  })
}
/** 角色管理 **/
// 查询角色
export function queryRole (data) {
  return request({
    url: '/role/queryRole',
    method: 'get',
    data
  })
}
// 新增角色
export function addRole (data) {
  return request({
    url: '/role/addRole',
    method: 'post',
    data
  })
}
// 角色绑定权限
export function addRolePermission (data) {
  return request({
    url: '/role/addRolePermission',
    method: 'post',
    data
  })
}
/** 组管理 **/
// 查询用户组
export function queryUserGroupInfo (data) {
  return request({
    url: '/user/getUserGroupInfo',
    method: 'get',
    data
  })
}
// 新增用户组
export function addUserGroup (data) {
  return request({
    url: '/user/addUserGroup',
    method: 'post',
    data
  })
}
// 用户组添加成员
export function addUserToGroup (data) {
  return request({
    url: '/user/addUserToGroup',
    method: 'post',
    data
  })
}
// 用户组绑定角色
export function addRoleToGroup (data) {
  return request({
    url: '/user/addRoleToGroup',
    method: 'post',
    data
  })
}

/** 资源管理 **/
// 获取模块
export function getPermissionInfo (data) {
  return request({
    url: '/permission/getPermissionInfo',
    method: 'get',
    data
  })
}
// 新增或修改模块
export function addOrEditPermission (data) {
  return request({
    url: '/permission/addPermission',
    method: 'post',
    data
  })
}
// 删除模块
export function delPermission (data) {
  return request({
    url: '/permission/delPermission',
    method: 'post',
    data
  })
}
