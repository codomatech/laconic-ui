import Store from '../store/Store'
import dcomponents from '../components/dynamic-Components'
import { renderscreen } from './rendering'

export default registerbusevents

function registerbusevents ($interface) {
  // handle all [gui] events..
  $interface.bus.off('gui')
  $interface.bus.on('gui', data => {
    switch (data.op) {
      case 'define': {
        // TODO validate screens, e.g. a ui component can't have the key `name`
        Store.state.screens = data.screens
        Store.state.curscreen.name = null
        const $router = $interface.$app.$router
        for (const route of dcomponents.list) {
          if (route && route.path) $router.addRoute(route)
        }
        Store.state.homeScreen = data.home
        let home = $router.currentRoute && $router.currentRoute.path
        if (!home || home === '/') { home = data.home } else { home = home.slice(1) }
        if (home) { $interface.bus.emit('gui', { op: 'goto-screen', screen: home }) }
        break
      }

      case 'goto-screen': {
        const $router = $interface.$app.$router
        let target = data.screen
        if (target === '@') { target = $router.currentRoute.path.slice(1) }
        let screen = Store.state.screens[target]
        if (!screen) {
          console.error('invalid screen name', data.screen)
          break
        }
        if (screen.isvisible && screen.isvisible() !== true) {
          target = Store.state.homeScreen
          screen = Store.state.screens[target]
          if (!target || (screen.isvisible && screen.isvisible() !== true)) {
            target = '/'
          } else {
            renderscreen(target, screen, data.fieldValues)
          }
          console.debug('trying to navigate to invisible screen, aborting', target, Store.state.homeScreen)
          $router.push(target)
          break
        }
        renderscreen(target, screen, data.fieldValues)

        if ($router.currentRoute.path !== '/' + data.screen) { $router.push(data.screen) }
        break
      }

      case 'populate-fields': {
        const curScreen = Store.state.curscreen.name
        const screen = Store.state.screens[curScreen]
        if (!screen) {
          console.error('populate-fields: current screen is not defined yet, try later?', curScreen)
          break
        }
        renderscreen(curScreen, screen, data.fieldValues)
        break
      }

      case 'notify': {
        let icon = ''
        switch (data.status) {
          case 'success':
            icon = 'check'
            break
          case 'warn':
            icon = 'warning'
            break
          case 'error':
            icon = 'error'
            break
        }
        const notification = $interface.state.notification
        notification.active = false
        notification.text = data.message
        notification.icon = icon
        notification.active = true

        break
      }

      case 'dialog': {
        const dialog = $interface.state.dialog
        dialog.title = data.title
        dialog.text = data.text
        dialog.operations = data.operations || []
        dialog.args = data.args || []
        dialog.active = true
        break
      }

      case 'set-branding': {
        Store.state.staticComponents = data.payload
        break
      }

      case 'update-datasource': {
        // NOTE: imperatively update a dataseource with a given name.
        // TODO make the datasource reactive and remove this command: cf. https://github.com/codomatech/laconic-ui/issues/9
        const payload = data.payload
        if (!$interface.state.dsources[payload.name]) {
          // console.debug('datasource not ready yet, will retry shortly', payload.name)
          setTimeout(function () { $interface.bus.emit('gui', data) }, 500)
          break
        }

        let display
        const dsource = payload.display
        if (!dsource || !dsource.length) {
          display = { header: [], rows: [] }
        } else {
          const header = dsource[0].map(n => ({ text: n, value: n, sortable: true }))
          // console.debug(dsource[0], header)
          const rows = dsource.slice(1).map((record) => {
            const row = {}
            let i = 0
            for (const field of header) {
              row[field.value] = record[i++]
            }
            return row
          })
          display = { header, rows }
        }

        $interface.state.dsources[payload.name].display = display
        $interface.state.dsources[payload.name].raw = payload.raw
        break
      }
    }
  })
}
