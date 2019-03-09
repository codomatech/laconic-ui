/* global $interface */

$interface.bus.emit('gui', {
  op: 'define',
  screens: {
    changesettings: {
      title: 'Change Settings',
      supportedlocales: {
        type: 'select',
        label: 'Language',
        multiple: true,
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
      submitSettings: { type: 'submit', label: 'submit' },
      submithandler: data => {
        console.log('submit handler')
        console.log(data)

        $interface.bus.emit('gui', {
          op: 'notify',
          status: 'success',
          message: 'department saved successfully'
        })
      }
    },
    addproduct: {
      title: 'Add new Product',
      producttype: {
        type: 'select',
        label: 'Product Type',
        multiple: true,
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

        $interface.bus.emit('gui', {
          op: 'notify',
          status: 'warn',
          message: 'department saved successfully'
        })
      }
    },
    editproduct: {
      title: 'Edit Product',
      producttype: {
        type: 'select',
        label: 'Product Type',
        multiple: true,
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

        $interface.bus.emit('gui', {
          op: 'notify',
          status: 'danger',
          message: 'department saved successfully'
        })
      }
    },
    viewproducts: {
      title: 'Products',
      weight: 0,
      tableview: {
        type: 'table',
        // datasource: the name of data source of this table, after this table is defined
        // you can set table contents using:
        //   $interface.bus.emit('gui',
        //      {
        //         op: 'updatedatasource', name: 'departmentstable',
        //         display: [
        //           ['Name', 'Family Name'],
        //           ['Mohamed', 'Adel'],
        //           ...
        //         ],
        //         raw: [
        //           ['id', 'name', 'family_name'],
        //           [1, 'mohamed', 'adel'],
        //           ...
        //         ]
        //      }
        //   )
        //
        // "value" is what should be displayed in the table, "rawdata" is the raw data of this row
        // the operations below will use rawdata
        datasource: 'products-table',
        // operations define the operations the user can do on each row
        // each operation has a callback that expects a `row` argument which is take from rawdata
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

$interface.bus.emit('gui', {
  op: 'set-branding',
  payload: {
    header: {
      size: '40px',
      imgSrc:
        'https://s2.logaster.com/static/v3/img/first_step_seo/example-2.png',
      title: 'Example App'
    },
    footer: {
      text: 'All rights reserved to Example Firm'
    }
  }
})

$interface.bus.emit('gui', {
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
