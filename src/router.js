import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from './components/Login.vue'
import Home from './components/Home.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/home', component: Home }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从那个路径跳转而来
  // next 是一个函数，代表放行
  // next() 放行 next('/login') 强制跳转
  // --------
  // 访问login可以直接跳转到login
  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  // 假如tokenStr的值为空，就是没有token的话，访问home路径页面就会跳转到login
  if (!tokenStr) return next('/login')
  next()
})

export default router
