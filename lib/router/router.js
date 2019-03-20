/* global AppHome, VueRouter, components */

export default router

import scomponents from '../components/static-Components'
import dcomponents from '../components/dynamic-Components' 

const routes = [{ path: '/', component: scomponents.AppHome }]

const router = new VueRouter({
  routes: routes
})

window.router = router
