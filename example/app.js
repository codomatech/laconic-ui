BUS.emit('gui', {
  op: 'set-branding',
  payload: {
    header: {
      size: '40px',
      imgSrc:
        'https://s2.logaster.com/static/v3/img/first_step_seo/example-2.png',
      title: 'Codoma-techs'
    },
    footer: {
      text: 'footer text'
    }
  }
})

/* global BUS */
BUS.emit('gui', {
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

        BUS.emit('gui', {
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

        BUS.emit('gui', {
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

        BUS.emit('gui', {
          op: 'notify',
          status: 'danger',
          message: 'department saved successfully'
        })
      }
    }
  }
})
