export default registerbusevents

import Store from '../store/Store'
import dcomponents from '../components/dynamic-Components'

function registerbusevents($interface) {
    $interface.bus.on('interaction', data => {
      // console.debug('interaction took place:', data)
      console.log('interaction took place:')
      console.log(data)
    })

    // handle all [gui] events..
    $interface.bus.on('gui', data => {
      switch (data.op) {
        // handle Screens events
        case 'define':
          Store.state.screens = data.screens
          Store.state.curscreen.name = null
          for (const route of dcomponents.list) {
              $interface.$app.$router.addRoute(route)
          }
          break

        // handle notification events
        case 'notify':
          let bg = ''
          switch (data.status) {
            case 'success':
              bg = 'linear-gradient(to right, #555, #2ea879)'
              break
            case 'warn':
              bg = 'linear-gradient(to right, #ffa63e, #ffaa0f)'
              break
            case 'danger':
              bg = 'linear-gradient(to right, #555, #ff0000)'
              break
            default:
              bg = 'linear-gradient(to right, #555, #96c93d)'
          }

          let NObj = {
            text: data.message,
            backgroundColor: bg
          }
          Toastify(NObj).showToast()
          break

        // handle dialog events
        case 'dialog':

          let modal = new tingle.modal({
            footer: !!data.actions,
            stickyFooter: true
          })
          data.content && modal.setContent(data.content)

          data.actions && data.actions.forEach(function (action) {
            modal.addFooterBtn(action.title, 'tingle-btn', function () {
              typeof (action.callback) === 'function' && action.callback.apply(null, data.args || [])
              modal.close()
            })
          })

          modal.open()
          break

        // handle static components events
        case 'set-branding':
          Store.state.staticComponents = data.payload
          break

        // update datasource
        case 'update-datasource':
          let payload = data.payload
          if (!$interface.state.dsources[payload.name]) {
            // console.debug('datasource not ready yet, will retry shortly', payload.name)
            setTimeout(function () { $interface.bus.emit('gui', data) }, 500)
            break
          }
          $interface.state.dsources[payload.name].display = payload.display
          $interface.state.dsources[payload.name].raw = payload.raw
          break
      }
    })
}
