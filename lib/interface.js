import Eev from 'eev'
import Vue from 'vue'
import Vuetify from 'vuetify'
import VueRouter from 'vue-router'

import router from './router/router'
import registerbusevents from './controllers/BUSEventHandler'

// TODO make part of the state observable, on update increment
// key to force reload the whole app: https://stackoverflow.com/questions/32106155/can-you-force-vue-js-to-reload-re-render
const initialState = {
    dsources: {
    },
    notification: { active: false, text: '' }
}

const state = new Proxy(initialState, {
  set: (obj, prop, value) => {
    $interface.$app.$children[0].version++
    console.debug('updating ui version to', $interface.$app.$children[0].version)
    obj[prop] = value

    // current screen might be no longer visible, refresh
    $interface.bus.emit('gui', {op: 'goto-screen', screen: '@'})

    return true
  }
})

const $interface = {
  bus: new Eev(),
  state: state
}

registerbusevents($interface)

// Start the app
Vue.prototype.$interface = $interface

const vuetify = new Vuetify({
  icons: {
    iconfont: 'mdi'
  }
})

Vue.use(Vuetify)
Vue.use(VueRouter)

const mainComponent = Vue.component('laconic-main', {
  data: () => ({ drawer: null, notification: $interface.state.notification }),
  props: ['version'],
  template: `
      <v-app :key="version">
        <v-navigation-drawer fixed v-model="drawer" app>
          <app-list></app-list>
        </v-navigation-drawer>

        <v-app-bar app>
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

$interface.$app.$children[0].version = 0

export default $interface
