import Eev from 'eev'
import Vue from 'vue'
import Vuetify from 'vuetify'
import VueRouter from 'vue-router'

import router from './router/router'
import registerbusevents from './controllers/BUSEventHandler'

const $interface = {
  bus: new Eev(),
  state: {
    dsources: {
    },
    notification: { active: false, text: '' }
  }
}

registerbusevents($interface)

// Start the app
Vue.prototype.$interface = $interface

const vuetify = new Vuetify({
  icons: {
    iconfont: 'mdi'
  }
})

window.vuetify = vuetify

Vue.use(Vuetify)
Vue.use(VueRouter)

const mainComponent = Vue.component('laconic-main', {
  data: () => ({ drawer: null, notification: $interface.state.notification }),
  template: `
      <v-app>
        <v-navigation-drawer fixed v-model="drawer" dark app>
          <app-list></app-list>
        </v-navigation-drawer>

        <v-app-bar color="indigo" dark app>
          <v-app-bar-nav-icon @click.stop="drawer = !drawer">
            <v-icon>menu</v-icon>
          </v-app-bar-nav-icon>
          <app-header></app-header>
        </v-app-bar>

        <v-spacer></v-spacer>

        <v-container fill-height justify="center" align="center" fluid>
        <v-main><router-view></router-view></v-main>
        </v-container>

        <app-footer></app-footer>


        <v-snackbar
            v-model="notification.active"
        >
        <v-icon>{{ notification.icon || 'notifications' }}</v-icon>
        {{ notification.text }}
            <template v-slot:action="{ attrs }">
            <v-btn
                color="pink"
                text
                v-bind="attrs"
                @click="notification.active = false"
                >
                Close
            </v-btn>
            </template>
        </v-snackbar>

      </v-app>
  `
})

$interface.$app = new Vue({
  vuetify,
  el: '#app',
  router,
  render: h => h(mainComponent)
}).$mount('#app')

export default $interface
