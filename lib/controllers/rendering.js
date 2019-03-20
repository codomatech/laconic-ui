//export default compInNstScreen

import Store from '../store/Store'

export function renderscreen(name, screen) {
  if (Store.state.curscreen.name === name) return
  
  Store.state.curscreen.name = name
  Store.state.curscreen.components = []
  Object.keys(screen).map(async key => {
    let component = screen[key]
    if (key === 'title') {
      let t = title(component, key)
      Store.state.curscreen.components.push(t)
      return
    }
    if ('submithandler weight'.indexOf(key) !== -1) {
      return
    }
    //console.log(key, component.type)
    switch (component.type) {
      case 'select':
        let s = await select(component, key)
        break

      case 'input':
        let i = await inpText(component, key)
        break

      case 'number':
        let n = await inpNumper(component, key)
        break

      case 'textarea':
        let txt = await textarea(component, key)
        break

      case 'submit':
        let sb = await submitBtn(component, key)
        break

      case 'table':
        let tbl = await table(component, key)
        break

      default:
        console.error('undefined component:', component)
    }
  })
}

// patterns


/* global router, Vue, compInNstScreen */

let title = async (values, key) => {
  let comp = await Vue.component(`app-${key}`, {
    template: `<h1>${values}</h1>`
  })
  Store.state.curscreen.components.push(comp)
}

let select = async (values, key) => {
  console.debug('select: ', key)
  let optionsArr = []
  Object.keys(values.options).map(key => {
    let obj = {
      key: key,
      value: values.options[key]
    }
    optionsArr.push(obj)
  })
  let comp = await Vue.component(`app-${key}`, {
    template: `
            <div>
                <v-flex xs12 sm6 d-flex>
                    <v-select
                     :items="items"
                     item-text="value"
                     item-value="key"
                     :label="values.label"
                     :multiple="values.multiple"
                     v-model="selected"
                     chips
                     @change="sendToParent"></v-select>
                </v-flex>
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
        let obj = {}
        obj[key] = this.selected
        this.$emit('sendToParent', obj)
      }
    }
  })
  Store.state.curscreen.components.push(comp)
}

let inpText = async (values, key) => {
  let comp = await Vue.component(`app-${key}`, {
    template: `
            <div>
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
        let obj = {}
        obj[key] = this.val
        this.$emit('sendToParent', obj)
      }
    }
  })
  Store.state.curscreen.components.push(comp)
}

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
        let obj = {}
        obj[key] = this.val
        this.$emit('sendToParent', obj)
      }
    }
  })
  Store.state.curscreen.components.push(comp)
}

let textarea = async (values, key) => {
  let comp = await Vue.component(`app-${key}`, {
    template: `
            <div>
                <v-textarea
                name="input-7-1"
                box label="Label"
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
        let obj = {}
        obj[key] = this.val
        this.$emit('sendToParent', obj)
      }
    }
  })
  Store.state.curscreen.components.push(comp)
}

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
        this.$emit('submitForm', { type: 'submit' })
      }
    }
  })
  Store.state.curscreen.components.push(comp)
}

const table = async (values, key) => {
  $interface.state.dsources[values.datasource] =
    $interface.state.dsources[values.datasource] || { display: [], raw: [] }
  let rowcursor = values.operations ? 'pointer' : 'auto'
  let comp = await Vue.component(`app-${key}`, {
    data: function () {
      return {
        tabledata: $interface.state.dsources[values.datasource]
      }
    },
    methods: {
      showeditdialog: function (index) {
        let tabledata = this.$data.tabledata
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
  })
  Store.state.curscreen.components.push(comp)
}
