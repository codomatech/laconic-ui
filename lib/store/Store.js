import Vue from 'vue'

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
})

console.debug('laconic store = ', Store)
export default Store
