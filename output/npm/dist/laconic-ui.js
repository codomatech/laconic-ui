import Eev from 'eev';
import Vue from 'vue';
import Vuetify from 'vuetify';
import VueRouter from 'vue-router';

const Store = new Vue({
  data () {
    return {
      state: {
        staticComponents: {},
        screens: {},
        curscreen: { name: null, components: [] }
      }
    }
  }
});

console.debug('laconic store = ', Store);

// TODO replace this with a component whose template depends on curscreen
function renderscreen (name, screen) {
  if (Store.state.curscreen.name === name) return

  Store.state.curscreen.name = name;
  Store.state.curscreen.components = [];
  Object.keys(screen).map(async key => {
    const component = screen[key];
    if (key === 'title') {
      await title(component, key);
      return
    }
    if (!component || !component.type) {
      return
    }
    if ('submithandler weight'.indexOf(key) !== -1) {
      return
    }
    // console.log(key, component.type)
    switch (component.type) {
      case 'select':
        await select(component, key);
        break

      case 'input':
        await inpText(component, key);
        break

      case 'number':
        await inpNumper(component, key);
        break

      case 'email':
        await inpEmail(component, key);
        break

      case 'password':
        await inpPassword(component, key);
        break

      case 'textarea':
        await textarea(component, key);
        break

      case 'submit':
        await submitBtn(component, key);
        break

      case 'table':
        await table(component, key);
        break

      default:
        console.error('undefined component:', component);
    }
  });
}

// patterns

const title = async (text, key) => {
  const comp = await Vue.component(`app-${key}`, {
    template: `<div class="screen-title text-h3">${text}</div>`
  });
  Store.state.curscreen.components.push(comp);
};

const select = async (values, key) => {
  const optionsArr = [];
  for (const key of Object.keys(values.options)) {
    const obj = {
      key: key,
      value: values.options[key]
    };
    optionsArr.push(obj);
  }
  const comp = await Vue.component(`app-${key}`, {
    template: `
            <div>
                    <v-select
                     :items="items"
                     item-text="value"
                     item-value="key"
                     :label="values.label"
                     :multiple="values.multiple"
                     v-model="selected"
                     chips
                     @change="sendToParent"></v-select>
            </div>
        `,
    data () {
      return {
        values: values,
        items: optionsArr,
        selected: []
      }
    },
    methods: {
      sendToParent () {
        const obj = {};
        obj[key] = this.selected;
        this.$emit('sendToParent', obj);
      }
    }
  });
  Store.state.curscreen.components.push(comp);
};

const inpText = async (values, key) => {
  const comp = await Vue.component(`app-${key}`, {
    template: `
            <div class="component input ${key}">
                <v-text-field
                type="text"
                label="${values.label}"
                @change="sendToParent"
                v-model="val"
                ></v-text-field>
            </div>
        `,
    data () {
      return {
        val: null
      }
    },
    methods: {
      sendToParent () {
        const obj = {};
        obj[key] = this.val;
        this.$emit('sendToParent', obj);
      }
    }
  });
  Store.state.curscreen.components.push(comp);
};

const inpEmail = async (values, key) => {
  const comp = await Vue.component(`app-${key}`, {
    template: `
          <div>
              <v-text-field
              type="text"
              :rules="[rules.required, rules.email]"
              label="${values.label}"
              @change="sendToParent"
              v-model="val"
              ></v-text-field>
          </div>
      `,
    data () {
      return {
        val: null,
        rules: {
          required: value => !!value || 'Required.',
          counter: value => (value && value.length <= 20) || 'Max 20 characters',
          email: value => {
            const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return pattern.test(value) || 'Invalid e-mail.'
          }
        }
      }
    },
    methods: {
      sendToParent () {
        const obj = {};
        obj[key] = this.val;
        this.$emit('sendToParent', obj);
      }
    }
  });
  Store.state.curscreen.components.push(comp);
};

const inpPassword = async (values, key) => {
  const comp = await Vue.component(`app-${key}`, {
    template: `
          <div>
              <v-text-field
              :type="show ? 'text' : 'password'"
              :append-icon="show ? 'visibility' : 'visibility_off'"
              :rules="[rules.required, rules.min]"
              label="${values.label}"
              hint="At least 8 characters"
              @change="sendToParent"
              @click:append="show = !show"
              v-model="val"
              ></v-text-field>
          </div>
      `,
    data () {
      return {
        val: null,
        show: false,
        rules: {
          required: value => !!value || 'Required.',
          min: v => (v && v.length >= 8) || 'Min 8 characters',
          emailMatch: () => "The email and password you entered don't match"
        }
      }
    },
    methods: {
      sendToParent () {
        const obj = {};
        obj[key] = this.val;
        this.$emit('sendToParent', obj);
      }
    }
  });
  Store.state.curscreen.components.push(comp);
};

const inpNumper = async (values, key) => {
  const comp = await Vue.component(`app-${key}`, {
    template: `
            <div>
                <v-text-field
                type="number"
                label="${values.label}"
                @change="sendToParent"
                v-model="val"
                ></v-text-field>
            </div>
        `,
    data () {
      return {
        val: null
      }
    },
    methods: {
      sendToParent () {
        const obj = {};
        obj[key] = this.val;
        this.$emit('sendToParent', obj);
      }
    }
  });
  Store.state.curscreen.components.push(comp);
};

const textarea = async (values, key) => {
  const comp = await Vue.component(`app-${key}`, {
    template: `
            <div>
                <v-textarea
                name="input-7-1"
                filled label="${values.label}"
                auto-grow
                @change="sendToParent"
                v-model="val"
                ></v-textarea>
            </div>
        `,
    data () {
      return {
        val: null
      }
    },
    methods: {
      sendToParent () {
        const obj = {};
        obj[key] = this.val;
        this.$emit('sendToParent', obj);
      }
    }
  });
  Store.state.curscreen.components.push(comp);
};

const submitBtn = async (values, key) => {
  const comp = await Vue.component(`app-${key}`, {
    template: `
            <div>
                <v-btn @click="submit">${
  values.label
}</v-btn>
            </div>
        `,
    methods: {
      submit () {
        this.$emit('submitForm', { type: 'submit' });
      }
    }
  });
  Store.state.curscreen.components.push(comp);
};

const table = async (values, key) => {
  $interface.state.dsources[values.datasource] =
    $interface.state.dsources[values.datasource] || { display: [], raw: [] };
  const rowcursor = values.operations ? 'pointer' : 'auto';
  const comp = await Vue.component(`app-${key}`, {
    data: function () {
      return {
        dsource: $interface.state.dsources[values.datasource]
      }
    },
    methods: {
      showeditdialog: function (index) {
        const tabledata = this.$data.tabledata;
        if (!values.operations) return
        $interface.bus.emit('gui', {
          op: 'dialog',
          content: 'The following operations are available:',
          actions: values.operations,
          args: [{ display: tabledata.display[index], raw: tabledata.raw[index] }]
        });
      }
    },
    template: `

    <v-data-table
        :headers="dsource.display.header"
        :items="dsource.display.rows"
        :items-per-page="5"
        class="elevation-1"
        ></v-data-table>


    <!--
    <table>
        <thead>
        <tr>
            <td v-for="cell in tabledata.display[0] || []">
            {{cell}}
            </td>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="(entry, index) in (tabledata.display.length>0 ? tabledata.display.slice(1) : [])"
            v-on:click="showeditdialog(index+1)"
            style="cursor: ${rowcursor};">
            <td v-for="cell in entry">
            {{cell}}
            </td>
        </tr>
        </tbody>
    </table>
    -->
    `
  });
  Store.state.curscreen.components.push(comp);
};

const scomponents = {};

scomponents.AppHome = Vue.component('app-home', {
  template: `
        <div id="home">
            <h1></h1>
        </div>
    `
});

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
      return Store.state.staticComponents.header ? Store.state.staticComponents.header : {}
    }
  }
});

scomponents.AppFooter = Vue.component('app-footer', {
  template: `
        <v-footer app inset>
            <v-container fluid>
              <p class="text-sm-center">{{footer.text}}</p>
            </v-container>
        </v-footer>
    `,
  computed: {
    footer () {
      return Store.state.staticComponents.footer ? Store.state.staticComponents.footer : {}
    }
  }
});

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
    btnData: function () {
      return Object.keys(Store.state.screens).filter((key) => {
        const screen = Store.state.screens[key];
        // console.debug('static components: checking screen visibilty', key, screen)
        return (!screen.isvisible || screen.isvisible() === true)
      }).map(key => {
        const obj = {
          name: Store.state.screens[key].title,
          btnRoute: key
        };
        return obj
      })
    }
  },

  methods: {
    navigateTo (route) {
      Store.state.curscreen = Store.state.screens[route];
      console.log('navigateTo', route, 'current=', this.$router.currentRoute.path, Store.state.curscreen);
      if (route === this.$router.currentRoute.path.substring(1)) {
        return
      }
      this.$router.push('/' + route);
      // nstScreen = Store.state.screens[route];
      renderscreen(route, Store.state.curscreen);
    }
  }
});

const routes = [{ path: '/', component: scomponents.AppHome }];

const router = new VueRouter({
  routes: routes
});

const dcomponents = new Vue({
  data: function () {
    return {
      curscreen: Store.state.curscreen.components
    }
  },
  computed: {
    list: () => Object.keys(Store.state.screens).map(ID => {
      const obj = {
        path: '/' + ID,
        component: Vue.component(`app-${ID}`, {
          template: `
                    <section id="${ID}" class="screen">
                        <form>
                            <template v-for="(comp, index) in curscreen">
                                <component
                                :is="comp"
                                :key="index"
                                @sendToParent="saveData($event)"
                                @submitForm="submitForm($event)"
                                ></component>
                            </template>
                        </form>
                    </section>
                    `,

          data () {
            return {
              curscreen: Store.state.curscreen.components,
              PageData: [],
              screen: ID,
              finalObj: null
            }
          },
          methods: {
            async saveData (d) {
              if (!this.PageData.length) {
                this.PageData.push(d);
                return
              }

              const filterdArr = await this.PageData.filter(
                doc => Object.keys(doc) !== Object.keys(d)[0]
              );
              this.PageData = filterdArr;
              this.PageData.push(d);
            },

            submitForm (d) {
              const resultObject = this.PageData.reduce((result, currentObject) => {
                for (const key of Object.keys(currentObject)) {
                  result[key] = currentObject[key];
                }
                return result
              }, {});
              this.finalObj = resultObject;
              const obj = {
                screen: this.screen,
                type: d.type,
                payload: this.finalObj
              };
              Store.state.screens[ID].submithandler(obj);
            }
          }
        })
      };

      return obj
    })
  }
});

function registerbusevents ($interface) {
  // handle all [gui] events..
  $interface.bus.off('gui');
  $interface.bus.on('gui', data => {
    switch (data.op) {
      case 'define': {
        Store.state.screens = data.screens;
        Store.state.curscreen.name = null;
        const $router = $interface.$app.$router;
        for (const route of dcomponents.list) {
          if (route && route.path) $router.addRoute(route);
        }
        Store.state.homeScreen = data.home;
        let home = $router.currentRoute && $router.currentRoute.path;
        if (!home || home === '/') { home = data.home; } else { home = home.slice(1); }
        if (home) { $interface.bus.emit('gui', { op: 'goto-screen', screen: home }); }
        break
      }

      case 'goto-screen': {
        const $router = $interface.$app.$router;
        let target = data.screen;
        if (target === '@') { target = $router.currentRoute.path.slice(1); }
        let screen = Store.state.screens[target];
        if (!screen) {
          console.error('invalid screen name', data.screen);
          break
        }
        if (screen.isvisible && screen.isvisible() !== true) {
          target = Store.state.homeScreen;
          screen = Store.state.screens[target];
          if (!target || (screen.isvisible && screen.isvisible() !== true)) {
            target = '/';
          } else {
            renderscreen(target, screen);
          }
          console.debug('trying to navigate to invisible screen, aborting', target, Store.state.homeScreen);
          $router.push(target);
          break
        }
        renderscreen(target, screen);

        if ($router.currentRoute.path !== '/' + data.screen) { $router.push(data.screen); }
        break
      }

      case 'notify': {
        let icon = '';
        switch (data.status) {
          case 'success':
            icon = 'check';
            break
          case 'warn':
            icon = 'warning';
            break
          case 'danger':
            icon = 'error';
            break
        }
        const notification = $interface.state.notification;
        notification.active = false;
        notification.text = data.message;
        notification.icon = icon;
        notification.active = true;

        break
      }
      // handle static components events
      case 'set-branding':
        Store.state.staticComponents = data.payload;
        break

        // update datasource
      case 'update-datasource': {
        const payload = data.payload;
        if (!$interface.state.dsources[payload.name]) {
          // console.debug('datasource not ready yet, will retry shortly', payload.name)
          setTimeout(function () { $interface.bus.emit('gui', data); }, 500);
          break
        }

        let display;
        const dsource = payload.display;
        if (!dsource || !dsource.length) {
          display = { header: [], rows: [] };
        } else {
          const header = dsource[0].map(n => ({ text: n, value: n, sortable: true }));
          // console.debug(dsource[0], header)
          const rows = dsource.slice(1).map((record) => {
            const row = {};
            let i = 0;
            for (const field of header) {
              row[field.value] = record[i++];
            }
            return row
          });
          display = { header, rows };
        }

        $interface.state.dsources[payload.name].display = display;
        $interface.state.dsources[payload.name].raw = payload.raw;
        break
      }
    }
  });
}

// TODO make part of the state observable, on update increment
// key to force reload the whole app: https://stackoverflow.com/questions/32106155/can-you-force-vue-js-to-reload-re-render
const initialState = {
  dsources: {
  },
  notification: { active: false, text: '' }
};

const state = new Proxy(initialState, {
  set: (obj, prop, value) => {
    $interface.$app.$children[0].version++;
    console.debug('updating ui version to', $interface.$app.$children[0].version);
    obj[prop] = value;

    // current screen might be no longer visible, refresh
    $interface.bus.emit('gui', { op: 'goto-screen', screen: '@' });

    return true
  }
});

const $interface = {
  bus: new Eev(),
  state: state
};

registerbusevents($interface);

// Start the app
Vue.prototype.$interface = $interface;

const vuetify = new Vuetify({
  icons: {
    iconfont: 'mdi'
  }
});

Vue.use(Vuetify);
Vue.use(VueRouter);

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
});

$interface.$app = new Vue({
  vuetify,
  el: '#app',
  router,
  render: h => h(mainComponent)
}).$mount('#app');

$interface.$app.$children[0].version = 0;

export { $interface as default };
