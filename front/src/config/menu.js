export const menuList = [
  {
    title: '首页',
    path: '/home',
    icon: 'aaa',
    name: 'home'
  },
  {
    title: '模型中心',
    path: '/model',
    icon: 'aaa',
    name: 'model',
    children: [
      {
        title: '模型管理',
        path: '/model/manage',
        icon: 'aaa',
        name: 'model_manage'
      },
      {
        title: '模型训练',
        path: '/model/train',
        icon: 'aaa',
        name: 'model_train'
      }
    ]
  },
  {
    title: '菜单管理',
    path: '/resource',
    icon: 'aaa',
    name: 'resource',
    children: [
      {
        title: '模块管理',
        path: '/resource/module',
        icon: 'aaa',
        name: 'resource_module'
      }
    ]
  },
  {
    title: '权限管理',
    path: '/permission',
    icon: 'aaa',
    name: 'permission',
    children: [
      {
        title: '用户管理',
        path: '/permission/user',
        icon: 'aaa',
        name: 'permission_user'
      },
      {
        title: '角色管理',
        path: '/permission/role',
        icon: 'aaa',
        name: 'permission_role'
      },
      {
        title: '组管理',
        path: '/permission/group',
        icon: 'aaa',
        name: 'permission_group'
      },
      {
        title: '菜单配置',
        path: '/permission/menu',
        icon: 'aaa',
        name: 'permission_menu12'
      }
    ]
  }
]

// 根据权限生成menu
function filterByCode (menu, nameArr) {
  const res = []
  menu.forEach(item => {
    const tmp = { ...item, children: undefined }
    if (nameArr.includes(item.name)) {
      if (item.children?.length) {
        tmp.children = filterByCode(item.children, nameArr)
      }
      res.push(tmp)
    }
  })
  return res
}
export function generateMenu (nameArr) {
  return filterByCode(menuList, nameArr)
}
// 根据menu生成路由
function configRoutesByMenu (menuArr) {
  let res = []
  menuArr.forEach(item => {
    if (item.children?.length) {
      res = res.concat(configRoutesByMenu(item.children))
    } else {
      res.push({
        ...item,
        component: () => import(`@/views${item.path}.vue`)
      })
    }
  })
  return res
}
export function generateRoutes (menuArr) {
  return configRoutesByMenu(menuList)
}
