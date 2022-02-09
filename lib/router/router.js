import VueRouter from 'vue-router'

import scomponents from '../components/static-Components'

const routes = [{ path: '/', component: scomponents.AppHome }]

const router = new VueRouter({
  routes: routes
})

export default router
