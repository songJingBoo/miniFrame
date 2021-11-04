import Vue from 'vue'
import App from '@/App.vue'
import router from '@/router'
import store from '@/store'
// svg图片导入
import '@/icons/index'
// 全局样式
import '@/styles/index.scss'
// elementUI
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
