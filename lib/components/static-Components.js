const AppHome = Vue.component('app-home', {
  template: `
        <div id="home">
            <h1></h1>
        </div>
    `
})

const AppHeader = Vue.component('app-header', {
  template: `
        <v-layout id="AppHeader">
            <v-avatar :size="header.size" v-if="header.imgSrc">
                <img :src="header.imgSrc" alt="Avatar">
            </v-avatar>
            <v-toolbar-title v-if="header.title">{{ header.title }}</v-toolbar-title>
            
        </v-layout>
    `,
  computed: {
    header () {
      return Store.state.staticComponents.header
    }
  }
})

const AppFooter = Vue.component('app-footer', {
  template: `
        <v-footer color="indigo" app inset>
            <span class="white--text">{{footer.text}}</span>
        </v-footer>
    `,
  computed: {
    footer () {
      return Store.state.staticComponents.footer
    }
  }
})

const Applist = Vue.component('app-list', {
  template: `
        <div id="Applist">
            <!--<button v-for="doc in btnData" @click="navigateTo(doc.btnRoute)">{{doc.name}}</button>-->
            <v-list dense v-for="doc in btnData">
                <v-list-tile @click="navigateTo(doc.btnRoute)">
                <v-list-tile-action>
                    <v-icon>home</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                    <v-list-tile-title>{{ doc.name }}</v-list-tile-title>
                </v-list-tile-content>
                </v-list-tile>
            </v-list>
        </div>
        `,

  data () {
    return {
      btnData: [],
      drawer: false
    }
  },

  methods: {
    navigateTo (route) {
      this.$router.push('/' + route)
      nstScreen = Store.state.screens[route]
      renderscreen(nstScreen)
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
    this.getRoutes()
  }
})
