$lc.ui.define({
  home: 'login',
  screens: {
    login: {
      isvisible: () => $lc.state.loggedIn !== true,
      title: 'Log in',
      username: { type: 'input', label: 'Username' },
      password: { type: 'password', label: 'Password' },
      submitSettings: { type: 'submit', label: 'log in' },
      submithandler: data => {
        $lc.state.loggedIn = true
        $lc.ui.gotoScreen({ screen: 'changesettings' })
      }
    },
    changesettings: {
      weight: 1,
      isvisible: () => $lc.state.loggedIn === true,
      title: 'Change Settings',
      supportedlocales: {
        type: 'select',
        label: 'Language',
        multiple: false,
        options: {
          en: 'English',
          fr: 'Francais',
          es: 'Espanol',
          de: 'Deutsch',
          nl: 'Nederlands',
          ar: 'العربية'
        }
      },
      storename: { type: 'input', label: 'Store Name' },
      storeabout: { type: 'textarea', label: 'About the Store' },
      submitSettings: { type: 'submit', label: 'submit' },
      submithandler: data => {
        console.log('submit handler')
        console.log(data)

        $lc.ui.notify({
          status: 'success',
          message: 'settings saved successfully'
        })
      }
    },
    addproduct: {
      isnavigable: false,
      isvisible: () => $lc.state.loggedIn === true,
      title: 'Add new Product',
      productName: {
        type: 'input',
        label: 'Name'
      },
      sku: {
        type: 'input',
        label: 'SKU'
      },
      price: {
        type: 'number',
        label: 'price'
      },
      confirm: { type: 'submit', label: 'Add product' },
      submithandler: data => {
        const [success, msg] = MockDataService.createRecord({ sku: data.sku, price: data.price, name: data.productName })

        if (!success) {
          $lc.ui.notify({
            status: 'error',
            message: `Error: ${msg}`
          })
        } else {
          $lc.ui.notify({
            status: 'success',
            message: msg
          })
          $lc.data.updateDataSource({
            name: 'products-table',
            ...MockDataService.getTableData()
          })
          $lc.ui.gotoScreen({ screen: 'viewproducts' })
        }
      }
    },
    editproduct: {
      isnavigable: false,
      isvisible: () => $lc.state.loggedIn === true,
      title: 'Edit Product',
      productId: {
        type: 'input',
        label: 'ID Number',
        readOnly: true
      },
      productName: {
        type: 'input',
        label: 'Name'
      },
      sku: {
        type: 'input',
        label: 'SKU'
      },
      price: {
        type: 'number',
        label: 'price'
      },
      confirm: { type: 'submit', label: 'Save' },
      submithandler: data => {
        const [success, msg] = MockDataService.updateRecord(data.productId, { sku: data.sku, price: data.price, name: data.productName })

        if (!success) {
          $lc.ui.notify({
            status: 'error',
            message: `Error: ${msg}`
          })
        } else {
          $lc.ui.notify({
            status: 'success',
            message: msg
          })
          $lc.data.updateDataSource({
            name: 'products-table',
            ...MockDataService.getTableData()
          })
          $lc.ui.gotoScreen({
            screen: 'viewproducts'
          })
        }
      }
    },
    viewproducts: {
      isvisible: () => $lc.state.loggedIn === true,
      title: 'Products',
      weight: 0,
      addButton: {
        type: 'button',
        label: 'add new product',
        onclick: function () { $lc.ui.gotoScreen({ screen: 'addproduct' }) }
      },
      tableview: {
        type: 'table',
        datasource: 'products-table',
        operations: [
          {
            text: 'Edit',
            callback: function (row) {
              const record = row.raw
              $lc.ui.gotoScreen({
                screen: 'editproduct',
                fieldValues: {
                  productId: record._id,
                  sku: record.sku,
                  productName: record.name,
                  price: record.price
                }
              })
            }
          },
          {
            text: 'Delete',
            callback: function (row) {
              const record = row.raw
              $lc.ui.dialog({
                title: 'Confirmation',
                text: 'Are you sure? This operation is irreversible.',
                operations: [
                  {
                    text: 'Yes',
                    callback: () => {
                      const [success, msg] = MockDataService.deleteRecord(record._id)

                      if (!success) {
                        $lc.ui.notify({
                          status: 'error',
                          message: `Error: ${msg}`
                        })
                      } else {
                        $lc.ui.notify({
                          status: 'success',
                          message: msg
                        })
                        $lc.data.updateDataSource({
                          name: 'products-table',
                          ...MockDataService.getTableData()
                        })
                        $lc.ui.gotoScreen({
                          screen: 'viewproducts'
                        })
                      }
                    }
                  },
                  { text: 'No' }
                ]
              })
              return true // keep the dialog open
            }
          }
        ]
      }
    }
  } // screens
})

$lc.ui.setBranding({
  header: {
    size: '40px',
    imgSrc:
      'https://cdn.cdnlogo.com/logos/c/58/cloudlinux.svg',
    title: 'Store Dashboard'
  },
  footer: {
    text: 'All rights reserved to Example Firm'
  }
})

document.addEventListener('DOMContentLoaded', function () {
  $lc.data.updateDataSource({
    name: 'products-table',
    ...MockDataService.getTableData()
  })
})

// a service to emulate the backend, in real world this would typically
// pull and update data on some server.
var MockDataService = {
  _data: [
    { _id: 6, sku: 'ABCD0012', name: 'Chair', price: 12.5 },
    { _id: 1, sku: 'ABCD0013', name: 'Sofa', price: 299.99 }
  ],
  getTableData: function () {
    const attrs = ['_id', 'sku', 'name', 'price']
    const raw = this._data.map((record) => attrs.map((attr) => record[attr]))
    const display = this._data.map((record) => [
      record.sku, record.name, `${record.price}$`
    ])
    console.debug('table data = ', raw, display)
    return {
      raw: [attrs, ...raw],
      display: [['SKU', 'Name', 'Price'], ...display]
    }
  },
  updateRecord: function (id, values) {
    if (Math.random() > 0.9) return [false, 'Internal server error']
    const record = this._data.filter((r) => r._id === id)[0]
    if (!record) {
      return [false, `Failed to find the requested id ${id}`]
    }
    for (const k in values) {
      record[k] = values[k]
    }
    return [true, `Product #${id} updated successfully`]
  },
  createRecord: function (values) {
    if (Math.random() > 0.9) return [false, 'Internal server error']
    const record = { _id: Math.round(Math.random() * 999999), ...values }
    this._data.push(record)
    return [true, `Product #${record._id} created successfully`]
  },
  deleteRecord: function (id) {
    if (Math.random() > 0.9) return [false, 'Internal server error']
    const index = this._data.findIndex((r) => r._id === id)
    if (index < 0) {
      return [false, `Failed to find the requested id ${id}`]
    }
    this._data.splice(index, 1)
    return [true, `Product #${id} deleted successfully`]
  }
}
