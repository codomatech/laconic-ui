import Vue from 'vue'

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
})

export default Store
