/* global AppHome, VueRouter, components */

import scomponents from '../components/static-Components'
import dcomponents from '../components/dynamic-Components'

const routes = [{ path: '/', component: scomponents.AppHome }]

const router = new VueRouter({
  routes: routes
})

export default router
