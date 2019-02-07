/* global AppHome, VueRouter, components */

const routes = [{ path: '/', component: AppHome }]

components.map(comp => {
  routes.push(comp)
})

const router = new VueRouter({
  routes // short for `routes: routes`
})
