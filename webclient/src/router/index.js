import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import Main from '@/components/Main'
import Registration from '@/components/Registration'

import axios from 'axios'
Object.defineProperty(Vue.prototype, '$axios', { value: axios });

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Main',
      component: Main
    },{
      path: '/login',
      name: 'Login',
      component: Login
    },{
      path: '/reg',
      name: 'Registration',
      component: Registration
    }
  ]
})
