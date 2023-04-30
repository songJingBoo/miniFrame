import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/views/login.vue'

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
    path: '/project',
    component: () => import('@/layout/index.vue'),
    redirect: '/project/chat',
    children: [
      {
        path: 'chat',
        component: () => import('@/views/chat.vue')
      },
      {
        path: 'upload',
        component: () => import('@/views/upload.vue')
      },
    ]
  },
  {
    path: '*',
    redirect: '/project'
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
    if (to.path === '/login') {
      next(from.path)
    } else {
      next()
    }
  } else {
    if (to.path === '/login' || to.path === '/register') {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
    }
  }
})

export default router
