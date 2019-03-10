/* global select, inpNumper, inpText, submitBtn, textarea, title, table */

let compInNstScreen = []

let renderscreen = screen => {
  if (compInNstScreen.length != 0) {
    compInNstScreen = []
  }
  Object.keys(screen).map(async key => {
    let component = screen[key]
    if (key === 'title') {
      let t = await title(component, key)
      compInNstScreen.push(t)
      return
    }
    if ('submithandler weight'.indexOf(key) !== -1) {
      return
    }
    console.log(key)
    switch (component.type) {
      case 'select':
        let s = await select(component, key)
        compInNstScreen.push(s)
        break

      case 'input':
        let i = await inpText(component, key)
        compInNstScreen.push(i)
        break

      case 'number':
        let n = await inpNumper(component, key)
        compInNstScreen.push(n)
        break

      case 'textarea':
        let txt = await textarea(component, key)
        compInNstScreen.push(txt)
        break

      case 'submit':
        let sb = await submitBtn(component, key)
        compInNstScreen.push(sb)
        break

      case 'table':
        let tbl = await table(component, key)
        compInNstScreen.push(tbl)
        break

      default:
        console.error('undefined component:', component)
    }
  })
}
