import Vue from 'vue'
import axios from 'axios'
import store from '@/store'
import { Message, MessageBox } from 'element-ui'

// 1.创建axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 60000
})

// 2.请求拦截
service.interceptors.request.use(
  config => {
    if (store.state.token) {
      config.headers.Authorization = 'Bearer ' + store.state.token
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 3.响应拦截
service.interceptors.response.use(
  response => {
    const { data } = response
    if (data.code === -666) {
      MessageBox.confirm('登录已过期', '过期', {
        confirmButtonText: '去登录',
        showCancelButton: false,
        type: 'warning'
      }).then(() => {
        store.dispatch('logout')
      })
    }
    return data
  },
  error => {
    Message({
      message: error.message,
      type: 'error',
      duration: 5000
    })
    return Promise.reject(error)
  }
)
Vue.prototype.$http = service
export default service
