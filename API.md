<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [`laconic-ui` API Documentation](#laconic-ui-api-documentation)
  - [The Framework API](#the-framework-api)
    - [`$lc.ui.define (screensConfig)`](#lcuidefine-screensconfig)
    - [`$lc.ui.setBranding ({title: <title>, text: <text>, operations: [<operation0>, <operation1>, ...]})](#lcuisetbranding-title-title-text-text-operations-operation0-operation1-)
    - [`$lc.ui.gotoScreen ({screen: <screenIdentifier>, fieldValues?: <fieldValues> })`](#lcuigotoscreen-screen-screenidentifier-fieldvalues-fieldvalues-)
    - [`$lc.ui.notify ({status: <status>, message: <message>})](#lcuinotify-status-status-message-message)
    - [`$lc.ui.dialog ({title: <title>, text: <text>, operations: [<operation0>, <operation1>, ...]})](#lcuidialog-title-title-text-text-operations-operation0-operation1-)
    - [`$lc.data.updateDataSource ({name: <name>, raw: <rawData>, display: <displayData>})](#lcdataupdatedatasource-name-name-raw-rawdata-display-displaydata)
  - [Styling the App](#styling-the-app)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# `laconic-ui` API Documentation


## The Framework API

The framework is accessible via a global variable, `$lc`, which exposes the
necessary methods to define and update your app's user interface.

`$lc` has the following methods:

### `$lc.ui.define (screensConfig)`
____
This is the main method to define your user interface in terms of screens.
`screensConfig` is an object with the following properties:

- `home`: the identifier of the home screen.
- `screens`: a map of `screenId` to `screenDefinition`.

`screenDefinition` is an object which describes the elements which constitute every screen.
Elements include various types of inputs (text, numbers, textarea, select), buttons, and tables.
It is planned to document all elements here, until then please check the first call in
[the example app](./examples/browser/app.js).


### `$lc.ui.setBranding ({title: <title>, text: <text>, operations: [<operation0>, <operation1>, ...]})
____
Use this to set the app's branding in header and footer. This is best shown by example:

```javascript
header: {
    size: '40px',
    imgSrc:
        'https://cdn.cdnlogo.com/logos/c/58/cloudlinux.svg',
    title: 'Store Dashboard'
},
footer: {
    text: 'All rights reserved to Example Firm'
}
```


### `$lc.ui.gotoScreen ({screen: <screenIdentifier>, fieldValues?: <fieldValues> })`
____
Use this to go to a specific screen. E.g. after you saved something, you want to send the user
to view what they just updated.

Optionally, you can also provide the initial values of screen elements via `fieldValues`.


### `$lc.ui.notify ({status: <status>, message: <message>})
____
Use this to notify the user with a message. The notification appears at the bottom of the screen
(commonly known as a *toast*).

`status` can be one of `'success'`, `'warn'`, `'error'`. `message` can be any text.


### `$lc.ui.dialog ({title: <title>, text: <text>, operations: [<operation0>, <operation1>, ...]})
____
Use this to show the user a message and get them to choose to do some operation.
`title` and `text` are free text. `operations` is an array of objects. Each of them has the following fields:

- `text`: describes what this operation does.
- `callback`: a function which is called if the user chooses (i.e. clicks) this option. Note that by default,
  the dialog is closed after executing the callback. If you want to keep the dialog open (e.g. to show a further
  dialog), then simply return `true` in the callback.


### `$lc.data.updateDataSource ({name: <name>, raw: <rawData>, display: <displayData>})
____

When you define a screen element as a table, you specify its data source (i.e. where the data comes from).
This method allows you to update a data source defined by `name`.
`raw` and `display` are two arrays of values which define the actual data and the version display to the user, respectively.



## Styling the App

`laconic-ui` default look is quite plain and unassuming: this is intentional. Every part of the app can be styled
using CSS. The framework makes sure each element is enclosed in an element with logical CSS classes. E.g. a button
you defined with the name `'createUSer'` will have the CSS classes of `.lc.button.createUSer`. Feel free to make your
app stunning in your own way!
