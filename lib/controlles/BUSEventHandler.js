/* global BUS, Toastify, Store */

BUS.on('interaction', data => {
  // console.debug('interaction took place:', data)
  console.log('interaction took place:')
  console.log(data)
})

// handle all [gui] events..
BUS.on('gui', data => {
  switch (data.op) {
    // handle Screens events
    case 'define':
      // if (JSON.stringify(data.screens) !== JSON.stringify(Store.state.screens)) {
      //   let e = Object.create(Enemy);
      //   let json = JSON.stringify(e);
      //   let same_e = Enemy.fromJSON(json);
      //   localStorage.setItem("Store", JSON.stringify(data.screens));
      //   location.reload();
      // }
      // screens = JSON.parse(localStorage.getItem("Store"));
      Store.state.screens = data.screens
      // console.log(Store.state.screens)
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

    // handle static components events
    case 'set-branding':
      Store.staticComponents = data.payload
      break
  }
})
