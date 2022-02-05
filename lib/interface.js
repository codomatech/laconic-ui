/* global Eev, Vue, Vuetify */

import router from './router/router'
import registerbusevents from './controllers/BUSEventHandler'

var $interface = {
    bus: new Eev(),
    state: {
      dsources: {
      }
    }
}

registerbusevents($interface)

// Start the app
Vue.prototype.$interface = $interface

Vue.use(Vuetify)

const vuetify = new Vuetify({
  icons: {
    iconfont: 'mdi',
  },
});


$interface.$app = new Vue({
  vuetify,
  el: '#app',
  router,
  data: () => ({
    drawer: null
  })
}).$mount('#app')

export default $interface
