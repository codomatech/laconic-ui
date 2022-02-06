import Eev from 'eev';
import Vue from 'vue';
import Vuetify from 'vuetify';
import VueRouter from 'vue-router';

var Store = new Vue({
  data () {
    return {
      state: {
        staticComponents: {},
        screens: {},
        curscreen: {name: null, components: []}
      }
    }
  }
});

function renderscreen(name, screen) {
  if (Store.state.curscreen.name === name) return

  Store.state.curscreen.name = name;
  Store.state.curscreen.components = [];
  Object.keys(screen).map(async key => {
    let component = screen[key];
    if (!component || !component.type) {
        return
    }
    if (key === 'title') {
      let t = title(component, key);
      Store.state.curscreen.components.push(t);
      return
    }
    if ('submithandler weight'.indexOf(key) !== -1) {
      return
    }
    //console.log(key, component.type)
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

      case "email":
        await inpEmail(component, key);
        break;

      case "password":
        await inpPassword(component, key);
        break;

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


let title = async (values, key) => {
  let comp = await Vue.component(`app-${key}`, {
    template: `<h1>${values}</h1>`
  });
  Store.state.curscreen.components.push(comp);
};

let select = async (values, key) => {
  console.debug('select: ', key);
  let optionsArr = [];
  Object.keys(values.options).map(key => {
    let obj = {
      key: key,
      value: values.options[key]
    };
    optionsArr.push(obj);
  });
  let comp = await Vue.component(`app-${key}`, {
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
        let obj = {};
        obj[key] = this.selected;
        this.$emit('sendToParent', obj);
      }
    }
  });
  Store.state.curscreen.components.push(comp);
};

let inpText = async (values, key) => {
  let comp = await Vue.component(`app-${key}`, {
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
        let obj = {};
        obj[key] = this.val;
        this.$emit('sendToParent', obj);
      }
    }
  });
  Store.state.curscreen.components.push(comp);
};

let inpEmail = async (values, key) => {
  let comp = await Vue.component(`app-${key}`, {
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
    data() {
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
      };
    },
    methods: {
      sendToParent() {
        let obj = {};
        obj[key] = this.val;
        this.$emit("sendToParent", obj);
      }
    }
  });
  Store.state.curscreen.components.push(comp);
};

let inpPassword = async (values, key) => {
  let comp = await Vue.component(`app-${key}`, {
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
    data() {
      return {
        val: null,
        show: false,
        rules: {
          required: value => !!value || "Required.",
          min: v => (v && v.length >= 8) || "Min 8 characters",
          emailMatch: () => "The email and password you entered don't match"
        }
      };
    },
    methods: {
      sendToParent() {
        let obj = {};
        obj[key] = this.val;
        this.$emit("sendToParent", obj);
      }
    }
  });
  Store.state.curscreen.components.push(comp);
};

let inpNumper = async (values, key) => {
  let comp = await Vue.component(`app-${key}`, {
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
      sendToParent (label) {
        let obj = {};
        obj[key] = this.val;
        this.$emit('sendToParent', obj);
      }
    }
  });
  Store.state.curscreen.components.push(comp);
};

let textarea = async (values, key) => {
  let comp = await Vue.component(`app-${key}`, {
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
      sendToParent (label) {
        let obj = {};
        obj[key] = this.val;
        this.$emit('sendToParent', obj);
      }
    }
  });
  Store.state.curscreen.components.push(comp);
};

let submitBtn = async (values, key) => {
  let comp = await Vue.component(`app-${key}`, {
    template: `
            <div>
                <v-btn color="indigo lighten-2" dark @click="submit">${
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
  let rowcursor = values.operations ? 'pointer' : 'auto';
  let comp = await Vue.component(`app-${key}`, {
    data: function () {
      return {
        tabledata: $interface.state.dsources[values.datasource]
      }
    },
    methods: {
      showeditdialog: function (index) {
        let tabledata = this.$data.tabledata;
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
      return Store.state.staticComponents.header? Store.state.staticComponents.header: {}
    }
  }
});

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
      btnData:  function() { return Object.keys(Store.state.screens).map(key => {
        let obj = {
          name: Store.state.screens[key].title,
          btnRoute: key
        };
        return obj
      })}
  },

  methods: {
    navigateTo (route) {
      console.log('navigateTo', route, 'current=', this.$router.currentRoute.path);
      if (route === this.$router.currentRoute.path.substring(1)) {
        return
      }
      this.$router.push('/' + route);
      //nstScreen = Store.state.screens[route];
      renderscreen(route, Store.state.screens[route]);
    },

    getRoutes () {
      Object.keys(Store.state.screens).map(key => {
        let obj = {
          name: Store.state.screens[key].title,
          btnRoute: key
        };

        this.btnData.push(obj);
      });
    }
  },
  mounted () {
    //this.getRoutes()
  }
});

const dcomponents = new Vue({
  data: function() {return {
    curscreen: Store.state.curscreen.components
  }},
  computed: {
    list: () => Object.keys(Store.state.screens).map(ID => {
      let obj = {
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
              if (this.PageData.length == 0) {
                this.PageData.push(d);
                return
              }

              let filterdArr = await this.PageData.filter(
                doc => Object.keys(doc) != Object.keys(d)[0]
              );
              this.PageData = filterdArr;
              this.PageData.push(d);
            },

            submitForm (d) {
              let resultObject = this.PageData.reduce((result, currentObject) => {
                for (let key in currentObject) {
                  if (currentObject.hasOwnProperty(key)) {
                    result[key] = currentObject[key];
                  }
                }
                return result
              }, {});
              this.finalObj = resultObject;
              let obj = {
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

const routes = [{ path: '/', component: scomponents.AppHome }];

const router = new VueRouter({
  routes: routes
});

function registerbusevents($interface) {
    $interface.bus.on('interaction', data => {
      // console.debug('interaction took place:', data)
      console.log('interaction took place:');
      console.log(data);
    });

    // handle all [gui] events..
    $interface.bus.on('gui', data => {
      switch (data.op) {
        // handle Screens events
        case 'define':
          Store.state.screens = data.screens;
          Store.state.curscreen.name = null;
          console.debug('adding routes to router', dcomponents.list);
          $interface.$app.$router.addRoutes(dcomponents.list);
          
          break

        // handle notification events
        case 'notify':
          let bg = '';
          switch (data.status) {
            case 'success':
              bg = 'linear-gradient(to right, #555, #2ea879)';
              break
            case 'warn':
              bg = 'linear-gradient(to right, #ffa63e, #ffaa0f)';
              break
            case 'danger':
              bg = 'linear-gradient(to right, #555, #ff0000)';
              break
            default:
              bg = 'linear-gradient(to right, #555, #96c93d)';
          }

          let NObj = {
            text: data.message,
            backgroundColor: bg
          };
          Toastify(NObj).showToast();
          break

        // handle dialog events
        case 'dialog':

          let modal = new tingle.modal({
            footer: !!data.actions,
            stickyFooter: true
          });
          data.content && modal.setContent(data.content);

          data.actions && data.actions.forEach(function (action) {
            modal.addFooterBtn(action.title, 'tingle-btn', function () {
              typeof (action.callback) === 'function' && action.callback.apply(null, data.args || []);
              modal.close();
            });
          });

          modal.open();
          break

        // handle static components events
        case 'set-branding':
          Store.state.staticComponents = data.payload;
          break

        // update datasource
        case 'update-datasource':
          let payload = data.payload;
          if (!$interface.state.dsources[payload.name]) {
            // console.debug('datasource not ready yet, will retry shortly', payload.name)
            setTimeout(function () { $interface.bus.emit('gui', data); }, 500);
            break
          }
          $interface.state.dsources[payload.name].display = payload.display;
          $interface.state.dsources[payload.name].raw = payload.raw;
          break
      }
    });
}

var $interface = {
    bus: new Eev(),
    state: {
      dsources: {
      }
    }
};

registerbusevents($interface);

// Start the app
Vue.prototype.$interface = $interface;

const vuetify = new Vuetify({
  icons: {
    iconfont: 'mdi',
  },
});


window.vuetify = vuetify;

Vue.use(Vuetify);
Vue.use(VueRouter);

$interface.$app = new Vue({
  vuetify,
  el: '#app',
  router,
  data: () => ({
    drawer: null
  })
}).$mount('#app');

export { $interface as default };
