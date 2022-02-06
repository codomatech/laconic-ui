import Eev from 'eev'
import Vue from 'vue'
import Vuetify from 'vuetify'
import VueRouter from 'vue-router';


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

const vuetify = new Vuetify({
  icons: {
    iconfont: 'mdi',
  },
});


window.vuetify = vuetify

Vue.use(Vuetify)
Vue.use(VueRouter);

$interface.$app = new Vue({
  vuetify,
  el: '#app',
  router,
  data: () => ({
    drawer: null
  })
}).$mount('#app')

export default $interface
