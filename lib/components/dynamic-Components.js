import Vue from 'vue'
import Store from '../store/Store'

const dcomponents = new Vue({
  data: function () {
    return {
      curscreen: Store.state.curscreen.components,
    }
  },
  computed: {
    list: () => Object.keys(Store.state.screens).map(ID => {
      const screen = Store.state.screens[ID]
      if (false && screen.isvisible && screen.isvisible() !== true) {
        return
      }

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
                this.PageData.push(d)
                return
              }

              const filterdArr = await this.PageData.filter(
                doc => Object.keys(doc) !== Object.keys(d)[0]
              )
              this.PageData = filterdArr
              this.PageData.push(d)
            },

            submitForm (d) {
              const resultObject = this.PageData.reduce((result, currentObject) => {
                for (const key of Object.keys(currentObject)) {
                  result[key] = currentObject[key]
                }
                return result
              }, {})
              this.finalObj = resultObject
              const obj = {
                screen: this.screen,
                type: d.type,
                payload: this.finalObj
              }
              Store.state.screens[ID].submithandler(obj)
            }
          }
        })
      }

      return obj
    })
  }
})

export default dcomponents
