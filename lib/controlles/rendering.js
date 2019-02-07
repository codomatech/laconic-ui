/* global select, inpNumper, inpText, submitBtn, textarea, title */

let compInNstScreen = []

let renderscreen = screen => {
  if (compInNstScreen.length != 0) {
    compInNstScreen = []
  }
  Object.keys(screen).map(async key => {
    if (key == 'title') {
      let t = await title(screen[key], key)
      compInNstScreen.push(t)
    }
    // console.log(key)
    switch (screen[key].type) {
      case 'select':
        let s = await select(screen[key], key)
        compInNstScreen.push(s)
        break

      case 'input':
        let i = await inpText(screen[key], key)
        compInNstScreen.push(i)
        break

      case 'number':
        let n = await inpNumper(screen[key], key)
        compInNstScreen.push(n)
        break

      case 'textarea':
        let txt = await textarea(screen[key], key)
        compInNstScreen.push(txt)
        break

      case 'submit':
        let sb = await submitBtn(screen[key], key)
        compInNstScreen.push(sb)
        break
    }
  })
}
