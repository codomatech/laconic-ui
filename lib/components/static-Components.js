import Vue from 'vue'
import {renderscreen} from '../controllers/rendering'
import Store from '../store/Store'

const scomponents = {}

scomponents.AppHome = Vue.component('app-home', {
  template: `
        <div id="home">
            <h1></h1>
        </div>
    `
})

scomponents.AppHeader = Vue.component('app-header', {
  template: `
        <v-layout id="AppHeader" flat align-center>

            <h1 class="d-none d-lg-block text-md">{{ header.title }}</h1>

            <v-spacer />
            <v-avatar :size="header.size" v-if="header.imgSrc" class="d-none d-md-block">
                <img :src="header.imgSrc" alt="Avatar">
            </v-avatar>

        </v-layout>
    `,
  computed: {
    header () {
      return Store.state.staticComponents.header? Store.state.staticComponents.header: {}
    }
  }
})

scomponents.AppFooter = Vue.component('app-footer', {
  template: `
        <v-footer color="indigo" app inset>
            <v-container fluid>
              <p class="white--text text-sm-center">{{footer.text}}</p>
            </v-container>
        </v-footer>
    `,
  computed: {
    footer () {
      return Store.state.staticComponents.footer? Store.state.staticComponents.footer: {}
    }
  }
})

scomponents.Applist = Vue.component('app-list', {
  template: `
        <div id="Applist">
            <!--<button v-for="doc in btnData" @click="navigateTo(doc.btnRoute)">{{doc.name}}</button>-->
            <v-list dense nav>

            <v-list-item link v-for="doc in btnData" :key="doc.btnRoute"
                @click="navigateTo(doc.btnRoute)"
                >
                <!--<v-list-item-title>-->
                <v-list-item-action>
                    <v-icon>{{ doc.icon || 'chevron_right' }}</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                    <v-list-item-title>{{ doc.name }}</v-list-item-title>
                </v-list-item-content>
                <!--</v-list-item-ttile>-->
            </v-list-item>

            </v-list>
        </div>
        `,

  data: function () {
    return {
      screens: Store.state.screens
    }
  },

  computed: {
      btnData:  function() { return Object.keys(Store.state.screens).map(key => {
        let obj = {
          name: Store.state.screens[key].title,
          btnRoute: key
        }
        return obj
      })}
  },

  methods: {
    navigateTo (route) {
      console.log('navigateTo', route, 'current=', this.$router.currentRoute.path)
      if (route === this.$router.currentRoute.path.substring(1)) {
        return
      }
      this.$router.push('/' + route)
      //nstScreen = Store.state.screens[route];
      renderscreen(route, Store.state.screens[route])
    },

    getRoutes () {
      Object.keys(Store.state.screens).map(key => {
        let obj = {
          name: Store.state.screens[key].title,
          btnRoute: key
        }

        this.btnData.push(obj)
      })
    }
  },
  mounted () {
    //this.getRoutes()
  }
})


export default scomponents
