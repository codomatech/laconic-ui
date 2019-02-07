/* global router, Vue */

// Start tha app
const app = new Vue({
  el: '#app',
  router,
  data: () => ({
    drawer: null
  })
}).$mount('#app')
