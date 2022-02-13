# `laconic`: frontend framework for busy developers

`laconic` is a low-code UI framework to create apps's interface fast.
**Top features:**
**declarative definition** of your UI with **minimal boilerplate** and **best-of-breed tech** fully hidden under the hood.
Check out our [demo](https://codomatech.github.io/laconic-ui/examples/browser/) and/or experiment with it live [here](https://codepen.io/codomatech/pen/LYOjdRb).

**The framework is still evolving**. please help us grow it to a stable release
with your feature requests and bug reports. Please use the [issues](issues) for
this.

## Install

### npm

```shell
npm i laconic-ui
```

### browser

```html
    <script src="https://cdn.jsdelivr.net/npm/laconic-ui/dist/laconic-ui.browser.js"></script>
```

## Examples

`laconic` is usable as npm package as well as a plain old browser `<script/>`.
Check out the [examples directory](examples).


## Philosophy

- **No markup**: define your ui completely in your script. Zero html needed.
- **Minimal boilerplate**: define your app as an object of screens, beyond that
  it is 100% your app's logic. Zero ui plumbing needed.
- **High-Level**: `laconic` uses amazing libraries under the hood to make your UI work:
  `vue`, `vue-router`, `vuetify`, `eev`. However, you won't need to  know any details about the workings of these libraries.
- **Minimal Theming**: `laconic` won't impose a specific theme on your app, you can
  customize the look and feel using CSS.
- **Usable**: use it by a plain old browser script or within a complex npm workflow.
