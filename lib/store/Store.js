export default Store

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

window.store = Store
