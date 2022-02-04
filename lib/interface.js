/* global Eev, Vue, Vuetify */

export default $interface

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
    iconfont: 'md',  // 'mdi' || 'mdiSvg' || 'md' || 'fa' || 'fa4'
  },
  theme: {
    dark: false,
  },
  themes: {
    light: {
      primary: "#4682b4",
      secondary: "#b0bec5",
      accent: "#8c9eff",
      error: "#b71c1c",
    },
  },
})


$interface.$app = new Vue({
  el: '#app',
  router,
  vuetify,
  data: () => ({
    drawer: null
  })
}).$mount('#app')
