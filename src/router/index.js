import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/views/login.vue'
import Layout from '@/layout/index.vue'
import { generateRoutes } from '@/config/menu'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    component: Login
  },
  {
    path: '/register',
    component: () => import('@/views/register.vue')
  },
  {
    path: '*',
    component: Layout,
    redirect: '/home',
    children: generateRoutes()
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

/** 路由守卫 **/
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('PER_TOKEN')
  if (token) {
    next()
  } else {
    if (to.path === '/login') {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
    }
  }
})

export default router
