import Vue from 'vue'
import $interface from '../interface'
import Store from '../store/Store'

// TODO create a command to populate fields of current screen, manipulate this.val here
// probably consolidate goto-screen to take initial values

// TODO replace this with a component whose template depends on curscreen
export function renderscreen (name, screen, fieldValues) {
  if (Store.state.curscreen.name === name) return

  fieldValues = fieldValues || {}

  Store.state.curscreen.name = name
  Store.state.curscreen.components = []

  let first = true
  Object.keys(screen).map(async key => {
    if (first) {
      // dummy component to reset state before rendering a screen
      await screenBegin()
      first = false
    }

    const component = screen[key]
    if (key === 'title') {
      await title(component, key)
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
    }

    const func = type2func[component.type]

    if (!func) {
      console.error('undefined component:', component)
      return
    }

    const c = await func(component, key, fieldValues[key]) // TODO make concurrent
    Store.state.curscreen.components.push(c)
    // console.debug('last added component = ', c)
    // c.options.methods.sendToParent()
  })
}

// patterns

// clearFieldState

const screenBegin = async (_, key, ___) => {
  const comp = await Vue.component(`app-${key}`, {
    template: '',
    //     methods: {
    //       sendToParent () {
    //         const obj = {}
    //         obj[key] = this.val
    //         this.$emit('sendToParent', obj)
    //       }
    //     },
    mounted () {
      this.$emit('clearFieldState')
    }
  })
  return comp
}

const title = async (text, key) => {
  const comp = await Vue.component(`app-${key}`, {
    template: `<div class="screen-title text-h3">${text}</div>`
  })
  return comp
}

const select = async (values, key, curValue) => {
  const optionsArr = []
  for (const key of Object.keys(values.options)) {
    const obj = {
      key: key,
      value: values.options[key]
    }
    optionsArr.push(obj)
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
        selected: curValue || []
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
  return comp
}

const inpText = async (values, key, curValue) => {
  let markup = ''

  if (values.hidden === true) {
    markup = `
      <input type="hidden"
        @input="sendToParent"
        v-model="val">
      `
  } else {
    const addTags = []
    if (values.readOnly === true) { addTags.push('readonly') }
    if (values.disabled === true) { addTags.push('disabled') }

    markup = `
    <v-text-field
      type="text"
      label="${values.label}"
      @input="sendToParent"
      v-model="val"
      ${addTags.join(' ')}
      ></v-text-field>
      `
  }
  const comp = await Vue.component(`app-${key}`, {
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
        const obj = {}
        obj[key] = this.val
        this.$emit('sendToParent', obj)
      }
    },
    mounted () {
      // NOTE: trigger change event to initialize the pagData
      // useful when there the fields are initialized
      this.sendToParent()
    }
  })
  return comp
}

const inpEmail = async (values, key, curValue) => {
  const comp = await Vue.component(`app-${key}`, {
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
    },
    mounted () {
      // NOTE: trigger change event to initialize the pagData
      // useful when there the fields are initialized
      this.sendToParent()
    }
  })
  return comp
}

const inpPassword = async (values, key, curValue) => {
  const comp = await Vue.component(`app-${key}`, {
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
        const obj = {}
        obj[key] = this.val
        this.$emit('sendToParent', obj)
      }
    },
    mounted () {
      // NOTE: trigger change event to initialize the pagData
      // useful when there the fields are initialized
      this.sendToParent()
    }
  })
  return comp
}

const inpNumber = async (values, key, curValue) => {
  const comp = await Vue.component(`app-${key}`, {
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
        const obj = {}
        obj[key] = this.val
        this.$emit('sendToParent', obj)
      }
    },
    mounted () {
      // NOTE: trigger change event to initialize the pagData
      // useful when there the fields are initialized
      this.sendToParent()
    }
  })
  return comp
}

const textarea = async (values, key, curValue) => {
  const comp = await Vue.component(`app-${key}`, {
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
        const obj = {}
        obj[key] = this.val
        this.$emit('sendToParent', obj)
      }
    },
    mounted () {
      // NOTE: trigger change event to initialize the pagData
      // useful when there the fields are initialized
      this.sendToParent()
    }
  })
  return comp
}

const submitBtn = async (values, key, _) => {
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
        this.$emit('submitForm', { type: 'submit' })
      }
    }
  })
  return comp
}

const button = async (values, key, _) => {
  const comp = await Vue.component(`app-${key}`, {
    template: `
            <div>
                <v-btn @click="${values.onclick()}">${
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
  return comp
}

const table = async (values, key, _) => {
  $interface.state.dsources[values.datasource] =
    $interface.state.dsources[values.datasource] || { display: [], raw: [] }
  const operations0 = values.operations
  const rowClass = operations0 ? 'clickable' : ''
  const comp = await Vue.component(`app-${key}`, {
    data: function () {
      return {
        dsource: $interface.state.dsources[values.datasource]
      }
    },
    methods: {
      showeditdialog: function (index) {
        const tabledata = this.$data.dsource
        const operations = tabledata.operations || operations0
        if (!operations) return
        const rawRecord = {}
        const vals = tabledata.raw[index + 1]
        for (let i = 0; i < vals.length; i++) {
          rawRecord[tabledata.raw[0][i]] = vals[i]
        }
        console.debug('showing dialog with row', rawRecord)
        $interface.bus.emit('gui', {
          op: 'dialog',
          title: '',
          text: '',
          operations: operations,
          args: [{ display: tabledata.display.rows[index], raw: rawRecord }]
        })
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
  })
  return comp
}
