var $laconic = (function (Eev, Vue, Vuetify, VueRouter) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var Eev__default = /*#__PURE__*/_interopDefaultLegacy(Eev);
  var Vue__default = /*#__PURE__*/_interopDefaultLegacy(Vue);
  var Vuetify__default = /*#__PURE__*/_interopDefaultLegacy(Vuetify);
  var VueRouter__default = /*#__PURE__*/_interopDefaultLegacy(VueRouter);

  const Store = new Vue__default["default"]({
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

  // TODO create a command to populate fields of current screen, manipulate this.val here
  // probably consolidate goto-screen to take initial values

  // TODO replace this with a component whose template depends on curscreen
  function renderscreen (name, screen, fieldValues) {
    if (Store.state.curscreen.name === name) return

    fieldValues = fieldValues || {};

    Store.state.curscreen.name = name;
    Store.state.curscreen.components = [];

    let first = true;
    Object.keys(screen).map(async key => {
      if (first) {
        // dummy component to reset state before rendering a screen
        await screenBegin();
        first = false;
      }

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
      const type2func = {
        select: select,
        input: inpText,
        number: inpNumber,
        email: inpEmail,
        password: inpPassword,
        textarea: textarea,
        button: button,
        submit: submitBtn,
        table: table
      };

      const func = type2func[component.type];

      if (!func) {
        console.error('undefined component:', component);
        return
      }

      const c = await func(component, key, fieldValues[key]); // TODO make concurrent
      Store.state.curscreen.components.push(c);
      // console.debug('last added component = ', c)
      // c.options.methods.sendToParent()
    });
  }

  // patterns

  // clearFieldState

  const screenBegin = async (_, key, ___) => {
    const comp = await Vue__default["default"].component(`app-${key}`, {
      template: '',
      //     methods: {
      //       sendToParent () {
      //         const obj = {}
      //         obj[key] = this.val
      //         this.$emit('sendToParent', obj)
      //       }
      //     },
      mounted () {
        this.$emit('clearFieldState');
      }
    });
    return comp
  };

  const title = async (text, key) => {
    const comp = await Vue__default["default"].component(`app-${key}`, {
      template: `<div class="screen-title text-h3">${text}</div>`
    });
    return comp
  };

  const select = async (values, key, curValue) => {
    const optionsArr = [];
    for (const key of Object.keys(values.options)) {
      const obj = {
        key: key,
        value: values.options[key]
      };
      optionsArr.push(obj);
    }
    const comp = await Vue__default["default"].component(`app-${key}`, {
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
          selected: curValue || []
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
    return comp
  };

  const inpText = async (values, key, curValue) => {
    let markup = '';

    if (values.hidden === true) {
      markup = `
      <input type="hidden"
        @input="sendToParent"
        v-model="val">
      `;
    } else {
      const addTags = [];
      if (values.readOnly === true) { addTags.push('readonly'); }
      if (values.disabled === true) { addTags.push('disabled'); }

      markup = `
    <v-text-field
      type="text"
      label="${values.label}"
      @input="sendToParent"
      v-model="val"
      ${addTags.join(' ')}
      ></v-text-field>
      `;
    }
    const comp = await Vue__default["default"].component(`app-${key}`, {
      template: `
            <div class="component input ${key}">
              ${markup}
            </div>
        `,
      data () {
        return {
          val: curValue
        }
      },
      methods: {
        sendToParent () {
          const obj = {};
          obj[key] = this.val;
          this.$emit('sendToParent', obj);
        }
      },
      mounted () {
        // NOTE: trigger change event to initialize the pagData
        // useful when there the fields are initialized
        this.sendToParent();
      }
    });
    return comp
  };

  const inpEmail = async (values, key, curValue) => {
    const comp = await Vue__default["default"].component(`app-${key}`, {
      template: `
          <div>
              <v-text-field
              type="text"
              :rules="[rules.required, rules.email]"
              label="${values.label}"
              @input="sendToParent"
              v-model="val"
              ></v-text-field>
          </div>
      `,
      data () {
        return {
          val: curValue,
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
      },
      mounted () {
        // NOTE: trigger change event to initialize the pagData
        // useful when there the fields are initialized
        this.sendToParent();
      }
    });
    return comp
  };

  const inpPassword = async (values, key, curValue) => {
    const comp = await Vue__default["default"].component(`app-${key}`, {
      template: `
          <div>
              <v-text-field
              :type="show ? 'text' : 'password'"
              :append-icon="show ? 'visibility' : 'visibility_off'"
              :rules="[rules.required, rules.min]"
              label="${values.label}"
              hint="At least 8 characters"
              @input="sendToParent"
              @click:append="show = !show"
              v-model="val"
              ></v-text-field>
          </div>
      `,
      data () {
        return {
          val: curValue,
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
      },
      mounted () {
        // NOTE: trigger change event to initialize the pagData
        // useful when there the fields are initialized
        this.sendToParent();
      }
    });
    return comp
  };

  const inpNumber = async (values, key, curValue) => {
    const comp = await Vue__default["default"].component(`app-${key}`, {
      template: `
            <div>
                <v-text-field
                type="number"
                label="${values.label}"
                @input="sendToParent"
                v-model="val"
                ></v-text-field>
            </div>
        `,
      data () {
        return {
          val: curValue
        }
      },
      methods: {
        sendToParent () {
          const obj = {};
          obj[key] = this.val;
          this.$emit('sendToParent', obj);
        }
      },
      mounted () {
        // NOTE: trigger change event to initialize the pagData
        // useful when there the fields are initialized
        this.sendToParent();
      }
    });
    return comp
  };

  const textarea = async (values, key, curValue) => {
    const comp = await Vue__default["default"].component(`app-${key}`, {
      template: `
            <div>
                <v-textarea
                name="input-7-1"
                filled label="${values.label}"
                auto-grow
                @input="sendToParent"
                v-model="val"
                ></v-textarea>
            </div>
        `,
      data () {
        return {
          val: curValue
        }
      },
      methods: {
        sendToParent () {
          const obj = {};
          obj[key] = this.val;
          this.$emit('sendToParent', obj);
        }
      },
      mounted () {
        // NOTE: trigger change event to initialize the pagData
        // useful when there the fields are initialized
        this.sendToParent();
      }
    });
    return comp
  };

  const submitBtn = async (values, key, _) => {
    const comp = await Vue__default["default"].component(`app-${key}`, {
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
    return comp
  };

  const button = async (values, key, _) => {
    const comp = await Vue__default["default"].component(`app-${key}`, {
      template: `
            <div>
                <v-btn @click="${values.onclick()}">${
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
    return comp
  };

  const table = async (values, key, _) => {
    $interface.state.dsources[values.datasource] =
      $interface.state.dsources[values.datasource] || { display: [], raw: [] };
    const operations0 = values.operations;
    const rowClass = operations0 ? 'clickable' : '';
    const comp = await Vue__default["default"].component(`app-${key}`, {
      data: function () {
        return {
          dsource: $interface.state.dsources[values.datasource]
        }
      },
      methods: {
        showeditdialog: function (index) {
          const tabledata = this.$data.dsource;
          const operations = tabledata.operations || operations0;
          if (!operations) return
          const rawRecord = {};
          const vals = tabledata.raw[index + 1];
          for (let i = 0; i < vals.length; i++) {
            rawRecord[tabledata.raw[0][i]] = vals[i];
          }
          console.debug('showing dialog with row', rawRecord);
          $interface.bus.emit('gui', {
            op: 'dialog',
            title: '',
            text: '',
            operations: operations,
            args: [{ display: tabledata.display.rows[index], raw: rawRecord }]
          });
        }
      },
      template: `
    <!--
    <v-data-table
        :headers="dsource.display.header"
        :items="dsource.display.rows"
        :items-per-page="5"
        class="elevation-1"
        ></v-data-table>
    -->

    <table class="lc-table">
        <thead>
        <tr>
            <td v-for="header in dsource.display.header">
            {{header.text}}
            </td>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="(entry, index) in dsource.display.rows"
            v-on:click="showeditdialog(index)"
            class="${rowClass}">
            <td v-for="cell in entry">
            {{cell}}
            </td>
        </tr>
        </tbody>
    </table>
    `
    });
    return comp
  };

  const scomponents = {};

  scomponents.AppHome = Vue__default["default"].component('app-home', {
    template: `
        <div id="home">
            <h1></h1>
        </div>
    `
  });

  scomponents.AppHeader = Vue__default["default"].component('app-header', {
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

  scomponents.AppFooter = Vue__default["default"].component('app-footer', {
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

  scomponents.Applist = Vue__default["default"].component('app-list', {
    template: `
        <div id="Applist">
            <!--<button v-for="doc in btnData" @click="navigateTo(doc.btnRoute)">{{doc.name}}</button>-->
            <v-list dense nav>

            <v-list-item link v-for="doc in btnData" :key="doc.btnRoute"
                @click="navigateTo(doc.btnRoute)"
                v-show="!doc.hidden"
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
          const screen = Store.state.screens[key];
          const obj = {
            name: screen.title,
            btnRoute: key,
            hidden: screen.isnavigable === false,
          };
          return obj
        }).sort((a, b) => (a.weight || 9999) > (b.weight || 9999)? 1: -1)
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

  const router = new VueRouter__default["default"]({
    routes: routes
  });

  const dcomponents = new Vue__default["default"]({
    data: function () {
      return {
        curscreen: Store.state.curscreen.components
      }
    },
    computed: {
      list: () => Object.keys(Store.state.screens).map(ID => {
        const obj = {
          path: '/' + ID,
          component: Vue__default["default"].component(`app-${ID}`, {
            template: `
                    <section id="${ID}" class="screen">
                        <form>
                            <template v-for="(comp, index) in curscreen">
                                <component
                                :is="comp"
                                :key="index"
                                @clearFieldState="this.PageData = []"
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
                screen: ID
              }
            },
            methods: {
              async saveData (d) {
                // console.debug('saveData', d, this.PageData)
                if (!this.PageData.length) {
                  this.PageData.push(d);
                  return
                }

                //               const filterdArr = await this.PageData.filter(
                //                 doc => Object.keys(doc) !== Object.keys(d)[0]
                //               )
                //               this.PageData = filterdArr
                this.PageData.push(d);
              },

              submitForm (d) {
                const fieldValues = this.PageData.reduce((result, currentObject) => {
                  for (const key of Object.keys(currentObject)) {
                    result[key] = currentObject[key];
                  }
                  return result
                }, {});
                Store.state.screens[ID].submithandler(fieldValues);
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
          // TODO validate screens, e.g. a ui component can't have the key `name`
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
              renderscreen(target, screen, data.fieldValues);
            }
            console.debug('trying to navigate to invisible screen, aborting', target, Store.state.homeScreen);
            $router.push(target);
            break
          }
          renderscreen(target, screen, data.fieldValues);

          if ($router.currentRoute.path !== '/' + data.screen) { $router.push(data.screen); }
          break
        }

        case 'populate-fields': {
          const curScreen = Store.state.curscreen.name;
          const screen = Store.state.screens[curScreen];
          if (!screen) {
            console.error('populate-fields: current screen is not defined yet, try later?', curScreen);
            break
          }
          renderscreen(curScreen, screen, data.fieldValues);
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
            case 'error':
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

        case 'dialog': {
          const dialog = $interface.state.dialog;
          dialog.title = data.title;
          dialog.text = data.text;
          dialog.operations = data.operations || [];
          dialog.args = data.args || [];
          dialog.active = true;
          break
        }

        case 'set-branding': {
          Store.state.staticComponents = data.payload;
          break
        }

        case 'update-datasource': {
          // NOTE: imperatively update a dataseource with a given name.
          // TODO make the datasource reactive and remove this command: cf. https://github.com/codomatech/laconic-ui/issues/9
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

  const initialState = {
    dsources: {},
    notification: { active: false, text: '' },
    dialog: { active: false, title: '', text: '', operations: [] }
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
    bus: new Eev__default["default"](),
    state: state
  };

  registerbusevents($interface);

  // Start the app
  Vue__default["default"].prototype.$interface = $interface;

  const vuetify = new Vuetify__default["default"]({
    icons: {
      iconfont: 'mdi'
    }
  });

  Vue__default["default"].use(Vuetify__default["default"]);
  Vue__default["default"].use(VueRouter__default["default"]);

  const mainComponent = Vue__default["default"].component('laconic-main', {
    data: () => ({
      drawer: null,
      notification: $interface.state.notification,
      dialog: $interface.state.dialog
    }),
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

        <!-- notification -->
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

        <!-- dialog -->
        <v-dialog
          v-model="dialog.active"
          max-width="500"
        >
          <v-card>
            <v-card-title v-if="dialog.title" class="text-h5 grey lighten-2">
              {{ dialog.title }}
            </v-card-title>

            <v-card-text  v-if="dialog.text">
              {{ dialog.text }}
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                v-for="op in dialog.operations"
                color="primary"
                text
                @click="let keep = (op.callback || function(){})(...dialog.args); dialog.active = keep === true"
              >
                {{ op.text }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-app>
`
  });

  $interface.$app = new Vue__default["default"]({
    vuetify,
    el: '#app',
    router,
    render: h => h(mainComponent)
  }).$mount('#app');

  // initialize ui version. this is how we update ui screens when state changes
  $interface.$app.$children[0].version = 0;

  // expose public API
  $interface.ui = {
    define: (config) => $interface.bus.emit('gui', { op: 'define', ...config }),
    gotoScreen: (config) => $interface.bus.emit('gui', { op: 'goto-screen', ...config }),
    notify: (config) => $interface.bus.emit('gui', { op: 'notify', ...config }),
    dialog: (config) => $interface.bus.emit('gui', { op: 'dialog', ...config }),
    setBranding: (config) => $interface.bus.emit('gui', { op: 'set-branding', ...config }),
    populateFields: (config) => $interface.bus.emit('gui', { op: 'populate-fields', ...config })
  };

  $interface.data = {
    updateDataSource: (config) => $interface.bus.emit('gui', { op: 'update-datasource', ...config })
  };

  return $interface;

})(Eev, Vue, Vuetify, VueRouter);
