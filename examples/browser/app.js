$laconic.bus.emit('gui', {
  op: 'define',
  home: 'changesettings',
  screens: {
    changesettings: {
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
          ar: 'Arabic'
        }
      },
      storename: { type: 'input', label: 'Store Name' },
      storeabout: { type: 'textarea', label: 'About the Store' },
      password: { type: 'password', label: 'Password'},
      email: { type: 'email', label: 'Email' },
      submitSettings: { type: 'submit', label: 'submit' },
      submithandler: data => {
        console.log('submit handler')
        console.log(data)

        $laconic.bus.emit('gui', {
          op: 'notify',
          status: 'success',
          message: 'settings saved successfully'
        })

      }
    },
    addproduct: {
      title: 'Add new Product',
      producttype: {
        type: 'select',
        label: 'Product Type',
        multiple: false,
        options: {
          clothes: 'Clothes',
          realestate: 'Real Estate'
        }
      },
      price: { type: 'number', label: 'Price' },
      confirm: { type: 'submit', label: 'Confirm' },
      submithandler: data => {
        console.log('submit handler')
        console.log(data)

        $laconic.bus.emit('gui', {
          op: 'notify',
          status: 'warn',
          message: 'product saved successfully'
        })

        $laconic.bus.emit('gui', {
          op: 'goto-screen',
          screen: 'viewproducts'
        })

      }
    },
    editproduct: {
      title: 'Edit Product',
      producttype: {
        type: 'select',
        label: 'Product Type',
        multiple: false,
        options: {
          clothes: 'Clothes',
          furniture: 'Furniture',
          realestate: 'Real Estate'
        }
      },
      confirm: { type: 'submit', label: 'Confirm' },
      submithandler: data => {
        console.log('submit handler')
        console.log(data)

        $laconic.bus.emit('gui', {
          op: 'notify',
          status: 'danger',
          message: 'product saved successfully'
        })

        $laconic.bus.emit('gui', {
          op: 'goto-screen',
          screen: 'viewproducts'
        })
      }
    },
    viewproducts: {
      title: 'Products',
      weight: 0,
      tableview: {
        type: 'table',
        datasource: 'products-table',
        operations: [
          { title: 'Edit',
            callback: function (row) {
              console.debug('editing department', row)
              return false
            } }
        ] }
    }
  } // screens
})

$laconic.bus.emit('gui', {
  op: 'set-branding',
  payload: {
    header: {
      size: '40px',
      imgSrc:
        'https://cdn.cdnlogo.com/logos/c/58/cloudlinux.svg',
      title: 'Example App'
    },
    footer: {
      text: 'All rights reserved to Example Firm'
    }
  }
})

$laconic.bus.emit('gui', {
  op: 'update-datasource',
  payload: {
    name: 'products-table',
    raw: [
      ['sku', 'name', 'price'],
      ['ABCD0012', 'Chair', 12.5],
      ['ABCD0013', 'Chair 2', 12.5]
    ],
    display: [
      ['SKU', 'Name', 'Price'],
      ['ABCD0012', 'Chair', '12.5$'],
      ['ABCD0013', 'Chair 2', '12.5$']
    ]
  }
})

