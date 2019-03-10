/* global router, Vue */

// Start tha app
Vue.prototype.$interface = $interface
const app = new Vue({
  el: '#app',
  router,
  data: () => ({
    drawer: null
  })
}).$mount('#app')
