import Vue from 'vue'
import Store from '../store/Store'

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
                    <section id="${ID}" class="lc screen ${ID}">
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
                this.PageData.push(d)
                return
              }

              //               const filterdArr = await this.PageData.filter(
              //                 doc => Object.keys(doc) !== Object.keys(d)[0]
              //               )
              //               this.PageData = filterdArr
              this.PageData.push(d)
            },

            submitForm (_d) {
              const fieldValues = this.PageData.reduce((result, currentObject) => {
                for (const key of Object.keys(currentObject)) {
                  result[key] = currentObject[key]
                }
                return result
              }, {})
              Store.state.screens[ID].submithandler(fieldValues)
            }
          }
        })
      }

      return obj
    })
  }
})

export default dcomponents
