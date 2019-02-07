const components = []

Object.keys(Store.state.screens).map(ID => {
  let obj = {
    path: '/' + ID,
    component: Vue.component(`app-${ID}`, {
      template: `
                <section id="${ID}">
                    <form>
                        <template v-for="(comp, index) in compInNstScreen">
                            <component
                            :is="comp"
                            :key="index"
                            @sendToParent="saveData($event)"
                            @submitForm="submitForm($event)"
                            ></component>
                        </template>
                    </form>
                </section>`,

      data () {
        return {
          compInNstScreen: compInNstScreen,
          PageData: [],
          screen: ID,
          finalObj: null
        }
      },
      methods: {
        async saveData (d) {
          if (this.PageData.length == 0) {
            this.PageData.push(d)
            return
          }

          let filterdArr = await this.PageData.filter(
            doc => Object.keys(doc) != Object.keys(d)[0]
          )
          this.PageData = filterdArr
          this.PageData.push(d)
        },

        submitForm (d) {
          let resultObject = this.PageData.reduce((result, currentObject) => {
            for (let key in currentObject) {
              if (currentObject.hasOwnProperty(key)) {
                result[key] = currentObject[key]
              }
            }
            return result
          }, {})
          this.finalObj = resultObject
          let obj = {
            screen: this.screen,
            type: d.type,
            payload: this.finalObj
          }
          Store.state.screens[ID].submithandler(obj)
        }
      }
    })
  }

  components.push(obj)
})
