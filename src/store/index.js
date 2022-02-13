import Vue from 'vue'
import Vuex from 'vuex'
import { login } from '@/api/user'
import { generateMenu } from '@/config/menu'
import router from '@/router'

Vue.use(Vuex)

// const modulesFiles = require.context('./modules', true, /\.js$/)
// const modules = modulesFiles.keys().reduce((modules, modulePath) => {
//   const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
//   const value = modulesFiles(modulePath)
//   modules[moduleName] = value.default
//   return modules
// }, {})

const state = {
  token: localStorage.getItem('PER_TOKEN') || '',
  userInfo: getUserInfo(),
  menuList: getMenuList()
}

function getUserInfo () {
  const userInfo = localStorage.getItem('USERINFO')
  return JSON.parse(userInfo || '{}')
}
function getMenuList () {
  const menuList = localStorage.getItem('MENULIST')
  return JSON.parse(menuList || '[]')
}

const mutations = {
  SET_TOKEN: (state, token) => {
    localStorage.setItem('PER_TOKEN', token)
    state.token = token
  },
  SET_USERINFO: (state, userInfo) => {
    localStorage.setItem('USERINFO', JSON.stringify(userInfo))
    state.userInfo = userInfo
  },
  DEL_TOKEN: (state) => {
    localStorage.removeItem('PER_TOKEN')
  },
  DEL_USERINFO: (state) => {
    localStorage.removeItem('USERINFO')
  },
  SET_MENULIST: (state, menuList) => {
    localStorage.setItem('MENULIST', JSON.stringify(menuList))
    state.menuList = menuList
  },
  DEL_MENULIST: (state) => {
    localStorage.removeItem('MENULIST')
    state.menuList = []
  }
}

const actions = {
  login: ({ commit }, userInfo) => {
    const { nickname, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ nickname: nickname.trim(), password: password })
        .then(response => {
          commit('SET_USERINFO', response.data)
          resolve(response)
        })
        .catch(error => {
          reject(error)
        })
    })
  },
  logout: ({ commit }) => {
    commit('DEL_TOKEN')
    router.push({ path: '/login' })
  },
  updateMenu: async ({ commit }) => {
    const res = await login('admin')
    if (res.status === 200) {
      const menuList = generateMenu(res.data.permission)
      commit('SET_MENULIST', menuList)
    } else {
      this.$message.error('登录失败!')
    }
  }
}

const getters = {
  nickname: state => state.userInfo.nickname,
  permission: state => state.userInfo.permission,
  role: state => state.userInfo.role,
  userId: state => state.userInfo.userId
}

export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters
})
