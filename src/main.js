import Vue from 'vue'
import App from '@/App.vue'
import router from '@/router'
import store from '@/store'
// svg图片导入
import '@/icons/index'
// 全局样式
import '@/styles/index.scss'
import '@/styles/common.scss'
import '@/styles/cover.scss'
// elementUI
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// 自定义basePage组件
import BasePage from '@/components/BasePage'
// 校验方法
import Validator from '@/utils/request'

Vue.component('BasePage', BasePage)
Vue.use(ElementUI)
Vue.config.productionTip = false
Vue.prototype.$valid = Validator

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
