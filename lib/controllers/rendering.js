import Vue from 'vue'
import $interface from '../interface'
import Store from '../store/Store'
import router from '../router/router'

export function renderscreen (name, screen) {
  if (Store.state.curscreen.name === name) return

  Store.state.curscreen.name = name
  Store.state.curscreen.components = []
  Object.keys(screen).map(async key => {
    const component = screen[key]
    if (!component || !component.type) {
      return
    }
    if (key === 'title') {
      const t = title(component, key)
      Store.state.curscreen.components.push(t)
      return
    }
    if ('submithandler weight'.indexOf(key) !== -1) {
      return
    }
    // console.log(key, component.type)
    switch (component.type) {
      case 'select':
        const s = await select(component, key)
        break

      case 'input':
        const i = await inpText(component, key)
        break

      case 'number':
        const n = await inpNumper(component, key)
        break

      case 'email':
        const e = await inpEmail(component, key)
        break

      case 'password':
        const p = await inpPassword(component, key)
        break

      case 'textarea':
        const txt = await textarea(component, key)
        break

      case 'submit':
        const sb = await submitBtn(component, key)
        break

      case 'table':
        const tbl = await table(component, key)
        break

      default:
        console.error('undefined component:', component)
    }
  })
}

// patterns

const title = async (values, key) => {
  const comp = await Vue.component(`app-${key}`, {
    template: `<h1>${values}</h1>`
  })
  Store.state.curscreen.components.push(comp)
}

const select = async (values, key) => {
  console.debug('select: ', key)
  const optionsArr = []
  Object.keys(values.options).map(key => {
    const obj = {
      key: key,
      value: values.options[key]
    }
    optionsArr.push(obj)
  })
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
        const obj = {}
        obj[key] = this.selected
        this.$emit('sendToParent', obj)
      }
    }
  })
  Store.state.curscreen.components.push(comp)
}

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
        const obj = {}
        obj[key] = this.val
        this.$emit('sendToParent', obj)
      }
    }
  })
  Store.state.curscreen.components.push(comp)
}

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
            const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            return pattern.test(value) || 'Invalid e-mail.'
          }
        }
      }
    },
    methods: {
      sendToParent () {
        const obj = {}
        obj[key] = this.val
        this.$emit('sendToParent', obj)
      }
    }
  })
  Store.state.curscreen.components.push(comp)
}

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
        const obj = {}
        obj[key] = this.val
        this.$emit('sendToParent', obj)
      }
    }
  })
  Store.state.curscreen.components.push(comp)
}

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
      sendToParent (label) {
        const obj = {}
        obj[key] = this.val
        this.$emit('sendToParent', obj)
      }
    }
  })
  Store.state.curscreen.components.push(comp)
}

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
      sendToParent (label) {
        const obj = {}
        obj[key] = this.val
        this.$emit('sendToParent', obj)
      }
    }
  })
  Store.state.curscreen.components.push(comp)
}

const submitBtn = async (values, key) => {
  const comp = await Vue.component(`app-${key}`, {
    template: `
            <div>
                <v-btn color="indigo lighten-2" dark @click="submit">${
  values.label
}</v-btn>
            </div>
        `,
    methods: {
      submit () {
        this.$emit('submitForm', { type: 'submit' })
      }
    }
  })
  Store.state.curscreen.components.push(comp)
}

const table = async (values, key) => {
  $interface.state.dsources[values.datasource] =
    $interface.state.dsources[values.datasource] || { display: [], raw: [] }
  const rowcursor = values.operations ? 'pointer' : 'auto'
  const comp = await Vue.component(`app-${key}`, {
    data: function () {
      return {
        dsource: $interface.state.dsources[values.datasource]
      }
    },
    methods: {
      showeditdialog: function (index) {
        const tabledata = this.$data.tabledata
        if (!values.operations) return
        $interface.bus.emit('gui', {
          op: 'dialog',
          content: 'The following operations are available:',
          actions: values.operations,
          args: [{ display: tabledata.display[index], raw: tabledata.raw[index] }]
        })
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
  })
  Store.state.curscreen.components.push(comp)
}
